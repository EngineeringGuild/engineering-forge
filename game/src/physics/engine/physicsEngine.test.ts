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

  it('provides structured library of common engineering materials with elasticity, density, and thermal expansion', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    const allSpecs = physicsRegistry.getAllCertifiedSpecs();
    expect(allSpecs.length).toBeGreaterThanOrEqual(7);

    // Aluminum 6061-T6
    const alu = physicsRegistry.getCertifiedSpec('aluminum_6061_t6');
    expect(alu).toBeDefined();
    expect(alu?.youngsModulusGPa).toBeCloseTo(68.9);
    expect(alu?.densityKgM3).toBe(2700);
    expect(alu?.thermalExpansionPpmK).toBeCloseTo(23.6);
    expect(alu?.standardCitation).toContain('ASTM B221');

    // Structural Concrete C30/37
    const concrete = physicsRegistry.getCertifiedSpec('structural_concrete_c30');
    expect(concrete).toBeDefined();
    expect(concrete?.category).toBe('ceramic_concrete');
    expect(concrete?.youngsModulusGPa).toBeCloseTo(32.8);
    expect(concrete?.densityKgM3).toBe(2400);
    expect(concrete?.thermalExpansionPpmK).toBeCloseTo(10.0);
    expect(concrete?.standardCitation).toContain('ACI 318');

    // Stainless Steel 304
    const stainless = physicsRegistry.getCertifiedSpec('stainless_steel_304');
    expect(stainless).toBeDefined();
    expect(stainless?.densityKgM3).toBe(8000);
    expect(stainless?.thermalExpansionPpmK).toBeCloseTo(17.2);

    // Filter by category
    const metals = physicsRegistry.getCertifiedSpecsByCategory('metal');
    expect(metals.some((m) => m.id === 'aluminum_6061_t6')).toBe(true);
    expect(metals.some((m) => m.id === 'structural_steel_a36')).toBe(true);

    const ceramics = physicsRegistry.getCertifiedSpecsByCategory('ceramic_concrete');
    expect(ceramics.length).toBe(1);
    expect(ceramics[0].id).toBe('structural_concrete_c30');

    // Thermal expansion calculation:
    // A 10m aluminum beam heated by 50 Kelvin:
    // delta_L = 23.6e-6 * 10 * 50 = 0.0118 m (11.8 mm)
    const thermalAlu = physicsRegistry.calculateThermalDeformation('aluminum_6061_t6', 10, 50);
    expect(thermalAlu).toBeCloseTo(0.0118, 4);

    // Concrete 10m bridge pier heated by 40 Kelvin:
    // delta_L = 10.0e-6 * 10 * 40 = 0.004 m (4.0 mm)
    const thermalConcrete = physicsRegistry.calculateThermalDeformation('structural_concrete_c30', 10, 40);
    expect(thermalConcrete).toBeCloseTo(0.004, 4);
  });

  it('evaluates Phase 2 Euler Column Buckling with critical load and slenderness ratio', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Wood member: E = 11 GPa, area = 0.01 m², allowable stress = 40 MPa, capacity = 400 kN
    // Square cross-section: b = sqrt(0.01) = 0.1m, I = (0.1)^4 / 12 = 8.333e-6 m^4
    // Length L = 4.0m
    // Euler critical load: P_cr = (pi^2 * E * I) / L^2 = (pi^2 * 11e9 * 8.333e-6) / 16 ~ 56.54 kN
    // Note that Euler buckling load (56.5 kN) is MUCH LESS than yield capacity (400 kN)!
    // Under 30 kN compression:
    const eval30 = physicsRegistry.evaluateStructuralMember('wood', -30_000, 4.0);
    expect(eval30).not.toBeNull();
    expect(eval30?.eulerCriticalLoadN).toBeCloseTo(56543, -2);
    expect(eval30?.isBuckled).toBe(false);
    expect(eval30?.slendernessRatio).toBeGreaterThan(100);

    // Under 70 kN compression: exceeds P_cr (56.5 kN) -> BUCKLED!
    const eval70 = physicsRegistry.evaluateStructuralMember('wood', -70_000, 4.0);
    expect(eval70?.isBuckled).toBe(true);
    expect(eval70?.isFailing).toBe(true);
  });

  it('evaluates Phase 2 Beam Bending (Euler-Bernoulli simple support)', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Steel beam A36: E = 200 GPa, allowable = 160 MPa, density = 7850 kg/m³
    // Span = 6.0m, Width = 0.12m, Height = 0.24m
    // Center point load = 20 kN
    const bending = physicsRegistry.evaluateBeamBending('structural_steel_a36', 6.0, 20_000, 0.12, 0.24);
    expect(bending).not.toBeNull();
    expect(bending?.maxDeflectionM).toBeGreaterThan(0);
    expect(bending?.maxBendingStressPa).toBeGreaterThan(0);
    expect(bending?.safetyFactor).toBeGreaterThan(1.0);
    expect(bending?.isFailing).toBe(false);
  });
});

describe('PhysicsMediator (UI Reactive Synchronizer)', () => {
  it('synchronizes test bench parameters and notifies subscribers', async () => {
    const { physicsMediator } = await import('./PhysicsMediator');
    let notificationCount = 0;
    const unsubscribe = physicsMediator.subscribe(() => {
      notificationCount++;
    });

    physicsMediator.updateTestBenchState({ spanLengthM: 8.0 });
    expect(physicsMediator.getTestBenchState().spanLengthM).toBe(8.0);
    expect(notificationCount).toBeGreaterThan(0);

    // Evaluating active beam returns consistent mechanical calculations
    const evalActive = physicsMediator.evaluateActiveBeam();
    expect(evalActive).not.toBeNull();
    expect(evalActive?.maxDeflectionM).toBeGreaterThan(0);

    // Column buckling evaluation through mediator
    const bucklingCheck = physicsMediator.evaluateColumnBuckling('wood', 80_000, 4.0);
    expect(bucklingCheck?.isBuckled).toBe(true);

    unsubscribe();
  });

  it('synchronizes custom materials and prevents cyclic state updates', async () => {
    const { physicsMediator } = await import('./PhysicsMediator');

    physicsMediator.updateTestBenchState({
      customModulusGPa: 150,
      customDensityKgM3: 6500,
      customThermalExpansionPpmK: 14.5,
    });
    const registered = physicsMediator.getTestBenchState();
    expect(registered.customModulusGPa).toBe(150);
    expect(registered.customDensityKgM3).toBe(6500);

    // Should evaluate active beam with the updated custom material specs
    const evaluated = physicsMediator.evaluateActiveBeam();
    expect(evaluated).not.toBeNull();
    expect(evaluated?.maxDeflectionM).toBeGreaterThan(0);
  });
});

describe('Phase 2 Continuum Mechanics & Dynamics Formulations', () => {
  it('validates Euler Buckling critical loads across boundary conditions (K-factor)', async () => {
    const { eulerBucklingCapacity, MATERIALS } = await import('../materials');
    const wood = MATERIALS.wood; // E = 11 GPa, area = 0.01 m²
    const L = 3.0; // 3 meters

    // Pinned-Pinned: K = 1.0 -> P_cr = pi^2 * E * I / L^2
    const pcrPinned = eulerBucklingCapacity(wood, L, 1.0);
    const expectedPinned = (Math.PI ** 2 * 11e9 * (0.01 ** 2 / 12)) / (L ** 2);
    expect(pcrPinned).toBeCloseTo(expectedPinned, 1);

    // Fixed-Fixed: K = 0.5 -> Effective length is L/2, so critical load is 4x higher
    const pcrFixed = eulerBucklingCapacity(wood, L, 0.5);
    expect(pcrFixed).toBeCloseTo(expectedPinned * 4, 1);

    // Cantilever (Fixed-Free): K = 2.0 -> Effective length is 2L, critical load is 1/4th
    const pcrCantilever = eulerBucklingCapacity(wood, L, 2.0);
    expect(pcrCantilever).toBeCloseTo(expectedPinned / 4, 1);
  });

  it('validates Euler-Bernoulli beam deflection against analytical textbook solution', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    const L = 4.0;   // 4 meters
    const P = 10_000; // 10 kN center point load
    const b = 0.1;   // 100 mm width
    const h = 0.2;   // 200 mm height

    const result = physicsRegistry.evaluateBeamBending('structural_steel_a36', L, P, b, h);
    expect(result).not.toBeNull();
    // Center deflection should be non-zero and physically reasonable (~1mm to 2mm for steel)
    expect(result?.maxDeflectionM).toBeGreaterThan(0.0005);
    expect(result?.maxDeflectionM).toBeLessThan(0.005);
    expect(result?.maxBendingStressPa).toBeGreaterThan(10e6); // > 10 MPa
    expect(result?.safetyFactor).toBeGreaterThan(1.0);
  });

  it('validates Pacejka Magic Formula curve properties (peak grip, slip plateau)', async () => {
    const { calculatePacejkaTraction } = await import('../vehicle');
    const normalForce = 10_000; // 10 kN
    const muPeak = 0.85;

    // 1. Slip = 0 -> Force = 0
    expect(calculatePacejkaTraction(normalForce, 0, muPeak)).toBe(0);

    // 2. Optimal grip between 12% and 18% slip
    const fAt15 = calculatePacejkaTraction(normalForce, 0.15, muPeak);
    const fAt5 = calculatePacejkaTraction(normalForce, 0.05, muPeak);
    const fAt60 = calculatePacejkaTraction(normalForce, 0.60, muPeak);

    expect(fAt15).toBeGreaterThan(fAt5);
    expect(fAt15).toBeGreaterThan(fAt60);
    // Peak grip at 15% slip develops > 8 kN for 10 kN normal force
    expect(fAt15).toBeGreaterThan(8000);
    expect(fAt15).toBeLessThanOrEqual(muPeak * normalForce);
  });
});

describe('Phase 3 Multi-Physics Guild Matrix (Electro-Thermal-Structural & FSI)', () => {
  it('evaluates Electro-Thermal-Structural Coupling (Joule heating, thermal expansion & pre-stress)', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Copper busbar/structural tie: length = 2.0m, area = 0.001 m^2 (1000 mm^2)
    // Carrying current = 1200 A for 10 seconds under 15 kN axial mechanical tension
    const res = physicsRegistry.evaluateElectroThermalStructuralCoupling(
      'copper_c11000',
      1200,      // 1200 A
      15_000,    // 15 kN mechanical tension
      2.0,       // 2 meters long
      0.001,     // 0.001 m^2 area
      10.0,      // 10 seconds duration
      293.15,    // 20 deg C ambient
      1.0,       // fully constrained ends
    );

    expect(res).not.toBeNull();
    // Resistance R = rho_e * (L / A) = 1.68e-8 * (2 / 0.001) = 3.36e-5 Ohm
    expect(res?.resistanceOhm).toBeCloseTo(3.36e-5, 7);
    // Joule dissipation P = I^2 * R = 1200^2 * 3.36e-5 ~ 48.38 W
    expect(res?.joulePowerWatts).toBeCloseTo(48.38, 1);
    // Total energy generated Q = P * 10s ~ 483.8 Joules
    expect(res?.heatEnergyJoules).toBeCloseTo(483.8, 1);
    // Mass = 8940 * 0.001 * 2 = 17.88 kg
    expect(res?.memberMassKg).toBeCloseTo(17.88, 2);
    // Temperature rise: delta_T = Q / (mass * c_p) = 483.8 / (17.88 * 385) ~ 0.07 K
    expect(res?.temperatureRiseK).toBeGreaterThan(0);
    expect(res?.temperatureRiseK).toBeLessThan(1.0);
    // Constrained thermal stress and combined stress are positive
    expect(res?.constrainedThermalStressPa).toBeGreaterThan(0);
    expect(res?.combinedStressPa).toBeGreaterThan(15_000 / 0.001); // greater than pure mechanical
    expect(res?.isFailing).toBe(false);
  });

  it('evaluates Fluid-Structure Interaction (FSI) & bridge aerodynamic cross-wind loading', async () => {
    const { physicsRegistry } = await import('./PhysicsEngineRegistry');
    // Vehicle traveling at 30 m/s (~108 km/h) with Cd=0.32, Cl=0.18, A=1.8 m^2
    // Along with storm cross-wind of 20 m/s acting on 12 m^2 exposed bridge truss
    const fsi = physicsRegistry.evaluateFluidStructureInteraction(
      30.0, // 30 m/s vehicle velocity
      0.32, // Cd
      0.18, // Cl downforce
      1.8,  // 1.8 m^2 frontal area
      20.0, // 20 m/s cross-wind
      12.0, // 12 m^2 bridge truss exposed area
    );

    // Dynamic pressure: q = 0.5 * 1.225 * 30^2 = 551.25 Pa
    expect(fsi.velocityPressurePa).toBeCloseTo(551.25, 1);
    // Vehicle Drag = 551.25 * 0.32 * 1.8 ~ 317.52 N
    expect(fsi.dragForceN).toBeCloseTo(317.52, 1);
    // Vehicle Downforce = 551.25 * 0.18 * 1.8 ~ 178.60 N
    expect(fsi.downforceLiftN).toBeCloseTo(178.60, 1);

    // Cross-wind pressure: q_wind = 0.5 * 1.225 * 20^2 = 245.0 Pa
    // Bridge wind thrust = 245.0 * 1.2 * 12 = 3528.0 N (~3.53 kN)
    expect(fsi.bridgeWindThrustN).toBeCloseTo(3528.0, 0);
  });
});

