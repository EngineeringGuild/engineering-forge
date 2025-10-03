// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/simulation/SimulationRunner.ts

import { Component } from "../../entities/Component";
import { PerformanceMetrics } from "../../value-objects/PerformanceMetrics";
import {
  PerformanceCalculator,
  PerformanceContext,
} from "../performance/PerformanceCalculator";
import { ForceCalculator, ForceResult } from "../physics/ForceCalculator";
import { PhysicsEngine, PhysicsState } from "../physics/PhysicsEngine";

/**
 * Simulation Configuration Interface
 * Configuration for simulation parameters
 */
export interface SimulationConfig {
  trackLength: number; // meters
  maxSimulationTime: number; // seconds
  timeStep: number; // seconds
  enablePhysics: boolean;
  enableDrag: boolean;
  enableFriction: boolean;
}

/**
 * Simulation Step Data Interface
 * Data for a single simulation step
 */
export interface SimulationStepData {
  timestamp: number;
  position: { x: number; y: number };
  speed: number; // km/h
  acceleration: number; // m/s²
  performance: PerformanceMetrics;
  forces: ForceResult;
  physicsState: PhysicsState;
}

/**
 * Simulation Runner
 * Orchestrates the entire simulation process
 *
 * This runner is responsible for:
 * - Coordinating physics, forces, and performance calculations
 * - Running the simulation loop
 * - Generating simulation steps
 * - Managing simulation state and progress
 */
export class SimulationRunner {
  private physicsEngine: PhysicsEngine;
  private forceCalculator: ForceCalculator;
  private performanceCalculator: PerformanceCalculator;
  private config: SimulationConfig;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      trackLength: 1000,
      maxSimulationTime: 30, // 30 segundos
      timeStep: 0.1, // 0.1 segundos (10 FPS) - mais estável
      enablePhysics: true,
      enableDrag: true,
      enableFriction: true,
      ...config,
    };

    this.physicsEngine = new PhysicsEngine({
      timeStep: this.config.timeStep,
      enableDrag: this.config.enableDrag,
      enableFriction: this.config.enableFriction,
    });

    this.forceCalculator = new ForceCalculator();
    this.performanceCalculator = new PerformanceCalculator();
  }

  /**
   * Run complete simulation
   * @param components - Car components
   * @returns Array of simulation steps
   */
  async runSimulation(components: Component[]): Promise<SimulationStepData[]> {
    // Validate components
    this.validateComponents(components);

    // Calculate initial performance
    const initialPerformance =
      this.performanceCalculator.calculateInitialPerformance(components);

    // Initialize simulation state
    const physicsState = this.physicsEngine.createInitialState();
    const steps: SimulationStepData[] = [];

    // Calculate car properties
    const carProperties = this.calculateCarProperties(components);

    console.log(
      `📊 Car properties - Weight: ${carProperties.weight}kg, Power: ${carProperties.power}hp`
    );

    // Simulation loop
    let stepCount = 0;
    const startTime = Date.now();
    while (this.shouldContinueSimulation(physicsState)) {
      stepCount++;

      // Debug log every 100 steps
      if (stepCount % 100 === 0) {
        console.log(
          `🔄 Simulation step ${stepCount}: distance=${physicsState.distance.toFixed(
            1
          )}m, speed=${this.physicsEngine
            .velocityToKmh(physicsState.velocity)
            .toFixed(1)}km/h, time=${physicsState.time.toFixed(1)}s`
        );
      }

      // Calculate forces
      const forces = this.forceCalculator.calculateForces(
        components,
        physicsState.velocity,
        this.config.enableDrag,
        this.config.enableFriction
      );

      // Update physics state
      const newPhysicsState = this.physicsEngine.updateState(
        physicsState,
        forces.netForce,
        carProperties.weight
      );

      // Calculate performance context
      const performanceContext: PerformanceContext = {
        initialPerformance,
        currentSpeed: this.physicsEngine.velocityToKmh(
          newPhysicsState.velocity
        ),
        currentDistance: newPhysicsState.distance,
        totalDistance: this.config.trackLength,
        timeElapsed: newPhysicsState.time,
      };

      // Update performance
      const currentPerformance =
        this.performanceCalculator.updatePerformance(performanceContext);

      // Create simulation step
      const stepData: SimulationStepData = {
        timestamp: newPhysicsState.time,
        position: {
          x: newPhysicsState.position.x,
          y: newPhysicsState.position.y,
        },
        speed: this.physicsEngine.velocityToKmh(newPhysicsState.velocity),
        acceleration: newPhysicsState.acceleration,
        performance: currentPerformance,
        forces,
        physicsState: newPhysicsState,
      };

      steps.push(stepData);

      // Update state for next iteration
      Object.assign(physicsState, newPhysicsState);

      // Safety check to prevent infinite loops
      if (steps.length > 300) {
        // 300 steps (30s * 10fps) - mais razoável
        console.warn("⚠️ Simulation stopped - too many steps");
        break;
      }
    }

    const maxSpeed = Math.max(...steps.map((s) => s.speed));
    const avgSpeed = steps.reduce((sum, s) => sum + s.speed, 0) / steps.length;
    const simulationTime = Date.now() - startTime;

    console.log(
      `✅ Simulation completed - ${
        steps.length
      } steps in ${simulationTime}ms, final distance: ${physicsState.distance.toFixed(
        1
      )}m, max speed: ${maxSpeed.toFixed(1)}km/h, avg speed: ${avgSpeed.toFixed(
        1
      )}km/h`
    );

    return steps;
  }

  /**
   * Validate that all required components are present
   * @param components - Array of components to validate
   * @throws Error if validation fails
   */
  private validateComponents(components: Component[]): void {
    const hasChassis = components.some((c) => c.type === "chassis");
    const hasEngine = components.some((c) => c.type === "engine");
    const hasWheels = components.some((c) => c.type === "wheels");

    if (!hasChassis || !hasEngine || !hasWheels) {
      const missing = [];
      if (!hasChassis) missing.push("chassis");
      if (!hasEngine) missing.push("engine");
      if (!hasWheels) missing.push("wheels");
      throw new Error(
        `Car must have chassis, engine, and wheels to run simulation. Missing: ${missing.join(
          ", "
        )}`
      );
    }
  }

  /**
   * Calculate car properties from components
   * @param components - Car components
   * @returns Car properties object
   */
  private calculateCarProperties(components: Component[]): {
    power: number;
    weight: number;
    efficiency: number;
  } {
    let totalPower = 0;
    let totalWeight = 0;
    let totalEfficiency = 0;
    let componentCount = 0;

    components.forEach((component) => {
      totalPower += component.properties.power || 0;
      totalWeight += component.properties.weight || 0;
      totalEfficiency += component.properties.efficiency || 0;
      componentCount++;
    });

    // Ensure minimum values for realistic simulation
    totalWeight = Math.max(totalWeight, 100); // Minimum 100kg
    totalPower = Math.max(totalPower, 10); // Minimum 10hp

    return {
      power: totalPower,
      weight: totalWeight,
      efficiency: componentCount > 0 ? totalEfficiency / componentCount : 50,
    };
  }

  /**
   * Check if simulation should continue
   * @param physicsState - Current physics state
   * @returns True if simulation should continue
   */
  private shouldContinueSimulation(physicsState: PhysicsState): boolean {
    // Check time limit
    if (
      this.physicsEngine.hasExceededTimeLimit(
        physicsState.time,
        this.config.maxSimulationTime
      )
    ) {
      return false;
    }

    // Check distance limit
    if (
      this.physicsEngine.hasReachedTarget(
        physicsState.distance,
        this.config.trackLength
      )
    ) {
      return false;
    }

    // Check if car is moving (prevent infinite loops with stationary cars)
    // Only stop if car has been stationary for a long time AND has moved very little
    if (
      physicsState.velocity < 0.01 &&
      physicsState.time > 10 &&
      physicsState.distance < 10
    ) {
      console.warn(
        "⚠️ Simulation stopped - car not moving after 10s and <10m distance"
      );
      return false;
    }

    return true;
  }

  /**
   * Get simulation configuration
   * @returns Current simulation configuration
   */
  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  /**
   * Update simulation configuration
   * @param newConfig - New configuration parameters
   */
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update sub-services with new configuration
    this.physicsEngine.updateConfig({
      timeStep: this.config.timeStep,
      enableDrag: this.config.enableDrag,
      enableFriction: this.config.enableFriction,
    });
  }

  /**
   * Get physics engine instance
   * @returns Physics engine instance
   */
  getPhysicsEngine(): PhysicsEngine {
    return this.physicsEngine;
  }

  /**
   * Get force calculator instance
   * @returns Force calculator instance
   */
  getForceCalculator(): ForceCalculator {
    return this.forceCalculator;
  }

  /**
   * Get performance calculator instance
   * @returns Performance calculator instance
   */
  getPerformanceCalculator(): PerformanceCalculator {
    return this.performanceCalculator;
  }
}
