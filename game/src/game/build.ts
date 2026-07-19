import type { TrussMember, TrussModel, TrussNode } from '../physics/truss';
import { MATERIALS } from '../physics/materials';
import type { LevelDef } from '../content/types';

export interface BuiltNode {
  id: string;
  x: number;
  y: number;
}

export interface BuiltMember {
  id: string;
  nodeA: string;
  nodeB: string;
  materialId: string;
}

/** The material used for the given, free roadway deck members. */
export const DECK_MATERIAL_ID = 'wood';

export function toTrussModel(
  level: LevelDef,
  builtNodes: BuiltNode[],
  builtMembers: BuiltMember[],
): TrussModel {
  const nodes: TrussNode[] = [
    ...level.fixedNodes.map((n) => ({ id: n.id, x: n.x, y: n.y, support: n.support })),
    ...builtNodes.map((n) => ({ id: n.id, x: n.x, y: n.y, support: 'none' as const })),
  ];

  const members: TrussMember[] = [
    ...level.deckMembers.map((m) => ({ ...m, materialId: DECK_MATERIAL_ID })),
    ...builtMembers,
  ];

  return { nodes, members, loads: level.loads };
}

function distance(a: BuiltNode, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function memberLength(
  level: LevelDef,
  builtNodes: BuiltNode[],
  member: BuiltMember,
): number {
  const points = new Map<string, { x: number; y: number }>();
  for (const n of level.fixedNodes) points.set(n.id, n);
  for (const n of builtNodes) points.set(n.id, n);
  const a = points.get(member.nodeA);
  const b = points.get(member.nodeB);
  if (!a || !b) return 0;
  return distance({ id: '', ...a }, b);
}

export function totalCost(
  level: LevelDef,
  builtNodes: BuiltNode[],
  builtMembers: BuiltMember[],
): number {
  return builtMembers.reduce((sum, member) => {
    const material = MATERIALS[member.materialId];
    return sum + memberLength(level, builtNodes, member) * material.costPerMeter;
  }, 0);
}

export interface StarResult {
  passed: boolean;
  cost: number;
  stars: 0 | 1 | 2 | 3;
}

export function scoreAttempt(level: LevelDef, cost: number, passed: boolean): StarResult {
  if (!passed || cost > level.budget) {
    return { passed: false, cost, stars: 0 };
  }
  const ratio = cost / level.budget;
  const stars = ratio <= 0.6 ? 3 : ratio <= 0.85 ? 2 : 1;
  return { passed: true, cost, stars };
}
