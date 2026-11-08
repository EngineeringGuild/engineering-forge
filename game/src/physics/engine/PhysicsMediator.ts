/**
 * PhysicsMediator: UI-to-Registry Reactive State Synchronization Service
 * 
 * Sits cleanly between user interfaces and the PhysicsEngineRegistry,
 * dispatching reactive notifications and keeping metrics overlays and
 * simulation benches in sync with parameter and material updates.
 */

import {
  PhysicsEngineRegistry,
  physicsRegistry,
  type BeamBendingEvaluation,
  type MechanicalEvaluation,
} from './PhysicsEngineRegistry';
import type { MaterialSpecification } from './PhysicsRegistry';

export interface BeamTestBenchState {
  selectedMaterialId: string;
  customModulusGPa: number;
  customDensityKgM3: number;
  customThermalExpansionPpmK: number;
  spanLengthM: number;
  appliedLoadN: number;
  beamWidthM: number;
  beamHeightM: number;
  deltaTemperatureK: number;
}

export type StateChangeCallback = () => void;

export class PhysicsMediator {
  private static instance: PhysicsMediator | null = null;
  private registry: PhysicsEngineRegistry;
  private stateChangeSubscribers: Set<StateChangeCallback> = new Set();

  private testBenchState: BeamTestBenchState = {
    selectedMaterialId: 'structural_steel_a36',
    customModulusGPa: 200,
    customDensityKgM3: 7850,
    customThermalExpansionPpmK: 12.0,
    spanLengthM: 6.0,
    appliedLoadN: 25_000,
    beamWidthM: 0.12,
    beamHeightM: 0.24,
    deltaTemperatureK: 0,
  };

  private constructor() {
    this.registry = physicsRegistry;

    // Listen to registry events and notify UI listeners
    this.registry.subscribe((_eventType) => {
      this.notifySubscribers();
    });
  }

  public static getInstance(): PhysicsMediator {
    if (!PhysicsMediator.instance) {
      PhysicsMediator.instance = new PhysicsMediator();
    }
    return PhysicsMediator.instance;
  }

  public subscribe(callback: StateChangeCallback): () => void {
    this.stateChangeSubscribers.add(callback);
    return () => {
      this.stateChangeSubscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    for (const callback of this.stateChangeSubscribers) {
      try {
        callback();
      } catch (err) {
        console.error('Error in PhysicsMediator subscriber callback', err);
      }
    }
  }

  public getRegistry(): PhysicsEngineRegistry {
    return this.registry;
  }

  public getTestBenchState(): BeamTestBenchState {
    return { ...this.testBenchState };
  }

  public updateTestBenchState(partial: Partial<BeamTestBenchState>): void {
    const prevState = { ...this.testBenchState };
    this.testBenchState = { ...this.testBenchState, ...partial };

    // If material selection changed, populate custom fields from the certified specification
    if (partial.selectedMaterialId && partial.selectedMaterialId !== prevState.selectedMaterialId) {
      const spec = this.registry.getCertifiedSpec(partial.selectedMaterialId);
      if (spec) {
        this.testBenchState.customModulusGPa = spec.youngsModulusGPa;
        this.testBenchState.customDensityKgM3 = spec.densityKgM3;
        this.testBenchState.customThermalExpansionPpmK = spec.thermalExpansionPpmK;
      }
    }

    this.syncCustomMaterialToRegistry();
    this.notifySubscribers();
  }

  /**
   * Applies custom properties from the test bench into the registry for live recalculation.
   */
  public syncCustomMaterialToRegistry(): void {
    const spec = this.registry.getCertifiedSpec(this.testBenchState.selectedMaterialId);
    if (!spec) return;

    // Check if values actually changed before writing to registry to prevent feedback loops
    if (
      spec.youngsModulusGPa === this.testBenchState.customModulusGPa &&
      spec.densityKgM3 === this.testBenchState.customDensityKgM3 &&
      spec.thermalExpansionPpmK === this.testBenchState.customThermalExpansionPpmK
    ) {
      return;
    }

    const updatedSpec: MaterialSpecification = {
      ...spec,
      youngsModulusGPa: this.testBenchState.customModulusGPa,
      densityKgM3: this.testBenchState.customDensityKgM3,
      thermalExpansionPpmK: this.testBenchState.customThermalExpansionPpmK,
    };

    this.registry.registerCertifiedSpec(updatedSpec);
  }

  /**
   * Evaluates the active beam configuration on the test bench.
   */
  public evaluateActiveBeam(): BeamBendingEvaluation | null {
    return this.registry.evaluateBeamBending(
      this.testBenchState.selectedMaterialId,
      this.testBenchState.spanLengthM,
      this.testBenchState.appliedLoadN,
      this.testBenchState.beamWidthM,
      this.testBenchState.beamHeightM,
    );
  }

  /**
   * Evaluates thermal elongation for the current bench beam.
   */
  public evaluateActiveBeamThermalExpansion(): number | null {
    return this.registry.calculateThermalDeformation(
      this.testBenchState.selectedMaterialId,
      this.testBenchState.spanLengthM,
      this.testBenchState.deltaTemperatureK,
    );
  }

  /**
   * Evaluates a member with Euler Buckling support for Phase 2.
   */
  public evaluateColumnBuckling(
    materialId: string,
    compressiveForceN: number,
    lengthM: number,
    kFactor: number = 1.0,
  ): MechanicalEvaluation | null {
    return this.registry.evaluateStructuralMember(
      materialId,
      -Math.abs(compressiveForceN),
      lengthM,
      kFactor,
    );
  }

  /**
   * Phase 3: Evaluates Joule heating, temperature rise, and constrained thermal stress
   */
  public evaluateElectroThermalCoupling(
    materialSpecId: string,
    currentA: number,
    axialForceN: number,
    lengthM: number,
    crossSectionAreaM2: number,
    durationSeconds: number = 1.0,
    ambientTempK: number = 293.15,
    endConstraintRatio: number = 1.0,
  ) {
    return this.registry.evaluateElectroThermalStructuralCoupling(
      materialSpecId,
      currentA,
      axialForceN,
      lengthM,
      crossSectionAreaM2,
      durationSeconds,
      ambientTempK,
      endConstraintRatio,
    );
  }

  /**
   * Phase 3: Evaluates Aerodynamic Dynamic Pressure, Drag, and Cross-Wind Truss Thrust
   */
  public evaluateFsi(
    relativeAirSpeedMps: number,
    dragCoefficientCd: number = 0.32,
    liftCoefficientCl: number = 0.15,
    referenceAreaM2: number = 1.8,
    crossWindSpeedMps: number = 0,
    bridgeExposedAreaM2: number = 0,
  ) {
    return this.registry.evaluateFluidStructureInteraction(
      relativeAirSpeedMps,
      dragCoefficientCd,
      liftCoefficientCl,
      referenceAreaM2,
      crossWindSpeedMps,
      bridgeExposedAreaM2,
    );
  }
}

export const physicsMediator = PhysicsMediator.getInstance();
