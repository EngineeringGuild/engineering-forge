import type { CircuitLevelDef } from '../circuitTypes';

export const level3: CircuitLevelDef = {
  id: 'level-3',
  order: 3,
  name: 'Splitting the Load',
  tagline: 'One resistor leaves it too dim. You don\'t have a smaller one.',
  hint:
    'The big resistor alone drops too much voltage before the current ever reaches the bulb. But two resistors run side by side — both starting at the battery, both ending at the same junction before the bulb — split the current between them. Two equal resistors in parallel act like one resistor at half the value.',
  sourceVoltage: 9,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 4, y: 0, terminal: 'negative' },
    { id: 'LOAD_A', x: 2, y: -1, terminal: 'none' },
    { id: 'LOAD_B', x: 2, y: 1, terminal: 'none' },
  ],
  givenEdges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
  budget: 120,
  unlockedMaterials: ['wire', 'resistor-large'],
  buildArea: { minX: 0, maxX: 4, minY: -2.5, maxY: 2 },
  gridSize: 0.5,
};
