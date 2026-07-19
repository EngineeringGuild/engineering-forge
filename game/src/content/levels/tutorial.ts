import type { LevelDef } from '../types';

export const tutorial: LevelDef = {
  id: 'tutorial',
  order: 0,
  name: 'First Forge',
  tagline: 'The road alone cannot hold weight.',
  hint:
    'A flat road is just two beams in a straight line — it has no way to carry a load pushing down on it. Add a joint above the road and connect it to both anchors AND to the road below. That triangle is what actually carries the load down into the ground.',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'M', x: 2, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 4, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-M', nodeA: 'A', nodeB: 'M' },
    { id: 'deck-M-B', nodeA: 'M', nodeB: 'B' },
  ],
  loads: [{ nodeId: 'M', force: 30_000 }],
  budget: 120,
  unlockedMaterials: ['wood', 'steel'],
  buildArea: { minX: 0, maxX: 4, minY: -3, maxY: 0 },
  gridSize: 0.5,
};
