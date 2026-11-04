import { describe, it, expect } from 'vitest';
import { createMatterTrussSimulation, computeMatterTrussTrajectory } from './matterTruss';
import { createMatterVehicleSimulation, analyzeVehicleWithMatter } from './matterVehicle';
import { createMatterCircuitSimulation } from './matterCircuit';
import { ENGINES, CHASSIS } from './vehicleParts';
import type { LevelDef } from '../content/types';
import type { TrussModel } from './truss';
import type { CircuitModel } from './circuit';

describe('Matter.js Physics Engine Integration', () => {
  describe('MatterTruss (Structural / Bridges)', () => {
    const testLevel: LevelDef = {
      id: 'test-bridge-level',
      order: 1,
      name: 'Test Bridge Level',
      tagline: 'Test bridge tagline',
      hint: 'Test hint',
      gridSize: 1,
      buildArea: { minX: 0, maxX: 4, minY: -2, maxY: 2 },
      budget: 5000,
      fixedNodes: [
        { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
        { id: 'B', x: 4, y: 0, support: 'roller', isDeck: true },
      ],
      deckMembers: [{ id: 'deck1', nodeA: 'A', nodeB: 'B' }],
      unlockedMaterials: ['wood', 'steel'],
      loads: [{ nodeId: 'D', force: 10000 }],
    };

    const strongModel: TrussModel = {
      nodes: [
        { id: 'A', x: 0, y: 0, support: 'pin' },
        { id: 'B', x: 4, y: 0, support: 'roller' },
        { id: 'C', x: 2, y: -1.5, support: 'none' },
        { id: 'D', x: 2, y: 0, support: 'none' },
      ],
      members: [
        { id: 'm1', nodeA: 'A', nodeB: 'D', materialId: 'steel' },
        { id: 'm2', nodeA: 'D', nodeB: 'B', materialId: 'steel' },
        { id: 'm3', nodeA: 'A', nodeB: 'C', materialId: 'steel' },
        { id: 'm4', nodeA: 'C', nodeB: 'B', materialId: 'steel' },
        { id: 'm5', nodeA: 'C', nodeB: 'D', materialId: 'steel' },
      ],
      loads: [{ nodeId: 'D', force: 10000 }],
    };

    it('creates rigid bodies, constraints, terrain, and vehicle in Matter world', () => {
      const sim = createMatterTrussSimulation(testLevel, strongModel, 10000);
      expect(sim.world.bodies.length).toBeGreaterThan(0);
      expect(sim.nodeBodies.size).toBe(4);
      expect(sim.memberConstraints.size).toBe(5);
      expect(sim.vehicleComposite).not.toBeNull();

      // Pin support node A must be a static body
      const nodeABody = sim.nodeBodies.get('A');
      expect(nodeABody?.isStatic).toBe(true);

      // Free node C must be dynamic
      const nodeCBody = sim.nodeBodies.get('C');
      expect(nodeCBody?.isStatic).toBe(false);

      sim.destroy();
    });

    it('advances vehicle and checks structural constraints under step()', () => {
      const sim = createMatterTrussSimulation(testLevel, strongModel, 10000);
      const state0 = sim.step(16.6);

      expect(state0.cartPos).toBeDefined();
      expect(state0.nodePositions.A).toBeDefined();
      expect(state0.isCollapsed).toBe(false);

      sim.destroy();
    });

    it('computes dynamic trajectory capturing vehicle crossing with Matter.js', () => {
      const trajectory = computeMatterTrussTrajectory(testLevel, strongModel, 20, 10000);
      expect(trajectory.frames.length).toBe(21);
      expect(trajectory.frames[0].cartPos.x).toBeLessThan(trajectory.frames[20].cartPos.x);
    });
  });

  describe('MatterVehicle (Vehicles & Drag Strip)', () => {
    it('accurately calculates normal force, traction limit and drives forward', () => {
      const sim = createMatterVehicleSimulation(
        ENGINES['engine-small'],
        CHASSIS['chassis-light'],
        50,
        0, // flat
        0, // no payload
      );

      const state = sim.step(16.6);
      expect(state.normalForceN).toBeGreaterThan(0);
      expect(state.tractionLimitN).toBeGreaterThan(0);
      expect(state.isStalled).toBe(false);

      const run = sim.runUntilFinish(3);
      expect(run.analysis.finalSpeed).toBeGreaterThan(0);
      expect(run.analysis.stalled).toBe(false);
      sim.destroy();
    });

    it('detects traction slip when engine force exceeds tire grip limit', () => {
      // Turbo engine on light chassis delivers 8000N thrust exceeding the ~6278N tire grip
      const sim = createMatterVehicleSimulation(
        ENGINES['engine-turbo'],
        CHASSIS['chassis-light'],
        50,
        0,
      );

      const state = sim.step(16.6);
      expect(state.isTractionLimited).toBe(true);
      expect(state.effectiveForceN).toBeLessThanOrEqual(state.tractionLimitN);
      sim.destroy();
    });

    it('detects stall on steep incline when gravity along slope overcomes traction', () => {
      // Small engine on a steep 40-degree incline
      const sim = createMatterVehicleSimulation(
        ENGINES['engine-small'],
        CHASSIS['chassis-heavy'],
        50,
        40, // 40 degrees steep
        100, // extra payload
      );

      const state = sim.step(16.6);
      expect(state.isStalled).toBe(true);
      expect(state.acceleration).toBe(0);
      sim.destroy();
    });

    it('analyzeVehicleWithMatter produces valid telemetry and results', () => {
      const analysis = analyzeVehicleWithMatter(
        ENGINES['engine-large'],
        CHASSIS['chassis-heavy'],
        40,
        5,
      );

      expect(analysis.effectiveForce).toBeGreaterThan(0);
      expect(analysis.acceleration).toBeGreaterThan(0);
      expect(analysis.finalSpeed).toBeGreaterThan(0);
      expect(typeof analysis.tractionLimited).toBe('boolean');
    });
  });

  describe('MatterCircuit (Electromechanical Switch & Breaker)', () => {
    const testCircuit: CircuitModel = {
      sourceVoltage: 5, // 5V / 5Ω = 1A, P = 5W < 10W maxPower
      nodes: [
        { id: 'pos', x: 0, y: 0, terminal: 'positive' },
        { id: 'neg', x: 2, y: 0, terminal: 'negative' },
      ],
      edges: [{ id: 'e1', nodeA: 'pos', nodeB: 'neg', componentId: 'resistor-small' }],
    };

    const shortCircuit: CircuitModel = {
      sourceVoltage: 12,
      nodes: [
        { id: 'pos', x: 0, y: 0, terminal: 'positive' },
        { id: 'neg', x: 2, y: 0, terminal: 'negative' },
      ],
      // direct wire across 12V battery = massive current
      edges: [{ id: 'e1', nodeA: 'pos', nodeB: 'neg', componentId: 'wire' }],
    };

    it('creates knife-switch mechanism and establishes electrical contact', () => {
      const sim = createMatterCircuitSimulation(testCircuit);
      expect(sim.leverBody).toBeDefined();
      expect(sim.terminalContactBody).toBeDefined();
      expect(sim.pivotConstraint).toBeDefined();

      sim.toggleSwitch(true);

      // Step physics until lever contacts the stationary terminal
      let contacted = false;
      for (let i = 0; i < 40; i++) {
        const state = sim.step(16.66);
        if (state.isContactClosed) {
          contacted = true;
          expect(state.circuitAnalysis.status).toBe('analyzed');
          break;
        }
      }

      expect(contacted).toBe(true);
      sim.destroy();
    });

    it('trips circuit breaker on short circuit with electromagnetic impulse and arc sparks', () => {
      const sim = createMatterCircuitSimulation(shortCircuit, 10); // 10A breaker limit
      sim.toggleSwitch(true);

      let tripped = false;
      for (let i = 0; i < 50; i++) {
        const state = sim.step(16.66);
        if (state.breakerTripped) {
          tripped = true;
          expect(state.arcSparks.length).toBeGreaterThan(0);
          expect(state.isContactClosed).toBe(false);
          break;
        }
      }

      expect(tripped).toBe(true);
      sim.destroy();
    });
  });
});
