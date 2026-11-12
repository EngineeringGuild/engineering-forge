import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalFirstSyncRepository,
  verifySubmissionDeterministically,
} from './syncEngine';

describe('Local-First Sync Engine & Anti-Cheat Solution Verifier', () => {
  let repo: LocalFirstSyncRepository;

  beforeEach(() => {
    repo = new LocalFirstSyncRepository('test_forge_sync_');
  });

  it('saves items locally and enqueues sync requests for cloud edge', () => {
    const item = repo.saveLocal('classroom_submission', 'sub-101', {
      studentName: 'Nikola Tesla',
      score: 95,
    });

    expect(item.id).toBe('sub-101');
    expect(repo.getQueueLength()).toBe(1);

    const flushed = repo.flushQueue(true);
    expect(flushed).toBe(1);
    expect(repo.getQueueLength()).toBe(0);
  });

  it('resolves conflicts using Last-Write-Wins (LWW)', () => {
    const older = {
      id: 'sub-1',
      entityType: 'user_progress' as const,
      version: 1,
      updatedAt: 1000,
      data: { xp: 100 },
    };

    const newer = {
      id: 'sub-1',
      entityType: 'user_progress' as const,
      version: 2,
      updatedAt: 2000,
      data: { xp: 250 },
    };

    const resolved = repo.resolveConflict(older, newer);
    expect(resolved.data.xp).toBe(250);
  });

  it('deterministically verifies compliant physics solutions and issues oracle signature', () => {
    // Standard Warren truss over 8m span
    const blueprint = {
      targetSpanMeters: 8,
      loadKn: 40,
      nodes: [
        { id: 'N0', x: 0, y: 0 },
        { id: 'N1', x: 4, y: 0 },
        { id: 'N2', x: 8, y: 0 },
        { id: 'N3', x: 2, y: -3 },
        { id: 'N4', x: 6, y: -3 },
      ],
      members: [
        { id: 'M0', nodeA: 'N0', nodeB: 'N1', materialId: 'wood' },
        { id: 'M1', nodeA: 'N1', nodeB: 'N2', materialId: 'wood' },
        { id: 'M2', nodeA: 'N0', nodeB: 'N3', materialId: 'wood' },
        { id: 'M3', nodeA: 'N3', nodeB: 'N1', materialId: 'wood' },
        { id: 'M4', nodeA: 'N1', nodeB: 'N4', materialId: 'wood' },
        { id: 'M5', nodeA: 'N4', nodeB: 'N2', materialId: 'wood' },
        { id: 'M6', nodeA: 'N3', nodeB: 'N4', materialId: 'steel' },
      ],
    };

    // First run to get expected analytical cost and SF
    const checkDryRun = verifySubmissionDeterministically(blueprint, {
      safetyFactor: 1.0,
      cost: 0,
    });

    // Verify when reported results match exact DSM analytical calculation
    const legitResult = verifySubmissionDeterministically(blueprint, {
      safetyFactor: checkDryRun.computedSafetyFactor,
      cost: checkDryRun.computedCost,
    });

    expect(legitResult.verified).toBe(true);
    expect(legitResult.deterministicSignature).toContain('SIG-ORACLE-VERIFIED-');
  });

  it('rejects fabricated or cheated results with numerical discrepancy', () => {
    const blueprint = {
      targetSpanMeters: 8,
      loadKn: 40,
      nodes: [
        { id: 'N0', x: 0, y: 0 },
        { id: 'N1', x: 4, y: 0 },
        { id: 'N2', x: 8, y: 0 },
        { id: 'N3', x: 2, y: -3 },
        { id: 'N4', x: 6, y: -3 },
      ],
      members: [
        { id: 'M0', nodeA: 'N0', nodeB: 'N1', materialId: 'wood' },
        { id: 'M1', nodeA: 'N1', nodeB: 'N2', materialId: 'wood' },
        { id: 'M2', nodeA: 'N0', nodeB: 'N3', materialId: 'wood' },
        { id: 'M3', nodeA: 'N3', nodeB: 'N1', materialId: 'wood' },
        { id: 'M4', nodeA: 'N1', nodeB: 'N4', materialId: 'wood' },
        { id: 'M5', nodeA: 'N4', nodeB: 'N2', materialId: 'wood' },
        { id: 'M6', nodeA: 'N3', nodeB: 'N4', materialId: 'steel' },
      ],
    };

    // Player claims SF = 9.99 and cost = $5 (blatant cheat)
    const cheatResult = verifySubmissionDeterministically(blueprint, {
      safetyFactor: 9.99,
      cost: 5,
    });

    expect(cheatResult.verified).toBe(false);
    expect(cheatResult.rejectionReason).toContain('Discrepância numérica');
    expect(cheatResult.deterministicSignature).toBeUndefined();
  });
});
