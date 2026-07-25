import { describe, expect, it } from 'vitest';
import { memberLength, scoreAttempt, toTrussModel, totalCost, type BuiltMember, type BuiltNode } from './build';
import type { LevelDef } from '../content/types';

const level: LevelDef = {
  id: 'test-level',
  order: 0,
  name: 'Test',
  tagline: '',
  hint: '',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'B', x: 4, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [{ id: 'deck-A-B', nodeA: 'A', nodeB: 'B' }],
  loads: [{ nodeId: 'A', force: 1000 }],
  budget: 100,
  unlockedMaterials: ['wood', 'steel'],
  buildArea: { minX: 0, maxX: 4, minY: -3, maxY: 0 },
  gridSize: 0.5,
};

describe('toTrussModel', () => {
  it('forces every deck member onto the deck material regardless of what is stored on it', () => {
    const model = toTrussModel(level, [], []);
    expect(model.members).toEqual([{ id: 'deck-A-B', nodeA: 'A', nodeB: 'B', materialId: 'wood' }]);
  });

  it('merges fixed + built nodes and deck + built members, and passes loads through unchanged', () => {
    const builtNodes: BuiltNode[] = [{ id: 'n0', x: 2, y: -2 }];
    const builtMembers: BuiltMember[] = [
      { id: 'm0', nodeA: 'A', nodeB: 'n0', materialId: 'steel' },
    ];
    const model = toTrussModel(level, builtNodes, builtMembers);

    expect(model.nodes).toHaveLength(3);
    expect(model.nodes.find((n) => n.id === 'n0')).toEqual({ id: 'n0', x: 2, y: -2, support: 'none' });
    expect(model.members).toHaveLength(2);
    expect(model.members.find((m) => m.id === 'm0')).toEqual(builtMembers[0]);
    expect(model.loads).toBe(level.loads);
  });
});

describe('memberLength', () => {
  it('computes the Euclidean distance between a fixed and a built node', () => {
    const builtNodes: BuiltNode[] = [{ id: 'n0', x: 0, y: -3 }];
    const member: BuiltMember = { id: 'm0', nodeA: 'A', nodeB: 'n0', materialId: 'wood' };
    expect(memberLength(level, builtNodes, member)).toBeCloseTo(3, 6);
  });

  it('returns 0 for a member referencing a node that does not exist', () => {
    const member: BuiltMember = { id: 'm0', nodeA: 'A', nodeB: 'missing', materialId: 'wood' };
    expect(memberLength(level, [], member)).toBe(0);
  });
});

describe('totalCost', () => {
  it('only charges for built members — the deck is free', () => {
    // A single 4m steel member (cost 20/m) from A to a built node directly
    // above B.
    const builtNodes: BuiltNode[] = [{ id: 'n0', x: 4, y: -3 }];
    const builtMembers: BuiltMember[] = [
      { id: 'm0', nodeA: 'A', nodeB: 'n0', materialId: 'steel' },
    ];
    const length = Math.hypot(4, 3); // 5
    expect(totalCost(level, builtNodes, builtMembers)).toBeCloseTo(length * 20, 6);
  });

  it('is zero with no built members', () => {
    expect(totalCost(level, [], [])).toBe(0);
  });
});

describe('scoreAttempt', () => {
  it('fails with 0 stars when the structural pass/fail is false, regardless of cost', () => {
    expect(scoreAttempt(level, 1, false)).toEqual({ passed: false, cost: 1, stars: 0 });
  });

  it('fails with 0 stars when cost exceeds budget, even if structurally passed', () => {
    expect(scoreAttempt(level, 101, true)).toEqual({ passed: false, cost: 101, stars: 0 });
  });

  it('awards stars by cost/budget ratio when it passes', () => {
    expect(scoreAttempt(level, 60, true)).toEqual({ passed: true, cost: 60, stars: 3 }); // 0.60
    expect(scoreAttempt(level, 61, true)).toEqual({ passed: true, cost: 61, stars: 2 }); // 0.61
    expect(scoreAttempt(level, 85, true)).toEqual({ passed: true, cost: 85, stars: 2 }); // 0.85
    expect(scoreAttempt(level, 86, true)).toEqual({ passed: true, cost: 86, stars: 1 }); // 0.86
    expect(scoreAttempt(level, 100, true)).toEqual({ passed: true, cost: 100, stars: 1 }); // 1.00
  });
});
