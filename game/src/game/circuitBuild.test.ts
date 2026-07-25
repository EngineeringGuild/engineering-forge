import { describe, expect, it } from 'vitest';
import {
  edgeLength,
  scoreCircuitAttempt,
  toCircuitModel,
  totalCircuitCost,
  type BuiltEdge,
} from './circuitBuild';
import type { BuiltNode } from './build';
import type { CircuitLevelDef } from '../content/circuitTypes';

const level: CircuitLevelDef = {
  id: 'test-level',
  order: 0,
  name: 'Test',
  tagline: '',
  hint: '',
  sourceVoltage: 9,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 4, y: 0, terminal: 'negative' },
    { id: 'LOAD_A', x: 2, y: -1, terminal: 'none' },
    { id: 'LOAD_B', x: 2, y: 1, terminal: 'none' },
  ],
  givenEdges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
  budget: 100,
  unlockedMaterials: ['wire', 'resistor-small', 'resistor-large'],
  buildArea: { minX: 0, maxX: 4, minY: -2, maxY: 2 },
  gridSize: 0.5,
};

describe('toCircuitModel', () => {
  it('merges fixed + built nodes and given + built edges, passing sourceVoltage through', () => {
    const builtNodes: BuiltNode[] = [{ id: 'n0', x: 0, y: -1 }];
    const builtEdges: BuiltEdge[] = [
      { id: 'e0', nodeA: 'POS', nodeB: 'n0', componentId: 'wire' },
    ];
    const model = toCircuitModel(level, builtNodes, builtEdges);

    expect(model.sourceVoltage).toBe(9);
    expect(model.nodes).toHaveLength(5);
    expect(model.nodes.find((n) => n.id === 'n0')).toEqual({ id: 'n0', x: 0, y: -1, terminal: 'none' });
    expect(model.edges).toHaveLength(2);
    expect(model.edges.find((e) => e.id === 'bulb')).toEqual(level.givenEdges[0]);
    expect(model.edges.find((e) => e.id === 'e0')).toEqual(builtEdges[0]);
  });
});

describe('edgeLength', () => {
  it('computes the Euclidean distance between two fixed nodes', () => {
    const edge: BuiltEdge = { id: 'e0', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'wire' };
    expect(edgeLength(level, [], edge)).toBeCloseTo(2, 6);
  });

  it('returns 0 for an edge referencing a node that does not exist', () => {
    const edge: BuiltEdge = { id: 'e0', nodeA: 'POS', nodeB: 'missing', componentId: 'wire' };
    expect(edgeLength(level, [], edge)).toBe(0);
  });
});

describe('totalCircuitCost', () => {
  it('only charges for built edges — the given load is free', () => {
    // A 4m wire (cost 2/m) from POS to a built node directly below NEG.
    const builtNodes: BuiltNode[] = [{ id: 'n0', x: 4, y: -3 }];
    const builtEdges: BuiltEdge[] = [{ id: 'e0', nodeA: 'POS', nodeB: 'n0', componentId: 'wire' }];
    const length = Math.hypot(4, 3); // 5
    expect(totalCircuitCost(level, builtNodes, builtEdges)).toBeCloseTo(length * 2, 6);
  });

  it('is zero with no built edges', () => {
    expect(totalCircuitCost(level, [], [])).toBe(0);
  });
});

describe('scoreCircuitAttempt', () => {
  it('fails with 0 stars when not passed, regardless of cost', () => {
    expect(scoreCircuitAttempt(level, 1, false)).toEqual({ passed: false, cost: 1, stars: 0 });
  });

  it('fails with 0 stars when cost exceeds budget even if otherwise passed', () => {
    expect(scoreCircuitAttempt(level, 101, true)).toEqual({ passed: false, cost: 101, stars: 0 });
  });

  it('awards stars by cost/budget ratio when it passes', () => {
    expect(scoreCircuitAttempt(level, 60, true)).toEqual({ passed: true, cost: 60, stars: 3 });
    expect(scoreCircuitAttempt(level, 61, true)).toEqual({ passed: true, cost: 61, stars: 2 });
    expect(scoreCircuitAttempt(level, 85, true)).toEqual({ passed: true, cost: 85, stars: 2 });
    expect(scoreCircuitAttempt(level, 86, true)).toEqual({ passed: true, cost: 86, stars: 1 });
  });
});
