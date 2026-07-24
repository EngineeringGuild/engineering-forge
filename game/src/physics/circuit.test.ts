import { describe, expect, it } from 'vitest';
import { analyzeCircuit, type CircuitModel } from './circuit';

function seriesCircuit(resistorId: string): CircuitModel {
  return {
    sourceVoltage: 9,
    nodes: [
      { id: 'POS', x: 0, y: 0, terminal: 'positive' },
      { id: 'A', x: 1, y: 0, terminal: 'none' },
      { id: 'B', x: 2, y: 0, terminal: 'none' },
      { id: 'NEG', x: 3, y: 0, terminal: 'negative' },
    ],
    edges: [
      { id: 'wire1', nodeA: 'POS', nodeB: 'A', componentId: 'wire' },
      { id: 'series', nodeA: 'A', nodeB: 'B', componentId: resistorId },
      { id: 'bulb', nodeA: 'B', nodeB: 'NEG', componentId: 'bulb' },
    ],
  };
}

describe('analyzeCircuit', () => {
  it('matches Ohm\'s law for a series wire + resistor + bulb loop', () => {
    // R = 0.5 (wire) + 5 (resistor-small) + 3 (bulb) = 8.5Ω
    const result = analyzeCircuit(seriesCircuit('resistor-small'));
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;

    const expectedCurrent = 9 / 8.5;
    const byId = Object.fromEntries(result.edges.map((e) => [e.edgeId, e]));

    expect(byId.wire1.current).toBeCloseTo(expectedCurrent, 6);
    expect(byId.series.current).toBeCloseTo(expectedCurrent, 6);
    expect(byId.bulb.current).toBeCloseTo(expectedCurrent, 6);

    expect(byId.bulb.power).toBeCloseTo(expectedCurrent ** 2 * 3, 6);
    expect(byId.bulb.underpowered).toBe(false);
    expect(byId.bulb.burnedOut).toBe(false);
    expect(result.anyBurnedOut).toBe(false);
  });

  it('splits current correctly across two branches in parallel', () => {
    // Wire and resistor-small both span POS -> NEG directly, so each sees
    // the full 9V independently (Ohm's law per branch), and KCL means the
    // solver must still balance the shared terminal nodes.
    const model: CircuitModel = {
      sourceVoltage: 9,
      nodes: [
        { id: 'POS', x: 0, y: 0, terminal: 'positive' },
        { id: 'NEG', x: 1, y: 0, terminal: 'negative' },
      ],
      edges: [
        { id: 'branch-wire', nodeA: 'POS', nodeB: 'NEG', componentId: 'wire' },
        { id: 'branch-resistor', nodeA: 'POS', nodeB: 'NEG', componentId: 'resistor-small' },
      ],
    };
    const result = analyzeCircuit(model);
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;

    const byId = Object.fromEntries(result.edges.map((e) => [e.edgeId, e]));
    expect(byId['branch-wire'].current).toBeCloseTo(9 / 0.5, 6);
    expect(byId['branch-resistor'].current).toBeCloseTo(9 / 5, 6);
  });

  it('flags the bulb as burned out with no current-limiting resistor', () => {
    const model: CircuitModel = {
      sourceVoltage: 9,
      nodes: [
        { id: 'POS', x: 0, y: 0, terminal: 'positive' },
        { id: 'NEG', x: 1, y: 0, terminal: 'negative' },
      ],
      edges: [{ id: 'bulb', nodeA: 'POS', nodeB: 'NEG', componentId: 'bulb' }],
    };
    const result = analyzeCircuit(model);
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    expect(result.edges[0].burnedOut).toBe(true);
    expect(result.anyBurnedOut).toBe(true);
  });

  it('flags the bulb as underpowered behind too much series resistance', () => {
    const result = analyzeCircuit(seriesCircuit('resistor-large'));
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    const bulb = result.edges.find((e) => e.edgeId === 'bulb')!;
    expect(bulb.underpowered).toBe(true);
    expect(bulb.burnedOut).toBe(false);
  });

  it('leaves a wire dangling off one terminal at that terminal\'s voltage, carrying no current', () => {
    // Electrically correct, not a singularity: with nothing on the far end,
    // the dead-end node floats to the source node's own voltage.
    const model: CircuitModel = {
      sourceVoltage: 9,
      nodes: [
        { id: 'POS', x: 0, y: 0, terminal: 'positive' },
        { id: 'NEG', x: 1, y: 0, terminal: 'negative' },
        { id: 'DANGLING', x: 2, y: 0, terminal: 'none' },
      ],
      edges: [{ id: 'dead-end', nodeA: 'POS', nodeB: 'DANGLING', componentId: 'wire' }],
    };
    const result = analyzeCircuit(model);
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    expect(result.edges[0].current).toBeCloseTo(0, 6);
  });

  it('reports an open circuit when a component sits on an island with no path to either terminal', () => {
    // The bulb connects LOAD_A <-> LOAD_B, but neither node connects to the
    // battery at all — the classic "forgot to wire up the load" mistake.
    const model: CircuitModel = {
      sourceVoltage: 9,
      nodes: [
        { id: 'POS', x: 0, y: 0, terminal: 'positive' },
        { id: 'NEG', x: 1, y: 0, terminal: 'negative' },
        { id: 'LOAD_A', x: 2, y: 0, terminal: 'none' },
        { id: 'LOAD_B', x: 3, y: 0, terminal: 'none' },
      ],
      edges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
    };
    const result = analyzeCircuit(model);
    expect(result.status).toBe('open');
  });
});
