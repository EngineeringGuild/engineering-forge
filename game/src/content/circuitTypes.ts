import type { Terminal } from '../physics/circuit';

export interface CircuitFixedNode {
  id: string;
  x: number;
  y: number;
  terminal: Terminal;
}

export interface CircuitLevelDef {
  id: string;
  order: number;
  name: string;
  tagline: string;
  hint: string;
  sourceVoltage: number;
  /** Terminals (positive/negative) and the load's own two connection points. */
  fixedNodes: CircuitFixedNode[];
  /** The given, free load component (e.g. the bulb) — always present. */
  givenEdges: { id: string; nodeA: string; nodeB: string; componentId: string }[];
  /** Budget available for player-built connections — the load itself is free. */
  budget: number;
  /** Component ids the player may choose from for new connections. */
  unlockedMaterials: string[];
  buildArea: { minX: number; maxX: number; minY: number; maxY: number };
  gridSize: number;
}
