import type { CircuitLevelDef } from '../circuitTypes';

export const level1: CircuitLevelDef = {
  id: 'level-1',
  order: 1,
  name: 'Two Bulbs',
  tagline: 'One battery, two independent loads.',
  hint:
    'Each bulb is its own branch back to the battery — wiring both to the same positive and negative rails is fine, but each branch needs its own current-limiting resistor. A resistor on one branch does nothing to protect the other.',
  sourceVoltage: 9,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 6, y: 0, terminal: 'negative' },
    { id: 'LOAD1_A', x: 2, y: -1.5, terminal: 'none' },
    { id: 'LOAD1_B', x: 2, y: 1.5, terminal: 'none' },
    { id: 'LOAD2_A', x: 4, y: -1.5, terminal: 'none' },
    { id: 'LOAD2_B', x: 4, y: 1.5, terminal: 'none' },
  ],
  givenEdges: [
    { id: 'bulb1', nodeA: 'LOAD1_A', nodeB: 'LOAD1_B', componentId: 'bulb' },
    { id: 'bulb2', nodeA: 'LOAD2_A', nodeB: 'LOAD2_B', componentId: 'bulb' },
  ],
  budget: 90,
  unlockedMaterials: ['wire', 'resistor-small', 'resistor-large'],
  buildArea: { minX: 0, maxX: 6, minY: -2, maxY: 2 },
  gridSize: 0.5,
};
