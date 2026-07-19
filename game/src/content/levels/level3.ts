import type { LevelDef } from '../types';

export const level3: LevelDef = {
  id: 'level-3',
  order: 3,
  name: 'The Long Crossing',
  tagline: 'A wide river, a tight budget, and three joints to brace.',
  hint:
    'Longer spans mean bigger forces near the middle. Steel costs four times as much as wood per meter but holds roughly three times the force — spend it where the numbers say a member is near its limit, not everywhere.',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'D1', x: 3.5, y: 0, support: 'none', isDeck: true },
    { id: 'D2', x: 7, y: 0, support: 'none', isDeck: true },
    { id: 'D3', x: 10.5, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 14, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-D1', nodeA: 'A', nodeB: 'D1' },
    { id: 'deck-D1-D2', nodeA: 'D1', nodeB: 'D2' },
    { id: 'deck-D2-D3', nodeA: 'D2', nodeB: 'D3' },
    { id: 'deck-D3-B', nodeA: 'D3', nodeB: 'B' },
  ],
  loads: [
    { nodeId: 'D1', force: 40_000 },
    { nodeId: 'D3', force: 40_000 },
  ],
  budget: 230,
  unlockedMaterials: ['wood', 'steel'],
  buildArea: { minX: 0, maxX: 14, minY: -6, maxY: 0 },
  gridSize: 0.5,
};
