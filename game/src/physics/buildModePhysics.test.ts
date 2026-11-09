import { describe, it, expect } from 'vitest';
import {
  computeTrussBuildMetrics,
  computeCircuitBuildMetrics,
  computeVehicleBuildMetrics,
} from './buildModePhysics';
import { getLevel } from '../content/levels';
import { getCircuitLevel } from '../content/circuitLevels';

describe('buildModePhysics', () => {
  it('correctly calculates total mass and center of gravity for a truss bridge', () => {
    const level = getLevel('tutorial')!;
    expect(level).toBeDefined();

    // With zero built members
    const initialMetrics = computeTrussBuildMetrics(level, [], []);
    expect(initialMetrics.totalMassKg).toBeGreaterThan(0);
    expect(initialMetrics.jointCount).toBe(level.fixedNodes.length);
    expect(initialMetrics.cog.x).toBeGreaterThan(0);
    expect(initialMetrics.cog.y).toBeGreaterThanOrEqual(0);

    // Add a node and a steel member
    const builtNodes = [{ id: 'n0', x: 2, y: 3 }];
    const builtMembers = [{ id: 'm0', nodeA: level.fixedNodes[0].id, nodeB: 'n0', materialId: 'steel' }];
    const withMembers = computeTrussBuildMetrics(level, builtNodes, builtMembers);

    expect(withMembers.totalMassKg).toBeGreaterThan(initialMetrics.totalMassKg);
    expect(withMembers.memberCount).toBe(level.deckMembers.length + 1);
    expect(withMembers.jointCount).toBe(level.fixedNodes.length + 1);
  });

  it('determines Maxwell determinacy condition accurately', () => {
    const level = getLevel('tutorial')!;
    expect(level).toBeDefined();
    const metrics = computeTrussBuildMetrics(level, [], []);
    expect(typeof metrics.determinacyDiff).toBe('number');
    expect(typeof metrics.determinacyLabel).toBe('string');
  });

  it('computes circuit build metrics with power and resistance estimate', () => {
    const level = getCircuitLevel('tutorial')!;
    expect(level).toBeDefined();
    const metrics = computeCircuitBuildMetrics(level, [], []);
    expect(metrics.totalComponents).toBeGreaterThanOrEqual(0);
    expect(metrics.estimatedPowerWatts).toBeGreaterThan(0);
  });

  it('computes vehicle build metrics with power-to-weight and weight distribution', () => {
    const metrics = computeVehicleBuildMetrics('engine-small', 'chassis-light');
    expect(metrics.totalMassKg).toBeGreaterThan(500);
    expect(metrics.powerToWeightHpPerTon).toBeGreaterThan(20);
    expect(metrics.frontBiasPercent + metrics.rearBiasPercent).toBe(100);
  });
});
