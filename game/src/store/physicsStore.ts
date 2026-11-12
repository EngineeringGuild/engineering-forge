/**
 * Engineering Forge - Physics Simulation State Management Store
 * Manages game simulation parameters: gravity vector, time step interval,
 * playback speed multipliers, pause/play status, and collision boundary visualization.
 */

import { create } from 'zustand';
import type { PhysicsSimulationEvent } from '../components/molecules/simulationConsoleTypes';
import { SAMPLE_PHYSICS_EVENTS } from '../components/molecules/simulationConsoleTypes';

export interface PhysicsSimulationState {
  // Core Simulation Parameters
  gravity: number; // m/s², default 9.81
  timeStep: number; // fixed physics delta time in seconds, default 1/60 (0.01667)
  timeScale: 0.25 | 0.5 | 1 | 2; // Simulation speed multiplier
  isPaused: boolean;
  isSimulating: boolean;
  currentStepIndex: number;
  showCollisions: boolean; // Flag to toggle collision boundary visualization

  // Physics Telemetry & Event Logging
  events: PhysicsSimulationEvent[];

  // Actions
  setGravity: (gravity: number) => void;
  setTimeStep: (timeStep: number) => void;
  setTimeScale: (scale: 0.25 | 0.5 | 1 | 2) => void;
  togglePause: () => void;
  setPaused: (isPaused: boolean) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  stepSimulationOnce: () => void;
  setShowCollisions: (show: boolean) => void;
  toggleShowCollisions: () => void;
  addSimulationEvent: (
    event: Omit<PhysicsSimulationEvent, 'id' | 'timestamp'> & {
      id?: string;
      timestamp?: string | number;
    }
  ) => void;
  clearSimulationEvents: () => void;
  resetSimulationState: () => void;
}

const MAX_EVENT_BUFFER = 100;

function formatStepTimestamp(stepIndex: number, stepDt: number): string {
  const elapsed = Math.max(0, stepIndex * stepDt);
  const minutes = Math.floor(elapsed / 60);
  const seconds = (elapsed % 60).toFixed(2);
  return `${String(minutes).padStart(2, '0')}:${seconds.padStart(5, '0')}`;
}

export const usePhysicsStore = create<PhysicsSimulationState>((set) => ({
  gravity: 9.81,
  timeStep: 1 / 60,
  timeScale: 1,
  isPaused: false,
  isSimulating: false,
  currentStepIndex: 0,
  showCollisions: false,
  events: [...SAMPLE_PHYSICS_EVENTS],

  setGravity: (gravity) => set({ gravity }),
  setTimeStep: (timeStep) => set({ timeStep: Math.max(0.001, Math.min(0.1, timeStep)) }),
  setTimeScale: (timeScale) => set({ timeScale }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setPaused: (isPaused) => set({ isPaused }),
  startSimulation: () => set({ isSimulating: true, isPaused: false }),
  stopSimulation: () => set({ isSimulating: false, isPaused: false, currentStepIndex: 0 }),
  stepSimulationOnce: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
  setShowCollisions: (showCollisions) => set({ showCollisions }),
  toggleShowCollisions: () => set((state) => ({ showCollisions: !state.showCollisions })),

  addSimulationEvent: (event) =>
    set((state) => {
      const timestamp =
        event.timestamp ??
        formatStepTimestamp(state.currentStepIndex, state.timeStep);
      const id =
        event.id ??
        `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const newEvent: PhysicsSimulationEvent = {
        ...event,
        id,
        timestamp,
      };

      const nextEvents = [newEvent, ...state.events];
      if (nextEvents.length > MAX_EVENT_BUFFER) {
        nextEvents.length = MAX_EVENT_BUFFER;
      }

      return { events: nextEvents };
    }),

  clearSimulationEvents: () => set({ events: [] }),

  resetSimulationState: () =>
    set({
      gravity: 9.81,
      timeStep: 1 / 60,
      timeScale: 1,
      isPaused: false,
      isSimulating: false,
      currentStepIndex: 0,
      showCollisions: false,
      events: [...SAMPLE_PHYSICS_EVENTS],
    }),
}));

