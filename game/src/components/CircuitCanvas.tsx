import { useEffect, useRef, useState, useCallback } from 'react';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { BuiltEdge } from '../game/circuitBuild';
import { toCircuitModel } from '../game/circuitBuild';
import type { BuiltNode } from '../game/build';
import { COMPONENTS } from '../physics/components';
import type { CircuitTestResult } from '../state/circuitStore';
import { soundFx } from '../audio/soundFx';
import { createMatterCircuitSimulation, type ArcSpark } from '../physics/matterCircuit';
import { SimulationControlPanel } from './SimulationControlPanel';
import { CircuitRealTimeMetricsOverlay } from './CircuitRealTimeMetricsOverlay';
import { getStressHeatmapRgb } from '../physics/heatmap';
import type { CircuitTelemetry } from '../physics/engine/PhysicsMetricsContract';
import { PhysicsParticleCanvas, type PhysicsParticleCanvasHandle } from './PhysicsParticleCanvas';

interface Point {
  x: number;
  y: number;
}

interface Props {
  level: CircuitLevelDef;
  builtNodes: BuiltNode[];
  builtEdges: BuiltEdge[];
  pendingNodeId: string | null;
  testResult: CircuitTestResult | null;
  isSimulating?: boolean;
  onSimulationFinish?: () => void;
  onResetSimulation?: () => void;
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveEdge: (edgeId: string) => void;
}

function getCircuitEdgeColor(
  result: { power: number; maxPower: number; burnedOut: boolean; underpowered: boolean } | undefined,
  fallback: string,
  heatmapEnabled: boolean,
): string {
  if (!result) return fallback;
  if (result.burnedOut) return 'var(--danger)';
  if (heatmapEnabled) {
    const util = result.maxPower > 0 ? result.power / result.maxPower : 0;
    return getStressHeatmapRgb(util, result.burnedOut);
  }
  if (result.underpowered) return 'var(--info)';
  return 'var(--success)';
}

export function CircuitCanvas({
  level,
  builtNodes,
  builtEdges,
  pendingNodeId,
  testResult,
  isSimulating = false,
  onSimulationFinish,
  onAddNode,
  onSelectNode,
  onRemoveNode,
  onRemoveEdge,
  onResetSimulation,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const particleCanvasRef = useRef<PhysicsParticleCanvasHandle | null>(null);
  const { buildArea, gridSize } = level;
  const simRef = useRef<ReturnType<typeof createMatterCircuitSimulation> | null>(null);

  // Animation phase for electron particle flow
  const [electronPhase, setElectronPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [vectorsEnabled, setVectorsEnabled] = useState(true);
  const [metricsEnabled, setMetricsEnabled] = useState(true);
  const [liveTelemetry, setLiveTelemetry] = useState<CircuitTelemetry | null>(null);

  const [switchState, setSwitchState] = useState<{
    leverAngle: number;
    contactClosed: boolean;
    breakerTripped: boolean;
    sparks: ArcSpark[];
  }>({
    leverAngle: -45,
    contactClosed: false,
    breakerTripped: false,
    sparks: [],
  });

  const handleResetSimulationClick = useCallback(() => {
    soundFx.playSnapNode();
    if (simRef.current) {
      simRef.current.resetBodies();
    }
    setSwitchState({
      leverAngle: -45,
      contactClosed: false,
      breakerTripped: false,
      sparks: [],
    });
    particleCanvasRef.current?.clear();
    setIsPaused(false);
    if (onResetSimulation) {
      onResetSimulation();
    }
  }, [onResetSimulation]);

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

  const allPoints = new Map<string, Point>();
  for (const n of level.fixedNodes) allPoints.set(n.id, n);
  for (const n of builtNodes) allPoints.set(n.id, n);

  const resultByEdgeId = new Map(
    testResult?.status === 'analyzed' ? testResult.edges.map((e) => [e.edgeId, e]) : [],
  );

  // Matter.js electromechanical contact switch and breaker simulation
  useEffect(() => {
    if (!isSimulating) return;

    const model = toCircuitModel(level, builtNodes, builtEdges);
    const sim = createMatterCircuitSimulation(model);
    simRef.current = sim;
    sim.toggleSwitch(true);

    const tracker = {
      animId: 0,
      lastTime: null as number | null,
      startTime: null as number | null,
      playedContactSound: false,
      playedBreakerSound: false,
      totalJouleEnergy: 0,
    };

    const frame = (timestamp: number) => {
      if (isPaused) {
        tracker.animId = requestAnimationFrame(frame);
        return;
      }

      if (tracker.startTime === null) {
        tracker.startTime = timestamp;
        tracker.lastTime = timestamp;
      }
      const rawDt = tracker.lastTime !== null ? Math.min(50, timestamp - tracker.lastTime) : 16.6;
      tracker.lastTime = timestamp;
      const dt = rawDt * playbackSpeed;
      const elapsed = timestamp - tracker.startTime;

      const state = sim.step(dt);
      setSwitchState({
        leverAngle: state.leverAngleDegrees,
        contactClosed: state.isContactClosed,
        breakerTripped: state.breakerTripped,
        sparks: state.arcSparks,
      });

      // Compute live electrodynamic metrics
      if (testResult?.status === 'analyzed' && state.isContactClosed && !state.breakerTripped) {
        let totalCurrent = 0;
        let totalPower = 0;
        let peakUtil = 0;
        let highestEdgeId: string | null = null;

        for (const edgeRes of testResult.edges) {
          totalPower += edgeRes.power;
          const util = edgeRes.maxPower > 0 ? edgeRes.power / edgeRes.maxPower : 0;
          if (util > peakUtil) {
            peakUtil = util;
            highestEdgeId = edgeRes.edgeId;
          }
          if (edgeRes.current > totalCurrent) {
            totalCurrent = edgeRes.current;
          }
        }

        tracker.totalJouleEnergy += totalPower * (dt / 1000);
        const breakerMargin = Math.max(0, (1 - peakUtil) * 100);

        setLiveTelemetry({
          totalSourceCurrentA: totalCurrent,
          loopVoltageV: level.sourceVoltage,
          totalPowerW: totalPower,
          totalJouleEnergyJ: tracker.totalJouleEnergy,
          peakComponentUtilization: peakUtil,
          highestLoadedEdgeId: highestEdgeId,
          kirchhoffResidualA: 0.000,
          breakerMarginPercent: breakerMargin,
          breakerTripped: state.breakerTripped,
          activeSparkCount: state.arcSparks.length,
        });
      } else {
        setLiveTelemetry({
          totalSourceCurrentA: 0,
          loopVoltageV: level.sourceVoltage,
          totalPowerW: 0,
          totalJouleEnergyJ: tracker.totalJouleEnergy,
          peakComponentUtilization: 0,
          highestLoadedEdgeId: null,
          kirchhoffResidualA: 0,
          breakerMarginPercent: 100,
          breakerTripped: state.breakerTripped,
          activeSparkCount: state.arcSparks.length,
        });
      }

      if (state.isContactClosed && !tracker.playedContactSound) {
        soundFx.playSnapNode();
        soundFx.playElectricHum();
        tracker.playedContactSound = true;
      }

      if (state.breakerTripped && !tracker.playedBreakerSound) {
        soundFx.playBreak();
        soundFx.playSpark();
        tracker.playedBreakerSound = true;
      }

      // Physics particle canvas visual feedback for electric arcs and breaker blowout
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (state.arcSparks.length > 0) {
          for (const s of state.arcSparks) {
            const px = (s.x / 400) * rect.width;
            const py = (s.y / 300) * rect.height;
            particleCanvasRef.current?.emitSparks(px, py, 3, { color: '#38bdf8' });
          }
        }
        if (state.breakerTripped && !tracker.playedBreakerSound) {
          particleCanvasRef.current?.emitSparks(rect.width * 0.45, rect.height * 0.45, 24, { color: '#f59e0b' });
          particleCanvasRef.current?.emitStressPuff(rect.width * 0.45, rect.height * 0.45, 1.0);
        }
      }

      if (elapsed < 2000) {
        tracker.animId = requestAnimationFrame(frame);
      } else {
        if (onSimulationFinish) {
          onSimulationFinish();
        }
      }
    };

    tracker.animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(tracker.animId);
      sim.destroy();
    };
  }, [isSimulating, isPaused, playbackSpeed, level, builtNodes, builtEdges, testResult, onSimulationFinish]);

  // Continuous animation loop for electron particles
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setElectronPhase((p) => (p + 0.035) % 1);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const vbX = buildArea.minX - 1;
  const vbY = buildArea.minY - 1;
  const vbW = buildArea.maxX - buildArea.minX + 2;
  const vbH = buildArea.maxY - buildArea.minY + 2;

  function toModel(evt: React.MouseEvent): Point | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function handleBackgroundClick(evt: React.MouseEvent) {
    if (isSimulating) return;
    const p = toModel(evt);
    if (!p) return;
    const snappedX = Math.round(p.x / gridSize) * gridSize;
    const snappedY = Math.round(p.y / gridSize) * gridSize;
    if (
      snappedX < buildArea.minX ||
      snappedX > buildArea.maxX ||
      snappedY < buildArea.minY ||
      snappedY > buildArea.maxY
    ) {
      return;
    }
    const tooClose = [...allPoints.values()].some(
      (n) => Math.hypot(n.x - snappedX, n.y - snappedY) < gridSize / 2,
    );
    if (tooClose) return;
    soundFx.playSnapNode();
    onAddNode(snappedX, snappedY);
  }

  const gridDots: Point[] = [];
  for (let x = buildArea.minX; x <= buildArea.maxX + 1e-6; x += gridSize) {
    for (let y = buildArea.minY; y <= buildArea.maxY + 1e-6; y += gridSize) {
      gridDots.push({ x, y });
    }
  }

  const hasCurrent = testResult?.status === 'analyzed' && testResult.edges.some((e) => e.current > 0.001);

  const isBreakerTripped = isSimulating
    ? switchState.breakerTripped
    : Boolean(testResult?.status === 'analyzed' && testResult.anyBurnedOut);
  const isContactClosed = isSimulating ? switchState.contactClosed : Boolean(testResult);
  const leverAngle = isSimulating ? switchState.leverAngle : testResult ? 0 : -45;
  const sparks = isSimulating ? switchState.sparks : [];

  return (
    <div className="relative w-full h-full">
      {/* Simulation Transport Control Panel */}
      <div className="absolute top-3 left-3 z-20">
        <SimulationControlPanel
          isSimulating={isSimulating}
          isPaused={isPaused}
          playbackSpeed={playbackSpeed}
          onTogglePlayPause={() => setIsPaused((v) => !v)}
          onReset={handleResetSimulationClick}
          onSpeedChange={(spd) => setPlaybackSpeed(spd)}
          heatmapEnabled={heatmapEnabled}
          onToggleHeatmap={() => setHeatmapEnabled((v) => !v)}
          vectorsEnabled={vectorsEnabled}
          onToggleVectors={() => setVectorsEnabled((v) => !v)}
          metricsEnabled={metricsEnabled}
          onToggleMetrics={() => setMetricsEnabled((v) => !v)}
        />
      </div>

      {/* Electromechanical Breaker HUD */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-xl bg-surface-2/85 backdrop-blur border border-border/80 px-3 py-1.5 font-mono text-xs shadow-md">
        <span className="text-fg-muted">Breaker:</span>
        {isBreakerTripped ? (
          <span className="flex items-center gap-1 text-danger font-semibold">
            ⚡ TRIPPED (Overcurrent)
          </span>
        ) : isContactClosed ? (
          <span className="flex items-center gap-1 text-success font-semibold">
            ● CLOSED (Conducting)
          </span>
        ) : (
          <span className="flex items-center gap-1 text-fg-subtle">
            ○ OPEN ({leverAngle.toFixed(0)}°)
          </span>
        )}
        {onResetSimulation && (
          <button
            onClick={handleResetSimulationClick}
            title="Reset Matter.js switch contacts and breaker mechanism"
            className="ml-2 rounded px-2 py-0.5 bg-surface-1 hover:bg-surface-2 text-fg hover:border-accent border border-border text-xs transition-colors"
          >
            ↺ Reset Sim
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full touch-none select-none"
        onClick={handleBackgroundClick}
      >
        <defs>
          <filter id="bulb-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.25" />
          </filter>
          {/* Current Flow Vector Arrowhead */}
          <marker
            id="arrow-current"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00e5ff" />
          </marker>
        </defs>

        {/* Grid dots */}
        {gridDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={0.02} fill="var(--border)" />
        ))}

        {/* Matter.js Arc Flash Sparks */}
        {sparks.map((s, idx) => (
          <circle
            key={`spark-${idx}`}
            cx={vbX + (s.x / 400) * vbW}
            cy={vbY + (s.y / 300) * vbH}
            r={s.size * 0.012}
            fill="#ffdd00"
            opacity={s.life}
          />
        ))}

        {/* Given (free) load edges, e.g. the bulb */}
        {level.givenEdges.map((edge) => {
          const a = allPoints.get(edge.nodeA)!;
          const b = allPoints.get(edge.nodeB)!;
          const component = COMPONENTS[edge.componentId];
          const result = resultByEdgeId.get(edge.id);
          const color = getCircuitEdgeColor(result, component.color, heatmapEnabled);
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const isBulb = edge.componentId.includes('bulb') || component.name.toLowerCase().includes('bulb');
          const isGlowing = result && !result.burnedOut && !result.underpowered;
          const current = result?.current ?? 0;

          return (
            <g key={edge.id}>
              {/* Radiant bulb glow halo */}
              {isBulb && (isSimulating || testResult) && isGlowing && (
                <circle
                  cx={midX}
                  cy={midY}
                  r={0.45}
                  fill="var(--warning)"
                  opacity={0.4}
                  filter="url(#bulb-glow)"
                />
              )}

              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={0.18}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />

              {/* Bulb icon & filament */}
              {isBulb && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle
                    r={0.18}
                    fill={isGlowing ? '#ffeb3b' : 'var(--surface-2)'}
                    stroke="var(--fg)"
                    strokeWidth={0.03}
                  />
                  <text
                    fontSize={0.18}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--surface-1)"
                  >
                    💡
                  </text>
                </g>
              )}

              {/* Burned out flash */}
              {result?.burnedOut && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle r={0.3} fill="var(--danger)" opacity={0.7} className="animate-ping" />
                  <text
                    fontSize={0.25}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--fg)"
                  >
                    ⚡
                  </text>
                </g>
              )}

              {/* Current flow vector arrow & telemetry label */}
              {vectorsEnabled && (isSimulating || testResult) && current > 0.001 && !result?.burnedOut && (
                <g>
                  <line
                    x1={a.x + (b.x - a.x) * 0.25}
                    y1={a.y + (b.y - a.y) * 0.25}
                    x2={a.x + (b.x - a.x) * 0.75}
                    y2={a.y + (b.y - a.y) * 0.75}
                    stroke="#00e5ff"
                    strokeWidth={0.05}
                    markerEnd="url(#arrow-current)"
                    opacity={0.85}
                  />
                  <rect
                    x={midX - 0.22}
                    y={midY - 0.32}
                    width={0.44}
                    height={0.16}
                    rx={0.04}
                    fill="rgba(10, 16, 26, 0.85)"
                    stroke="#00e5ff"
                    strokeWidth={0.015}
                  />
                  <text
                    x={midX}
                    y={midY - 0.24}
                    fontSize={0.09}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#00e5ff"
                  >
                    {(current * 1000).toFixed(0)} mA
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Player-built connections */}
        {builtEdges.map((edge) => {
          const a = allPoints.get(edge.nodeA);
          const b = allPoints.get(edge.nodeB);
          if (!a || !b) return null;
          const component = COMPONENTS[edge.componentId];
          const result = resultByEdgeId.get(edge.id);
          const color = getCircuitEdgeColor(result, component.color, heatmapEnabled);
          const current = result?.current ?? 0;
          const isBurned = result?.burnedOut;
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={0.12}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className={isSimulating ? '' : 'cursor-pointer'}
                onClick={(e) => {
                  if (isSimulating) return;
                  e.stopPropagation();
                  soundFx.playSnapNode();
                  onRemoveEdge(edge.id);
                }}
              />

              {/* Component badge icon on the wire */}
              {component.id !== 'wire' && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-0.22}
                    y={-0.12}
                    width={0.44}
                    height={0.24}
                    rx={0.06}
                    fill="var(--surface-2)"
                    stroke={color}
                    strokeWidth={0.03}
                  />
                  <text
                    fontSize={0.11}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--fg)"
                  >
                    {component.resistance}Ω
                  </text>
                </g>
              )}

              {/* Burned out explosion badge */}
              {isBurned && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <circle r={0.28} fill="var(--danger)" opacity={0.7} className="animate-ping" />
                  <text
                    fontSize={0.24}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--fg)"
                  >
                    💥
                  </text>
                </g>
              )}

              {/* Animated electron particle beads */}
              {(isSimulating || testResult) && hasCurrent && current > 0.01 && !isBurned && (
                <>
                  {[0, 0.33, 0.66].map((offset, i) => {
                    const t = (electronPhase + offset) % 1;
                    const px = a.x + t * (b.x - a.x);
                    const py = a.y + t * (b.y - a.y);
                    return (
                      <circle
                        key={i}
                        cx={px}
                        cy={py}
                        r={0.045}
                        fill="#00ffff"
                        filter="url(#bulb-glow)"
                      />
                    );
                  })}
                </>
              )}

              {/* Current flow vector arrow & telemetry label */}
              {vectorsEnabled && (isSimulating || testResult) && current > 0.001 && !isBurned && (
                <g>
                  <line
                    x1={a.x + (b.x - a.x) * 0.25}
                    y1={a.y + (b.y - a.y) * 0.25}
                    x2={a.x + (b.x - a.x) * 0.75}
                    y2={a.y + (b.y - a.y) * 0.75}
                    stroke="#00e5ff"
                    strokeWidth={0.04}
                    markerEnd="url(#arrow-current)"
                    opacity={0.8}
                  />
                  <rect
                    x={midX - 0.2}
                    y={midY - 0.26}
                    width={0.4}
                    height={0.15}
                    rx={0.03}
                    fill="rgba(10, 16, 26, 0.85)"
                    stroke="#00e5ff"
                    strokeWidth={0.015}
                  />
                  <text
                    x={midX}
                    y={midY - 0.18}
                    fontSize={0.085}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#00e5ff"
                  >
                    {(current * 1000).toFixed(0)} mA
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Battery terminals */}
        {level.fixedNodes
          .filter((n) => n.terminal !== 'none')
          .map((n) => (
            <g key={`terminal-${n.id}`}>
              <text
                x={n.x}
                y={n.y - 0.28}
                textAnchor="middle"
                fontSize={0.32}
                fontWeight="bold"
                fill={n.terminal === 'positive' ? 'var(--danger)' : 'var(--info)'}
              >
                {n.terminal === 'positive' ? '+' : '−'}
              </text>
              {/* Battery source voltage tag */}
              {n.terminal === 'positive' && (
                <text
                  x={n.x}
                  y={n.y + 0.36}
                  textAnchor="middle"
                  fontSize={0.16}
                  fontFamily="monospace"
                  fill="var(--fg-muted)"
                >
                  {level.sourceVoltage}V
                </text>
              )}
            </g>
          ))}

        {/* All nodes */}
        {[...level.fixedNodes, ...builtNodes].map((n) => {
          const isPending = pendingNodeId === n.id;
          const isTerminal = level.fixedNodes.some(
            (f) => f.id === n.id && f.terminal !== 'none',
          );
          return (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={isTerminal ? 0.18 : 0.14}
              fill={isPending ? 'var(--accent)' : isTerminal ? 'var(--fg)' : 'var(--fg-muted)'}
              stroke={isPending ? 'var(--accent)' : isTerminal ? 'var(--fg)' : 'var(--bg)'}
              strokeWidth={0.05}
              vectorEffect="non-scaling-stroke"
              className={isSimulating ? '' : 'cursor-pointer'}
              onClick={(e) => {
                if (isSimulating) return;
                e.stopPropagation();
                soundFx.playSnapNode();
                onSelectNode(n.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const isFixed = level.fixedNodes.some((f) => f.id === n.id);
                if (!isFixed && !isSimulating) {
                  soundFx.playSnapNode();
                  onRemoveNode(n.id);
                }
              }}
            />
          );
        })}
      </svg>
      {/* Particle Simulation Canvas for short-circuits and electrical arcs */}
      <PhysicsParticleCanvas ref={particleCanvasRef} active={isSimulating} />

      {/* Real-time Circuit HUD */}
      {metricsEnabled && (
        <CircuitRealTimeMetricsOverlay
          telemetry={liveTelemetry}
          isSimulating={isSimulating}
          heatmapEnabled={heatmapEnabled}
          vectorsEnabled={vectorsEnabled}
        />
      )}
    </div>
  );
}
