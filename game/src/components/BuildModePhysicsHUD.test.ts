import { describe, it, expect } from 'vitest';
import { computeTrussBuildMetrics } from '../physics/buildModePhysics';
import { getLevel } from '../content/levels';

describe('BuildModePhysicsHUD component helpers', () => {
  it('correctly provides metrics object needed by BuildModePhysicsHUD', () => {
    const level = getLevel('tutorial')!;
    expect(level).toBeDefined();
    const metrics = computeTrussBuildMetrics(level, [], []);
    expect(metrics).toBeDefined();
    expect(metrics.totalMassKg).toBeGreaterThan(0);
    expect(metrics.cog).toBeDefined();
    expect(typeof metrics.peakStressPercent).toBe('number');
    expect(['nominal', 'elevated', 'critical', 'unstable']).toContain(metrics.stressStatus);
  });
});
