import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analyzeTruss, type MemberResult } from '../physics/truss';
import { getLevel, LEVELS } from '../content/levels';
import { DECK_MATERIAL_ID, scoreAttempt, toTrussModel, totalCost, type BuiltMember, type BuiltNode } from '../game/build';

export interface LevelProgress {
  stars: 1 | 2 | 3;
  bestCost: number;
}

export type TestResult =
  | { status: 'unstable' }
  | {
      status: 'analyzed';
      members: MemberResult[];
      anyFailed: boolean;
      passed: boolean;
      cost: number;
      stars: 0 | 1 | 2 | 3;
    };

interface GameState {
  progress: Record<string, LevelProgress>;
  currentLevelId: string | null;
  builtNodes: BuiltNode[];
  builtMembers: BuiltMember[];
  selectedMaterial: string;
  pendingNodeId: string | null;
  testResult: TestResult | null;
  nextId: number;

  isLevelUnlocked: (levelId: string) => boolean;
  startLevel: (levelId: string) => void;
  addNode: (x: number, y: number) => void;
  removeNode: (nodeId: string) => void;
  addMember: (nodeA: string, nodeB: string) => void;
  removeMember: (memberId: string) => void;
  setSelectedMaterial: (materialId: string) => void;
  setPendingNode: (nodeId: string | null) => void;
  runTest: () => void;
  resetBuild: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      progress: {},
      currentLevelId: null,
      builtNodes: [],
      builtMembers: [],
      selectedMaterial: DECK_MATERIAL_ID,
      pendingNodeId: null,
      testResult: null,
      nextId: 0,

      isLevelUnlocked: (levelId) => {
        const index = LEVELS.findIndex((l) => l.id === levelId);
        if (index <= 0) return true;
        const previous = LEVELS[index - 1];
        return Boolean(get().progress[previous.id]);
      },

      startLevel: (levelId) =>
        set({
          currentLevelId: levelId,
          builtNodes: [],
          builtMembers: [],
          pendingNodeId: null,
          testResult: null,
          selectedMaterial: DECK_MATERIAL_ID,
          nextId: 0,
        }),

      addNode: (x, y) =>
        set((state) => ({
          builtNodes: [...state.builtNodes, { id: `n${state.nextId}`, x, y }],
          nextId: state.nextId + 1,
          testResult: null,
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          builtNodes: state.builtNodes.filter((n) => n.id !== nodeId),
          builtMembers: state.builtMembers.filter(
            (m) => m.nodeA !== nodeId && m.nodeB !== nodeId,
          ),
          pendingNodeId: state.pendingNodeId === nodeId ? null : state.pendingNodeId,
          testResult: null,
        })),

      addMember: (nodeA, nodeB) =>
        set((state) => {
          if (nodeA === nodeB) return state;
          const exists = state.builtMembers.some(
            (m) =>
              (m.nodeA === nodeA && m.nodeB === nodeB) ||
              (m.nodeA === nodeB && m.nodeB === nodeA),
          );
          if (exists) return state;
          return {
            builtMembers: [
              ...state.builtMembers,
              {
                id: `m${state.nextId}`,
                nodeA,
                nodeB,
                materialId: state.selectedMaterial,
              },
            ],
            nextId: state.nextId + 1,
            testResult: null,
          };
        }),

      removeMember: (memberId) =>
        set((state) => ({
          builtMembers: state.builtMembers.filter((m) => m.id !== memberId),
          testResult: null,
        })),

      setSelectedMaterial: (materialId) => set({ selectedMaterial: materialId }),
      setPendingNode: (nodeId) => set({ pendingNodeId: nodeId }),

      runTest: () => {
        const state = get();
        const level = state.currentLevelId ? getLevel(state.currentLevelId) : undefined;
        if (!level) return;

        const model = toTrussModel(level, state.builtNodes, state.builtMembers);
        const analysis = analyzeTruss(model);
        const cost = totalCost(level, state.builtNodes, state.builtMembers);

        if (analysis.status === 'unstable') {
          set({ testResult: { status: 'unstable' } });
          return;
        }

        const scored = scoreAttempt(level, cost, !analysis.anyFailed);
        set({
          testResult: {
            status: 'analyzed',
            members: analysis.members,
            anyFailed: analysis.anyFailed,
            passed: scored.passed,
            cost,
            stars: scored.stars,
          },
        });

        if (scored.passed) {
          set((s) => {
            const existing = s.progress[level.id];
            const stars = scored.stars as 1 | 2 | 3;
            if (existing && existing.bestCost <= cost) return s;
            return {
              progress: {
                ...s.progress,
                [level.id]: { stars, bestCost: cost },
              },
            };
          });
        }
      },

      resetBuild: () =>
        set({ builtNodes: [], builtMembers: [], pendingNodeId: null, testResult: null, nextId: 0 }),
    }),
    {
      name: 'engineering-forge-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
