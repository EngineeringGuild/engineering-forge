import { useEffect, useRef, useState, useMemo } from 'react';
import type { LevelDef } from '../content/types';
import type { BuiltMember, BuiltNode } from '../game/build';
import { MATERIALS } from '../physics/materials';
import type { TestResult } from '../state/gameStore';
import type { DynamicSimulationTrajectory } from '../physics/trussDynamic';
import { computeMatterTrussTrajectory } from '../physics/matterTruss';
import { toTrussModel } from '../game/build';
import { soundFx } from '../audio/soundFx';

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
  isSimulating?: boolean;
  onSimulationFinish?: () => void;
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

function stressColor(utilization: number, failed: boolean): string {
  if (failed) return 'var(--danger)';
  if (utilization > 0.8) return 'var(--danger)';
  if (utilization > 0.6) return 'var(--warning)';
  return 'var(--success)';
}

export function BridgeCanvas({
  level,
  builtNodes,
  builtMembers,
  pendingNodeId,
  testResult,
  isSimulating = false,
  onSimulationFinish,
  onAddNode,
  onSelectNode,
  onRemoveNode,
  onRemoveMember,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { buildArea, gridSize } = level;

  // Dynamic simulation playback state
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const soundPlayedRef = useRef<{ creak: boolean; snap: boolean }>({ creak: false, snap: false });

  // Base coordinates mapping
  const basePoints = useMemo(() => {
    const map = new Map<string, Point>();
    for (const n of level.fixedNodes) map.set(n.id, { x: n.x, y: n.y });
    for (const n of builtNodes) map.set(n.id, { x: n.x, y: n.y });
    return map;
  }, [level.fixedNodes, builtNodes]);

  // Compute dynamic trajectory when in simulation or test mode using Matter.js physics engine
  const trajectory: DynamicSimulationTrajectory | null = useMemo(() => {
    if (!testResult && !isSimulating) return null;
    const model = toTrussModel(level, builtNodes, builtMembers);
    return computeMatterTrussTrajectory(level, model, 36);
  }, [level, builtNodes, builtMembers, testResult, isSimulating]);

  const animIdRef = useRef<number>(0);
  const startTimestampRef = useRef<number | null>(null);

  // Animation loop when simulating
  useEffect(() => {
    if (!isSimulating || !trajectory || trajectory.frames.length === 0) {
      soundPlayedRef.current = { creak: false, snap: false };
      startTimestampRef.current = null;
      return;
    }

    startTimestampRef.current = null;
    const duration = (trajectory.durationSeconds * 1000) / playbackSpeed;

    const frame = (timestamp: number) => {
      if (isPaused) {
        animIdRef.current = requestAnimationFrame(frame);
        return;
      }

      if (startTimestampRef.current === null) startTimestampRef.current = timestamp;
      const elapsed = timestamp - startTimestampRef.current;
      const p = Math.min(1, elapsed / duration);
      setAnimProgress(p);

      // Sound triggers based on simulation state
      const frameIndex = Math.min(
        trajectory.frames.length - 1,
        Math.floor(p * trajectory.frames.length),
      );
      const curFrame = trajectory.frames[frameIndex];

      if (curFrame) {
        if (curFrame.maxUtilization > 0.75 && !soundPlayedRef.current.creak) {
          soundFx.playStressCreak(curFrame.maxUtilization);
          soundPlayedRef.current.creak = true;
        }
        if (curFrame.failedMemberId && !soundPlayedRef.current.snap) {
          soundFx.playBreak();
          soundPlayedRef.current.snap = true;
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
  }, [isSimulating, trajectory, playbackSpeed, isPaused, onSimulationFinish]);

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

  const vbX = buildArea.minX - 1;
  const vbY = buildArea.minY - 1;
  const vbW = buildArea.maxX - buildArea.minX + 2;
  const vbH = buildArea.maxY - buildArea.minY + 3;

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
          const result = currentFrame?.memberResults[m.id];
          const color = result
            ? stressColor(result.utilization, result.failed)
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
          const result = currentFrame?.memberResults[m.id];
          const material = MATERIALS[m.materialId];
          const isFailed = result?.failed || currentFrame?.failedMemberId === m.id;
          const color = result ? stressColor(result.utilization, isFailed) : material.color;

          return (
            <g key={m.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={isFailed ? 0.08 : 0.12}
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
              {/* Failure rupture blast indicator */}
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
        </defs>

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
      </svg>

      {/* Floating Simulation HUD Overlay */}
      {isSimulating && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between rounded-xl bg-surface-1/90 border border-border/80 px-4 py-2.5 backdrop-blur-md shadow-lg text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            <span className="text-fg font-semibold uppercase tracking-wider">
              {currentFrame?.isCollapsed ? '⚠️ Collapse Detected' : '🚚 Crossing Bridge'}
            </span>
            <span className="text-fg-subtle">
              ({Math.round(animProgress * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-fg-muted">
              Peak Stress:{' '}
              <strong
                className={
                  (currentFrame?.maxUtilization ?? 0) > 0.8
                    ? 'text-danger font-bold'
                    : (currentFrame?.maxUtilization ?? 0) > 0.6
                    ? 'text-warning'
                    : 'text-success'
                }
              >
                {Math.round((currentFrame?.maxUtilization ?? 0) * 100)}%
              </strong>
            </span>

            <button
              onClick={() => setIsPaused((v) => !v)}
              className="rounded px-2 py-1 bg-surface-2 text-fg hover:border-accent border border-border"
            >
              {isPaused ? '▶ Play' : '⏸ Pause'}
            </button>
            <button
              onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
              className="rounded px-2 py-1 bg-surface-2 text-fg hover:border-accent border border-border"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
