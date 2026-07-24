import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getVehicleLevel, VEHICLE_LEVELS } from '../content/vehicleLevels';
import { runVehicleTest } from '../game/vehicleBuild';
import type { VehicleAnalysis } from '../physics/vehicle';

export interface VehicleLevelProgress {
  stars: 1 | 2 | 3;
  bestCost: number;
}

export interface VehicleTestResult {
  analysis: VehicleAnalysis;
  cost: number;
  passed: boolean;
  stars: 0 | 1 | 2 | 3;
}

interface VehicleState {
  progress: Record<string, VehicleLevelProgress>;
  currentLevelId: string | null;
  selectedEngine: string;
  selectedChassis: string;
  testResult: VehicleTestResult | null;

  isLevelUnlocked: (levelId: string) => boolean;
  startLevel: (levelId: string) => void;
  setSelectedEngine: (engineId: string) => void;
  setSelectedChassis: (chassisId: string) => void;
  runTest: () => void;
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

      setSelectedEngine: (engineId) => set({ selectedEngine: engineId, testResult: null }),
      setSelectedChassis: (chassisId) => set({ selectedChassis: chassisId, testResult: null }),

      runTest: () => {
        const state = get();
        const level = state.currentLevelId ? getVehicleLevel(state.currentLevelId) : undefined;
        if (!level) return;

        const { analysis, cost, score } = runVehicleTest(
          level,
          state.selectedEngine,
          state.selectedChassis,
        );

        set({
          testResult: { analysis, cost, passed: score.passed, stars: score.stars },
        });

        if (score.passed) {
          set((s) => {
            const existing = s.progress[level.id];
            const stars = score.stars as 1 | 2 | 3;
            if (existing && existing.bestCost <= cost) return s;
            return { progress: { ...s.progress, [level.id]: { stars, bestCost: cost } } };
          });
        }
      },

      resetBuild: () => set({ testResult: null }),
    }),
    {
      name: 'engineering-forge-vehicles-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
