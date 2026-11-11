import { describe, it, expect } from 'vitest';
import {
  analyzeClassroomDiagnostics,
  getAnonymousStudentAlias,
  type StudentFailureRecord,
} from './educatorDiagnostics';

describe('Educator Diagnostics & Classroom Heatmap Engine', () => {
  const sampleRecords: StudentFailureRecord[] = [
    {
      submissionId: 'sub-01',
      studentAnonymousAlias: getAnonymousStudentAlias(0),
      discipline: 'structures',
      failureType: 'euler_buckling',
      safetyFactorAchieved: 0.72,
      cost: 1400,
      timeSpentSeconds: 120,
      failedMemberIds: ['m1', 'm2'],
      failedNodeCoords: [{ x: 4, y: 0 }, { x: 4, y: -3 }],
      timestamp: Date.now(),
    },
    {
      submissionId: 'sub-02',
      studentAnonymousAlias: getAnonymousStudentAlias(1),
      discipline: 'structures',
      failureType: 'euler_buckling',
      safetyFactorAchieved: 0.85,
      cost: 1600,
      timeSpentSeconds: 95,
      failedMemberIds: ['m2'],
      failedNodeCoords: [{ x: 4, y: -3 }],
      timestamp: Date.now(),
    },
    {
      submissionId: 'sub-03',
      studentAnonymousAlias: getAnonymousStudentAlias(2),
      discipline: 'structures',
      failureType: 'cable_slack',
      safetyFactorAchieved: 0.9,
      cost: 1200,
      timeSpentSeconds: 150,
      failedMemberIds: ['c1'],
      failedNodeCoords: [{ x: 2, y: 0 }],
      timestamp: Date.now(),
    },
    {
      submissionId: 'sub-04',
      studentAnonymousAlias: getAnonymousStudentAlias(3),
      discipline: 'structures',
      failureType: 'budget_exceeded',
      safetyFactorAchieved: 1.8, // Structure is safe but budget blown
      cost: 3200,
      timeSpentSeconds: 180,
      timestamp: Date.now(),
    },
    {
      submissionId: 'sub-05',
      studentAnonymousAlias: getAnonymousStudentAlias(4),
      discipline: 'structures',
      failureType: 'unstable_mechanism',
      safetyFactorAchieved: 1.45,
      cost: 1500,
      timeSpentSeconds: 80,
      timestamp: Date.now(),
    },
  ];

  it('aggregates overall class pass rates, cost and safety factor', () => {
    const summary = analyzeClassroomDiagnostics(sampleRecords);

    expect(summary.totalSubmissions).toBe(5);
    expect(summary.passRatePercent).toBe(40); // 2 out of 5 achieved SF >= 1.0 (sub-04 and sub-05)
    expect(summary.averageSafetyFactor).toBeGreaterThan(1.0);
    expect(summary.averageCost).toBeGreaterThan(1000);
  });

  it('ranks top failure causes with pedagogical intervention recommendations', () => {
    const summary = analyzeClassroomDiagnostics(sampleRecords);

    expect(summary.topFailureCauses.length).toBeGreaterThanOrEqual(3);
    const topCause = summary.topFailureCauses[0];
    expect(topCause.type).toBe('euler_buckling');
    expect(topCause.count).toBe(2);
    expect(topCause.percentage).toBe(50); // 2 out of 4 failed submissions
    expect(topCause.pedagogicalIntervention).toContain('esbeltez de colunas');
  });

  it('generates spatial heatmap points with normalized intensity for hotspot visualization', () => {
    const summary = analyzeClassroomDiagnostics(sampleRecords);

    expect(summary.nodeFailureHeatmap.length).toBeGreaterThan(0);
    // Node at (4, -3) failed twice (in sub-01 and sub-02)
    const hotSpot = summary.nodeFailureHeatmap.find((p) => p.x === 4 && p.y === -3);
    expect(hotSpot).toBeDefined();
    expect(hotSpot?.failureCount).toBe(2);
    expect(hotSpot?.intensity).toBe(1.0); // Highest failure hotspot
  });
});
