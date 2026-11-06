import { describe, it, expect } from 'vitest';
import {
  PHYSICAL_CONSTANTS,
  CERTIFIED_MATERIALS_REGISTER,
  exportToGuildRegister,
} from './PhysicsRegistry';
import {
  calculateAerodynamicDrag,
  calculateInclineForces,
} from './PhysicsMetricsContract';

describe('Physics Engine Infrastructure (Registry & Contracts)', () => {
  it('supplies certified physical constants with standard citations', () => {
    expect(PHYSICAL_CONSTANTS.STANDARD_GRAVITY.value).toBeCloseTo(9.80665);
    expect(PHYSICAL_CONSTANTS.STANDARD_GRAVITY.unit).toBe('m/s²');
    expect(PHYSICAL_CONSTANTS.STANDARD_GRAVITY.standardCitation).toContain('ISO 80000');

    expect(PHYSICAL_CONSTANTS.AIR_DENSITY_SEA_LEVEL.value).toBe(1.225);
    expect(PHYSICAL_CONSTANTS.AIR_DENSITY_SEA_LEVEL.unit).toBe('kg/m³');
  });

  it('validates ASTM/ASME material specifications with positive design margins', () => {
    const steel = CERTIFIED_MATERIALS_REGISTER.structural_steel_a36;
    expect(steel.yieldStrengthMPa).toBe(250);
    expect(steel.allowableStressMPa).toBeLessThan(steel.yieldStrengthMPa);
    expect(steel.asmeSafetyFactor).toBeGreaterThan(1.5);

    const cable = CERTIFIED_MATERIALS_REGISTER.high_tensile_cable;
    expect(cable.yieldStrengthMPa).toBe(1180);
    expect(cable.allowableStressMPa).toBe(520);
  });

  it('generates compliant Guild Dimension Register python manifests', () => {
    const manifest = exportToGuildRegister('MNR1-BRIDGE-STUDY', 'VAR-01', [
      {
        group: 'STR',
        element: 'DECK',
        parameter: 'SPAN_LENGTH',
        value: 12.0,
        unit: 'm',
        basis: 'LOCKED',
        source: 'DOC-FORGE-01',
        status: 'EM_DIA',
        note: 'Primary valley clearance',
      },
      {
        group: 'STR',
        element: 'PIER_L0',
        parameter: 'REACTION_LOAD',
        value: 45.2,
        unit: 'kN',
        basis: 'DERIVADO',
        source: 'calc/bridge_equilibrium.py',
        status: 'EM_DIA',
        note: 'Matter.js dynamic wheel contact reaction',
      },
    ]);

    expect(manifest).toContain('Dim = namedtuple');
    expect(manifest).toContain("Dim('STR', 'DECK', 'SPAN_LENGTH', 12, 'm', 'LOCKED'");
    expect(manifest).toContain("Dim('STR', 'PIER_L0', 'REACTION_LOAD', 45.2, 'kN', 'DERIVADO'");
  });

  it('computes ISO 80000 quadratic aerodynamic drag correctly', () => {
    // At zero speed, drag is zero
    expect(calculateAerodynamicDrag(0)).toBe(0);

    // At 10 m/s (~36 km/h) with Cd=0.32, A=1.8 m^2:
    // F_drag = 0.5 * 1.225 * 100 * 0.32 * 1.8 = 35.28 N
    const drag10 = calculateAerodynamicDrag(10, 0.32, 1.8);
    expect(drag10).toBeCloseTo(35.28, 1);

    // At 20 m/s, drag quadruples (proportional to v^2)
    const drag20 = calculateAerodynamicDrag(20, 0.32, 1.8);
    expect(drag20).toBeCloseTo(35.28 * 4, 1);
  });

  it('calculates accurate incline normal and slope gravity forces', () => {
    const mass = 1000; // 1000 kg vehicle
    // On flat ground (0 deg): normal force = m*g, slope force = 0
    const flat = calculateInclineForces(mass, 0);
    expect(flat.normalForceN).toBeCloseTo(mass * 9.80665, 1);
    expect(flat.slopeGravityN).toBeCloseTo(0, 1);

    // On 30 deg incline: normal = m*g*cos(30) ~ 8492.8 N, slope = m*g*sin(30) ~ 4903.3 N
    const slope30 = calculateInclineForces(mass, 30);
    expect(slope30.normalForceN).toBeCloseTo(mass * 9.80665 * (Math.sqrt(3) / 2), 1);
    expect(slope30.slopeGravityN).toBeCloseTo(mass * 9.80665 * 0.5, 1);
  });
});
