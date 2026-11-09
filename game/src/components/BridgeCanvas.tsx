import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { LevelDef } from '../content/types';
import type { BuiltMember, BuiltNode } from '../game/build';
import { MATERIALS } from '../physics/materials';
import type { TestResult } from '../state/gameStore';
import type { DynamicSimulationTrajectory } from '../physics/trussDynamic';
import { computeMatterTrussTrajectory } from '../physics/matterTruss';
import { toTrussModel } from '../game/build';
import { analyzeTruss } from '../physics/truss';
import { soundFx } from '../audio/soundFx';
import { getStressHeatmapRgb } from '../physics/heatmap';
import { SimulationControlPanel } from './SimulationControlPanel';
import { RealTimeMetricsOverlay } from './RealTimeMetricsOverlay';
import { PhysicsParticleCanvas, type PhysicsParticleCanvasHandle } from './PhysicsParticleCanvas';
import type { PhysicsDebugConfig } from './PhysicsDebugPanel';

interface Point {
  x: number;
  y: number;
}

interface Props {
  level: LevelDef;
  builtNodes: BuiltNode[];
  builtMembers: BuiltMember[];
  pendingNodeId: string | null;
  testResult: TestResult | null;
  debugConfig?: PhysicsDebugConfig;
  cog?: { x: number; y: number } | null;
  showCoGMarker?: boolean;
  heatmapEnabled?: boolean;
  onToggleHeatmap?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  isSimulating?: boolean;
  onSimulationFinish?: () => void;
  onResetSimulation?: () => void;
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

function getMemberColor(
  utilization: number,
  failed: boolean,
  materialColor: string,
  heatmap: boolean,
): string {
  if (failed) return '#ef4444';
  if (!heatmap) return materialColor;
  return getStressHeatmapRgb(utilization, failed);
}

export function BridgeCanvas({
  level,
  builtNodes,
  builtMembers,
  pendingNodeId,
  testResult,
  debugConfig,
  cog,
  showCoGMarker = true,
  heatmapEnabled: propHeatmapEnabled,
  onToggleHeatmap,
  playbackSpeed: propPlaybackSpeed,
  onSpeedChange,
  isSimulating = false,
  onSimulationFinish,
  onResetSimulation,
  onAddNode,
  onSelectNode,
  onRemoveNode,
  onRemoveMember,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { buildArea, gridSize } = level;
  const vbX = buildArea.minX - 1;
  const vbY = buildArea.minY - 1;
  const vbW = buildArea.maxX - buildArea.minX + 2;
  const vbH = buildArea.maxY - buildArea.minY + 3;
  const particleCanvasRef = useRef<PhysicsParticleCanvasHandle | null>(null);

  // Dynamic simulation playback state
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1
  const [internalSpeed, setInternalSpeed] = useState(1);
  const playbackSpeed = propPlaybackSpeed ?? internalSpeed;
  const setPlaybackSpeed = onSpeedChange ?? setInternalSpeed;

  const [isPaused, setIsPaused] = useState(false);
  const [internalHeatmap, setInternalHeatmap] = useState(true);
  const heatmapEnabled = propHeatmapEnabled ?? internalHeatmap;
  const toggleHeatmap = useCallback(() => {
    if (onToggleHeatmap) {
      onToggleHeatmap();
    } else {
      setInternalHeatmap((v) => !v);
    }
  }, [onToggleHeatmap]);

  const [vectorsEnabled, setVectorsEnabled] = useState(true);
  const [metricsEnabled, setMetricsEnabled] = useState(true);
  const soundPlayedRef = useRef<{ creak: boolean; snap: boolean }>({ creak: false, snap: false });

  // Base coordinates mapping
  const basePoints = useMemo(() => {
    const map = new Map<string, Point>();
    for (const n of level.fixedNodes) map.set(n.id, { x: n.x, y: n.y });
    for (const n of builtNodes) map.set(n.id, { x: n.x, y: n.y });
    return map;
  }, [level.fixedNodes, builtNodes]);

  // Real-time static dead-load member stress map in build mode when heatmap is active
  const buildModeStressMap = useMemo(() => {
    if (!heatmapEnabled || isSimulating || testResult) return null;
    try {
      const model = toTrussModel(level, builtNodes, builtMembers);
      const analysis = analyzeTruss(model);
      if (analysis.status === 'analyzed') {
        const map = new Map<string, { utilization: number; failed: boolean }>();
        for (const m of analysis.members) {
          map.set(m.memberId, { utilization: m.utilization, failed: m.failed });
        }
        return map;
      }
    } catch {
      return null;
    }
    return null;
  }, [heatmapEnabled, isSimulating, testResult, level, builtNodes, builtMembers]);

  // Compute dynamic trajectory when in simulation or test mode using Matter.js physics engine
  const trajectory: DynamicSimulationTrajectory | null = useMemo(() => {
    if (!testResult && !isSimulating) return null;
    const model = toTrussModel(level, builtNodes, builtMembers);
    return computeMatterTrussTrajectory(level, model, 36);
  }, [level, builtNodes, builtMembers, testResult, isSimulating]);

  const animIdRef = useRef<number>(0);
  const startTimestampRef = useRef<number | null>(null);
  const animProgressRef = useRef(animProgress);
  useEffect(() => {
    animProgressRef.current = animProgress;
  }, [animProgress]);

  const handleResetSimulation = useCallback(() => {
    setAnimProgress(0);
    setIsPaused(false);
    startTimestampRef.current = null;
    soundPlayedRef.current = { creak: false, snap: false };
    particleCanvasRef.current?.clear();
    onResetSimulation?.();
  }, [onResetSimulation]);

  const handleScrub = useCallback((p: number) => {
    setIsPaused(true);
    setAnimProgress(p);
    startTimestampRef.current = null;
  }, []);

  // Keyboard controls for rapid inspection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && (isSimulating || testResult)) {
        e.preventDefault();
        setIsPaused((v) => !v);
      } else if ((e.key === 'r' || e.key === 'R') && (isSimulating || testResult)) {
        handleResetSimulation();
      } else if (e.key === 'h' || e.key === 'H') {
        toggleHeatmap();
      } else if (e.key === 'v' || e.key === 'V') {
        setVectorsEnabled((v) => !v);
      } else if (e.key === 'm' || e.key === 'M') {
        setMetricsEnabled((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulating, testResult, handleResetSimulation, toggleHeatmap]);

  // Animation loop when simulating
  useEffect(() => {
    if (!isSimulating || !trajectory || trajectory.frames.length === 0) {
      soundPlayedRef.current = { creak: false, snap: false };
      startTimestampRef.current = null;
      return;
    }

    const duration = (trajectory.durationSeconds * 1000) / playbackSpeed;

    const frame = (timestamp: number) => {
      if (isPaused) {
        animIdRef.current = requestAnimationFrame(frame);
        return;
      }

      if (startTimestampRef.current === null) {
        startTimestampRef.current = timestamp - animProgressRef.current * duration;
      }
      const elapsed = timestamp - startTimestampRef.current;
      const p = Math.min(1, Math.max(0, elapsed / duration));
      setAnimProgress(p);

      // Sound triggers and particle effects based on simulation state
      const frameIndex = Math.min(
        trajectory.frames.length - 1,
        Math.floor(p * trajectory.frames.length),
      );
      const curFrame = trajectory.frames[frameIndex];

      if (curFrame) {
        if (curFrame.maxUtilization > 0.82 && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          if (curFrame.cartPos && Math.random() > 0.65) {
            const px = ((curFrame.cartPos.x - vbX) / vbW) * rect.width;
            const py = ((curFrame.cartPos.y - vbY) / vbH) * rect.height;
            particleCanvasRef.current?.emitStressPuff(px, py, curFrame.maxUtilization);
          }
        }

        if (curFrame.maxUtilization > 0.75 && !soundPlayedRef.current.creak) {
          soundFx.playStressCreak(curFrame.maxUtilization);
          soundPlayedRef.current.creak = true;
        }

        if (curFrame.failedMemberId && !soundPlayedRef.current.snap) {
          soundFx.playBreak();
          soundPlayedRef.current.snap = true;

          // Trigger physical fracture fragments and sparks on beam failure
          if (svgRef.current) {
            const brokenMember = [...level.deckMembers, ...builtMembers].find(
              (m) => m.id === curFrame.failedMemberId,
            );
            if (brokenMember) {
              const a = basePoints.get(brokenMember.nodeA);
              const b = basePoints.get(brokenMember.nodeB);
              if (a && b) {
                const rect = svgRef.current.getBoundingClientRect();
                const x1 = ((a.x - vbX) / vbW) * rect.width;
                const y1 = ((a.y - vbY) / vbH) * rect.height;
                const x2 = ((b.x - vbX) / vbW) * rect.width;
                const y2 = ((b.y - vbY) / vbH) * rect.height;
                particleCanvasRef.current?.emitFracture(x1, y1, x2, y2, '#ef4444', 30);
                particleCanvasRef.current?.emitSparks(
                  (x1 + x2) / 2,
                  (y1 + y2) / 2,
                  18,
                  { color: '#ff6600', speed: 160 },
                );
              }
            }
          }
        }
      }

      if (p < 1) {
        animIdRef.current = requestAnimationFrame(frame);
      } else {
        if (onSimulationFinish) {
          onSimulationFinish();
        }
      }
    };

    animIdRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [
    isSimulating,
    trajectory,
    playbackSpeed,
    isPaused,
    onSimulationFinish,
    vbX,
    vbY,
    vbW,
    vbH,
    builtMembers,
    basePoints,
    level.deckMembers,
  ]);

  // Current frame data based on animProgress or static result
  const currentFrame = useMemo(() => {
    if (!trajectory || trajectory.frames.length === 0) return null;
    if (!isSimulating && testResult) {
      // Show final or failure frame
      return trajectory.frames[trajectory.frames.length - 1];
    }
    const idx = Math.min(
      trajectory.frames.length - 1,
      Math.floor(animProgress * trajectory.frames.length),
    );
    return trajectory.frames[idx];
  }, [trajectory, isSimulating, testResult, animProgress]);

  // Interpolated deformed node positions for visual delight
  const displayPoints = useMemo(() => {
    const map = new Map<string, Point>();
    const displacements = currentFrame?.nodeDisplacements ?? {};
    // Visual exaggeration factor so kids can see elasticity
    const flexScale = 12.0;

    basePoints.forEach((pt, id) => {
      const disp = displacements[id];
      if (disp && (isSimulating || testResult)) {
        map.set(id, {
          x: pt.x + disp.dx * flexScale,
          y: pt.y + disp.dy * flexScale,
        });
      } else {
        map.set(id, pt);
      }
    });
    return map;
  }, [basePoints, currentFrame, isSimulating, testResult]);

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
    const tooClose = [...basePoints.values()].some(
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

  // Cart position on bridge deck
  const cartPos = currentFrame?.cartPos;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        className="w-full h-full touch-none select-none"
        onClick={handleBackgroundClick}
      >
        {/* Grid dots */}
        {gridDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={0.02} fill="var(--border)" />
        ))}

        {/* Deck (road) members */}
        {level.deckMembers.map((m) => {
          const a = displayPoints.get(m.nodeA)!;
          const b = displayPoints.get(m.nodeB)!;
          const staticResult = testResult?.status === 'analyzed'
            ? testResult.members.find((res) => res.memberId === m.id)
            : undefined;
          const buildStress = buildModeStressMap?.get(m.id);
          const result = currentFrame?.memberResults[m.id] ?? staticResult ?? buildStress;
          const isFailed = result ? (result.failed || result.utilization >= 1.0) : false;
          const color = (heatmapEnabled && result)
            ? getMemberColor(result.utilization, isFailed, MATERIALS.wood.color, heatmapEnabled)
            : MATERIALS.wood.color;
          return (
            <line
              key={m.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color}
              strokeWidth={0.18}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Player-built members */}
        {builtMembers.map((m) => {
          const a = displayPoints.get(m.nodeA);
          const b = displayPoints.get(m.nodeB);
          if (!a || !b) return null;
          const staticResult = testResult?.status === 'analyzed'
            ? testResult.members.find((res) => res.memberId === m.id)
            : undefined;
          const buildStress = buildModeStressMap?.get(m.id);
          const result = currentFrame?.memberResults[m.id] ?? staticResult ?? buildStress;
          const material = MATERIALS[m.materialId];
          const isFailed = result?.failed || (result ? result.utilization >= 1.0 : false) || currentFrame?.failedMemberId === m.id;
          const color = (heatmapEnabled && result)
            ? getMemberColor(result.utilization, isFailed, material.color, heatmapEnabled)
            : material.color;

          return (
            <g key={m.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={isFailed ? 0.16 : 0.12}
                strokeDasharray={isFailed ? '0.15 0.1' : undefined}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className={isSimulating ? '' : 'cursor-pointer'}
                onClick={(e) => {
                  if (isSimulating) return;
                  e.stopPropagation();
                  soundFx.playSnapNode();
                  onRemoveMember(m.id);
                }}
              />
              {/* Failure rupture blast indicator or critical warning badge */}
              {isFailed && (
                <g transform={`translate(${(a.x + b.x) / 2}, ${(a.y + b.y) / 2})`}>
                  <circle r={0.22} fill="var(--danger)" opacity={0.65} className="animate-ping" />
                  <text
                    fontSize={0.28}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--fg)"
                  >
                    💥
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Active Member Force Vectors (Tension & Compression) */}
        {(isSimulating || testResult) &&
          vectorsEnabled &&
          [...level.deckMembers, ...builtMembers].map((m) => {
            const a = displayPoints.get(m.nodeA);
            const b = displayPoints.get(m.nodeB);
            if (!a || !b) return null;
            const res = currentFrame?.memberResults[m.id];
            if (!res || Math.abs(res.axialForce) < 15) return null;

            const isTension = res.axialForce > 0;
            const mag = Math.abs(res.axialForce);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            if (len < 0.35) return null;

            const ux = (b.x - a.x) / len;
            const uy = (b.y - a.y) / len;
            const nx = -uy;
            const ny = ux;

            const arrowLen = Math.min(len * 0.22, 0.35);
            const arrowColor = isTension ? '#38bdf8' : '#f97316';
            const marker = isTension ? 'url(#arrow-tension)' : 'url(#arrow-compression)';
            const forceLabel = (mag >= 1000 ? `${(mag / 1000).toFixed(1)}k` : `${Math.round(mag)}`) + (isTension ? 'T' : 'C');

            return (
              <g key={`vec-${m.id}`} className="pointer-events-none select-none">
                {isTension ? (
                  <>
                    <line
                      x1={a.x + ux * 0.12}
                      y1={a.y + uy * 0.12}
                      x2={a.x + ux * (0.12 + arrowLen)}
                      y2={a.y + uy * (0.12 + arrowLen)}
                      stroke={arrowColor}
                      strokeWidth={0.035}
                      markerEnd={marker}
                    />
                    <line
                      x1={b.x - ux * 0.12}
                      y1={b.y - uy * 0.12}
                      x2={b.x - ux * (0.12 + arrowLen)}
                      y2={b.y - uy * (0.12 + arrowLen)}
                      stroke={arrowColor}
                      strokeWidth={0.035}
                      markerEnd={marker}
                    />
                  </>
                ) : (
                  <>
                    <line
                      x1={mx - ux * 0.08}
                      y1={my - uy * 0.08}
                      x2={mx - ux * (0.08 + arrowLen)}
                      y2={my - uy * (0.08 + arrowLen)}
                      stroke={arrowColor}
                      strokeWidth={0.035}
                      markerEnd={marker}
                    />
                    <line
                      x1={mx + ux * 0.08}
                      y1={my + uy * 0.08}
                      x2={mx + ux * (0.08 + arrowLen)}
                      y2={my + uy * (0.08 + arrowLen)}
                      stroke={arrowColor}
                      strokeWidth={0.035}
                      markerEnd={marker}
                    />
                  </>
                )}
                {/* Vector magnitude badge */}
                <g transform={`translate(${mx + nx * 0.16}, ${my + ny * 0.16})`}>
                  <rect
                    x={-0.34}
                    y={-0.11}
                    width={0.68}
                    height={0.22}
                    rx={0.04}
                    fill="#020617"
                    fillOpacity={0.9}
                    stroke={arrowColor}
                    strokeWidth={0.012}
                  />
                  <text
                    x={0}
                    y={0.045}
                    fontSize={0.105}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill={arrowColor}
                  >
                    {forceLabel}
                  </text>
                </g>
              </g>
            );
          })}

        {/* Anchors (pin / roller) */}
        {level.fixedNodes
          .filter((n) => n.support !== 'none')
          .map((n) => (
            <g key={`support-${n.id}`}>
              <polygon
                points={`${n.x - 0.35},${n.y + 0.6} ${n.x + 0.35},${n.y + 0.6} ${n.x},${n.y}`}
                fill="var(--fg-muted)"
              />
              {n.support === 'roller' && (
                <>
                  <circle cx={n.x - 0.18} cy={n.y + 0.72} r={0.12} fill="var(--fg-muted)" />
                  <circle cx={n.x + 0.18} cy={n.y + 0.72} r={0.12} fill="var(--fg-muted)" />
                </>
              )}
              <line
                x1={n.x - 0.5}
                y1={n.y + 0.9}
                x2={n.x + 0.5}
                y2={n.y + 0.9}
                stroke="var(--fg-subtle)"
                strokeWidth={0.06}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

        {/* Support reaction force vectors */}
        {(isSimulating || testResult) &&
          vectorsEnabled &&
          currentFrame?.supportReactions &&
          level.fixedNodes
            .filter((n) => n.support !== 'none')
            .map((n) => {
              const pt = displayPoints.get(n.id) ?? n;
              const r = currentFrame.supportReactions?.[n.id];
              if (!r) return null;
              const ryMag = Math.abs(r.ry);
              if (ryMag < 50) return null;
              const arrowHeight = Math.min(1.0, Math.max(0.35, (ryMag / 10000) * 0.7));
              return (
                <g key={`react-vec-${n.id}`} className="pointer-events-none select-none">
                  <line
                    x1={pt.x}
                    y1={pt.y + 0.6 + arrowHeight}
                    x2={pt.x}
                    y2={pt.y + 0.6}
                    stroke="#10b981"
                    strokeWidth={0.05}
                    markerEnd="url(#arrow-reaction)"
                  />
                  <rect
                    x={pt.x - 0.42}
                    y={pt.y + 0.65 + arrowHeight}
                    width={0.84}
                    height={0.22}
                    rx={0.04}
                    fill="#020617"
                    fillOpacity={0.9}
                    stroke="#10b981"
                    strokeWidth={0.012}
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 0.8 + arrowHeight}
                    fontSize={0.105}
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#10b981"
                  >
                    {(ryMag / 1000).toFixed(1)}kN ↑
                  </text>
                </g>
              );
            })}

        {/* Dynamic Vehicle / Cart Crossing the Deck */}
        {(isSimulating || testResult) && cartPos && (
          <g
            transform={`translate(${cartPos.x}, ${cartPos.y})`}
            className="transition-transform duration-75"
          >
            {/* Cart body */}
            <rect
              x={-0.38}
              y={-0.42}
              width={0.76}
              height={0.28}
              rx={0.06}
              fill="var(--accent)"
              stroke="var(--fg)"
              strokeWidth={0.04}
            />
            {/* Cargo container on cart */}
            <rect
              x={-0.32}
              y={-0.62}
              width={0.64}
              height={0.22}
              rx={0.04}
              fill="var(--surface-2)"
              stroke="var(--fg-muted)"
              strokeWidth={0.03}
            />
            {/* Cab window */}
            <rect x={0.12} y={-0.4} width={0.18} height={0.14} rx={0.03} fill="var(--info)" />
            {/* Left wheel */}
            <circle
              cx={-0.22}
              cy={-0.08}
              r={0.12}
              fill="var(--surface-1)"
              stroke="var(--fg)"
              strokeWidth={0.04}
            />
            {/* Right wheel */}
            <circle
              cx={0.22}
              cy={-0.08}
              r={0.12}
              fill="var(--surface-1)"
              stroke="var(--fg)"
              strokeWidth={0.04}
            />
            {/* Load indicator tag */}
            <text
              x={0}
              y={-0.48}
              fontSize={0.14}
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              fill="var(--fg)"
            >
              FORGE
            </text>

            {/* Live Vehicle Weight Force Vector */}
            {vectorsEnabled && (
              <g className="pointer-events-none select-none">
                <line
                  x1={0}
                  y1={-0.05}
                  x2={0}
                  y2={0.55}
                  stroke="#f59e0b"
                  strokeWidth={0.05}
                  markerEnd="url(#arrow-load)"
                />
                <rect
                  x={0.06}
                  y={0.2}
                  width={0.68}
                  height={0.2}
                  rx={0.03}
                  fill="#020617"
                  fillOpacity={0.92}
                  stroke="#f59e0b"
                  strokeWidth={0.012}
                />
                <text
                  x={0.4}
                  y={0.34}
                  fontSize={0.095}
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="#f59e0b"
                >
                  10.0kN ↓
                </text>
              </g>
            )}
          </g>
        )}

        {/* Load markers when not simulating */}
        {!isSimulating &&
          !testResult &&
          level.loads.map((load) => {
            const n = displayPoints.get(load.nodeId);
            if (!n) return null;
            return (
              <g key={`load-${load.nodeId}`}>
                <line
                  x1={n.x}
                  y1={n.y - 0.9}
                  x2={n.x}
                  y2={n.y - 0.15}
                  stroke="var(--accent)"
                  strokeWidth={0.08}
                  markerEnd="url(#arrow)"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
            <path d="M0,0 L6,0 L3,6 z" fill="var(--accent)" />
          </marker>
          <marker id="arrow-tension" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-compression" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 z" fill="#f97316" />
          </marker>
          <marker id="arrow-reaction" markerWidth="5" markerHeight="5" refX="2.5" refY="1" orient="auto">
            <path d="M0,5 L5,5 L2.5,0 z" fill="#10b981" />
          </marker>
          <marker id="arrow-load" markerWidth="5" markerHeight="5" refX="2.5" refY="4" orient="auto">
            <path d="M0,0 L5,0 L2.5,5 z" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Physics Debug Overlay: Wireframe Colliders */}
        {debugConfig?.enabled && debugConfig.showColliders && (
          <g id="debug-colliders" className="pointer-events-none select-none">
            {/* Fixed Foundation Ground Colliders */}
            {level.fixedNodes.map((fn) => (
              <g key={`debug-ground-${fn.id}`}>
                <rect
                  x={fn.x - 0.45}
                  y={fn.y + 0.1}
                  width={0.9}
                  height={0.55}
                  fill="#06b6d4"
                  fillOpacity={0.06}
                  stroke="#06b6d4"
                  strokeWidth={0.02}
                  strokeDasharray="0.06 0.04"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={fn.x}
                  y={fn.y + 0.42}
                  fontSize={0.11}
                  fontFamily="monospace"
                  fill="#06b6d4"
                  textAnchor="middle"
                  opacity={0.8}
                >
                  FOUNDATION [{fn.id}]
                </text>
              </g>
            ))}

            {/* Member Oriented Bounding Box Colliders */}
            {[...level.deckMembers, ...builtMembers].map((m) => {
              const a = displayPoints.get(m.nodeA);
              const b = displayPoints.get(m.nodeB);
              if (!a || !b) return null;
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              if (len < 0.1) return null;

              const ux = (b.x - a.x) / len;
              const uy = (b.y - a.y) / len;
              const nx = -uy;
              const ny = ux;

              const hw = 'materialId' in m && m.materialId === 'wood' ? 0.15 : 'materialId' in m && m.materialId === 'cable' ? 0.07 : 0.11;
              const p1 = `${a.x + nx * hw},${a.y + ny * hw}`;
              const p2 = `${b.x + nx * hw},${b.y + ny * hw}`;
              const p3 = `${b.x - nx * hw},${b.y - ny * hw}`;
              const p4 = `${a.x - nx * hw},${a.y - ny * hw}`;

              return (
                <g key={`debug-mem-col-${m.id}`}>
                  <polygon
                    points={`${p1} ${p2} ${p3} ${p4}`}
                    fill="#10b981"
                    fillOpacity={0.08}
                    stroke="#10b981"
                    strokeWidth={0.018}
                    strokeDasharray="0.08 0.05"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Cross-section caliper tick */}
                  <line
                    x1={(a.x + b.x) / 2 - nx * hw * 1.3}
                    y1={(a.y + b.y) / 2 - ny * hw * 1.3}
                    x2={(a.x + b.x) / 2 + nx * hw * 1.3}
                    y2={(a.y + b.y) / 2 + ny * hw * 1.3}
                    stroke="#10b981"
                    strokeWidth={0.015}
                  />
                </g>
              );
            })}

            {/* Node Joint Pin Colliders & Clearance Circles */}
            {[...level.fixedNodes, ...builtNodes].map((n) => {
              const pt = displayPoints.get(n.id) ?? n;
              return (
                <g key={`debug-node-col-${n.id}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={0.28}
                    fill="#06b6d4"
                    fillOpacity={0.05}
                    stroke="#06b6d4"
                    strokeWidth={0.02}
                    strokeDasharray="0.06 0.04"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line x1={pt.x - 0.14} y1={pt.y} x2={pt.x + 0.14} y2={pt.y} stroke="#06b6d4" strokeWidth={0.015} />
                  <line x1={pt.x} y1={pt.y - 0.14} x2={pt.x} y2={pt.y + 0.14} stroke="#06b6d4" strokeWidth={0.015} />
                  <text
                    x={pt.x + 0.15}
                    y={pt.y - 0.15}
                    fontSize={0.11}
                    fontFamily="monospace"
                    fill="#06b6d4"
                    fontWeight="bold"
                  >
                    {n.id} ({pt.x.toFixed(1)},{pt.y.toFixed(1)})
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Physics Debug Overlay: Design Force Vectors */}
        {debugConfig?.enabled && debugConfig.showForceVectors && (
          <g id="debug-force-vectors" className="pointer-events-none select-none">
            {/* Free Joint Dead-Load Gravity Vectors */}
            {builtNodes.map((n) => {
              const pt = displayPoints.get(n.id) ?? n;
              return (
                <g key={`debug-grav-${n.id}`}>
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={pt.y + 0.45}
                    stroke="#f59e0b"
                    strokeWidth={0.035}
                    markerEnd="url(#arrow-load)"
                  />
                  <rect
                    x={pt.x + 0.06}
                    y={pt.y + 0.16}
                    width={0.44}
                    height={0.18}
                    rx={0.03}
                    fill="#020617"
                    fillOpacity={0.9}
                    stroke="#f59e0b"
                    strokeWidth={0.01}
                  />
                  <text
                    x={pt.x + 0.28}
                    y={pt.y + 0.29}
                    fontSize={0.09}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#f59e0b"
                    textAnchor="middle"
                  >
                    Fg ↓
                  </text>
                </g>
              );
            })}

            {/* Pinned Support Foundation Reaction Vectors */}
            {level.fixedNodes.map((n) => {
              const pt = displayPoints.get(n.id) ?? n;
              return (
                <g key={`debug-react-prev-${n.id}`}>
                  <line
                    x1={pt.x}
                    y1={pt.y + 0.6}
                    x2={pt.x}
                    y2={pt.y + 0.08}
                    stroke="#06b6d4"
                    strokeWidth={0.04}
                    markerEnd="url(#arrow-reaction)"
                  />
                  <rect
                    x={pt.x + 0.06}
                    y={pt.y + 0.24}
                    width={0.44}
                    height={0.18}
                    rx={0.03}
                    fill="#020617"
                    fillOpacity={0.9}
                    stroke="#06b6d4"
                    strokeWidth={0.01}
                  />
                  <text
                    x={pt.x + 0.28}
                    y={pt.y + 0.37}
                    fontSize={0.09}
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#06b6d4"
                    textAnchor="middle"
                  >
                    Ry ↑
                  </text>
                </g>
              );
            })}

            {/* Axial Load Path Vectors along Built Members in Design Mode */}
            {!isSimulating &&
              !testResult &&
              builtMembers.map((m) => {
                const a = displayPoints.get(m.nodeA);
                const b = displayPoints.get(m.nodeB);
                if (!a || !b) return null;
                const len = Math.hypot(b.x - a.x, b.y - a.y);
                if (len < 0.45) return null;
                const ux = (b.x - a.x) / len;
                const uy = (b.y - a.y) / len;
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2;

                return (
                  <g key={`debug-path-${m.id}`} opacity={0.85}>
                    <line
                      x1={mx - ux * 0.18}
                      y1={my - uy * 0.18}
                      x2={mx + ux * 0.18}
                      y2={my + uy * 0.18}
                      stroke="#38bdf8"
                      strokeWidth={0.02}
                      strokeDasharray="0.04 0.03"
                      markerEnd="url(#arrow-tension)"
                    />
                  </g>
                );
              })}
          </g>
        )}

        {/* Nodes */}
        {[...level.fixedNodes, ...builtNodes].map((n) => {
          const pt = displayPoints.get(n.id) ?? n;
          const isPending = pendingNodeId === n.id;
          const isFixed = level.fixedNodes.some((f) => f.id === n.id);
          return (
            <circle
              key={n.id}
              cx={pt.x}
              cy={pt.y}
              r={isFixed ? 0.16 : 0.14}
              fill={isPending ? 'var(--accent)' : isFixed ? 'var(--fg)' : 'var(--fg-muted)'}
              stroke={isPending ? 'var(--accent)' : isFixed ? 'var(--fg)' : 'var(--bg)'}
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
                if (!isFixed && !isSimulating) {
                  soundFx.playSnapNode();
                  onRemoveNode(n.id);
                }
              }}
            />
          );
        })}

        {/* Real-Time Center of Gravity (CoG) Live Marker in Build Mode */}
        {!isSimulating && !testResult && showCoGMarker && cog && (
          <g className="pointer-events-none select-none transition-all duration-150">
            {/* Plumb / gravity vertical reference line */}
            <line
              x1={cog.x}
              y1={cog.y}
              x2={cog.x}
              y2={level.buildArea.maxY + 0.6}
              stroke="#38bdf8"
              strokeWidth={0.03}
              strokeDasharray="0.1 0.1"
              opacity={0.5}
              vectorEffect="non-scaling-stroke"
            />
            {/* Target concentric reticle */}
            <circle
              cx={cog.x}
              cy={cog.y}
              r={0.28}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={0.03}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={cog.x}
              cy={cog.y}
              r={0.08}
              fill="#38bdf8"
              opacity={0.7}
            />
            {/* Precision Crosshairs */}
            <line
              x1={cog.x - 0.38}
              y1={cog.y}
              x2={cog.x + 0.38}
              y2={cog.y}
              stroke="#38bdf8"
              strokeWidth={0.03}
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={cog.x}
              y1={cog.y - 0.38}
              x2={cog.x}
              y2={cog.y + 0.38}
              stroke="#38bdf8"
              strokeWidth={0.03}
              vectorEffect="non-scaling-stroke"
            />
            {/* CoG Tag */}
            <text
              x={cog.x + 0.35}
              y={cog.y - 0.22}
              fill="#38bdf8"
              fontSize={0.28}
              fontFamily="monospace"
              fontWeight="bold"
            >
              CoG
            </text>
          </g>
        )}
      </svg>
      {/* Particle Simulation Canvas for fracture sparks and stress puffs */}
      <PhysicsParticleCanvas ref={particleCanvasRef} active={isSimulating} />

      {/* Simulation Control Panel & Playback Inspection */}
      {(isSimulating || testResult) && (
        <div className="absolute top-3 left-3 right-3 z-10">
          <SimulationControlPanel
            isSimulating={isSimulating}
            isPaused={isPaused}
            playbackSpeed={playbackSpeed}
            animProgress={animProgress}
            heatmapEnabled={heatmapEnabled}
            vectorsEnabled={vectorsEnabled}
            metricsEnabled={metricsEnabled}
            durationSeconds={trajectory?.durationSeconds ?? 3.2}
            onTogglePlayPause={() => setIsPaused((v) => !v)}
            onReset={handleResetSimulation}
            onSpeedChange={setPlaybackSpeed}
            onScrub={handleScrub}
            onToggleHeatmap={toggleHeatmap}
            onToggleVectors={() => setVectorsEnabled((v) => !v)}
            onToggleMetrics={() => setMetricsEnabled((v) => !v)}
          />
        </div>
      )}

      {/* Real-Time Metrics & Force Telemetry Overlay */}
      {(isSimulating || testResult) && metricsEnabled && (
        <RealTimeMetricsOverlay
          currentFrame={currentFrame}
          builtMembers={builtMembers}
          isSimulating={isSimulating}
          heatmapEnabled={heatmapEnabled}
          vectorsEnabled={vectorsEnabled}
        />
      )}

      {/* Visual FEA Stress Heatmap Legend (visible in build mode or when metrics panel is toggled off) */}
      {heatmapEnabled && (!metricsEnabled || (!isSimulating && !testResult)) && (
        <div
          data-testid="stress-heatmap-legend"
          className="absolute bottom-3 right-3 z-20 flex flex-col gap-1 rounded-xl border border-border/80 bg-surface-base/95 backdrop-blur px-3 py-2 font-mono text-[11px] shadow-lg pointer-events-auto"
        >
          <div className="flex items-center justify-between gap-3 text-fg-subtle">
            <span className="font-semibold text-fg">FEA Stress Heatmap</span>
            <span className="text-red-400 font-bold">Red = Critical Failure</span>
          </div>
          <div className="h-2 w-48 rounded bg-gradient-to-r from-blue-600 via-cyan-500 via-emerald-500 via-amber-500 to-red-500 shadow-inner" />
          <div className="flex justify-between text-[9px] text-fg-subtle">
            <span>0% Safe</span>
            <span>50%</span>
            <span>75%</span>
            <span className="text-red-400 font-bold">100%+ Fail</span>
          </div>
        </div>
      )}

      {/* Physics Debug: Static Determinacy & Equilibrium Inspector */}
      {debugConfig?.enabled && debugConfig.showEquilibrium && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-surface-base/90 backdrop-blur px-3 py-1.5 font-mono text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">⚖️</span>
            <span className="text-fg-muted">Determinacy:</span>
            {(() => {
              const j = level.fixedNodes.length + builtNodes.length;
              const m = level.deckMembers.length + builtMembers.length;
              const diff = m - (2 * j - 3);
              if (diff === 0) {
                return <span className="text-emerald-400 font-bold">Statically Determinate (m = 2j - 3)</span>;
              }
              if (diff > 0) {
                return (
                  <span className="text-cyan-400 font-bold">
                    Indeterminate (+{diff} deg redundancy)
                  </span>
                );
              }
              return (
                <span className="text-amber-400 font-bold">
                  Underconstrained (Mechanism: {diff})
                </span>
              );
            })()}
          </div>
          <span className="text-fg-subtle">•</span>
          <div className="text-[11px] text-fg-subtle">
            Nodes: {level.fixedNodes.length + builtNodes.length} · Members:{' '}
            {level.deckMembers.length + builtMembers.length}
          </div>
        </div>
      )}
    </div>
  );
}
