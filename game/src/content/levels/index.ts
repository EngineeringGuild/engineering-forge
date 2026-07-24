import { tutorial } from './tutorial';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import type { LevelDef } from '../types';

export const LEVELS: LevelDef[] = [tutorial, level1, level2, level3, level4];

export function getLevel(id: string): LevelDef | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function nextLevelId(id: string): string | undefined {
  const index = LEVELS.findIndex((level) => level.id === id);
  if (index === -1 || index === LEVELS.length - 1) return undefined;
  return LEVELS[index + 1].id;
}
