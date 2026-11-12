import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { GameLoop } from './organisms/GameLoop';
import { PhysicsMetrics } from './organisms/PhysicsMetrics';
import { PhysicsControls } from './organisms/PhysicsControls';
import { PhysicsStatusBar } from './organisms/PhysicsStatusBar';
import { TechTreeOrganism } from './organisms/TechTreeOrganism';
import { PatentMarketplaceOrganism } from './organisms/PatentMarketplaceOrganism';
import { usePhysicsStore } from '../store/physicsStore';
import { useForgeEconomyStore } from '../state/forgeEconomyStore';
import { usePatentExchangeStore } from '../state/patentExchangeStore';

describe('Organisms Suite (GameLoop, PhysicsMetrics, PhysicsControls, PhysicsStatusBar, TechTree, PatentMarketplace)', () => {
  beforeEach(() => {
    usePhysicsStore.getState().resetSimulationState();
  });

  it('renders PhysicsMetrics with default store values and optional console terminal', () => {
    const element = React.createElement(PhysicsMetrics, {
      showControls: true,
      showConsole: true,
    });

    expect(element.props.showControls).toBe(true);
    expect(element.props.showConsole).toBe(true);
    expect(usePhysicsStore.getState().gravity).toBe(9.81);
    expect(usePhysicsStore.getState().timeScale).toBe(1);
    expect(usePhysicsStore.getState().events.length).toBeGreaterThanOrEqual(4);
  });

  it('instantiates GameLoop organism with fixed-update and render callbacks', () => {
    const onFixedUpdate = vi.fn();
    const onRenderUpdate = vi.fn();

    const element = React.createElement(GameLoop, {
      onFixedUpdate,
      onRenderUpdate,
    });

    expect(element.props.onFixedUpdate).toBeDefined();
    expect(element.props.onRenderUpdate).toBeDefined();
  });

  it('instantiates PhysicsControls organism and interacts with physicsStore', () => {
    const onReset = vi.fn();
    const onTogglePlay = vi.fn();

    const element = React.createElement(PhysicsControls, {
      onReset,
      onTogglePlay,
      showSpeedSelectors: true,
      showStepButton: true,
    });

    expect(element.props.onReset).toBeDefined();
    expect(element.props.onTogglePlay).toBeDefined();
    expect(usePhysicsStore.getState().isSimulating).toBe(false);

    // Test store mutation
    usePhysicsStore.getState().startSimulation();
    expect(usePhysicsStore.getState().isSimulating).toBe(true);
    expect(usePhysicsStore.getState().isPaused).toBe(false);

    usePhysicsStore.getState().togglePause();
    expect(usePhysicsStore.getState().isPaused).toBe(true);

    usePhysicsStore.getState().stepSimulationOnce();
    expect(usePhysicsStore.getState().currentStepIndex).toBe(1);

    usePhysicsStore.getState().setTimeScale(2);
    expect(usePhysicsStore.getState().timeScale).toBe(2);

    usePhysicsStore.getState().resetSimulationState();
    expect(usePhysicsStore.getState().isSimulating).toBe(false);
    expect(usePhysicsStore.getState().currentStepIndex).toBe(0);
    expect(usePhysicsStore.getState().timeScale).toBe(1);
  });

  it('instantiates PhysicsStatusBar organism and renders metrics and simulation status indicator', () => {
    const onTogglePlay = vi.fn();
    const onReset = vi.fn();

    const element = React.createElement(PhysicsStatusBar, {
      compact: false,
      showTimer: true,
      showControls: true,
      onTogglePlay,
      onReset,
    });

    expect(element.props.showTimer).toBe(true);
    expect(element.props.showControls).toBe(true);

    usePhysicsStore.getState().setGravity(1.62);
    expect(usePhysicsStore.getState().gravity).toBe(1.62);

    usePhysicsStore.getState().setTimeScale(0.5);
    expect(usePhysicsStore.getState().timeScale).toBe(0.5);
  });

  it('instantiates TechTreeOrganism and checks wallet and tech nodes', () => {
    const onNodeSelect = vi.fn();
    const element = React.createElement(TechTreeOrganism, {
      onNodeSelect,
    });

    expect(element.props.onNodeSelect).toBeDefined();
    const nodes = useForgeEconomyStore.getState().techTree;
    expect(nodes.length).toBeGreaterThanOrEqual(12);
    expect(useForgeEconomyStore.getState().wallet.credits).toBeGreaterThanOrEqual(0);
  });

  it('instantiates PatentMarketplaceOrganism and checks seed patents', () => {
    const onPatentSelected = vi.fn();
    const element = React.createElement(PatentMarketplaceOrganism, {
      onPatentSelected,
    });

    expect(element.props.onPatentSelected).toBeDefined();
    const patents = usePatentExchangeStore.getState().registeredPatents;
    expect(patents.length).toBeGreaterThanOrEqual(3);
    expect(patents[0].patentNumber).toMatch(/^PAT-/);
  });
});
