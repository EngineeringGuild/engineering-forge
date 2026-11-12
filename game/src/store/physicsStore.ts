/**
 * Engineering Forge - Physics Simulation State Management Store
 * Manages game simulation parameters: gravity vector, time step interval,
 * playback speed multipliers, and pause/play status across levels.
 */

import { create } from 'zustand';

export interface PhysicsSimulationState {
  // Core Simulation Parameters
  gravity: number; // m/s², default 9.81
  timeStep: number; // fixed physics delta time in seconds, default 1/60 (0.01667)
  timeScale: 0.25 | 0.5 | 1 | 2; // Simulation speed multiplier
  isPaused: boolean;
  isSimulating: boolean;
  currentStepIndex: number;

  // Actions
  setGravity: (gravity: number) => void;
  setTimeStep: (timeStep: number) => void;
  setTimeScale: (scale: 0.25 | 0.5 | 1 | 2) => void;
  togglePause: () => void;
  setPaused: (isPaused: boolean) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  stepSimulationOnce: () => void;
  resetSimulationState: () => void;
}

export const usePhysicsStore = create<PhysicsSimulationState>((set) => ({
  gravity: 9.81,
  timeStep: 1 / 60,
  timeScale: 1,
  isPaused: false,
  isSimulating: false,
  currentStepIndex: 0,

  setGravity: (gravity) => set({ gravity }),
  setTimeStep: (timeStep) => set({ timeStep: Math.max(0.001, Math.min(0.1, timeStep)) }),
  setTimeScale: (timeScale) => set({ timeScale }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPaused: (isPaused) => set({ isPaused }),
  startSimulation: () => set({ isSimulating: true, isPaused: false }),
  stopSimulation: () => set({ isSimulating: false, isPaused: false, currentStepIndex: 0 }),
  stepSimulationOnce: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
  resetSimulationState: () =>
    set({
      gravity: 9.81,
      timeStep: 1 / 60,
      timeScale: 1,
      isPaused: false,
      isSimulating: false,
      currentStepIndex: 0,
    }),
}));
