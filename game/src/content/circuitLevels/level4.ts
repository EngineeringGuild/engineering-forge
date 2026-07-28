import type { CircuitLevelDef } from '../circuitTypes';

export const level4: CircuitLevelDef = {
  id: 'level-4',
  order: 4,
  name: 'One Path, Two Bulbs',
  tagline: 'Not side by side this time — one wire threads through both.',
  hint:
    "Unlike Two Bulbs, these two aren't on independent branches — one single path runs from + through the first bulb, into the second bulb, and back to −. The same current flows through both, so their resistances add together in that one path. The small resistor that worked back in the tutorial pushes too much current through this longer path now — both bulbs burn out. Step up to the large resistor.",
  sourceVoltage: 15,
  fixedNodes: [
    { id: 'POS', x: 0, y: 0, terminal: 'positive' },
    { id: 'BULB1_A', x: 2, y: -1, terminal: 'none' },
    { id: 'BULB1_B', x: 2, y: 1, terminal: 'none' },
    { id: 'BULB2_A', x: 4, y: -1, terminal: 'none' },
    { id: 'BULB2_B', x: 4, y: 1, terminal: 'none' },
    { id: 'NEG', x: 6, y: 0, terminal: 'negative' },
  ],
  givenEdges: [
    { id: 'bulb1', nodeA: 'BULB1_A', nodeB: 'BULB1_B', componentId: 'bulb' },
    { id: 'bulb2', nodeA: 'BULB2_A', nodeB: 'BULB2_B', componentId: 'bulb' },
  ],
  budget: 60,
  unlockedMaterials: ['wire', 'resistor-small', 'resistor-large'],
  buildArea: { minX: 0, maxX: 6, minY: -2, maxY: 2 },
  gridSize: 0.5,
};
