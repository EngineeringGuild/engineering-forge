import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analyzeTruss, type MemberResult } from '../physics/truss';
import { getLevel, LEVELS } from '../content/levels';
import { DECK_MATERIAL_ID, scoreAttempt, toTrussModel, totalCost, type BuiltMember, type BuiltNode } from '../game/build';
import type { StarRatingResult } from '../game/starRating';

export interface LevelProgress {
  stars: 1 | 2 | 3;
  bestCost: number;
  bestTimeSeconds?: number;
  completedAt?: string;
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
      ratingDetails?: StarRatingResult;
    };

export interface BuildSnapshot {
  builtNodes: BuiltNode[];
  builtMembers: BuiltMember[];
  nextId: number;
  selectedMaterial: string;
}

const MAX_HISTORY = 40;

interface GameState {
  progress: Record<string, LevelProgress>;
  currentLevelId: string | null;
  builtNodes: BuiltNode[];
  builtMembers: BuiltMember[];
  selectedMaterial: string;
  pendingNodeId: string | null;
  testResult: TestResult | null;
  nextId: number;
  undoStack: BuildSnapshot[];
  redoStack: BuildSnapshot[];

  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => boolean;
  redo: () => boolean;
  isLevelUnlocked: (levelId: string) => boolean;
  startLevel: (levelId: string) => void;
  restoreBuild: (
    nodes: BuiltNode[],
    members: BuiltMember[],
    nextId?: number,
    selectedMaterial?: string,
  ) => void;
  addNode: (x: number, y: number) => void;
  removeNode: (nodeId: string) => void;
  addMember: (nodeA: string, nodeB: string) => void;
  removeMember: (memberId: string) => void;
  setSelectedMaterial: (materialId: string) => void;
  setPendingNode: (nodeId: string | null) => void;
  runTest: (solveTimeSeconds?: number) => void;
  clearTestResult: () => void;
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
      undoStack: [],
      redoStack: [],

      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return false;
        const previous = state.undoStack[state.undoStack.length - 1];
        const newUndoStack = state.undoStack.slice(0, -1);
        const currentSnapshot: BuildSnapshot = {
          builtNodes: state.builtNodes,
          builtMembers: state.builtMembers,
          nextId: state.nextId,
          selectedMaterial: state.selectedMaterial,
        };
        const newRedoStack = [currentSnapshot, ...state.redoStack];
        set({
          builtNodes: previous.builtNodes,
          builtMembers: previous.builtMembers,
          nextId: previous.nextId,
          selectedMaterial: previous.selectedMaterial,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          pendingNodeId: null,
          testResult: null,
        });
        return true;
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return false;
        const next = state.redoStack[0];
        const newRedoStack = state.redoStack.slice(1);
        const currentSnapshot: BuildSnapshot = {
          builtNodes: state.builtNodes,
          builtMembers: state.builtMembers,
          nextId: state.nextId,
          selectedMaterial: state.selectedMaterial,
        };
        const newUndoStack = [...state.undoStack, currentSnapshot];
        if (newUndoStack.length > MAX_HISTORY) {
          newUndoStack.shift();
        }
        set({
          builtNodes: next.builtNodes,
          builtMembers: next.builtMembers,
          nextId: next.nextId,
          selectedMaterial: next.selectedMaterial,
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          pendingNodeId: null,
          testResult: null,
        });
        return true;
      },

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
          undoStack: [],
          redoStack: [],
        }),

      restoreBuild: (nodes, members, nextId, selectedMaterial) => {
        const computedNextId =
          nextId !== undefined
            ? nextId
            : Math.max(
                ...nodes.map((n) => parseInt(n.id.replace(/\D/g, ''), 10) || 0),
                ...members.map((m) => parseInt(m.id.replace(/\D/g, ''), 10) || 0),
                0,
              ) + 1;
        set({
          builtNodes: nodes,
          builtMembers: members,
          nextId: computedNextId,
          selectedMaterial: selectedMaterial ?? DECK_MATERIAL_ID,
          pendingNodeId: null,
          testResult: null,
          undoStack: [],
          redoStack: [],
        });
      },

      addNode: (x, y) =>
        set((state) => {
          const snapshot: BuildSnapshot = {
            builtNodes: state.builtNodes,
            builtMembers: state.builtMembers,
            nextId: state.nextId,
            selectedMaterial: state.selectedMaterial,
          };
          const newUndo = [...state.undoStack, snapshot];
          if (newUndo.length > MAX_HISTORY) newUndo.shift();
          return {
            undoStack: newUndo,
            redoStack: [],
            builtNodes: [...state.builtNodes, { id: `n${state.nextId}`, x, y }],
            nextId: state.nextId + 1,
            testResult: null,
          };
        }),

      removeNode: (nodeId) =>
        set((state) => {
          const snapshot: BuildSnapshot = {
            builtNodes: state.builtNodes,
            builtMembers: state.builtMembers,
            nextId: state.nextId,
            selectedMaterial: state.selectedMaterial,
          };
          const newUndo = [...state.undoStack, snapshot];
          if (newUndo.length > MAX_HISTORY) newUndo.shift();
          return {
            undoStack: newUndo,
            redoStack: [],
            builtNodes: state.builtNodes.filter((n) => n.id !== nodeId),
            builtMembers: state.builtMembers.filter(
              (m) => m.nodeA !== nodeId && m.nodeB !== nodeId,
            ),
            pendingNodeId: state.pendingNodeId === nodeId ? null : state.pendingNodeId,
            testResult: null,
          };
        }),

      addMember: (nodeA, nodeB) =>
        set((state) => {
          if (nodeA === nodeB) return state;
          const exists = state.builtMembers.some(
            (m) =>
              (m.nodeA === nodeA && m.nodeB === nodeB) ||
              (m.nodeA === nodeB && m.nodeB === nodeA),
          );
          if (exists) return state;
          const snapshot: BuildSnapshot = {
            builtNodes: state.builtNodes,
            builtMembers: state.builtMembers,
            nextId: state.nextId,
            selectedMaterial: state.selectedMaterial,
          };
          const newUndo = [...state.undoStack, snapshot];
          if (newUndo.length > MAX_HISTORY) newUndo.shift();
          return {
            undoStack: newUndo,
            redoStack: [],
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
        set((state) => {
          const snapshot: BuildSnapshot = {
            builtNodes: state.builtNodes,
            builtMembers: state.builtMembers,
            nextId: state.nextId,
            selectedMaterial: state.selectedMaterial,
          };
          const newUndo = [...state.undoStack, snapshot];
          if (newUndo.length > MAX_HISTORY) newUndo.shift();
          return {
            undoStack: newUndo,
            redoStack: [],
            builtMembers: state.builtMembers.filter((m) => m.id !== memberId),
            testResult: null,
          };
        }),

      setSelectedMaterial: (materialId) => set({ selectedMaterial: materialId }),
      setPendingNode: (nodeId) => set({ pendingNodeId: nodeId }),

      runTest: (solveTimeSeconds) => {
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

        const scored = scoreAttempt(level, cost, !analysis.anyFailed, solveTimeSeconds ?? 0);
        set({
          testResult: {
            status: 'analyzed',
            members: analysis.members,
            anyFailed: analysis.anyFailed,
            passed: scored.passed,
            cost,
            stars: scored.stars,
            ratingDetails: scored.ratingDetails,
          },
        });

        if (scored.passed) {
          set((s) => {
            const existing = s.progress[level.id];
            const newStars = Math.max(existing?.stars ?? 0, scored.stars) as 1 | 2 | 3;
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

      resetBuild: () =>
        set((state) => {
          if (state.builtNodes.length === 0 && state.builtMembers.length === 0) {
            return { pendingNodeId: null, testResult: null };
          }
          const snapshot: BuildSnapshot = {
            builtNodes: state.builtNodes,
            builtMembers: state.builtMembers,
            nextId: state.nextId,
            selectedMaterial: state.selectedMaterial,
          };
          const newUndo = [...state.undoStack, snapshot];
          if (newUndo.length > MAX_HISTORY) newUndo.shift();
          return {
            undoStack: newUndo,
            redoStack: [],
            builtNodes: [],
            builtMembers: [],
            pendingNodeId: null,
            testResult: null,
            nextId: 0,
          };
        }),
    }),
    {
      name: 'engineering-forge-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
