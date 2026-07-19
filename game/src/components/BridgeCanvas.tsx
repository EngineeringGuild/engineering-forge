import { useRef } from 'react';
import type { LevelDef } from '../content/types';
import type { BuiltMember, BuiltNode } from '../game/build';
import { MATERIALS } from '../physics/materials';
import type { TestResult } from '../state/gameStore';

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
  onAddNode: (x: number, y: number) => void;
  onSelectNode: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

function stressColor(utilization: number, failed: boolean): string {
  if (failed) return 'var(--danger)';
  if (utilization > 0.7) return 'var(--warning)';
  return 'var(--success)';
}

export function BridgeCanvas({
  level,
  builtNodes,
  builtMembers,
  pendingNodeId,
  testResult,
  onAddNode,
  onSelectNode,
  onRemoveNode,
  onRemoveMember,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { buildArea, gridSize } = level;

  const allPoints = new Map<string, Point>();
  for (const n of level.fixedNodes) allPoints.set(n.id, n);
  for (const n of builtNodes) allPoints.set(n.id, n);

  const memberResultById = new Map(
    testResult?.status === 'analyzed' ? testResult.members.map((m) => [m.memberId, m]) : [],
  );

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

      {/* deck (road) members */}
      {level.deckMembers.map((m) => {
        const a = allPoints.get(m.nodeA)!;
        const b = allPoints.get(m.nodeB)!;
        const result = memberResultById.get(m.id);
        const color = result ? stressColor(result.utilization, result.failed) : MATERIALS.wood.color;
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

      {/* player-built members */}
      {builtMembers.map((m) => {
        const a = allPoints.get(m.nodeA);
        const b = allPoints.get(m.nodeB);
        if (!a || !b) return null;
        const result = memberResultById.get(m.id);
        const material = MATERIALS[m.materialId];
        const color = result ? stressColor(result.utilization, result.failed) : material.color;
        return (
          <line
            key={m.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color}
            strokeWidth={0.12}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveMember(m.id);
            }}
          />
        );
      })}

      {/* anchors (pin / roller) */}
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

      {/* load markers */}
      {level.loads.map((load) => {
        const n = allPoints.get(load.nodeId)!;
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

      {/* deck + built nodes */}
      {[...level.fixedNodes, ...builtNodes].map((n) => {
        const isPending = pendingNodeId === n.id;
        const isFixed = level.fixedNodes.some((f) => f.id === n.id);
        return (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={isFixed ? 0.16 : 0.14}
            fill={isPending ? 'var(--accent)' : isFixed ? 'var(--fg)' : 'var(--fg-muted)'}
            stroke={isPending ? 'var(--accent)' : isFixed ? 'var(--fg)' : 'var(--bg)'}
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
              if (!isFixed) onRemoveNode(n.id);
            }}
          />
        );
      })}
    </svg>
  );
}
