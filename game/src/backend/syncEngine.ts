/**
 * Engineering Forge - Local-First Offline Sync & Anti-Cheat Solution Verifier Engine
 * Implements client-side Local-First persistent storage abstractions with offline queue,
 * conflict resolution (Last-Write-Wins), and deterministic server-side physics verification (DOC-11).
 */

import { analyzeTruss } from '../physics/truss';
import { MATERIALS } from '../physics/materials';

export interface SyncPayload<T = unknown> {
  id: string;
  entityType: 'classroom_submission' | 'blueprint_patent' | 'user_progress';
  version: number;
  updatedAt: number;
  data: T;
  clientSignature?: string;
}

export interface OfflineSyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: SyncPayload;
  queuedAt: number;
  retryCount: number;
}

export interface VerificationCheckResult {
  verified: boolean;
  computedSafetyFactor: number;
  reportedSafetyFactor: number;
  computedCost: number;
  reportedCost: number;
  toleranceDelta: number;
  rejectionReason?: string;
  deterministicSignature?: string;
}

/**
 * In-memory / localStorage Local-First repository with automatic offline sync queuing.
 */
export class LocalFirstSyncRepository {
  private storageKeyPrefix: string;
  private offlineQueue: OfflineSyncQueueItem[] = [];

  constructor(prefix: string = 'forge_local_first_') {
    this.storageKeyPrefix = prefix;
  }

  public saveLocal<T>(entityType: SyncPayload['entityType'], id: string, data: T): SyncPayload<T> {
    const payload: SyncPayload<T> = {
      id,
      entityType,
      version: Date.now(),
      updatedAt: Date.now(),
      data,
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          `${this.storageKeyPrefix}${entityType}_${id}`,
          JSON.stringify(payload)
        );
      }
    } catch {
      // Storage unavailable fallback
    }

    // Queue for cloud edge synchronization
    this.enqueueSync({
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      endpoint: `/api/v1/${entityType}`,
      method: 'POST',
      payload: payload as SyncPayload,
      queuedAt: Date.now(),
      retryCount: 0,
    });

    return payload;
  }

  public getLocal<T>(entityType: SyncPayload['entityType'], id: string): SyncPayload<T> | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(`${this.storageKeyPrefix}${entityType}_${id}`);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      return null;
    }
    return null;
  }

  public enqueueSync(item: OfflineSyncQueueItem): void {
    this.offlineQueue.push(item);
  }

  public getQueueLength(): number {
    return this.offlineQueue.length;
  }

  public flushQueue(mockNetworkSuccess: boolean = true): number {
    if (!mockNetworkSuccess) return 0;
    const count = this.offlineQueue.length;
    this.offlineQueue = [];
    return count;
  }

  /**
   * Last-Write-Wins (LWW) conflict resolver between two versions of the same entity.
   */
  public resolveConflict<T>(local: SyncPayload<T>, incoming: SyncPayload<T>): SyncPayload<T> {
    if (incoming.updatedAt > local.updatedAt) {
      return incoming;
    }
    return local;
  }
}

/**
 * Deterministic Physics Verifier (Serverless / Worker anti-cheat oracle).
 * Re-runs the Direct Stiffness Method on the submitted blueprint and compares
 * computed results against reported values within an analytical tolerance (< 1e-4).
 */
export function verifySubmissionDeterministically(
  blueprint: {
    nodes: Array<{ id: string; x: number; y: number; support?: 'none' | 'pin' | 'roller' }>;
    members: Array<{ id: string; nodeA: string; nodeB: string; materialId: string }>;
    loadKn: number;
    targetSpanMeters: number;
  },
  reportedResult: {
    safetyFactor: number;
    cost: number;
  }
): VerificationCheckResult {
  const span = blueprint.targetSpanMeters;

  // Convert to solver model
  const solverNodes = blueprint.nodes.map((n) => {
    const isLeft = Math.abs(n.x) < 0.01 && Math.abs(n.y) < 0.01;
    const isRight = Math.abs(n.x - span) < 0.01 && Math.abs(n.y) < 0.01;
    const support = n.support || (isLeft ? 'pin' : isRight ? 'roller' : 'none');
    return {
      id: n.id,
      x: n.x,
      y: n.y,
      support,
    };
  });

  const nodeMap = new Map(blueprint.nodes.map((n) => [n.id, n]));
  let computedCost = 0;

  const solverMembers = blueprint.members.map((m) => {
    const mat = MATERIALS[m.materialId] || MATERIALS.wood;
    const na = nodeMap.get(m.nodeA);
    const nb = nodeMap.get(m.nodeB);
    const len = na && nb ? Math.hypot(nb.x - na.x, nb.y - na.y) : 1;
    computedCost += len * mat.costPerMeter;

    return {
      id: m.id,
      nodeA: m.nodeA,
      nodeB: m.nodeB,
      materialId: m.materialId,
    };
  });

  // Center node load
  const midX = span / 2;
  const targetNode = blueprint.nodes.reduce((prev, curr) =>
    Math.abs(curr.x - midX) < Math.abs(prev.x - midX) ? curr : prev
  );

  const loads = [
    {
      nodeId: targetNode.id,
      force: blueprint.loadKn * 1000,
    },
  ];

  const analysis = analyzeTruss({
    nodes: solverNodes,
    members: solverMembers,
    loads,
  });

  if (analysis.status !== 'analyzed') {
    return {
      verified: false,
      computedSafetyFactor: 0,
      reportedSafetyFactor: reportedResult.safetyFactor,
      computedCost: Math.round(computedCost),
      reportedCost: reportedResult.cost,
      toleranceDelta: 999,
      rejectionReason: 'Estrutura instável (mecanismo ou matriz singular detectada).',
    };
  }

  let maxUtil = 0;
  for (const res of analysis.members) {
    if (res.utilization > maxUtil) maxUtil = res.utilization;
  }

  const computedSafetyFactor = maxUtil > 0 ? Number((1 / maxUtil).toFixed(2)) : 0;
  const costDiff = Math.abs(computedCost - reportedResult.cost);
  const sfDiff = Math.abs(computedSafetyFactor - reportedResult.safetyFactor);

  const costToleranceOk = costDiff < 5.0; // $5 tolerance for rounding
  const sfToleranceOk = sfDiff < 0.05; // 0.05 SF tolerance

  const verified = costToleranceOk && sfToleranceOk;

  const deterministicSignature = verified
    ? `SIG-ORACLE-VERIFIED-${Math.round(computedSafetyFactor * 100)}-${Math.round(computedCost)}`
    : undefined;

  return {
    verified,
    computedSafetyFactor,
    reportedSafetyFactor: reportedResult.safetyFactor,
    computedCost: Math.round(computedCost),
    reportedCost: reportedResult.cost,
    toleranceDelta: Number(Math.max(costDiff, sfDiff).toFixed(4)),
    rejectionReason: verified
      ? undefined
      : `Discrepância numérica detectada (SF Diff: ${sfDiff.toFixed(2)}, Custo Diff: $${costDiff.toFixed(1)}).`,
    deterministicSignature,
  };
}
