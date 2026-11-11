import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MECHATRONICS_LEVELS, WINCHES } from '../content/mechatronicsLevels';
import {
  stepMechatronicSimulation,
  evaluateLogicNetwork,
  type LogicGate,
  type LogicSignalMap,
} from '../physics/mechatronics';
import { soundFx } from '../audio/soundFx';

export interface MechatronicsLevelProgress {
  stars: 0 | 1 | 2 | 3;
  bestCost?: number;
  bestTimeSeconds?: number;
  completedAt?: string;
}

export interface MechatronicsState {
  currentLevelId: string;
  selectedWinchId: string;
  counterweightAdjustmentKg: number;
  limitCutoffAngleDeg: number;
  voltageSupplyV: number;
  userLogicGates: LogicGate[];
  inputSignals: LogicSignalMap;

  // Simulation state
  isSimulating: boolean;
  timeScale: number;
  simulationTimeSec: number;
  currentAngleDeg: number;
  angularVelocityRadPerSec: number;
  motorCurrentA: number;
  winchTensionKn: number;
  limitSwitchTripped: boolean;
  relayClosed: boolean;
  isCableSnapped: boolean;
  isStalled: boolean;
  isSolved: boolean;
  earnedStars: 0 | 1 | 2 | 3;

  // Progress store
  progress: Record<string, MechatronicsLevelProgress>;

  // Actions
  setLevel: (levelId: string) => void;
  setSelectedWinch: (winchId: string) => void;
  setCounterweightAdjustment: (deltaKg: number) => void;
  setLimitCutoffAngle: (angleDeg: number) => void;
  setVoltageSupply: (voltageV: number) => void;
  setTimeScale: (scale: number) => void;
  toggleInputSignal: (signalId: string) => void;
  addLogicGate: (gate: LogicGate) => void;
  removeLogicGate: (gateId: string) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  stepSimulationTick: (dt: number) => void;
  isLevelUnlocked: (levelId: string) => boolean;
}

export const useMechatronicsStore = create<MechatronicsState>()(
  persist(
    (set, get) => ({
      currentLevelId: 'mechatronics-1',
      selectedWinchId: 'winch-heavy',
      counterweightAdjustmentKg: 0,
      limitCutoffAngleDeg: 46,
      voltageSupplyV: 24,
      userLogicGates: [],
      inputSignals: {
        deck_locked: true,
        ship_cleared: true,
        estop_pressed: false,
      },

      isSimulating: false,
      timeScale: 1.0,
      simulationTimeSec: 0,
      currentAngleDeg: 0,
      angularVelocityRadPerSec: 0,
      motorCurrentA: 0,
      winchTensionKn: 0,
      limitSwitchTripped: false,
      relayClosed: false,
      isCableSnapped: false,
      isStalled: false,
      isSolved: false,
      earnedStars: 0,

      progress: {},

      setLevel: (levelId) => {
        const lvl = MECHATRONICS_LEVELS.find((l) => l.id === levelId) ?? MECHATRONICS_LEVELS[0];
        const defaultWinch = lvl.availableWinches[0]?.id ?? 'winch-heavy';

        // Setup default gates if level 3
        const initialGates: LogicGate[] =
          levelId === 'mechatronics-3'
            ? [
                { id: 'g_not', type: 'NOT', inputA: 'estop_pressed', output: 'estop_ok' },
                { id: 'g_and1', type: 'AND', inputA: 'deck_locked', inputB: 'ship_cleared', output: 'clear_ok' },
                { id: 'g_and2', type: 'AND', inputA: 'clear_ok', inputB: 'estop_ok', output: 'traffic_gate_enable' },
              ]
            : [];

        set({
          currentLevelId: levelId,
          selectedWinchId: defaultWinch,
          counterweightAdjustmentKg: 0,
          limitCutoffAngleDeg: lvl.targetClearanceAngleDeg + 2,
          voltageSupplyV: WINCHES[defaultWinch]?.ratedVoltage ?? 24,
          userLogicGates: initialGates,
          isSimulating: false,
          simulationTimeSec: 0,
          currentAngleDeg: 0,
          angularVelocityRadPerSec: 0,
          motorCurrentA: 0,
          winchTensionKn: 0,
          limitSwitchTripped: false,
          relayClosed: false,
          isCableSnapped: false,
          isStalled: false,
          isSolved: false,
          earnedStars: 0,
        });
      },

      setSelectedWinch: (winchId) => {
        const w = WINCHES[winchId];
        set({
          selectedWinchId: winchId,
          voltageSupplyV: w ? w.ratedVoltage : 24,
        });
      },

      setCounterweightAdjustment: (deltaKg) => {
        set({ counterweightAdjustmentKg: deltaKg });
      },

      setLimitCutoffAngle: (angleDeg) => {
        set({ limitCutoffAngleDeg: angleDeg });
      },

      setVoltageSupply: (voltageV) => {
        set({ voltageSupplyV: voltageV });
      },

      setTimeScale: (scale) => {
        set({ timeScale: scale });
      },

      toggleInputSignal: (signalId) => {
        set((state) => ({
          inputSignals: {
            ...state.inputSignals,
            [signalId]: !state.inputSignals[signalId],
          },
        }));
      },

      addLogicGate: (gate) => {
        set((state) => ({
          userLogicGates: [...state.userLogicGates.filter((g) => g.id !== gate.id), gate],
        }));
      },

      removeLogicGate: (gateId) => {
        set((state) => ({
          userLogicGates: state.userLogicGates.filter((g) => g.id !== gateId),
        }));
      },

      startSimulation: () => {
        soundFx.playMotorHum(1.0);
        soundFx.playRelayClick();
        set({
          isSimulating: true,
          isSolved: false,
          earnedStars: 0,
          isCableSnapped: false,
          isStalled: false,
          relayClosed: true,
        });
      },

      stopSimulation: () => {
        set({ isSimulating: false, relayClosed: false });
      },

      resetSimulation: () => {
        set({
          isSimulating: false,
          simulationTimeSec: 0,
          currentAngleDeg: 0,
          angularVelocityRadPerSec: 0,
          motorCurrentA: 0,
          winchTensionKn: 0,
          limitSwitchTripped: false,
          relayClosed: false,
          isCableSnapped: false,
          isStalled: false,
          isSolved: false,
          earnedStars: 0,
        });
      },

      stepSimulationTick: (dt) => {
        const state = get();
        if (!state.isSimulating) return;

        const lvl = MECHATRONICS_LEVELS.find((l) => l.id === state.currentLevelId) ?? MECHATRONICS_LEVELS[0];
        const winch = WINCHES[state.selectedWinchId] ?? WINCHES['winch-heavy'];

        // Logic check for Level 3
        if (lvl.requiredLogicInterlock) {
          const evalMap = evaluateLogicNetwork(state.userLogicGates, state.inputSignals);
          const out = evalMap[lvl.requiredLogicInterlock.targetOutput] ?? false;
          if (out === lvl.requiredLogicInterlock.expectedState) {
            soundFx.playVictory(3);
            set({
              isSimulating: false,
              isSolved: true,
              earnedStars: 3,
              progress: {
                ...state.progress,
                [lvl.id]: {
                  stars: 3,
                  completedAt: new Date().toISOString(),
                },
              },
            });
          }
          return;
        }

        // Stepped kinematic deck
        const adjustedDeck = {
          ...lvl.deck,
          counterweightKg: lvl.deck.counterweightKg + state.counterweightAdjustmentKg,
        };

        const next = stepMechatronicSimulation(
          adjustedDeck,
          winch,
          state.currentAngleDeg,
          state.angularVelocityRadPerSec,
          state.voltageSupplyV,
          state.relayClosed,
          state.limitCutoffAngleDeg,
          dt * state.timeScale,
        );

        if (next.limitSwitchTripped && !state.limitSwitchTripped) {
          soundFx.playLimitSwitchPing();
        }

        if (next.isCableSnapped) {
          soundFx.playStructuralSnap();
          set({
            isSimulating: false,
            isCableSnapped: true,
            winchTensionKn: next.winchTensionKn,
            motorCurrentA: 0,
            relayClosed: false,
          });
          return;
        }

        const newTime = state.simulationTimeSec + dt * state.timeScale;

        // Check victory
        if (
          next.isTargetAngleReached &&
          !next.isCableSnapped &&
          next.winchTensionKn <= lvl.maxAllowableTensionKn &&
          next.motorCurrentA <= lvl.maxAllowableCurrentA
        ) {
          const stars: 0 | 1 | 2 | 3 = newTime <= 6 ? 3 : newTime <= 10 ? 2 : 1;
          soundFx.playVictory(stars);

          set({
            isSimulating: false,
            isSolved: true,
            earnedStars: stars,
            currentAngleDeg: next.bridgeAngleDeg,
            angularVelocityRadPerSec: next.angularVelocityRadPerSec,
            motorCurrentA: next.motorCurrentA,
            winchTensionKn: next.winchTensionKn,
            limitSwitchTripped: next.limitSwitchTripped,
            relayClosed: next.relayClosed,
            simulationTimeSec: newTime,
            progress: {
              ...state.progress,
              [lvl.id]: {
                stars,
                bestTimeSeconds: newTime,
                completedAt: new Date().toISOString(),
              },
            },
          });
          return;
        }

        set({
          simulationTimeSec: newTime,
          currentAngleDeg: next.bridgeAngleDeg,
          angularVelocityRadPerSec: next.angularVelocityRadPerSec,
          motorCurrentA: next.motorCurrentA,
          winchTensionKn: next.winchTensionKn,
          limitSwitchTripped: next.limitSwitchTripped,
          relayClosed: next.relayClosed,
          isStalled: next.isStalled,
        });
      },

      isLevelUnlocked: (levelId) => {
        const index = MECHATRONICS_LEVELS.findIndex((l) => l.id === levelId);
        if (index <= 0) return true;
        const prevLevel = MECHATRONICS_LEVELS[index - 1];
        if (!prevLevel) return true;
        const prevProgress = get().progress[prevLevel.id];
        return (prevProgress?.stars ?? 0) > 0;
      },
    }),
    {
      name: 'engineering-forge-mechatronics-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
);
