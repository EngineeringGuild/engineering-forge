import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getVehicleLevel, VEHICLE_LEVELS } from '../content/vehicleLevels';
import { runVehicleTest } from '../game/vehicleBuild';
import type { VehicleAnalysis } from '../physics/vehicle';
import type { StarRatingResult } from '../game/starRating';

export interface VehicleLevelProgress {
  stars: 1 | 2 | 3;
  bestCost: number;
  bestTimeSeconds?: number;
  completedAt?: string;
}

export interface VehicleTestResult {
  analysis: VehicleAnalysis;
  cost: number;
  passed: boolean;
  stars: 0 | 1 | 2 | 3;
  ratingDetails?: StarRatingResult;
}

interface VehicleState {
  progress: Record<string, VehicleLevelProgress>;
  currentLevelId: string | null;
  selectedEngine: string;
  selectedChassis: string;
  testResult: VehicleTestResult | null;

  isLevelUnlocked: (levelId: string) => boolean;
  startLevel: (levelId: string) => void;
  restoreBuild: (engineId: string, chassisId: string) => void;
  setSelectedEngine: (engineId: string) => void;
  setSelectedChassis: (chassisId: string) => void;
  runTest: (solveTimeSeconds?: number) => void;
  clearTestResult: () => void;
  resetBuild: () => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      progress: {},
      currentLevelId: null,
      selectedEngine: 'engine-small',
      selectedChassis: 'chassis-light',
      testResult: null,

      isLevelUnlocked: (levelId) => {
        const index = VEHICLE_LEVELS.findIndex((l) => l.id === levelId);
        if (index <= 0) return true;
        const previous = VEHICLE_LEVELS[index - 1];
        return Boolean(get().progress[previous.id]);
      },

      startLevel: (levelId) =>
        set({
          currentLevelId: levelId,
          selectedEngine: 'engine-small',
          selectedChassis: 'chassis-light',
          testResult: null,
        }),

      restoreBuild: (engineId, chassisId) =>
        set({
          selectedEngine: engineId,
          selectedChassis: chassisId,
          testResult: null,
        }),

      setSelectedEngine: (engineId) => set({ selectedEngine: engineId, testResult: null }),
      setSelectedChassis: (chassisId) => set({ selectedChassis: chassisId, testResult: null }),

      runTest: (solveTimeSeconds) => {
        const state = get();
        const level = state.currentLevelId ? getVehicleLevel(state.currentLevelId) : undefined;
        if (!level) return;

        const { analysis, cost, score } = runVehicleTest(
          level,
          state.selectedEngine,
          state.selectedChassis,
          solveTimeSeconds ?? 0,
        );

        set({
          testResult: {
            analysis,
            cost,
            passed: score.passed,
            stars: score.stars,
            ratingDetails: score.ratingDetails,
          },
        });

        if (score.passed) {
          set((s) => {
            const existing = s.progress[level.id];
            const newStars = Math.max(existing?.stars ?? 0, score.stars) as 1 | 2 | 3;
            const bestCost = existing ? Math.min(existing.bestCost, cost) : cost;
            const bestTime =
              solveTimeSeconds !== undefined && solveTimeSeconds > 0
                ? existing?.bestTimeSeconds
                  ? Math.min(existing.bestTimeSeconds, solveTimeSeconds)
                  : solveTimeSeconds
                : existing?.bestTimeSeconds;

            return {
              progress: {
                ...s.progress,
                [level.id]: {
                  stars: newStars,
                  bestCost,
                  bestTimeSeconds: bestTime,
                  completedAt: existing?.completedAt ?? new Date().toISOString(),
                },
              },
            };
          });
        }
      },

      clearTestResult: () => set({ testResult: null }),
      resetBuild: () => set({ testResult: null }),
    }),
    {
      name: 'engineering-forge-vehicles-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
