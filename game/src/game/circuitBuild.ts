import type { CircuitEdge, CircuitModel, CircuitNode } from '../physics/circuit';
import { COMPONENTS } from '../physics/components';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { BuiltNode } from './build';

export interface BuiltEdge {
  id: string;
  nodeA: string;
  nodeB: string;
  componentId: string;
}

export function toCircuitModel(
  level: CircuitLevelDef,
  builtNodes: BuiltNode[],
  builtEdges: BuiltEdge[],
): CircuitModel {
  const nodes: CircuitNode[] = [
    ...level.fixedNodes.map((n) => ({ id: n.id, x: n.x, y: n.y, terminal: n.terminal })),
    ...builtNodes.map((n) => ({ id: n.id, x: n.x, y: n.y, terminal: 'none' as const })),
  ];

  const edges: CircuitEdge[] = [...level.givenEdges, ...builtEdges];

  return { nodes, edges, sourceVoltage: level.sourceVoltage };
}

function points(level: CircuitLevelDef, builtNodes: BuiltNode[]): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const n of level.fixedNodes) map.set(n.id, n);
  for (const n of builtNodes) map.set(n.id, n);
  return map;
}

export function edgeLength(level: CircuitLevelDef, builtNodes: BuiltNode[], edge: BuiltEdge): number {
  const map = points(level, builtNodes);
  const a = map.get(edge.nodeA);
  const b = map.get(edge.nodeB);
  if (!a || !b) return 0;
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function totalCircuitCost(
  level: CircuitLevelDef,
  builtNodes: BuiltNode[],
  builtEdges: BuiltEdge[],
): number {
  return builtEdges.reduce((sum, edge) => {
    const component = COMPONENTS[edge.componentId];
    return sum + edgeLength(level, builtNodes, edge) * component.costPerMeter;
  }, 0);
}

export interface CircuitStarResult {
  passed: boolean;
  cost: number;
  stars: 0 | 1 | 2 | 3;
}

export function scoreCircuitAttempt(
  level: CircuitLevelDef,
  cost: number,
  passed: boolean,
): CircuitStarResult {
  if (!passed || cost > level.budget) {
    return { passed: false, cost, stars: 0 };
  }
  const ratio = cost / level.budget;
  const stars = ratio <= 0.6 ? 3 : ratio <= 0.85 ? 2 : 1;
  return { passed: true, cost, stars };
}
