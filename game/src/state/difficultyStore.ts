import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyModifiers {
  level: DifficultyLevel;
  name: string;
  badge: string;
  description: string;
  gravityMultiplier: number;
  stressCapacityMultiplier: number; // e.g. 1.25 allows 25% higher load before snapping
  burnoutPowerMultiplier: number; // e.g. 1.25 allows 25% higher power before electrical burnout
  tractionFrictionMultiplier: number; // e.g. 1.15 boosts tire grip
  scoreBonusMultiplier: number; // Hard mode rewards higher mastery score
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyModifiers> = {
  easy: {
    level: 'easy',
    name: 'Apprentice (Easy)',
    badge: '🟢',
    description: 'Forgiving conditions: 0.8x gravity, +25% material stress allowance, +25% component thermal headroom.',
    gravityMultiplier: 0.8,
    stressCapacityMultiplier: 1.25,
    burnoutPowerMultiplier: 1.25,
    tractionFrictionMultiplier: 1.15,
    scoreBonusMultiplier: 0.8,
  },
  medium: {
    level: 'medium',
    name: 'Standard (Medium)',
    badge: '🟡',
    description: 'Nominal physics: standard earth gravity (9.81 m/s²), nominal ASME/IEEE design stress limits.',
    gravityMultiplier: 1.0,
    stressCapacityMultiplier: 1.0,
    burnoutPowerMultiplier: 1.0,
    tractionFrictionMultiplier: 1.0,
    scoreBonusMultiplier: 1.0,
  },
  hard: {
    level: 'hard',
    name: 'Hardcore (Hard)',
    badge: '🔴',
    description: 'Harsh conditions: 1.15x gravity, stricter -15% structural stress limits, -10% electrical burnout limits. Unlocks Hardcore achievement.',
    gravityMultiplier: 1.15,
    stressCapacityMultiplier: 0.85,
    burnoutPowerMultiplier: 0.9,
    tractionFrictionMultiplier: 0.9,
    scoreBonusMultiplier: 1.4,
  },
};

export interface DifficultyState {
  globalDifficulty: DifficultyLevel;
  levelOverrides: Record<string, DifficultyLevel>;
  setGlobalDifficulty: (diff: DifficultyLevel) => void;
  setLevelDifficulty: (levelId: string, diff: DifficultyLevel) => void;
  getDifficultyForLevel: (levelId?: string) => DifficultyLevel;
  getModifiersForLevel: (levelId?: string) => DifficultyModifiers;
  resetAllDifficulties: () => void;
}

export const useDifficultyStore = create<DifficultyState>()(
  persist(
    (set, get) => ({
      globalDifficulty: 'medium',
      levelOverrides: {},

      setGlobalDifficulty: (diff) => {
        set({ globalDifficulty: diff });
      },

      setLevelDifficulty: (levelId, diff) => {
        set((state) => ({
          levelOverrides: {
            ...state.levelOverrides,
            [levelId]: diff,
          },
        }));
      },

      getDifficultyForLevel: (levelId) => {
        if (!levelId) return get().globalDifficulty;
        return get().levelOverrides[levelId] ?? get().globalDifficulty;
      },

      getModifiersForLevel: (levelId) => {
        const diff = get().getDifficultyForLevel(levelId);
        return DIFFICULTY_PRESETS[diff] ?? DIFFICULTY_PRESETS.medium;
      },

      resetAllDifficulties: () => {
        set({ globalDifficulty: 'medium', levelOverrides: {} });
      },
    }),
    {
      name: 'engineering-forge-difficulty',
    },
  ),
);
