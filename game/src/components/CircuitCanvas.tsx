import { useEffect, useRef, useState } from 'react';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { BuiltEdge } from '../game/circuitBuild';
import type { BuiltNode } from '../game/build';
import { COMPONENTS } from '../physics/components';
import type { CircuitTestResult } from '../state/circuitStore';
import { soundFx } from '../audio/soundFx';

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
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveEdge: (edgeId: string) => void;
}

function edgeColor(
  result: { power: number; maxPower: number; burnedOut: boolean; underpowered: boolean } | undefined,
  fallback: string,
): string {
  if (!result) return fallback;
  if (result.burnedOut) return 'var(--danger)';
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
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { buildArea, gridSize } = level;

  // Animation phase for electron particle flow
  const [electronPhase, setElectronPhase] = useState(0);

  const allPoints = new Map<string, Point>();
  for (const n of level.fixedNodes) allPoints.set(n.id, n);
  for (const n of builtNodes) allPoints.set(n.id, n);

  const resultByEdgeId = new Map(
    testResult?.status === 'analyzed' ? testResult.edges.map((e) => [e.edgeId, e]) : [],
  );

  // Sound and animation timer
  useEffect(() => {
    if (!isSimulating && !testResult) return;

    if (isSimulating) {
      soundFx.playElectricHum();
      const timer = setTimeout(() => {
        if (testResult?.status === 'analyzed' && testResult.anyBurnedOut) {
          soundFx.playSpark();
        }
        if (onSimulationFinish) {
          onSimulationFinish();
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSimulating, testResult, onSimulationFinish]);

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

  return (
    <div className="relative w-full h-full">
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
        </defs>

        {/* Grid dots */}
        {gridDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={0.02} fill="var(--border)" />
        ))}

        {/* Given (free) load edges, e.g. the bulb */}
        {level.givenEdges.map((edge) => {
          const a = allPoints.get(edge.nodeA)!;
          const b = allPoints.get(edge.nodeB)!;
          const component = COMPONENTS[edge.componentId];
          const result = resultByEdgeId.get(edge.id);
          const color = edgeColor(result, component.color);
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const isBulb = edge.componentId.includes('bulb') || component.name.toLowerCase().includes('bulb');
          const isGlowing = result && !result.burnedOut && !result.underpowered;

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
          const color = edgeColor(result, component.color);
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
              {(isSimulating || testResult) && hasCurrent && current > 0.01 && (
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

      {/* Live Circuit Simulation Banner */}
      {isSimulating && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between rounded-xl bg-surface-1/90 border border-border/80 px-4 py-2.5 backdrop-blur-md shadow-lg text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-info animate-pulse" />
            <span className="text-fg font-semibold uppercase tracking-wider">
              ⚡ Energizing Circuit ({level.sourceVoltage}V)
            </span>
          </div>
          <span className="text-info animate-pulse">Flowing Current…</span>
        </div>
      )}
    </div>
  );
}
