import type { SupportType } from '../physics/truss';

export interface FixedNode {
  id: string;
  x: number;
  y: number;
  support: SupportType;
  /** Deck nodes are pre-connected to their neighbor by a free, weak plank —
   * the roadway itself, which the player reinforces rather than replaces. */
  isDeck: boolean;
}

export interface LevelLoad {
  /** id of the deck node this axle/load bears on. */
  nodeId: string;
  force: number;
}

export interface LevelDef {
  id: string;
  order: number;
  name: string;
  tagline: string;
  hint: string;
  /** Nodes given at the start: anchors (supports) and deck nodes (roadway). */
  fixedNodes: FixedNode[];
  /** Members connecting the given deck/anchor nodes — the free, weak roadway. */
  deckMembers: { id: string; nodeA: string; nodeB: string }[];
  loads: LevelLoad[];
  /** Budget available for player-built members (the deck itself is free). */
  budget: number;
  /** Materials the player may choose from for new members. */
  unlockedMaterials: string[];
  /** Bounding box for placing new nodes, in meters. */
  buildArea: { minX: number; maxX: number; minY: number; maxY: number };
  /** Grid snap size in meters. */
  gridSize: number;
}
