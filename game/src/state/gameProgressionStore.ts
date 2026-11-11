/**
 * Engineering Forge - Unified Game Progression Store
 * 
 * Persistent store (localStorage) tracking unlock status, completions,
 * star ratings, and mastery badges across all engineering categories
 * (Structures, Circuits, Machines).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LEVELS } from '../content/levels';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';
import { MECHATRONICS_LEVELS } from '../content/mechatronicsLevels';
import { useGameStore } from './gameStore';
import { useCircuitStore } from './circuitStore';
import { useVehicleStore } from './vehicleStore';
import { useMechatronicsStore } from './mechatronicsStore';

export type EngineeringCategory = 'structures' | 'circuits' | 'machines' | 'mechatronics';

export interface LevelProgressRecord {
  id: string;
  category: EngineeringCategory;
  unlocked: boolean;
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestCost?: number;
  bestTimeSeconds?: number;
  completedAt?: string;
}

export interface CategoryBadgeInfo {
  category: EngineeringCategory;
  tier: 'initiate' | 'apprentice' | 'journeyman' | 'master';
  title: string;
  description: string;
  icon: string;
  accentColor: string;
  completedCount: number;
  totalCount: number;
  earnedStars: number;
  maxStars: number;
  percent: number;
  isFullyCompleted: boolean;
  unlockedAt?: string;
}

export interface GameProgressionState {
  records: Record<string, LevelProgressRecord>; // key: `${category}:${levelId}`

  // Query helpers
  isLevelUnlocked: (category: EngineeringCategory, levelId: string) => boolean;
  isLevelCompleted: (category: EngineeringCategory, levelId: string) => boolean;
  getLevelStars: (category: EngineeringCategory, levelId: string) => number;
  getLevelRecord: (category: EngineeringCategory, levelId: string) => LevelProgressRecord | undefined;
  getCategoryBadge: (category: EngineeringCategory) => CategoryBadgeInfo;
  getOverallStats: () => {
    totalCompleted: number;
    totalLevels: number;
    earnedStars: number;
    maxStars: number;
    overallPercent: number;
    allCategoriesMastered: boolean;
  };

  // Mutations
  unlockLevel: (category: EngineeringCategory, levelId: string) => void;
  recordLevelCompletion: (
    category: EngineeringCategory,
    levelId: string,
    stars: 1 | 2 | 3,
    cost: number,
    timeSeconds?: number,
  ) => void;
  syncFromLegacyStores: () => void;
  resetCategoryProgress: (category: EngineeringCategory) => void;
  resetAllProgression: () => void;
}

const CATEGORY_LEVEL_DEFS: Record<EngineeringCategory, Array<{ id: string; name: string }>> = {
  structures: LEVELS,
  circuits: CIRCUIT_LEVELS,
  machines: VEHICLE_LEVELS,
  mechatronics: MECHATRONICS_LEVELS,
};

function getRecordKey(category: EngineeringCategory, levelId: string): string {
  return `${category}:${levelId}`;
}

export const useGameProgressionStore = create<GameProgressionState>()(
  persist(
    (set, get) => ({
      records: {},

      isLevelUnlocked: (category, levelId) => {
        const list = CATEGORY_LEVEL_DEFS[category] || [];
        const index = list.findIndex((l) => l.id === levelId);
        // First level in any discipline is always unlocked by default
        if (index <= 0) return true;

        const record = get().records[getRecordKey(category, levelId)];
        if (record?.unlocked) return true;

        // Check if previous level in sequence is completed
        const prevLevel = list[index - 1];
        if (!prevLevel) return true;

        const prevRecord = get().records[getRecordKey(category, prevLevel.id)];
        if (prevRecord && prevRecord.completed) return true;

        // Fallback: check legacy domain stores
        switch (category) {
          case 'structures':
            return useGameStore.getState().isLevelUnlocked(levelId);
          case 'circuits':
            return useCircuitStore.getState().isLevelUnlocked(levelId);
          case 'machines':
            return useVehicleStore.getState().isLevelUnlocked(levelId);
          case 'mechatronics':
            return useMechatronicsStore.getState().isLevelUnlocked(levelId);
        }
      },

      isLevelCompleted: (category, levelId) => {
        const record = get().records[getRecordKey(category, levelId)];
        if (record && record.completed && record.stars > 0) return true;

        // Fallback check against domain stores
        switch (category) {
          case 'structures':
            return (useGameStore.getState().progress[levelId]?.stars ?? 0) > 0;
          case 'circuits':
            return (useCircuitStore.getState().progress[levelId]?.stars ?? 0) > 0;
          case 'machines':
            return (useVehicleStore.getState().progress[levelId]?.stars ?? 0) > 0;
          case 'mechatronics':
            return (useMechatronicsStore.getState().progress[levelId]?.stars ?? 0) > 0;
        }
      },

      getLevelStars: (category, levelId) => {
        const record = get().records[getRecordKey(category, levelId)];
        if (record && record.stars > 0) return record.stars;

        switch (category) {
          case 'structures':
            return useGameStore.getState().progress[levelId]?.stars ?? 0;
          case 'circuits':
            return useCircuitStore.getState().progress[levelId]?.stars ?? 0;
          case 'machines':
            return useVehicleStore.getState().progress[levelId]?.stars ?? 0;
          case 'mechatronics':
            return useMechatronicsStore.getState().progress[levelId]?.stars ?? 0;
        }
      },

      getLevelRecord: (category, levelId) => {
        return get().records[getRecordKey(category, levelId)];
      },

      getCategoryBadge: (category) => {
        const list = CATEGORY_LEVEL_DEFS[category] || [];
        const totalCount = list.length;
        let completedCount = 0;
        let earnedStars = 0;

        for (const lvl of list) {
          if (get().isLevelCompleted(category, lvl.id)) {
            completedCount++;
          }
          earnedStars += get().getLevelStars(category, lvl.id);
        }

        const maxStars = totalCount * 3;
        const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const isFullyCompleted = totalCount > 0 && completedCount === totalCount;

        if (isFullyCompleted) {
          return {
            category,
            tier: 'master',
            title: `${category === 'structures' ? 'Structures' : category === 'circuits' ? 'Circuits' : 'Machines'} Master`,
            description: `100% Mastery: All ${totalCount} levels solved and physically verified.`,
            icon: '🏆',
            accentColor: 'var(--success)',
            completedCount,
            totalCount,
            earnedStars,
            maxStars,
            percent: 100,
            isFullyCompleted: true,
          };
        } else if (percent >= 50) {
          return {
            category,
            tier: 'journeyman',
            title: `Journeyman ${category === 'structures' ? 'Structural' : category === 'circuits' ? 'Electrical' : 'Mechanical'} Engineer`,
            description: `Solid proficiency: ${completedCount} of ${totalCount} levels completed.`,
            icon: '⚙️',
            accentColor: 'var(--accent)',
            completedCount,
            totalCount,
            earnedStars,
            maxStars,
            percent,
            isFullyCompleted: false,
          };
        } else if (completedCount > 0) {
          return {
            category,
            tier: 'apprentice',
            title: `Apprentice ${category === 'structures' ? 'Builder' : category === 'circuits' ? 'Wirer' : 'Mechanic'}`,
            description: `Underway: First milestones achieved in ${category}.`,
            icon: '🥉',
            accentColor: '#f59e0b',
            completedCount,
            totalCount,
            earnedStars,
            maxStars,
            percent,
            isFullyCompleted: false,
          };
        } else {
          return {
            category,
            tier: 'initiate',
            title: `Initiate of ${category === 'structures' ? 'Structures' : category === 'circuits' ? 'Circuits' : 'Machines'}`,
            description: `Ready to begin first trial.`,
            icon: '📐',
            accentColor: 'var(--fg-muted)',
            completedCount: 0,
            totalCount,
            earnedStars: 0,
            maxStars,
            percent: 0,
            isFullyCompleted: false,
          };
        }
      },

      getOverallStats: () => {
        let totalCompleted = 0;
        let totalLevels = 0;
        let earnedStars = 0;

        (['structures', 'circuits', 'machines'] as EngineeringCategory[]).forEach((cat) => {
          const list = CATEGORY_LEVEL_DEFS[cat];
          totalLevels += list.length;
          for (const lvl of list) {
            if (get().isLevelCompleted(cat, lvl.id)) {
              totalCompleted++;
            }
            earnedStars += get().getLevelStars(cat, lvl.id);
          }
        });

        const maxStars = totalLevels * 3;
        const overallPercent = totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0;
        const allCategoriesMastered = totalLevels > 0 && totalCompleted === totalLevels;

        return {
          totalCompleted,
          totalLevels,
          earnedStars,
          maxStars,
          overallPercent,
          allCategoriesMastered,
        };
      },

      unlockLevel: (category, levelId) => {
        const key = getRecordKey(category, levelId);
        set((state) => {
          const existing = state.records[key];
          return {
            records: {
              ...state.records,
              [key]: {
                id: levelId,
                category,
                unlocked: true,
                completed: existing?.completed ?? false,
                stars: existing?.stars ?? 0,
                bestCost: existing?.bestCost,
                bestTimeSeconds: existing?.bestTimeSeconds,
                completedAt: existing?.completedAt,
              },
            },
          };
        });
      },

      recordLevelCompletion: (category, levelId, stars, cost, timeSeconds) => {
        const key = getRecordKey(category, levelId);
        const list = CATEGORY_LEVEL_DEFS[category] || [];
        const currentIndex = list.findIndex((l) => l.id === levelId);

        set((state) => {
          const existing = state.records[key];
          const bestStars = (existing ? Math.max(existing.stars, stars) : stars) as 0 | 1 | 2 | 3;
          const bestCost = existing?.bestCost ? Math.min(existing.bestCost, cost) : cost;
          const bestTimeSeconds =
            timeSeconds !== undefined && timeSeconds > 0
              ? existing?.bestTimeSeconds
                ? Math.min(existing.bestTimeSeconds, timeSeconds)
                : timeSeconds
              : existing?.bestTimeSeconds;

          const updatedRecords = {
            ...state.records,
            [key]: {
              id: levelId,
              category,
              unlocked: true,
              completed: true,
              stars: bestStars,
              bestCost,
              bestTimeSeconds,
              completedAt: existing?.completedAt ?? new Date().toISOString(),
            },
          };

          // Also unlock the next level in this category sequence if one exists
          if (currentIndex >= 0 && currentIndex < list.length - 1) {
            const nextLevel = list[currentIndex + 1];
            const nextKey = getRecordKey(category, nextLevel.id);
            const nextExisting = updatedRecords[nextKey];
            updatedRecords[nextKey] = {
              id: nextLevel.id,
              category,
              unlocked: true,
              completed: nextExisting?.completed ?? false,
              stars: nextExisting?.stars ?? 0,
              bestCost: nextExisting?.bestCost,
              bestTimeSeconds: nextExisting?.bestTimeSeconds,
              completedAt: nextExisting?.completedAt,
            };
          }

          return { records: updatedRecords };
        });

        // Synchronize with existing domain stores
        switch (category) {
          case 'structures': {
            const store = useGameStore.getState();
            const existing = store.progress[levelId];
            useGameStore.setState({
              progress: {
                ...store.progress,
                [levelId]: {
                  stars: Math.max(existing?.stars ?? 0, stars) as 1 | 2 | 3,
                  bestCost: existing ? Math.min(existing.bestCost, cost) : cost,
                  bestTimeSeconds: timeSeconds ?? existing?.bestTimeSeconds,
                  completedAt: existing?.completedAt ?? new Date().toISOString(),
                },
              },
            });
            break;
          }
          case 'circuits': {
            const store = useCircuitStore.getState();
            const existing = store.progress[levelId];
            useCircuitStore.setState({
              progress: {
                ...store.progress,
                [levelId]: {
                  stars: Math.max(existing?.stars ?? 0, stars) as 1 | 2 | 3,
                  bestCost: existing ? Math.min(existing.bestCost, cost) : cost,
                  bestTimeSeconds: timeSeconds ?? existing?.bestTimeSeconds,
                  completedAt: existing?.completedAt ?? new Date().toISOString(),
                },
              },
            });
            break;
          }
          case 'machines': {
            const store = useVehicleStore.getState();
            const existing = store.progress[levelId];
            useVehicleStore.setState({
              progress: {
                ...store.progress,
                [levelId]: {
                  stars: Math.max(existing?.stars ?? 0, stars) as 1 | 2 | 3,
                  bestCost: existing ? Math.min(existing.bestCost, cost) : cost,
                  bestTimeSeconds: timeSeconds ?? existing?.bestTimeSeconds,
                  completedAt: existing?.completedAt ?? new Date().toISOString(),
                },
              },
            });
            break;
          }
          case 'mechatronics': {
            const store = useMechatronicsStore.getState();
            const existing = store.progress[levelId];
            useMechatronicsStore.setState({
              progress: {
                ...store.progress,
                [levelId]: {
                  stars: Math.max(existing?.stars ?? 0, stars) as 1 | 2 | 3,
                  bestCost: existing?.bestCost !== undefined ? Math.min(existing.bestCost, cost) : cost,
                  bestTimeSeconds: timeSeconds ?? existing?.bestTimeSeconds,
                  completedAt: existing?.completedAt ?? new Date().toISOString(),
                },
              },
            });
            break;
          }
        }
      },

      syncFromLegacyStores: () => {
        const records: Record<string, LevelProgressRecord> = { ...get().records };

        // Sync structures
        const structProgress = useGameStore.getState().progress;
        for (const [id, data] of Object.entries(structProgress)) {
          if (data && data.stars > 0) {
            records[getRecordKey('structures', id)] = {
              id,
              category: 'structures',
              unlocked: true,
              completed: true,
              stars: data.stars,
              bestCost: data.bestCost,
              bestTimeSeconds: data.bestTimeSeconds,
              completedAt: data.completedAt,
            };
          }
        }

        // Sync circuits
        const circuitProgress = useCircuitStore.getState().progress;
        for (const [id, data] of Object.entries(circuitProgress)) {
          if (data && data.stars > 0) {
            records[getRecordKey('circuits', id)] = {
              id,
              category: 'circuits',
              unlocked: true,
              completed: true,
              stars: data.stars,
              bestCost: data.bestCost,
              bestTimeSeconds: data.bestTimeSeconds,
              completedAt: data.completedAt,
            };
          }
        }

        // Sync machines
        const vehicleProgress = useVehicleStore.getState().progress;
        for (const [id, data] of Object.entries(vehicleProgress)) {
          if (data && data.stars > 0) {
            records[getRecordKey('machines', id)] = {
              id,
              category: 'machines',
              unlocked: true,
              completed: true,
              stars: data.stars,
              bestCost: data.bestCost,
              bestTimeSeconds: data.bestTimeSeconds,
              completedAt: data.completedAt,
            };
          }
        }

        // Sync mechatronics
        const mechaProgress = useMechatronicsStore.getState().progress;
        for (const [id, data] of Object.entries(mechaProgress)) {
          if (data && data.stars > 0) {
            records[getRecordKey('mechatronics', id)] = {
              id,
              category: 'mechatronics',
              unlocked: true,
              completed: true,
              stars: data.stars,
              bestCost: data.bestCost,
              bestTimeSeconds: data.bestTimeSeconds,
              completedAt: data.completedAt,
            };
          }
        }

        set({ records });
      },

      resetCategoryProgress: (category) => {
        set((state) => {
          const filtered = Object.fromEntries(
            Object.entries(state.records).filter(([key]) => !key.startsWith(`${category}:`)),
          );
          return { records: filtered };
        });
        switch (category) {
          case 'structures':
            useGameStore.setState({ progress: {} });
            break;
          case 'circuits':
            useCircuitStore.setState({ progress: {} });
            break;
          case 'machines':
            useVehicleStore.setState({ progress: {} });
            break;
        }
      },

      resetAllProgression: () => {
        set({ records: {} });
        useGameStore.setState({ progress: {} });
        useCircuitStore.setState({ progress: {} });
        useVehicleStore.setState({ progress: {} });
      },
    }),
    {
      name: 'engineering-forge-game-progression-v2',
      partialize: (state) => ({ records: state.records }),
    },
  ),
);
