import { solveLinearSystem } from './linalg';
import { axialStiffness, materialCapacity, MATERIALS } from './materials';

export type SupportType = 'none' | 'pin' | 'roller';

export interface TrussNode {
  id: string;
  x: number;
  y: number;
  support: SupportType;
}

export interface TrussMember {
  id: string;
  nodeA: string;
  nodeB: string;
  materialId: string;
}

export interface PointLoad {
  nodeId: string;
  /** Downward force in Newtons (positive = pulling toward +y, i.e. down). */
  force: number;
}

export interface TrussModel {
  nodes: TrussNode[];
  members: TrussMember[];
  loads: PointLoad[];
}

export interface MemberResult {
  memberId: string;
  /** Positive = tension, negative = compression, Newtons. */
  axialForce: number;
  capacity: number;
  utilization: number; // |axialForce| / capacity
  failed: boolean;
}

export type TrussAnalysis =
  | { status: 'unstable' }
  | { status: 'analyzed'; members: MemberResult[]; anyFailed: boolean };

function length(a: TrussNode, b: TrussNode): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Solves a 2D pin-jointed truss via the direct stiffness method: assembles the
 * global stiffness matrix, solves for free-node displacements under the given
 * loads, then recovers each member's axial force from its end displacements.
 * A singular reduced stiffness matrix means the structure is a mechanism —
 * it cannot resist load in some direction and is reported as unstable.
 */
export function analyzeTruss(model: TrussModel): TrussAnalysis {
  const { nodes, members, loads } = model;
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const dof = nodes.length * 2;

  // DOF layout: node i -> [2i (x), 2i+1 (y)]
  const isFixed = new Array<boolean>(dof).fill(false);
  for (const node of nodes) {
    const i = index.get(node.id)!;
    if (node.support === 'pin') {
      isFixed[2 * i] = true;
      isFixed[2 * i + 1] = true;
    } else if (node.support === 'roller') {
      isFixed[2 * i + 1] = true; // restrains vertical only, free horizontally
    }
  }

  const K = Array.from({ length: dof }, () => new Array<number>(dof).fill(0));
  const memberGeometry = new Map<
    string,
    { c: number; s: number; len: number; k: number }
  >();

  for (const member of members) {
    const a = nodes[index.get(member.nodeA)!];
    const b = nodes[index.get(member.nodeB)!];
    const len = length(a, b);
    const material = MATERIALS[member.materialId];
    const c = (b.x - a.x) / len;
    const s = (b.y - a.y) / len;
    const k = axialStiffness(material, len);
    memberGeometry.set(member.id, { c, s, len, k });

    const ia = index.get(member.nodeA)!;
    const ib = index.get(member.nodeB)!;
    const dofs = [2 * ia, 2 * ia + 1, 2 * ib, 2 * ib + 1];
    // Local 4x4 stiffness in global coordinates for a 2-force axial member.
    const cc = c * c;
    const cs = c * s;
    const ss = s * s;
    const local = [
      [cc, cs, -cc, -cs],
      [cs, ss, -cs, -ss],
      [-cc, -cs, cc, cs],
      [-cs, -ss, cs, ss],
    ];
    for (let r = 0; r < 4; r++) {
      for (let col = 0; col < 4; col++) {
        K[dofs[r]][dofs[col]] += k * local[r][col];
      }
    }
  }

  const F = new Array<number>(dof).fill(0);
  for (const load of loads) {
    const i = index.get(load.nodeId)!;
    F[2 * i + 1] += load.force; // downward = +y in screen/model coordinates
  }

  const freeDofs: number[] = [];
  for (let i = 0; i < dof; i++) if (!isFixed[i]) freeDofs.push(i);

  if (freeDofs.length === 0) {
    return { status: 'analyzed', members: [], anyFailed: false };
  }

  const Kff = freeDofs.map((r) => freeDofs.map((c) => K[r][c]));
  const Ff = freeDofs.map((r) => F[r]);

  const uf = solveLinearSystem(Kff, Ff);
  if (uf === null) {
    return { status: 'unstable' };
  }

  const u = new Array<number>(dof).fill(0);
  freeDofs.forEach((globalDof, i) => {
    u[globalDof] = uf[i];
  });

  const results: MemberResult[] = members.map((member) => {
    const a = index.get(member.nodeA)!;
    const b = index.get(member.nodeB)!;
    const geo = memberGeometry.get(member.id)!;
    const material = MATERIALS[member.materialId];
    const elongation =
      geo.c * (u[2 * b] - u[2 * a]) + geo.s * (u[2 * b + 1] - u[2 * a + 1]);
    const axialForce = geo.k * elongation;
    const capacity = materialCapacity(material);
    const utilization = Math.abs(axialForce) / capacity;
    return {
      memberId: member.id,
      axialForce,
      capacity,
      utilization,
      failed: utilization > 1,
    };
  });

  return {
    status: 'analyzed',
    members: results,
    anyFailed: results.some((r) => r.failed),
  };
}
