import { describe, expect, it } from 'vitest';
import {
  computeDynamicTrussSimulation,
  solveTrussWithDisplacements,
} from './trussDynamic';
import type { TrussModel } from './truss';
import type { LevelDef } from '../content/types';

describe('trussDynamic physics engine', () => {
  const level: LevelDef = {
    id: 'test-bridge',
    order: 0,
    name: 'Test Dynamic Bridge',
    tagline: 'A 4m simple bridge',
    hint: '',
    fixedNodes: [
      { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
      { id: 'D', x: 2, y: 0, support: 'none', isDeck: true },
      { id: 'B', x: 4, y: 0, support: 'roller', isDeck: true },
    ],
    deckMembers: [
      { id: 'deck-A-D', nodeA: 'A', nodeB: 'D' },
      { id: 'deck-D-B', nodeA: 'D', nodeB: 'B' },
    ],
    loads: [{ nodeId: 'D', force: 10000 }],
    budget: 200,
    unlockedMaterials: ['wood', 'steel'],
    buildArea: { minX: 0, maxX: 4, minY: -3, maxY: 0 },
    gridSize: 0.5,
  };

  const simpleModel: TrussModel = {
    nodes: [
      { id: 'A', x: 0, y: 0, support: 'pin' },
      { id: 'D', x: 2, y: 0, support: 'none' },
      { id: 'B', x: 4, y: 0, support: 'roller' },
      { id: 'C', x: 2, y: -2, support: 'none' },
    ],
    members: [
      { id: 'deck-A-D', nodeA: 'A', nodeB: 'D', materialId: 'wood' },
      { id: 'deck-D-B', nodeA: 'D', nodeB: 'B', materialId: 'wood' },
      { id: 'm1', nodeA: 'A', nodeB: 'C', materialId: 'steel' },
      { id: 'm2', nodeA: 'B', nodeB: 'C', materialId: 'steel' },
      { id: 'm3', nodeA: 'D', nodeB: 'C', materialId: 'steel' },
    ],
    loads: [{ nodeId: 'D', force: 10000 }],
  };

  it('solves displacements and forces for stable truss', () => {
    const res = solveTrussWithDisplacements(simpleModel);
    expect(res.status).toBe('analyzed');
    expect(res.anyFailed).toBe(false);
    expect(res.displacements['D']).toBeDefined();
    // Under downward load (+y), displacement dy at D should be positive (downward)
    expect(res.displacements['D'].dy).toBeGreaterThan(0);
  });

  it('generates a multi-step dynamic moving load trajectory', () => {
    const steps = 10;
    const trajectory = computeDynamicTrussSimulation(level, simpleModel, steps);

    expect(trajectory.frames.length).toBe(steps + 1);
    expect(trajectory.durationSeconds).toBeGreaterThan(0);
    expect(trajectory.frames[0].cartPos.x).toBeCloseTo(0);
    expect(trajectory.frames[steps].cartPos.x).toBeCloseTo(4);
    expect(trajectory.passed).toBe(true);
  });

  it('detects structural failure along the moving load path if overloaded', () => {
    const overloadedLevel: LevelDef = {
      ...level,
      loads: [{ nodeId: 'D', force: 2000000 }], // 2,000,000 N load exceeds wood capacity of 400,000 N
    };

    const trajectory = computeDynamicTrussSimulation(overloadedLevel, simpleModel, 10);
    expect(trajectory.passed).toBe(false);
    expect(trajectory.failureStep).not.toBeNull();
  });
});
