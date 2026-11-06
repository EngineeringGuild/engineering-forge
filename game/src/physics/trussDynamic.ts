import { solveLinearSystem } from './linalg';
import { axialStiffness, materialCapacity, MATERIALS } from './materials';
import type { MemberResult, TrussModel, TrussNode } from './truss';
import type { LevelDef } from '../content/types';

export interface DynamicTrussFrame {
  step: number;
  t: number; // normalized 0..1
  cartPos: { x: number; y: number };
  memberResults: Record<string, MemberResult>;
  nodeDisplacements: Record<string, { dx: number; dy: number }>;
  maxUtilization: number;
  failedMemberId: string | null;
  isCollapsed: boolean;
  supportReactions?: Record<string, { rx: number; ry: number }>;
  maxDeflectionMm?: number;
  activeLoadN?: number;
  /** Phase 2/3 performance profiling: frame-by-frame physics calculation time in milliseconds */
  calculationTimeMs?: number;
}

export interface DynamicSimulationTrajectory {
  frames: DynamicTrussFrame[];
  passed: boolean;
  failureStep: number | null;
  failedMemberId: string | null;
  failureReason?: 'unstable' | 'wentSlack' | 'pulledApart' | 'overload';
  peakUtilization: number;
  durationSeconds: number;
}

function length(a: TrussNode, b: TrussNode): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Solves a truss model returning both member results and node displacements.
 */
export function solveTrussWithDisplacements(model: TrussModel): {
  status: 'unstable' | 'analyzed';
  members: MemberResult[];
  displacements: Record<string, { dx: number; dy: number }>;
  anyFailed: boolean;
} {
  const { nodes, members, loads } = model;
  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const dof = nodes.length * 2;

  const isFixed = new Array<boolean>(dof).fill(false);
  for (const node of nodes) {
    const i = index.get(node.id)!;
    if (node.support === 'pin') {
      isFixed[2 * i] = true;
      isFixed[2 * i + 1] = true;
    } else if (node.support === 'roller') {
      isFixed[2 * i + 1] = true;
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
    if (i !== undefined) {
      F[2 * i + 1] += load.force;
    }
  }

  const freeDofs: number[] = [];
  for (let i = 0; i < dof; i++) if (!isFixed[i]) freeDofs.push(i);

  if (freeDofs.length === 0) {
    return { status: 'analyzed', members: [], displacements: {}, anyFailed: false };
  }

  const Kff = freeDofs.map((r) => freeDofs.map((c) => K[r][c]));
  const Ff = freeDofs.map((r) => F[r]);

  const uf = solveLinearSystem(Kff, Ff);
  if (uf === null) {
    return { status: 'unstable', members: [], displacements: {}, anyFailed: true };
  }

  const u = new Array<number>(dof).fill(0);
  freeDofs.forEach((globalDof, i) => {
    u[globalDof] = uf[i];
  });

  const displacements: Record<string, { dx: number; dy: number }> = {};
  for (const node of nodes) {
    const i = index.get(node.id)!;
    displacements[node.id] = { dx: u[2 * i], dy: u[2 * i + 1] };
  }

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
    const wentSlack = Boolean(material.tensionOnly) && axialForce < 0;
    const pulledApart = Boolean(material.compressionOnly) && axialForce > 0;
    return {
      memberId: member.id,
      axialForce,
      capacity,
      utilization,
      failed: wentSlack || pulledApart || utilization > 1,
      wentSlack,
      pulledApart,
    };
  });

  return {
    status: 'analyzed',
    members: results,
    displacements,
    anyFailed: results.some((r) => r.failed),
  };
}

/**
 * Computes a step-by-step dynamic simulation trajectory for a moving vehicle.
 */
export function computeDynamicTrussSimulation(
  level: LevelDef,
  baseModel: TrussModel,
  totalSteps: number = 32,
): DynamicSimulationTrajectory {
  // 1. Identify deck nodes along the road
  const deckNodeMap = new Map<string, TrussNode>();
  for (const n of level.fixedNodes) {
    if (n.isDeck) {
      deckNodeMap.set(n.id, { id: n.id, x: n.x, y: n.y, support: n.support });
    }
  }

  // Also include nodes on deck members
  for (const dm of level.deckMembers) {
    const nodeA = baseModel.nodes.find((n) => n.id === dm.nodeA);
    const nodeB = baseModel.nodes.find((n) => n.id === dm.nodeB);
    if (nodeA) deckNodeMap.set(nodeA.id, nodeA);
    if (nodeB) deckNodeMap.set(nodeB.id, nodeB);
  }

  const sortedDeckNodes = Array.from(deckNodeMap.values()).sort((a, b) => a.x - b.x);

  if (sortedDeckNodes.length < 2) {
    // Fallback if deck nodes are not defined
    const staticRes = solveTrussWithDisplacements(baseModel);
    const memberMap: Record<string, MemberResult> = {};
    staticRes.members.forEach((m) => (memberMap[m.memberId] = m));
    return {
      frames: [
        {
          step: 0,
          t: 0.5,
          cartPos: { x: 0, y: 0 },
          memberResults: memberMap,
          nodeDisplacements: staticRes.displacements,
          maxUtilization: Math.max(0, ...staticRes.members.map((m) => m.utilization)),
          failedMemberId: staticRes.members.find((m) => m.failed)?.memberId ?? null,
          isCollapsed: staticRes.anyFailed || staticRes.status === 'unstable',
        },
      ],
      passed: !staticRes.anyFailed && staticRes.status === 'analyzed',
      failureStep: staticRes.anyFailed ? 0 : null,
      failedMemberId: staticRes.members.find((m) => m.failed)?.memberId ?? null,
      peakUtilization: Math.max(0, ...staticRes.members.map((m) => m.utilization)),
      durationSeconds: 3.0,
    };
  }

  const minX = sortedDeckNodes[0].x;
  const maxX = sortedDeckNodes[sortedDeckNodes.length - 1].x;
  const totalLoadMag = level.loads.reduce((acc, l) => acc + l.force, 0) || 10000;

  const frames: DynamicTrussFrame[] = [];
  let failureStep: number | null = null;
  let failedMemberId: string | null = null;
  let failureReason: 'unstable' | 'wentSlack' | 'pulledApart' | 'overload' | undefined = undefined;
  let peakUtilization = 0;

  for (let s = 0; s <= totalSteps; s++) {
    const t = s / totalSteps;
    const cartX = minX + t * (maxX - minX);

    // Find segment on deck
    let segIdx = 0;
    for (let i = 0; i < sortedDeckNodes.length - 1; i++) {
      if (cartX >= sortedDeckNodes[i].x && cartX <= sortedDeckNodes[i + 1].x) {
        segIdx = i;
        break;
      }
    }

    const nA = sortedDeckNodes[segIdx];
    const nB = sortedDeckNodes[Math.min(segIdx + 1, sortedDeckNodes.length - 1)];
    const segLen = Math.max(0.001, nB.x - nA.x);
    const alpha = Math.max(0, Math.min(1, (cartX - nA.x) / segLen));
    const cartY = nA.y + alpha * (nB.y - nA.y);

    // If failure already occurred, simulate collapse fall
    if (failureStep !== null) {
      const dropFrames = s - failureStep;
      frames.push({
        step: s,
        t,
        cartPos: { x: cartX, y: cartY + dropFrames * 0.25 },
        memberResults: frames[frames.length - 1].memberResults,
        nodeDisplacements: frames[frames.length - 1].nodeDisplacements,
        maxUtilization: frames[frames.length - 1].maxUtilization,
        failedMemberId,
        isCollapsed: true,
      });
      continue;
    }

    // Dynamic loads: vehicle load shared between nA and nB
    const dynamicLoads = [
      { nodeId: nA.id, force: (1 - alpha) * totalLoadMag },
      { nodeId: nB.id, force: alpha * totalLoadMag },
    ];

    const stepModel: TrussModel = {
      nodes: baseModel.nodes,
      members: baseModel.members,
      loads: dynamicLoads,
    };

    const stepStartTime = performance.now();
    const res = solveTrussWithDisplacements(stepModel);
    const calculationTimeMs = Math.max(0.01, performance.now() - stepStartTime);

    if (res.status === 'unstable') {
      failureStep = s;
      failureReason = 'unstable';
      frames.push({
        step: s,
        t,
        cartPos: { x: cartX, y: cartY },
        memberResults: {},
        nodeDisplacements: {},
        maxUtilization: 999,
        failedMemberId: null,
        isCollapsed: true,
      });
      continue;
    }

    const memberMap: Record<string, MemberResult> = {};
    let stepMaxUtil = 0;
    let stepFailing: MemberResult | undefined;

    for (const m of res.members) {
      memberMap[m.memberId] = m;
      if (m.utilization > stepMaxUtil) stepMaxUtil = m.utilization;
      if (m.failed && !stepFailing) stepFailing = m;
    }

    if (stepMaxUtil > peakUtilization) peakUtilization = stepMaxUtil;

    if (res.anyFailed && stepFailing) {
      failureStep = s;
      failedMemberId = stepFailing.memberId;
      failureReason = stepFailing.wentSlack
        ? 'wentSlack'
        : stepFailing.pulledApart
        ? 'pulledApart'
        : 'overload';

      frames.push({
        step: s,
        t,
        cartPos: { x: cartX, y: cartY },
        memberResults: memberMap,
        nodeDisplacements: res.displacements,
        maxUtilization: stepMaxUtil,
        failedMemberId,
        isCollapsed: true,
        calculationTimeMs,
      });
    } else {
      frames.push({
        step: s,
        t,
        cartPos: { x: cartX, y: cartY },
        memberResults: memberMap,
        nodeDisplacements: res.displacements,
        maxUtilization: stepMaxUtil,
        failedMemberId: null,
        isCollapsed: false,
        calculationTimeMs,
      });
    }
  }

  return {
    frames,
    passed: failureStep === null,
    failureStep,
    failedMemberId,
    failureReason,
    peakUtilization,
    durationSeconds: 3.5,
  };
}
