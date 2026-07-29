import type { CircuitLevelDef } from '../circuitTypes';

export const level5: CircuitLevelDef = {
  id: 'level-5',
  order: 5,
  name: 'Two Paths, One Bulb',
  tagline: 'Neither resistor gets there alone — not too little, not too much.',
  hint:
    "Every single resistor here leaves the bulb underpowered, whichever one you pick — the small one and the large one both fall short. A wire can only carry one component between two joints, so to run a second resistor from + to the bulb, add a new joint and route a second path through it. Two paths sharing the current act like one weaker resistor together. Two of the same resistor gets there cheapest; mixing the two values also works, it just costs more.",
  sourceVoltage: 4.6,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'NEG', x: 6, y: 0, terminal: 'negative' },
    { id: 'LOAD_A', x: 4, y: -1, terminal: 'none' },
    { id: 'LOAD_B', x: 4, y: 1, terminal: 'none' },
  ],
  givenEdges: [{ id: 'bulb', nodeA: 'LOAD_A', nodeB: 'LOAD_B', componentId: 'bulb' }],
  budget: 70,
  unlockedMaterials: ['wire', 'resistor-small', 'resistor-large'],
  buildArea: { minX: 0, maxX: 6, minY: -2, maxY: 2 },
  gridSize: 0.5,
};
