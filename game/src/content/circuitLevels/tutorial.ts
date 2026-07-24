import type { CircuitLevelDef } from '../circuitTypes';

export const tutorial: CircuitLevelDef = {
  id: 'tutorial',
  order: 0,
  name: 'First Spark',
  tagline: 'Wire it straight and the bulb pops.',
  hint:
    'A direct wire from the battery to the bulb lets through too much current — the bulb burns out immediately. Add a resistor in series (between the positive terminal and the bulb) to bring the current down into its safe, bright range. Too big a resistor and it stays dim instead.',
  sourceVoltage: 9,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 4, y: 0, terminal: 'negative' },
    { id: 'LOAD_A', x: 2, y: -1, terminal: 'none' },
    { id: 'LOAD_B', x: 2, y: 1, terminal: 'none' },
  ],
  givenEdges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
  budget: 60,
  unlockedMaterials: ['wire', 'resistor-small', 'resistor-large'],
  buildArea: { minX: 0, maxX: 4, minY: -2, maxY: 2 },
  gridSize: 0.5,
};
