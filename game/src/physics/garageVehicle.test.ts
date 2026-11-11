import { describe, it, expect } from 'vitest';
import {
  calculateGarageVehicleMetrics,
  type CustomVehicleConfig,
} from './garageVehicle';

describe('Inventor Garage Vehicle Physics Engine', () => {
  const sampleConfig: CustomVehicleConfig = {
    id: 'veh-custom-proto',
    name: 'Apex Rover GT',
    chassisType: 'tubular',
    chassisMassKg: 1000,
    wheelbaseMeters: 2.5,
    chassisLengthMeters: 4.0,
    engineId: 'engine-turbo',
    engineForceNewtons: 4000,
    cogOffsetRatio: 0.0, // perfectly centered CoG
    suspensionStiffnessNPerM: 35000,
    suspensionDampingRatio: 0.7,
    tireCompound: 'racing_slicks',
    tireFrictionMu: 1.0,
    payloadMassKg: 200,
  };

  it('calculates balanced weight distribution when CoG offset is zero', () => {
    const metrics = calculateGarageVehicleMetrics(sampleConfig);

    expect(metrics.totalMassKg).toBe(1200);
    expect(metrics.cogXPositionMeters).toBe(1.25); // exactly half of 2.5m wheelbase
    // Front and rear normal forces should be equal for centered CoG
    expect(Math.abs(metrics.normalForceFrontN - metrics.normalForceRearN)).toBeLessThanOrEqual(5);
  });

  it('shifts normal forces to rear when CoG is shifted rearward', () => {
    const rearHeavy = { ...sampleConfig, cogOffsetRatio: -0.2 };
    const metrics = calculateGarageVehicleMetrics(rearHeavy);

    expect(metrics.cogXPositionMeters).toBeLessThan(1.25);
    expect(metrics.normalForceRearN).toBeGreaterThan(metrics.normalForceFrontN);
  });

  it('computes maximum climbable slope and top speed bounded by Coulomb friction', () => {
    const metrics = calculateGarageVehicleMetrics(sampleConfig);

    expect(metrics.maxClimbableSlopeDeg).toBeGreaterThan(15);
    expect(metrics.maxClimbableSlopeDeg).toBeLessThan(45);
    expect(metrics.accelerationMaxMs2).toBeGreaterThan(2.0);
    expect(metrics.topSpeedEstimateMs).toBeGreaterThan(20);
    expect(metrics.suspensionNaturalFrequencyHz).toBeGreaterThan(1.0);
  });
});
