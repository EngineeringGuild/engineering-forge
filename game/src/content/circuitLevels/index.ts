import { tutorial } from './tutorial';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import type { CircuitLevelDef } from '../circuitTypes';

export const CIRCUIT_LEVELS: CircuitLevelDef[] = [tutorial, level1, level2, level3, level4, level5];

export function getCircuitLevel(id: string): CircuitLevelDef | undefined {
  return CIRCUIT_LEVELS.find((level) => level.id === id);
}

export function nextCircuitLevelId(id: string): string | undefined {
  const index = CIRCUIT_LEVELS.findIndex((level) => level.id === id);
  if (index === -1 || index === CIRCUIT_LEVELS.length - 1) return undefined;
  return CIRCUIT_LEVELS[index + 1].id;
}
