import type { CircuitLevelDef } from '../circuitTypes';

export const level2: CircuitLevelDef = {
  id: 'level-2',
  order: 2,
  name: 'Higher Voltage',
  tagline: 'Double the voltage. The old resistor isn\'t enough anymore.',
  hint:
    'This battery pushes 18V instead of 9V — the same small resistor that worked before will let through too much current now. Scale up: use the larger resistor to keep the bulb in its safe range.',
  sourceVoltage: 18,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 4, y: 0, terminal: 'negative' },
    { id: 'LOAD_A', x: 2, y: -1, terminal: 'none' },
    { id: 'LOAD_B', x: 2, y: 1, terminal: 'none' },
  ],
  givenEdges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
  budget: 50,
  unlockedMaterials: ['wire', 'resistor-large'],
  buildArea: { minX: 0, maxX: 4, minY: -2, maxY: 2 },
  gridSize: 0.5,
};
