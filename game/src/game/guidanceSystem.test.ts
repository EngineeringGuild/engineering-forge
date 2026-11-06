import { describe, it, expect } from 'vitest';
import {
  getStructuralGuidance,
  getElectricalGuidance,
  getVehicleGuidance,
} from './guidanceSystem';
import type { LevelDef } from '../content/types';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { VehicleLevelDef } from '../content/vehicleTypes';

describe('Context-Aware Guidance System', () => {
  const mockStructuralLevel: LevelDef = {
    id: 'test-bridge',
    order: 1,
    name: 'Test Bridge',
    tagline: 'Cross the chasm',
    hint: 'Triangulate the deck nodes for maximum rigidity.',
    fixedNodes: [
      { id: 'A', x: 0, y: 0, support: 'pin', isDeck: true },
      { id: 'B', x: 6, y: 0, support: 'roller', isDeck: true },
    ],
    deckMembers: [{ id: 'deck-1', nodeA: 'A', nodeB: 'B' }],
    loads: [{ nodeId: 'B', force: 40000 }],
    budget: 100,
    unlockedMaterials: ['wood', 'steel'],
    buildArea: { minX: 0, maxX: 6, minY: -4, maxY: 0 },
    gridSize: 0.5,
  };

  it('provides triangulation tip when no structural members have been added', () => {
    const guidance = getStructuralGuidance(mockStructuralLevel, [], [], 0, null);
    expect(guidance.headline).toContain('Triangulation');
    expect(guidance.domain).toBe('structural');
  });

  it('detects kinematic mechanisms and provides stability advice', () => {
    const guidance = getStructuralGuidance(
      mockStructuralLevel,
      [{ id: 'n1', x: 3, y: -2 }],
      [{ id: 'm1', nodeA: 'A', nodeB: 'n1', materialId: 'wood' }],
      25,
      { status: 'unstable' },
    );
    expect(guidance.headline).toContain('Kinematic Mechanism');
    expect(guidance.severity).toBe('warning');
  });

  it('detects cable slackening in compression', () => {
    const guidance = getStructuralGuidance(
      mockStructuralLevel,
      [{ id: 'n1', x: 3, y: -2 }],
      [{ id: 'm1', nodeA: 'A', nodeB: 'n1', materialId: 'cable' }],
      30,
      {
        status: 'analyzed',
        members: [
          {
            memberId: 'm1',
            axialForce: -5000,
            capacity: 20000,
            utilization: 0.25,
            failed: true,
            wentSlack: true,
            pulledApart: false,
          },
        ],
        anyFailed: true,
        passed: false,
        cost: 30,
        stars: 0,
      },
    );
    expect(guidance.headline).toContain('Went Slack');
    expect(guidance.advice).toContain('tensile capacity');
  });

  const mockCircuitLevel: CircuitLevelDef = {
    id: 'test-circuit',
    order: 1,
    name: 'Simple Bulb',
    tagline: 'Light the lamp',
    hint: 'Complete the loop from positive to negative.',
    sourceVoltage: 12,
    fixedNodes: [
      { id: 'pos', x: 0, y: 0, terminal: 'positive' },
      { id: 'neg', x: 4, y: 0, terminal: 'negative' },
    ],
    givenEdges: [{ id: 'load-1', nodeA: 'l1', nodeB: 'l2', componentId: 'bulb' }],
    budget: 50,
    unlockedMaterials: ['wire', 'resistor'],
    buildArea: { minX: 0, maxX: 4, minY: -2, maxY: 2 },
    gridSize: 0.5,
  };

  it('provides loop closure advice on open circuit', () => {
    const guidance = getElectricalGuidance(
      mockCircuitLevel,
      [],
      [{ id: 'e1', nodeA: 'pos', nodeB: 'l1', componentId: 'wire' }],
      10,
      { status: 'open' },
    );
    expect(guidance.headline).toContain('Open Circuit');
    expect(guidance.domain).toBe('electrical');
  });

  it('provides overcurrent burnout advice', () => {
    const guidance = getElectricalGuidance(
      mockCircuitLevel,
      [],
      [{ id: 'e1', nodeA: 'pos', nodeB: 'neg', componentId: 'wire' }],
      15,
      {
        status: 'analyzed',
        edges: [
          {
            edgeId: 'e1',
            current: 10,
            power: 120,
            maxPower: 1,
            burnedOut: true,
            underpowered: false,
          },
        ],
        anyBurnedOut: true,
        anyUnderpowered: false,
        passed: false,
        cost: 15,
        stars: 0,
      },
    );
    expect(guidance.headline).toContain('Burnout');
    expect(guidance.advice).toContain('series resistance');
  });

  const mockVehicleLevel: VehicleLevelDef = {
    id: 'test-vehicle',
    order: 1,
    name: 'Hill Climb',
    tagline: 'Ascend the 15 degree slope',
    hint: 'High torque overcomes incline gravity.',
    distance: 100,
    targetSpeed: 20,
    inclineDegrees: 15,
    budget: 500,
    unlockedEngines: ['v6', 'v8'],
    unlockedChassis: ['light', 'standard'],
  };

  it('provides grade resistance advice when vehicle stalls', () => {
    const guidance = getVehicleGuidance(mockVehicleLevel, 'v6', 'standard', 300, {
      analysis: {
        effectiveForce: 0,
        tractionLimit: 1500,
        tractionLimited: false,
        acceleration: 0,
        finalSpeed: 0,
        stalled: true,
        slipRatio: 0,
      },
      passed: false,
      stars: 0,
      cost: 300,
    });
    expect(guidance.headline).toContain('Grade Resistance');
    expect(guidance.domain).toBe('mechanical');
  });
});
