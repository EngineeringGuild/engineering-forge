import type { LevelDef } from '../types';

export const level1: LevelDef = {
  id: 'level-1',
  order: 1,
  name: 'Longer Span',
  tagline: 'Double the span, same idea — but mind the budget.',
  hint:
    'Same trick as the tutorial, just a wider gap and a heavier truck. Wood is cheap; use it unless the numbers tell you a member is close to its limit.',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'M', x: 4, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 8, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-M', nodeA: 'A', nodeB: 'M' },
    { id: 'deck-M-B', nodeA: 'M', nodeB: 'B' },
  ],
  loads: [{ nodeId: 'M', force: 50_000 }],
  budget: 75,
  unlockedMaterials: ['wood', 'steel'],
  buildArea: { minX: 0, maxX: 8, minY: -5, maxY: 0 },
  gridSize: 0.5,
};
