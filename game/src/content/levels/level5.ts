import type { LevelDef } from '../types';

export const level5: LevelDef = {
  id: 'level-5',
  order: 5,
  name: 'The King Post',
  tagline: 'One post over the load, two legs down to the anchors. Which way does each one work?',
  hint:
    "Place a joint above the midpoint and connect it to both anchors AND straight down to the loaded point below it — a classic king-post shape. Test it in steel first and read the colors: the two angled legs push (compression), while the vertical post pulls (tension) — the exact opposite roles of The Tower's lines. A strut is cheap but can only push, same idea as cable but backwards; use it on the legs, and save cable for the post.",
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'M', x: 4, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 8, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-M', nodeA: 'A', nodeB: 'M' },
    { id: 'deck-M-B', nodeA: 'M', nodeB: 'B' },
  ],
  loads: [{ nodeId: 'M', force: 40_000 }],
  budget: 110,
  unlockedMaterials: ['wood', 'steel', 'cable', 'strut'],
  buildArea: { minX: 0, maxX: 8, minY: -4, maxY: 0 },
  gridSize: 0.5,
};
