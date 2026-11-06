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

describe('PhysicsEngineRegistry (Centralized Manager)', () => {
  it('provides singleton access with standard constants and certified materials', async () => {
    const { PhysicsEngineRegistry, physicsRegistry } = await import('./PhysicsEngineRegistry');
    expect(PhysicsEngineRegistry.getInstance()).toBe(physicsRegistry);
    expect(physicsRegistry.getStandardGravity()).toBeCloseTo(9.80665);
    expect(physicsRegistry.getAirDensity()).toBe(1.225);

    const steelSpec = physicsRegistry.getCertifiedSpec('structural_steel_a36');
    expect(steelSpec).toBeDefined();
    expect(steelSpec?.youngsModulusGPa).toBe(200);
  });

  it('evaluates structural mechanics with ASME allowable stress, safety factor, and deformation', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Steel: area 0.005 m², allowable stress 250 MPa, Young's modulus 200 GPa
    // Under 500 kN tension, length 4m:
    // stress = 500,000 / 0.005 = 100 MPa
    // utilization = 100 MPa / 250 MPa = 0.40
    // safetyFactor = 2.5
    // delta_L = (500,000 * 4) / (200e9 * 0.005) = 2,000,000 / 1e9 = 0.002 m (2 mm)
    const result = physicsRegistry.evaluateStructuralMember('steel', 500_000, 4.0);
    expect(result).not.toBeNull();
    expect(result?.stressPa).toBeCloseTo(100e6);
    expect(result?.utilization).toBeCloseTo(0.4);
    expect(result?.safetyFactor).toBeCloseTo(2.5);
    expect(result?.isFailing).toBe(false);
    expect(result?.deformationM).toBeCloseTo(0.002);
  });

  it('evaluates electrodynamic Ohm law and Joule power dissipation', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Resistor small: 5 ohms, max power 10 W
    // At 1.2 A:
    // V = 1.2 * 5 = 6.0 V
    // P = 1.2^2 * 5 = 7.2 W
    // utilization = 7.2 / 10 = 0.72 (nominal)
    const evalNominal = physicsRegistry.evaluateElectricalComponent('resistor-small', 1.2);
    expect(evalNominal).not.toBeNull();
    expect(evalNominal?.voltageDropV).toBeCloseTo(6.0);
    expect(evalNominal?.powerW).toBeCloseTo(7.2);
    expect(evalNominal?.isOverloaded).toBe(false);

    // At 2.0 A: P = 2^2 * 5 = 20 W > 10 W (overloaded)
    const evalBurn = physicsRegistry.evaluateElectricalComponent('resistor-small', 2.0);
    expect(evalBurn?.powerW).toBeCloseTo(20.0);
    expect(evalBurn?.isOverloaded).toBe(true);
  });

  it('evaluates machine traction, normal forces, and grade stall limits', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Light chassis: 800 kg, Small engine: 1500 N thrust
    // On flat ground: normal = 800 * 9.80665 ~ 7845.3 N
    // Traction limit = 0.8 * 7845.3 ~ 6276.2 N > 1500 N (not traction limited)
    // net acceleration = 1500 / 800 = 1.875 m/s²
    const flatTraction = physicsRegistry.evaluateMachineTraction('engine-small', 'chassis-light', 0, 0);
    expect(flatTraction).not.toBeNull();
    expect(flatTraction?.isTractionLimited).toBe(false);
    expect(flatTraction?.netAccelerationMps2).toBeCloseTo(1.875, 2);
    expect(flatTraction?.isStalled).toBe(false);

    // On steep 45-degree slope:
    // slope force = 800 * 9.80665 * sin(45) ~ 5547.8 N > 1500 N -> STALLED
    const steepSlope = physicsRegistry.evaluateMachineTraction('engine-small', 'chassis-light', 45, 0);
    expect(steepSlope?.isStalled).toBe(true);
    expect(steepSlope?.netAccelerationMps2).toBe(0);
  });
});
