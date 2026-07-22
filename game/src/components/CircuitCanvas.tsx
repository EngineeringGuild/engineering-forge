import { useRef } from 'react';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { BuiltEdge } from '../game/circuitBuild';
import type { BuiltNode } from '../game/build';
import { COMPONENTS } from '../physics/components';
import type { CircuitTestResult } from '../state/circuitStore';

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
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveEdge: (edgeId: string) => void;
}

function edgeColor(result: { power: number; maxPower: number; burnedOut: boolean; underpowered: boolean } | undefined, fallback: string): string {
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
  onAddNode,
  onSelectNode,
  onRemoveNode,
  onRemoveEdge,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { buildArea, gridSize } = level;

  const allPoints = new Map<string, Point>();
  for (const n of level.fixedNodes) allPoints.set(n.id, n);
  for (const n of builtNodes) allPoints.set(n.id, n);

  const resultByEdgeId = new Map(
    testResult?.status === 'analyzed' ? testResult.edges.map((e) => [e.edgeId, e]) : [],
  );

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
    onAddNode(snappedX, snappedY);
  }

  const gridDots: Point[] = [];
  for (let x = buildArea.minX; x <= buildArea.maxX + 1e-6; x += gridSize) {
    for (let y = buildArea.minY; y <= buildArea.maxY + 1e-6; y += gridSize) {
      gridDots.push({ x, y });
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className="w-full h-full touch-none select-none"
      onClick={handleBackgroundClick}
    >
      {gridDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.02} fill="var(--border)" />
      ))}

      {/* given (free) load edges, e.g. the bulb */}
      {level.givenEdges.map((edge) => {
        const a = allPoints.get(edge.nodeA)!;
        const b = allPoints.get(edge.nodeB)!;
        const component = COMPONENTS[edge.componentId];
        const result = resultByEdgeId.get(edge.id);
        const color = edgeColor(result, component.color);
        return (
          <line
            key={edge.id}
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

      {/* player-built connections */}
      {builtEdges.map((edge) => {
        const a = allPoints.get(edge.nodeA);
        const b = allPoints.get(edge.nodeB);
        if (!a || !b) return null;
        const component = COMPONENTS[edge.componentId];
        const result = resultByEdgeId.get(edge.id);
        const color = edgeColor(result, component.color);
        return (
          <line
            key={edge.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color}
            strokeWidth={0.1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveEdge(edge.id);
            }}
          />
        );
      })}

      {/* battery terminals */}
      {level.fixedNodes
        .filter((n) => n.terminal !== 'none')
        .map((n) => (
          <text
            key={`terminal-${n.id}`}
            x={n.x}
            y={n.y - 0.28}
            textAnchor="middle"
            fontSize={0.32}
            fontWeight="bold"
            fill={n.terminal === 'positive' ? 'var(--danger)' : 'var(--fg-muted)'}
          >
            {n.terminal === 'positive' ? '+' : '−'}
          </text>
        ))}

      {/* all nodes: terminals, load endpoints, built nodes */}
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
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode(n.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const isFixed = level.fixedNodes.some((f) => f.id === n.id);
              if (!isFixed) onRemoveNode(n.id);
            }}
          />
        );
      })}
    </svg>
  );
}
