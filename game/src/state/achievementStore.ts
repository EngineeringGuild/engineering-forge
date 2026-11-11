import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundFx } from '../audio/soundFx';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'structures' | 'circuits' | 'machines' | 'mechatronics' | 'general';
  points: number;
}

export interface UnlockedAchievementRecord {
  id: string;
  unlockedAt: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_bridge',
    title: 'First Bridge Built',
    description: 'Construct and physically verify your first structural truss bridge.',
    icon: '🌉',
    category: 'structures',
    points: 100,
  },
  {
    id: 'master_builder',
    title: 'Master Truss Builder',
    description: 'Successfully complete all structural engineering bridge challenges.',
    icon: '🏗️',
    category: 'structures',
    points: 500,
  },
  {
    id: 'first_spark',
    title: 'First Spark',
    description: 'Wire a functional closed DC resistive circuit without open-circuits.',
    icon: '⚡',
    category: 'circuits',
    points: 100,
  },
  {
    id: 'master_electrician',
    title: 'Master Electrician',
    description: 'Complete all electrical circuit levels according to Kirchhoff & Ohm laws.',
    icon: '💡',
    category: 'circuits',
    points: 500,
  },
  {
    id: 'first_drive',
    title: 'Speed Demon',
    description: 'Spec an engine and chassis that reaches the target terminal velocity.',
    icon: '🏎️',
    category: 'machines',
    points: 100,
  },
  {
    id: 'master_machinist',
    title: 'Formula Engineer',
    description: 'Optimize Newton kinematic acceleration across all vehicle proving grounds.',
    icon: '⚙️',
    category: 'machines',
    points: 500,
  },
  {
    id: 'mechatronics_maestro',
    title: 'Systems Architect',
    description: 'Solve your first coupled electromechanical and logic interlock challenge.',
    icon: '🤖',
    category: 'mechatronics',
    points: 300,
  },
  {
    id: 'budget_maestro',
    title: 'Budget Maestro',
    description: 'Clear any level with at least 30% of your capital budget remaining.',
    icon: '💰',
    category: 'general',
    points: 250,
  },
  {
    id: 'sub_second_solver',
    title: 'Sub-Second Solver',
    description: 'Achieve simulation transit clearance in under 3.0 seconds.',
    icon: '⏱️',
    category: 'general',
    points: 200,
  },
  {
    id: 'stress_whisperer',
    title: 'Stress Whisperer',
    description: 'Maintain peak member stress between 85% and 99% of yield without fracture.',
    icon: '🎯',
    category: 'structures',
    points: 350,
  },
  {
    id: 'hardcore_engineer',
    title: 'Hardcore Engineer',
    description: 'Complete any level under Hardcore difficulty (1.15x gravity, -15% stress limit).',
    icon: '🔥',
    category: 'general',
    points: 400,
  },
  {
    id: 'laboratory_scholar',
    title: 'Laboratory Scholar',
    description: 'Visit the Tinkerer Workshop & Continuum Test Bench in the Lab.',
    icon: '🔬',
    category: 'general',
    points: 150,
  },
];

export interface AchievementState {
  unlocked: Record<string, UnlockedAchievementRecord>;
  recentUnlocked: AchievementDef | null;
  unlockAchievement: (id: string) => boolean; // returns true if newly unlocked
  isUnlocked: (id: string) => boolean;
  clearRecentBanner: () => void;
  getTotalPoints: () => number;
  resetAchievements: () => void;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      recentUnlocked: null,

      unlockAchievement: (id: string) => {
        const state = get();
        if (state.unlocked[id]) return false;

        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return false;

        soundFx.playVictory(3);

        set((prev) => ({
          unlocked: {
            ...prev.unlocked,
            [id]: {
              id,
              unlockedAt: new Date().toISOString(),
            },
          },
          recentUnlocked: def,
        }));

        return true;
      },

      isUnlocked: (id: string) => {
        return !!get().unlocked[id];
      },

      clearRecentBanner: () => {
        set({ recentUnlocked: null });
      },

      getTotalPoints: () => {
        const unlockedMap = get().unlocked;
        return ACHIEVEMENTS.reduce((sum, a) => {
          return unlockedMap[a.id] ? sum + a.points : sum;
        }, 0);
      },

      resetAchievements: () => {
        set({ unlocked: {}, recentUnlocked: null });
      },
    }),
    {
      name: 'engineering-forge-achievements',
      partialize: (state) => ({ unlocked: state.unlocked }),
    },
  ),
);
