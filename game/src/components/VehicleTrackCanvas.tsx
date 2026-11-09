import { useEffect, useRef, useState, useCallback } from 'react';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import type { VehicleTestResult } from '../state/vehicleStore';
import { soundFx } from '../audio/soundFx';
import { createMatterVehicleSimulation } from '../physics/matterVehicle';
import { ENGINES, CHASSIS } from '../physics/vehicleParts';
import { SimulationControlPanel } from './SimulationControlPanel';
import { VehicleRealTimeMetricsOverlay } from './VehicleRealTimeMetricsOverlay';
import {
  calculateAerodynamicDrag,
  calculateInclineForces,
  type VehicleTelemetry,
} from '../physics/engine/PhysicsMetricsContract';
import { PhysicsParticleCanvas, type PhysicsParticleCanvasHandle } from './PhysicsParticleCanvas';
import type { PhysicsDebugConfig } from './PhysicsDebugPanel';

interface Props {
  level: VehicleLevelDef;
  selectedEngineId: string;
  selectedChassisId: string;
  testResult: VehicleTestResult | null;
  debugConfig?: PhysicsDebugConfig;
  isSimulating: boolean;
  onSimulationFinish?: () => void;
  onResetSimulation?: () => void;
}

export function VehicleTrackCanvas({
  level,
  selectedEngineId,
  selectedChassisId,
  testResult,
  debugConfig,
  isSimulating,
  onSimulationFinish,
  onResetSimulation,
}: Props) {
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1
  const [animSpeed, setAnimSpeed] = useState(0); // m/s
  const [wheelRotation, setWheelRotation] = useState(0); // degrees
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [vectorsEnabled, setVectorsEnabled] = useState(true);
  const [metricsEnabled, setMetricsEnabled] = useState(true);
  const [liveTelemetry, setLiveTelemetry] = useState<VehicleTelemetry | null>(null);

  const soundTriggeredRef = useRef<{ rev: boolean; screech: boolean }>({ rev: false, screech: false });
  const animIdRef = useRef<number>(0);
  const simRef = useRef<ReturnType<typeof createMatterVehicleSimulation> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const particleCanvasRef = useRef<PhysicsParticleCanvasHandle | null>(null);

  const handleResetSimulationClick = useCallback(() => {
    soundFx.playSnapNode();
    if (simRef.current) {
      simRef.current.resetBodies();
    }
    setAnimProgress(0);
    setAnimSpeed(0);
    setWheelRotation(0);
    setIsPaused(false);
    particleCanvasRef.current?.clear();
    if (onResetSimulation) {
      onResetSimulation();
    }
  }, [onResetSimulation]);

  const finalSpeed = testResult?.analysis.finalSpeed ?? 0;
  const isStalled = testResult?.analysis.stalled ?? false;
  const isTractionLimited = testResult?.analysis.tractionLimited ?? false;
  const incline = level.inclineDegrees ?? 0;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && (isSimulating || testResult)) {
        e.preventDefault();
        setIsPaused((v) => !v);
      } else if ((e.key === 'r' || e.key === 'R') && (isSimulating || testResult)) {
        handleResetSimulationClick();
      } else if (e.key === 'h' || e.key === 'H') {
        setHeatmapEnabled((v) => !v);
      } else if (e.key === 'v' || e.key === 'V') {
        setVectorsEnabled((v) => !v);
      } else if (e.key === 'm' || e.key === 'M') {
        setMetricsEnabled((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulating, testResult, handleResetSimulationClick]);

  useEffect(() => {
    if (!isSimulating) {
      soundTriggeredRef.current = { rev: false, screech: false };
      return;
    }

    const engineDef = ENGINES[selectedEngineId] || ENGINES['engine-small'];
    const chassisDef = CHASSIS[selectedChassisId] || CHASSIS['chassis-light'];
    const totalMass = chassisDef.mass + (level.payloadMass || 0);
    const sim = createMatterVehicleSimulation(
      engineDef,
      chassisDef,
      level.distance,
      incline,
      level.payloadMass,
    );
    simRef.current = sim;

    let lastTimestamp: number | null = null;

    const frame = (timestamp: number) => {
      if (isPaused) {
        animIdRef.current = requestAnimationFrame(frame);
        return;
      }

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const rawDt = Math.min(50, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      const dt = rawDt * playbackSpeed;

      // Step Matter.js physics engine
      const state = sim.step(dt);

      const p = Math.min(1, Math.max(0, state.distanceTraveled / level.distance));
      setAnimProgress(p);
      setAnimSpeed(state.speed);
      setWheelRotation((state.wheelRotationRad * 180) / Math.PI);

      // Compute physical telemetry contracts
      const dragN = calculateAerodynamicDrag(state.speed);
      const inclineForces = calculateInclineForces(totalMass, incline);
      const powerW = state.effectiveForceN * state.speed;

      setLiveTelemetry({
        speedMps: state.speed,
        speedKmh: state.speed * 3.6,
        accelerationMps2: state.acceleration,
        gForce: state.acceleration / 9.80665,
        thrustN: state.effectiveForceN,
        normalForceN: state.normalForceN,
        tractionLimitN: state.tractionLimitN,
        gripRatio: state.effectiveForceN / (state.tractionLimitN || 1),
        isTractionLimited: state.isTractionLimited,
        aerodynamicDragN: dragN,
        slopeForceN: inclineForces.slopeGravityN,
        powerWatt: powerW,
        powerHp: powerW / 745.7,
        kineticEnergyJoule: 0.5 * totalMass * state.speed * state.speed,
        isStalled: state.isStalled,
      });

      if (state.speed > 0.5 && !soundTriggeredRef.current.rev) {
        soundFx.playEngineRev(Math.min(1, state.speed / (level.targetSpeed || 30)));
        soundTriggeredRef.current.rev = true;
      }

      if (state.isTractionLimited && !soundTriggeredRef.current.screech && p > 0.1) {
        soundFx.playTireScreech();
        soundTriggeredRef.current.screech = true;
      }

      // Physics particle canvas visual feedback for tire smoke and slip sparks
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const curCarX = 60 + p * (540 - 60);
        const curCarY = 160 - (curCarX - 60) * Math.tan((incline * Math.PI) / 180);
        const px = ((curCarX - 18) / 600) * rect.width;
        const py = (curCarY / 210) * rect.height;

        if (state.isTractionLimited) {
          particleCanvasRef.current?.emitSparks(px, py, 3, { color: '#f59e0b' });
          particleCanvasRef.current?.emitTireSmoke(px, py, 0.9);
        } else if (state.speed > 1.2 && Math.random() > 0.45) {
          particleCanvasRef.current?.emitTireSmoke(px, py, 0.4);
        }
      }

      const isDone = state.reachedFinish || (state.isStalled && state.timeSeconds > 1.6);

      if (!isDone) {
        animIdRef.current = requestAnimationFrame(frame);
      } else {
        if (onSimulationFinish) {
          onSimulationFinish();
        }
      }
    };

    animIdRef.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animIdRef.current);
      sim.destroy();
    };
  }, [
    isSimulating,
    isPaused,
    playbackSpeed,
    selectedEngineId,
    selectedChassisId,
    level.distance,
    incline,
    level.payloadMass,
    level.targetSpeed,
    onSimulationFinish,
  ]);

  const progress = isSimulating ? animProgress : (testResult ? 1 : 0);
  const currentSpeed = isSimulating ? animSpeed : (testResult ? finalSpeed : 0);
  const totalDuration = finalSpeed > 0 ? (2 * level.distance) / finalSpeed : 3.5;

  // Viewbox coordinates: track runs from 0 to 600, y from 0 to 220
  const trackStartX = 60;
  const trackEndX = 540;
  const trackY = incline > 0 ? 160 - Math.tan((incline * Math.PI) / 180) * 120 : 160;
  const carX = trackStartX + progress * (trackEndX - trackStartX);
  const carY = 160 - (carX - trackStartX) * Math.tan((incline * Math.PI) / 180);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface-1 p-3">
      {/* Simulation Control Panel & Transport */}
      {(isSimulating || testResult) && (
        <div className="mb-2">
          <SimulationControlPanel
            isSimulating={isSimulating}
            isPaused={isPaused}
            playbackSpeed={playbackSpeed}
            animProgress={animProgress}
            heatmapEnabled={heatmapEnabled}
            vectorsEnabled={vectorsEnabled}
            metricsEnabled={metricsEnabled}
            durationSeconds={totalDuration}
            onTogglePlayPause={() => setIsPaused((v) => !v)}
            onReset={handleResetSimulationClick}
            onSpeedChange={setPlaybackSpeed}
            onScrub={(p) => {
              setIsPaused(true);
              setAnimProgress(p);
            }}
            onToggleHeatmap={() => setHeatmapEnabled((v) => !v)}
            onToggleVectors={() => setVectorsEnabled((v) => !v)}
            onToggleMetrics={() => setMetricsEnabled((v) => !v)}
          />
        </div>
      )}

      <svg ref={svgRef} viewBox="0 0 600 210" className="w-full h-48 select-none touch-none">
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--border)" />
            <stop offset="100%" stopColor="var(--surface-2)" />
          </linearGradient>
          <pattern id="checkers" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#ffffff" />
            <rect x="4" width="4" height="4" fill="#000000" />
            <rect y="4" width="4" height="4" fill="#000000" />
            <rect x="4" y="4" height="4" fill="#ffffff" />
          </pattern>
          <marker id="arrow-thrust" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="#06b6d4" />
          </marker>
          <marker id="arrow-normal" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
            <path d="M0,6 L6,6 L3,0 z" fill="#10b981" />
          </marker>
          <marker id="arrow-slope" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 z" fill="#f97316" />
          </marker>
          <marker id="arrow-drag" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
            <path d="M6,0 L0,3 L6,6 z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Sky / Grid Background */}
        <line x1="0" y1="185" x2="600" y2="185" stroke="var(--border)" strokeWidth="1" strokeDasharray="6 6" />

        {/* Runway track base with incline angle */}
        <polygon
          points={`40,175 ${trackEndX + 30},${trackY + 15} ${trackEndX + 30},205 40,205`}
          fill="url(#trackGrad)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Runway asphalt strip */}
        <line
          x1={trackStartX - 10}
          y1={160}
          x2={trackEndX + 10}
          y2={trackY}
          stroke="var(--fg-subtle)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Distance interval markers */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const mx = trackStartX + pct * (trackEndX - trackStartX);
          const my = 160 - (mx - trackStartX) * Math.tan((incline * Math.PI) / 180);
          const dist = Math.round(pct * level.distance);
          return (
            <g key={idx}>
              <line x1={mx} y1={my - 4} x2={mx} y2={my + 8} stroke="var(--border)" strokeWidth="1.5" />
              <text x={mx} y={my + 22} fontSize="9" fontFamily="monospace" fill="var(--fg-subtle)" textAnchor="middle">
                {dist}m
              </text>
            </g>
          );
        })}

        {/* Start Line */}
        <line x1={trackStartX} y1={140} x2={trackStartX} y2={175} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />

        {/* Finish Line Checkered Banner */}
        <g transform={`translate(${trackEndX}, ${trackY - 35})`}>
          <rect x="-4" y="0" width="8" height="35" fill="url(#checkers)" stroke="var(--border)" strokeWidth="1" />
          <polygon points="4,0 18,6 4,12" fill="var(--accent)" />
          <text x="0" y="-4" fontSize="8" fontFamily="monospace" fill="var(--fg)" fontWeight="bold" textAnchor="middle">
            FINISH
          </text>
        </g>

        {/* Vehicle Sprite */}
        <g transform={`translate(${carX}, ${carY - 18}) rotate(${-incline})`}>
          {/* Tire traction slip smoke puff */}
          {isTractionLimited && isSimulating && (
            <g transform="translate(-24, 10)">
              <circle r="6" fill="var(--fg-muted)" opacity="0.4" className="animate-ping" />
              <circle r="4" fill="var(--fg-subtle)" opacity="0.6" />
            </g>
          )}

          {/* Engine Exhaust Pipe & Flame */}
          <rect x="-24" y="2" width="6" height="4" rx="1" fill="var(--fg-subtle)" />
          {isSimulating && (
            <polygon points="-24,3 -32,4 -24,5" fill="var(--accent)" className="animate-pulse" />
          )}

          {/* Vehicle Body Chassis */}
          <rect
            x="-20"
            y="-8"
            width="44"
            height="16"
            rx="4"
            fill={selectedChassisId.includes('heavy') ? 'var(--fg-subtle)' : 'var(--accent)'}
            stroke="var(--fg)"
            strokeWidth="1.5"
          />

          {/* Windshield / Cockpit */}
          <polygon
            points="0,-8 10,-8 18,0 -4,0"
            fill="var(--info)"
            opacity="0.8"
          />

          {/* Speed Indicator Badge */}
          {(isSimulating || testResult) && (
            <text
              x="2"
              y="-10"
              fontSize="6"
              fontFamily="monospace"
              fontWeight="bold"
              fill="var(--fg)"
              textAnchor="middle"
            >
              {(currentSpeed * 3.6).toFixed(0)} km/h
            </text>
          )}

          {/* Payload Crate */}
          {Boolean(level.payloadMass) && (
            <g transform="translate(-16, -18)">
              <rect width="16" height="10" rx="1.5" fill="#8d6e63" stroke="#5d4037" strokeWidth="1" />
              <line x1="0" y1="0" x2="16" y2="10" stroke="#5d4037" strokeWidth="0.8" />
              <text x="8" y="7" fontSize="5" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                {level.payloadMass}kg
              </text>
            </g>
          )}

          {/* Rear Wheel (with Heatmap Color) */}
          <g transform={`translate(-10, 8) rotate(${wheelRotation})`}>
            <circle
              r="6.5"
              fill="var(--surface-1)"
              stroke={!heatmapEnabled ? 'var(--fg)' : isTractionLimited ? '#f59e0b' : isStalled ? '#ef4444' : '#10b981'}
              strokeWidth="2"
            />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--fg-muted)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--fg-muted)" strokeWidth="1" />
          </g>

          {/* Front Wheel (with Heatmap Color) */}
          <g transform={`translate(16, 8) rotate(${wheelRotation})`}>
            <circle
              r="6.5"
              fill="var(--surface-1)"
              stroke={!heatmapEnabled ? 'var(--fg)' : isTractionLimited ? '#f59e0b' : isStalled ? '#ef4444' : '#10b981'}
              strokeWidth="2"
            />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="var(--fg-muted)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="var(--fg-muted)" strokeWidth="1" />
          </g>

          {/* Active Force Vectors on Vehicle */}
          {vectorsEnabled && (isSimulating || testResult) && (
            <g className="pointer-events-none select-none">
              {/* Thrust Vector Arrow (Forward Cyan) */}
              <line
                x1="22"
                y1="0"
                x2="48"
                y2="0"
                stroke="#06b6d4"
                strokeWidth="2"
                markerEnd="url(#arrow-thrust)"
              />
              <rect x="25" y="-14" width="28" height="10" rx="2" fill="#020617" fillOpacity="0.9" stroke="#06b6d4" strokeWidth="0.8" />
              <text x="39" y="-6.5" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill="#06b6d4" textAnchor="middle">
                {((liveTelemetry?.thrustN ?? 4500) / 1000).toFixed(1)}k
              </text>

              {/* Normal Force Vector Arrow (Perpendicular Up Emerald) */}
              <line
                x1="3"
                y1="8"
                x2="3"
                y2="-24"
                stroke="#10b981"
                strokeWidth="2"
                markerEnd="url(#arrow-normal)"
              />
              <rect x="-10" y="-36" width="26" height="10" rx="2" fill="#020617" fillOpacity="0.9" stroke="#10b981" strokeWidth="0.8" />
              <text x="3" y="-28.5" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill="#10b981" textAnchor="middle">
                {((liveTelemetry?.normalForceN ?? 8000) / 1000).toFixed(1)}k
              </text>

              {/* Incline Slope Gravity Force Vector (Backward Down Slope Orange) */}
              {incline > 0 && (
                <>
                  <line
                    x1="-20"
                    y1="0"
                    x2="-44"
                    y2="0"
                    stroke="#f97316"
                    strokeWidth="1.8"
                    markerEnd="url(#arrow-slope)"
                  />
                  <rect x="-48" y="-14" width="26" height="10" rx="2" fill="#020617" fillOpacity="0.9" stroke="#f97316" strokeWidth="0.8" />
                  <text x="-35" y="-6.5" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill="#f97316" textAnchor="middle">
                    {((liveTelemetry?.slopeForceN ?? 1500) / 1000).toFixed(1)}k
                  </text>
                </>
              )}

              {/* Aerodynamic Drag Force Vector (Backward Amber) */}
              {(liveTelemetry?.aerodynamicDragN ?? 0) > 10 && (
                <line
                  x1="-20"
                  y1="-6"
                  x2="-38"
                  y2="-6"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow-drag)"
                />
              )}
            </g>
          )}

          {/* Physics Debug: Wireframe Colliders on Vehicle */}
          {debugConfig?.enabled && debugConfig.showColliders && (
            <g className="pointer-events-none select-none">
              {/* Chassis Collision Envelope */}
              <rect
                x="-26"
                y="-20"
                width="52"
                height="24"
                rx="2"
                fill="#10b981"
                fillOpacity="0.08"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <text x="0" y="-22" fontSize="5.5" fontFamily="monospace" fill="#10b981" textAnchor="middle">
                CHASSIS HULL [{selectedChassisId}]
              </text>
              {/* Wheel Circular Colliders & Contact Patches */}
              <circle cx="-18" cy="8" r="10" fill="#06b6d4" fillOpacity="0.06" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 1.5" />
              <circle cx="18" cy="8" r="10" fill="#06b6d4" fillOpacity="0.06" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 1.5" />
              <rect x="-22" y="16.5" width="8" height="3" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="0.8" />
              <rect x="14" y="16.5" width="8" height="3" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="0.8" />
            </g>
          )}

          {/* Physics Debug: Design FBD Force Vectors (When not simulating) */}
          {debugConfig?.enabled && debugConfig.showForceVectors && !isSimulating && !testResult && (
            <g className="pointer-events-none select-none">
              {/* Weight vector downwards */}
              <line x1="0" y1="0" x2="0" y2="24" stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#arrow-thrust)" />
              <text x="8" y="16" fontSize="6" fontFamily="monospace" fill="#f59e0b" fontWeight="bold">
                W = mg
              </text>
              {/* Normal force perpendicular to track */}
              <line x1="0" y1="5" x2="0" y2="-22" stroke="#10b981" strokeWidth="1.8" markerEnd="url(#arrow-normal)" />
              <text x="8" y="-12" fontSize="6" fontFamily="monospace" fill="#10b981" fontWeight="bold">
                Fn = mg·cosθ
              </text>
            </g>
          )}
        </g>
      </svg>
      {/* Particle Simulation Canvas for tire smoke and slip sparks */}
      <PhysicsParticleCanvas ref={particleCanvasRef} active={isSimulating} />

      {/* Real-Time Vehicle Telemetry Overlay */}
      {(isSimulating || testResult) && metricsEnabled && (
        <VehicleRealTimeMetricsOverlay
          telemetry={liveTelemetry}
          isSimulating={isSimulating}
          heatmapEnabled={heatmapEnabled}
          vectorsEnabled={vectorsEnabled}
          targetSpeedKmh={level.targetSpeed ? level.targetSpeed * 3.6 : 100}
        />
      )}

      {/* Physics Debug: FBD Equilibrium Inspector */}
      {debugConfig?.enabled && debugConfig.showEquilibrium && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-surface-base/90 backdrop-blur px-3 py-1.5 font-mono text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">⚖️</span>
            <span className="text-fg-muted">FBD Balance:</span>
            <span className="text-emerald-400 font-bold">
              Fn = {(liveTelemetry?.normalForceN ?? 8000).toFixed(0)}N · Ft = {(liveTelemetry?.thrustN ?? 4500).toFixed(0)}N
            </span>
          </div>
          <span className="text-fg-subtle">•</span>
          <div className="text-[11px] text-fg-subtle">
            Incline: {incline}° · Mass: {(ENGINES[selectedEngineId]?.cost ?? 1000) > 0 ? (CHASSIS[selectedChassisId]?.mass ?? 800) + (level.payloadMass ?? 0) : 1000}kg
          </div>
        </div>
      )}
    </div>
  );
}
