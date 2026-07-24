import type { LevelDef } from '../types';

export const level4: LevelDef = {
  id: 'level-4',
  order: 4,
  name: 'The Tower',
  tagline: 'One tall tower, five lines down to the deck. Not all of them pull.',
  hint:
    'Cable is cheap for its strength, but it can only pull — put it on a member that ends up in compression and it fails outright, no matter how light the load. Build a tower above the deck and run lines from its top down to the anchors and to the loaded points, then Test before committing to cable everywhere: the color will tell you which lines are actually in tension.',
  fixedNodes: [
    { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
    { id: 'D1', x: 4, y: 0, support: 'none', isDeck: true },
    { id: 'MID', x: 6, y: 0, support: 'none', isDeck: true },
    { id: 'D2', x: 8, y: 0, support: 'none', isDeck: true },
    { id: 'B', x: 12, y: 0, support: 'roller', isDeck: true },
  ],
  deckMembers: [
    { id: 'deck-A-D1', nodeA: 'A', nodeB: 'D1' },
    { id: 'deck-D1-MID', nodeA: 'D1', nodeB: 'MID' },
    { id: 'deck-MID-D2', nodeA: 'MID', nodeB: 'D2' },
    { id: 'deck-D2-B', nodeA: 'D2', nodeB: 'B' },
  ],
  loads: [
    { nodeId: 'D1', force: 40_000 },
    { nodeId: 'D2', force: 40_000 },
  ],
  budget: 710,
  unlockedMaterials: ['wood', 'steel', 'cable'],
  buildArea: { minX: 0, maxX: 12, minY: -6, maxY: 0 },
  gridSize: 0.5,
};
