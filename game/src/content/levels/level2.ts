import type { LevelDef } from '../types';

export const level2: LevelDef = {
  id: 'level-2',
  order: 2,
  name: 'Two Axles',
  tagline: 'Two load points now. Every joint on the road needs its own triangle.',
  hint:
    'This truck has two axles, so two points on the road carry weight — and both need a load path up into a triangle, not just one. Any road joint left as a straight line between its neighbors is a mechanism, even the ones with no load on them.',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'D1', x: 10 / 3, y: 0, support: 'none', isDeck: true },
    { id: 'D2', x: 20 / 3, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 10, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-D1', nodeA: 'A', nodeB: 'D1' },
    { id: 'deck-D1-D2', nodeA: 'D1', nodeB: 'D2' },
    { id: 'deck-D2-B', nodeA: 'D2', nodeB: 'B' },
  ],
  loads: [
    { nodeId: 'D1', force: 35_000 },
    { nodeId: 'D2', force: 35_000 },
  ],
  budget: 160,
  unlockedMaterials: ['wood', 'steel'],
  buildArea: { minX: 0, maxX: 10, minY: -5, maxY: 0 },
  gridSize: 0.5,
};
