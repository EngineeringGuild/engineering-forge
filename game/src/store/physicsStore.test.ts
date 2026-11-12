import { describe, it, expect, beforeEach } from 'vitest';
import { usePhysicsStore } from './physicsStore';

describe('Physics Simulation Store (physicsStore.ts)', () => {
  beforeEach(() => {
    usePhysicsStore.getState().resetSimulationState();
  });

  it('initializes with nominal physical default values', () => {
    const state = usePhysicsStore.getState();
    expect(state.gravity).toBe(9.81);
    expect(state.timeStep).toBeCloseTo(1 / 60, 4);
    expect(state.timeScale).toBe(1);
    expect(state.isPaused).toBe(false);
    expect(state.isSimulating).toBe(false);
  });

  it('updates gravity and time scale multipliers', () => {
    const store = usePhysicsStore.getState();

    store.setGravity(1.62); // Moon gravity
    expect(usePhysicsStore.getState().gravity).toBe(1.62);

    store.setTimeScale(2);
    expect(usePhysicsStore.getState().timeScale).toBe(2);

    store.setTimeScale(0.25); // Slo-mo
    expect(usePhysicsStore.getState().timeScale).toBe(0.25);
  });

  it('manages play, pause and single-stepping execution states', () => {
    const store = usePhysicsStore.getState();

    store.startSimulation();
    expect(usePhysicsStore.getState().isSimulating).toBe(true);
    expect(usePhysicsStore.getState().isPaused).toBe(false);

    store.togglePause();
    expect(usePhysicsStore.getState().isPaused).toBe(true);

    store.stepSimulationOnce();
    expect(usePhysicsStore.getState().currentStepIndex).toBe(1);

    store.stopSimulation();
    expect(usePhysicsStore.getState().isSimulating).toBe(false);
    expect(usePhysicsStore.getState().currentStepIndex).toBe(0);
  });
});
