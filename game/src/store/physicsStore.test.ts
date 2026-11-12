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
    expect(state.showCollisions).toBe(false);
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

  it('toggles and manages showCollisions boundary visualization flag', () => {
    const store = usePhysicsStore.getState();
    expect(store.showCollisions).toBe(false);

    store.toggleShowCollisions();
    expect(usePhysicsStore.getState().showCollisions).toBe(true);

    store.setShowCollisions(false);
    expect(usePhysicsStore.getState().showCollisions).toBe(false);

    store.setShowCollisions(true);
    expect(usePhysicsStore.getState().showCollisions).toBe(true);

    store.resetSimulationState();
    expect(usePhysicsStore.getState().showCollisions).toBe(false);
  });

  it('manages real-time physics event telemetry stream and buffer limits', () => {
    const store = usePhysicsStore.getState();
    expect(store.events.length).toBeGreaterThanOrEqual(4);

    store.addSimulationEvent({
      type: 'collision',
      message: 'Colisão inelástica em teste',
      severity: 'warning',
      details: { impulse: 150 },
    });

    const updatedEvents = usePhysicsStore.getState().events;
    expect(updatedEvents[0].message).toBe('Colisão inelástica em teste');
    expect(updatedEvents[0].type).toBe('collision');
    expect(updatedEvents[0].severity).toBe('warning');
    expect(updatedEvents[0].id).toBeDefined();
    expect(updatedEvents[0].timestamp).toBeDefined();

    store.clearSimulationEvents();
    expect(usePhysicsStore.getState().events).toHaveLength(0);

    store.resetSimulationState();
    expect(usePhysicsStore.getState().events.length).toBeGreaterThanOrEqual(4);
  });
});
