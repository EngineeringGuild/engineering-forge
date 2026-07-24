import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { analyzeCircuit, type EdgeResult } from '../physics/circuit';
import { CIRCUIT_LEVELS, getCircuitLevel } from '../content/circuitLevels';
import {
  scoreCircuitAttempt,
  toCircuitModel,
  totalCircuitCost,
  type BuiltEdge,
} from '../game/circuitBuild';
import type { BuiltNode } from '../game/build';

export interface CircuitLevelProgress {
  stars: 1 | 2 | 3;
  bestCost: number;
}

export type CircuitTestResult =
  | { status: 'open' }
  | {
      status: 'analyzed';
      edges: EdgeResult[];
      anyBurnedOut: boolean;
      anyUnderpowered: boolean;
      passed: boolean;
      cost: number;
      stars: 0 | 1 | 2 | 3;
    };

const DEFAULT_MATERIAL = 'wire';

interface CircuitState {
  progress: Record<string, CircuitLevelProgress>;
  currentLevelId: string | null;
  builtNodes: BuiltNode[];
  builtEdges: BuiltEdge[];
  selectedMaterial: string;
  pendingNodeId: string | null;
  testResult: CircuitTestResult | null;
  nextId: number;

  isLevelUnlocked: (levelId: string) => boolean;
  startLevel: (levelId: string) => void;
  addNode: (x: number, y: number) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (nodeA: string, nodeB: string) => void;
  removeEdge: (edgeId: string) => void;
  setSelectedMaterial: (materialId: string) => void;
  setPendingNode: (nodeId: string | null) => void;
  runTest: () => void;
  resetBuild: () => void;
}

export const useCircuitStore = create<CircuitState>()(
  persist(
    (set, get) => ({
      progress: {},
      currentLevelId: null,
      builtNodes: [],
      builtEdges: [],
      selectedMaterial: DEFAULT_MATERIAL,
      pendingNodeId: null,
      testResult: null,
      nextId: 0,

      isLevelUnlocked: (levelId) => {
        const index = CIRCUIT_LEVELS.findIndex((l) => l.id === levelId);
        if (index <= 0) return true;
        const previous = CIRCUIT_LEVELS[index - 1];
        return Boolean(get().progress[previous.id]);
      },

      startLevel: (levelId) =>
        set({
          currentLevelId: levelId,
          builtNodes: [],
          builtEdges: [],
          pendingNodeId: null,
          testResult: null,
          selectedMaterial: DEFAULT_MATERIAL,
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
          builtEdges: state.builtEdges.filter(
            (e) => e.nodeA !== nodeId && e.nodeB !== nodeId,
          ),
          pendingNodeId: state.pendingNodeId === nodeId ? null : state.pendingNodeId,
          testResult: null,
        })),

      addEdge: (nodeA, nodeB) =>
        set((state) => {
          if (nodeA === nodeB) return state;
          const exists = state.builtEdges.some(
            (e) =>
              (e.nodeA === nodeA && e.nodeB === nodeB) ||
              (e.nodeA === nodeB && e.nodeB === nodeA),
          );
          if (exists) return state;
          return {
            builtEdges: [
              ...state.builtEdges,
              { id: `e${state.nextId}`, nodeA, nodeB, componentId: state.selectedMaterial },
            ],
            nextId: state.nextId + 1,
            testResult: null,
          };
        }),

      removeEdge: (edgeId) =>
        set((state) => ({
          builtEdges: state.builtEdges.filter((e) => e.id !== edgeId),
          testResult: null,
        })),

      setSelectedMaterial: (materialId) => set({ selectedMaterial: materialId }),
      setPendingNode: (nodeId) => set({ pendingNodeId: nodeId }),

      runTest: () => {
        const state = get();
        const level = state.currentLevelId ? getCircuitLevel(state.currentLevelId) : undefined;
        if (!level) return;

        const model = toCircuitModel(level, state.builtNodes, state.builtEdges);
        const analysis = analyzeCircuit(model);
        const cost = totalCircuitCost(level, state.builtNodes, state.builtEdges);

        if (analysis.status === 'open') {
          set({ testResult: { status: 'open' } });
          return;
        }

        const anyUnderpowered = analysis.edges.some((e) => e.underpowered);
        const scored = scoreCircuitAttempt(
          level,
          cost,
          !analysis.anyBurnedOut && !anyUnderpowered,
        );

        set({
          testResult: {
            status: 'analyzed',
            edges: analysis.edges,
            anyBurnedOut: analysis.anyBurnedOut,
            anyUnderpowered,
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
              progress: { ...s.progress, [level.id]: { stars, bestCost: cost } },
            };
          });
        }
      },

      resetBuild: () =>
        set({ builtNodes: [], builtEdges: [], pendingNodeId: null, testResult: null, nextId: 0 }),
    }),
    {
      name: 'engineering-forge-circuits-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
