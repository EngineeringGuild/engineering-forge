/**
 * Engineering Guild Centralized Physics Engine Registry
 * 
 * Central manager for physical constants, material properties, and domain calculations,
 * allowing simulation modules (structures, circuits, machines/vehicles) to consume
 * a unified, standardized physics API.
 * 
 * Standards Referenced:
 * - ISO 80000-1:2022 (Quantities and Units - General)
 * - ISO 80000-3:2019 / ISO 80000-4:2019 (Space, Time, Mechanics)
 * - ASME BPVC Section II-D & Section VIII Div 1 & 2
 * - ASTM A36, ASTM A603, ASTM E8/E8M, ASTM E111
 * - IEEE Std 100 / IEC 60027-1 (Electrodynamics)
 * - NIST Special Publication 330 (SI Units & Fundamental Constants)
 */

import {
  PHYSICAL_CONSTANTS,
  CERTIFIED_MATERIALS_REGISTER,
  type PhysicalConstant,
  type MaterialSpecification,
  type GuildDimensionEntry,
  exportToGuildRegister,
} from './PhysicsRegistry';
import { MATERIALS, type Material } from '../materials';
import { COMPONENTS, type ElectricalComponent } from '../components';
import { ENGINES, CHASSIS, type Engine, type Chassis } from '../vehicleParts';

export interface MechanicalEvaluation {
  stressPa: number;
  allowableStressPa: number;
  utilization: number;
  safetyFactor: number;
  isFailing: boolean;
  deformationM: number;
  /** Phase 2: Euler Column Buckling (AISC 360-16 / ASME III) */
  eulerCriticalLoadN?: number;
  slendernessRatio?: number;
  isBuckled?: boolean;
}

export interface BeamBendingEvaluation {
  maxDeflectionM: number;
  maxMomentNm: number;
  maxBendingStressPa: number;
  allowableStressPa: number;
  utilization: number;
  safetyFactor: number;
  isFailing: boolean;
  weightN: number;
}

export interface ElectricalEvaluation {
  currentA: number;
  voltageDropV: number;
  powerW: number;
  maxPowerW: number;
  utilization: number;
  isOverloaded: boolean;
}

export interface MachineTractionEvaluation {
  totalMassKg: number;
  normalForceN: number;
  slopeForceN: number;
  tractionLimitN: number;
  effectiveThrustN: number;
  isTractionLimited: boolean;
  netAccelerationMps2: number;
  isStalled: boolean;
}

export type PhysicsRegistryListener = (eventType: 'material_updated' | 'constant_updated' | 'component_updated') => void;

export class PhysicsEngineRegistry {
  private static instance: PhysicsEngineRegistry | null = null;
  private listeners: Set<PhysicsRegistryListener> = new Set();

  // Internal registries
  private constants: Map<string, PhysicalConstant> = new Map();
  private structuralMaterials: Map<string, Material> = new Map();
  private certifiedSpecs: Map<string, MaterialSpecification> = new Map();
  private electricalComponents: Map<string, ElectricalComponent> = new Map();
  private vehicleEngines: Map<string, Engine> = new Map();
  private vehicleChassis: Map<string, Chassis> = new Map();

  // Friction and medium coefficients
  private tireFrictionCoefficient = 0.8; // Coulomb friction coefficient mu

  private constructor() {
    this.seedDefaults();
  }

  /**
   * Singleton accessor for global consumption.
   */
  public static getInstance(): PhysicsEngineRegistry {
    if (!PhysicsEngineRegistry.instance) {
      PhysicsEngineRegistry.instance = new PhysicsEngineRegistry();
    }
    return PhysicsEngineRegistry.instance;
  }

  /**
   * Resets singleton instance (useful in test teardowns).
   */
  public static resetInstance(): void {
    PhysicsEngineRegistry.instance = null;
  }

  /**
   * Initializes registries with certified standards and default game catalogs.
   */
  private seedDefaults(): void {
    // Physical constants
    for (const [key, constant] of Object.entries(PHYSICAL_CONSTANTS)) {
      this.constants.set(key, constant);
    }

    // Certified ASME / ASTM material specs
    for (const [key, spec] of Object.entries(CERTIFIED_MATERIALS_REGISTER)) {
      this.certifiedSpecs.set(key, spec);
    }

    // Structural build materials
    for (const [key, mat] of Object.entries(MATERIALS)) {
      this.structuralMaterials.set(key, mat);
    }

    // Electrical components
    for (const [key, comp] of Object.entries(COMPONENTS)) {
      this.electricalComponents.set(key, comp);
    }

    // Vehicle engines and chassis
    for (const [key, eng] of Object.entries(ENGINES)) {
      this.vehicleEngines.set(key, eng);
    }
    for (const [key, ch] of Object.entries(CHASSIS)) {
      this.vehicleChassis.set(key, ch);
    }
  }

  // ==========================================
  // Physical Constants API
  // ==========================================

  public getConstant(key: string): PhysicalConstant | undefined {
    return this.constants.get(key);
  }

  public getConstantValue(key: string, fallback: number = 0): number {
    return this.constants.get(key)?.value ?? fallback;
  }

  public getStandardGravity(): number {
    return this.getConstantValue('STANDARD_GRAVITY', 9.80665);
  }

  public getAirDensity(): number {
    return this.getConstantValue('AIR_DENSITY_SEA_LEVEL', 1.225);
  }

  public getAllConstants(): Record<string, PhysicalConstant> {
    const result: Record<string, PhysicalConstant> = {};
    for (const [k, v] of this.constants.entries()) {
      result[k] = v;
    }
    return result;
  }

  // ==========================================
  // Structural Materials & Mechanics API
  // ==========================================

  public getStructuralMaterial(id: string): Material | undefined {
    return this.structuralMaterials.get(id);
  }

  public getAllStructuralMaterials(): Material[] {
    return Array.from(this.structuralMaterials.values());
  }

  public getCertifiedSpec(id: string): MaterialSpecification | undefined {
    return this.certifiedSpecs.get(id);
  }

  public getAllCertifiedSpecs(): MaterialSpecification[] {
    return Array.from(this.certifiedSpecs.values());
  }

  public getCertifiedSpecsByCategory(
    category: MaterialSpecification['category'],
  ): MaterialSpecification[] {
    return Array.from(this.certifiedSpecs.values()).filter((s) => s.category === category);
  }

  /**
   * Calculates linear thermal expansion elongation:
   * delta_L = alpha * L_0 * delta_T
   * where alpha is the linear thermal expansion coefficient (10^-6 / K)
   */
  public calculateThermalDeformation(
    materialSpecId: string,
    initialLengthM: number,
    deltaTemperatureK: number,
  ): number | null {
    const spec = this.certifiedSpecs.get(materialSpecId);
    if (!spec) return null;
    const alpha = spec.thermalExpansionPpmK * 1e-6;
    return alpha * initialLengthM * deltaTemperatureK;
  }

  // ==========================================
  // Reactive Listener API (for UI synchronization)
  // ==========================================

  public subscribe(listener: PhysicsRegistryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(eventType: 'material_updated' | 'constant_updated' | 'component_updated'): void {
    for (const listener of this.listeners) {
      try {
        listener(eventType);
      } catch (err) {
        console.error('Error in PhysicsRegistryListener', err);
      }
    }
  }

  public registerConstant(key: string, constant: PhysicalConstant): void {
    this.constants.set(key, constant);
    this.notifyListeners('constant_updated');
  }

  public registerStructuralMaterial(material: Material): void {
    this.structuralMaterials.set(material.id, material);
    this.notifyListeners('material_updated');
  }

  public registerCertifiedSpec(spec: MaterialSpecification): void {
    this.certifiedSpecs.set(spec.id, spec);
    this.notifyListeners('material_updated');
  }

  /**
   * Evaluates axial stress, ASME safety factor, deformation, and Euler column buckling (AISC 360-16).
   * P_cr = (pi^2 * E * I) / (K * L)^2
   * For square/circular section approximation: I approx A^2 / 12
   */
  public evaluateStructuralMember(
    materialId: string,
    axialForceN: number,
    lengthM: number,
    effectiveLengthFactorK: number = 1.0,
  ): MechanicalEvaluation | null {
    const mat = this.structuralMaterials.get(materialId);
    if (!mat) return null;

    const stressPa = Math.abs(axialForceN) / mat.area;
    const allowableStressPa = mat.allowableStress;
    let utilization = allowableStressPa > 0 ? stressPa / allowableStressPa : 0;
    let safetyFactor = utilization > 0 ? 1 / utilization : 999;

    let isFailing = utilization > 1.0;
    if (mat.tensionOnly && axialForceN < -1e-6) {
      isFailing = true; // Compression in tension-only cable
    } else if (mat.compressionOnly && axialForceN > 1e-6) {
      isFailing = true; // Tension in compression-only strut
    }

    // Phase 2: Euler Column Buckling for compression members (axialForceN < 0)
    let eulerCriticalLoadN: number | undefined;
    let slendernessRatio: number | undefined;
    let isBuckled = false;

    if (axialForceN < -1e-6 && lengthM > 0) {
      // Area moment of inertia for square solid cross-section with width b = sqrt(A):
      // I = b^4 / 12 = A^2 / 12
      const I = (mat.area * mat.area) / 12;
      const r = Math.sqrt(I / mat.area); // radius of gyration
      slendernessRatio = (effectiveLengthFactorK * lengthM) / r;

      const KL = effectiveLengthFactorK * lengthM;
      eulerCriticalLoadN = (Math.PI * Math.PI * mat.youngsModulus * I) / (KL * KL);

      const compressiveLoadN = Math.abs(axialForceN);
      if (compressiveLoadN > eulerCriticalLoadN) {
        isBuckled = true;
        isFailing = true;
        const bucklingUtilization = compressiveLoadN / eulerCriticalLoadN;
        if (bucklingUtilization > utilization) {
          utilization = bucklingUtilization;
          safetyFactor = 1 / utilization;
        }
      }
    }

    const deformationM = mat.youngsModulus > 0 && mat.area > 0
      ? (axialForceN * lengthM) / (mat.youngsModulus * mat.area)
      : 0;

    return {
      stressPa,
      allowableStressPa,
      utilization,
      safetyFactor,
      isFailing,
      deformationM,
      eulerCriticalLoadN,
      slendernessRatio,
      isBuckled,
    };
  }

  /**
   * Phase 2: Beam Bending Analysis (Simply Supported Beam with Center Point Load)
   * Euler-Bernoulli beam theory:
   * Max Deflection: delta_max = (P * L^3) / (48 * E * I)
   * Max Bending Moment: M_max = (P * L) / 4
   * Max Bending Stress: sigma_max = (M_max * c) / I = (M_max * (h/2)) / I
   */
  public evaluateBeamBending(
    materialSpecId: string,
    spanLengthM: number,
    pointLoadN: number,
    widthM: number = 0.1,
    heightM: number = 0.2,
  ): BeamBendingEvaluation | null {
    const spec = this.certifiedSpecs.get(materialSpecId);
    if (!spec) return null;

    const E = spec.youngsModulusGPa * 1e9;
    const I = (widthM * Math.pow(heightM, 3)) / 12; // m^4
    const area = widthM * heightM;
    const g = this.getStandardGravity();
    const beamMassKg = spec.densityKgM3 * area * spanLengthM;
    const beamWeightN = beamMassKg * g;

    // Combined center load including 50% distributed self-weight equivalent center load
    const totalCenterLoadN = Math.abs(pointLoadN) + 0.5 * beamWeightN;

    const maxDeflectionM = (totalCenterLoadN * Math.pow(spanLengthM, 3)) / (48 * E * I);
    const maxMomentNm = (totalCenterLoadN * spanLengthM) / 4;
    const c = heightM / 2; // extreme fiber distance
    const maxBendingStressPa = (maxMomentNm * c) / I;

    const allowableStressPa = spec.allowableStressMPa * 1e6;
    const utilization = allowableStressPa > 0 ? maxBendingStressPa / allowableStressPa : 0;
    const safetyFactor = utilization > 0 ? 1 / utilization : 999;
    const isFailing = utilization > 1.0;

    return {
      maxDeflectionM,
      maxMomentNm,
      maxBendingStressPa,
      allowableStressPa,
      utilization,
      safetyFactor,
      isFailing,
      weightN: beamWeightN,
    };
  }

  // ==========================================
  // Electrodynamics & Circuit Components API
  // ==========================================

  public getElectricalComponent(id: string): ElectricalComponent | undefined {
    return this.electricalComponents.get(id);
  }

  public registerElectricalComponent(comp: ElectricalComponent): void {
    this.electricalComponents.set(comp.id, comp);
  }

  public getAllElectricalComponents(): ElectricalComponent[] {
    return Array.from(this.electricalComponents.values());
  }

  /**
   * Evaluates Ohm's Law and Joule heating power for an electrical component.
   * V = I * R, P = I^2 * R
   */
  public evaluateElectricalComponent(
    componentId: string,
    currentA: number,
  ): ElectricalEvaluation | null {
    const comp = this.electricalComponents.get(componentId);
    if (!comp) return null;

    const current = Math.abs(currentA);
    const voltageDropV = current * comp.resistance;
    const powerW = current * current * comp.resistance;
    const utilization = comp.maxPower > 0 ? powerW / comp.maxPower : 0;
    const isOverloaded = utilization > 1.0;

    return {
      currentA: current,
      voltageDropV,
      powerW,
      maxPowerW: comp.maxPower,
      utilization,
      isOverloaded,
    };
  }

  // ==========================================
  // Machine Dynamics & Vehicle Traction API
  // ==========================================

  public getEngine(id: string): Engine | undefined {
    return this.vehicleEngines.get(id);
  }

  public registerEngine(engine: Engine): void {
    this.vehicleEngines.set(engine.id, engine);
  }

  public getAllEngines(): Engine[] {
    return Array.from(this.vehicleEngines.values());
  }

  public getChassis(id: string): Chassis | undefined {
    return this.vehicleChassis.get(id);
  }

  public registerChassis(chassis: Chassis): void {
    this.vehicleChassis.set(chassis.id, chassis);
  }

  public getAllChassis(): Chassis[] {
    return Array.from(this.vehicleChassis.values());
  }

  public getTireFrictionCoefficient(): number {
    return this.tireFrictionCoefficient;
  }

  public setTireFrictionCoefficient(mu: number): void {
    this.tireFrictionCoefficient = Math.max(0, mu);
  }

  /**
   * Evaluates machine traction, normal forces, and net acceleration on any incline grade.
   */
  public evaluateMachineTraction(
    engineId: string,
    chassisId: string,
    inclineDegrees: number = 0,
    payloadMassKg: number = 0,
  ): MachineTractionEvaluation | null {
    const engine = this.vehicleEngines.get(engineId);
    const chassis = this.vehicleChassis.get(chassisId);
    if (!engine || !chassis) return null;

    const g = this.getStandardGravity();
    const totalMassKg = chassis.mass + payloadMassKg;
    const thetaRad = (inclineDegrees * Math.PI) / 180;

    const normalForceN = totalMassKg * g * Math.cos(thetaRad);
    const slopeForceN = totalMassKg * g * Math.sin(thetaRad);
    const tractionLimitN = this.tireFrictionCoefficient * normalForceN;

    const isTractionLimited = engine.force > tractionLimitN;
    const effectiveThrustN = isTractionLimited ? tractionLimitN : engine.force;

    const netForceN = effectiveThrustN - slopeForceN;
    const isStalled = netForceN <= 0;
    const netAccelerationMps2 = isStalled ? 0 : netForceN / totalMassKg;

    return {
      totalMassKg,
      normalForceN,
      slopeForceN,
      tractionLimitN,
      effectiveThrustN,
      isTractionLimited,
      netAccelerationMps2,
      isStalled,
    };
  }

  /**
   * Aerodynamic drag calculation following ISO 80000 fluid dynamics:
   * F_d = 0.5 * rho * v^2 * Cd * A
   */
  public calculateAerodynamicDrag(
    speedMps: number,
    dragCoefficient: number = 0.32,
    frontalAreaM2: number = 1.8,
  ): number {
    const rho = this.getAirDensity();
    return 0.5 * rho * (speedMps * speedMps) * dragCoefficient * frontalAreaM2;
  }

  // ==========================================
  // Guild Dimension Register Export API
  // ==========================================

  public exportManifest(
    projectName: string,
    variantId: string,
    entries: GuildDimensionEntry[],
  ): string {
    return exportToGuildRegister(projectName, variantId, entries);
  }
}

// Global default singleton export for direct consumption
export const physicsRegistry = PhysicsEngineRegistry.getInstance();
