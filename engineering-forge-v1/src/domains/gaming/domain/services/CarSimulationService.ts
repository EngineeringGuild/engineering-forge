// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/CarSimulationService.ts

import { Component } from "../entities/Component";
import { PerformanceMetrics } from "../value-objects/PerformanceMetrics";
import { PositionVO } from "../value-objects/Position";
import { PerformanceCalculator } from "./performance/PerformanceCalculator";
import {
  SimulationConfig,
  SimulationRunner,
  SimulationStepData,
} from "./simulation/SimulationRunner";

/**
 * Car Simulation Result Interface
 * Represents the result of a car simulation run
 */
export interface CarSimulationResult {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  distance: number; // in meters
  maxSpeed: number; // in km/h
  averageSpeed: number; // in km/h
  finalPerformance: PerformanceMetrics;
  score: number; // 0-100
  passed: boolean;
  simulationSteps: SimulationStep[];
}

/**
 * Simulation Step Interface
 * Represents a single step in the simulation
 */
export interface SimulationStep {
  timestamp: number; // in seconds
  position: PositionVO;
  speed: number; // in km/h
  acceleration: number; // in m/s²
  performance: PerformanceMetrics;
}

/**
 * Car Simulation Service
 * Modular car simulation service using specialized components
 *
 * This service is responsible for:
 * - Coordinating modular simulation components
 * - Running car simulations based on components
 * - Generating simulation results
 * - Managing simulation state
 */
export class CarSimulationService {
  private simulationRunner: SimulationRunner;
  private performanceCalculator: PerformanceCalculator;
  private defaultConfig: SimulationConfig = {
    trackLength: 1000, // 1km track
    maxSimulationTime: 30, // 30 seconds max (consistente com SimulationRunner)
    timeStep: 0.1, // 100ms steps
    enablePhysics: true,
    enableDrag: true,
    enableFriction: true,
  };

  constructor() {
    this.simulationRunner = new SimulationRunner(this.defaultConfig);
    this.performanceCalculator = new PerformanceCalculator();
  }

  /**
   * Run a complete car simulation
   * @param components - Array of car components
   * @param config - Optional simulation configuration
   * @returns Promise<CarSimulationResult>
   */
  async runSimulation(
    components: Component[],
    config?: Partial<SimulationConfig>
  ): Promise<CarSimulationResult> {
    // Update configuration if provided
    if (config) {
      this.simulationRunner.updateConfig(config);
    }

    // Validate components
    this.validateComponents(components);

    // Initialize simulation
    const simulationId = this.generateSimulationId();
    const startTime = new Date();

    // Run simulation using modular components
    const simulationSteps = await this.simulationRunner.runSimulation(
      components
    );

    // Calculate final results
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    const result = this.calculateSimulationResult(
      simulationId,
      startTime,
      endTime,
      duration,
      simulationSteps,
      this.simulationRunner.getConfig()
    );

    return result;
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
   * Calculate final simulation result
   * @param simulationId - Unique simulation ID
   * @param startTime - Simulation start time
   * @param endTime - Simulation end time
   * @param duration - Simulation duration
   * @param steps - Simulation steps data
   * @param config - Simulation configuration
   * @returns CarSimulationResult
   */
  private calculateSimulationResult(
    simulationId: string,
    startTime: Date,
    endTime: Date,
    duration: number,
    steps: SimulationStepData[],
    config: SimulationConfig
  ): CarSimulationResult {
    if (steps.length === 0) {
      throw new Error("No simulation steps generated");
    }

    const lastStep = steps[steps.length - 1];
    if (!lastStep) {
      throw new Error("Invalid simulation steps");
    }

    const maxSpeed = Math.max(...steps.map((s) => s.speed));
    const averageSpeed =
      steps.reduce((sum, s) => sum + s.speed, 0) / steps.length;

    // Calculate score using performance calculator
    const performanceContext = {
      initialPerformance: lastStep.performance,
      currentSpeed: lastStep.speed,
      currentDistance: lastStep.position.x,
      totalDistance: config.trackLength,
      timeElapsed: lastStep.timestamp,
    };

    const score = this.performanceCalculator.calculateFinalScore(
      performanceContext,
      config.trackLength
    );
    const passed = score >= 60; // Pass if score >= 60

    // Convert SimulationStepData to SimulationStep
    const simulationSteps: SimulationStep[] = steps.map((step) => ({
      timestamp: step.timestamp,
      position: new PositionVO(step.position.x, step.position.y),
      speed: step.speed,
      acceleration: step.acceleration,
      performance: step.performance,
    }));

    return {
      id: simulationId,
      startTime,
      endTime,
      duration,
      distance: lastStep.position.x,
      maxSpeed,
      averageSpeed,
      finalPerformance: lastStep.performance,
      score,
      passed,
      simulationSteps,
    };
  }

  /**
   * Generate unique simulation ID
   * @returns Unique simulation ID
   */
  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get simulation runner instance
   * @returns Simulation runner instance
   */
  getSimulationRunner(): SimulationRunner {
    return this.simulationRunner;
  }

  /**
   * Get performance calculator instance
   * @returns Performance calculator instance
   */
  getPerformanceCalculator(): PerformanceCalculator {
    return this.performanceCalculator;
  }

  /**
   * Get default simulation configuration
   * @returns Default simulation configuration
   */
  getDefaultConfig(): SimulationConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Update simulation configuration
   * @param config - New configuration parameters
   */
  updateConfig(config: Partial<SimulationConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    this.simulationRunner.updateConfig(this.defaultConfig);
  }

  /**
   * Validate simulation configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  validateConfig(config: Partial<SimulationConfig>): void {
    if (config.trackLength && config.trackLength <= 0) {
      throw new Error("Track length must be positive");
    }
    if (config.maxSimulationTime && config.maxSimulationTime <= 0) {
      throw new Error("Max simulation time must be positive");
    }
    if (
      config.timeStep !== undefined &&
      (config.timeStep <= 0 || config.timeStep > 1)
    ) {
      throw new Error("Time step must be between 0 and 1 seconds");
    }
  }

  /**
   * Get simulation statistics
   * @param result - Simulation result
   * @returns Simulation statistics
   */
  getSimulationStatistics(result: CarSimulationResult): {
    totalSteps: number;
    averageTimePerStep: number;
    maxAcceleration: number;
    minSpeed: number;
    efficiency: number;
    powerToWeightRatio: number;
  } {
    const steps = result.simulationSteps;
    const maxAcceleration = Math.max(...steps.map((s) => s.acceleration));
    const minSpeed = Math.min(...steps.map((s) => s.speed));
    const averageTimePerStep = result.duration / steps.length;
    const efficiency = result.finalPerformance.fuelEfficiency;
    const powerToWeightRatio =
      result.finalPerformance.power / result.finalPerformance.weight;

    return {
      totalSteps: steps.length,
      averageTimePerStep,
      maxAcceleration,
      minSpeed,
      efficiency,
      powerToWeightRatio,
    };
  }

  /**
   * Get performance recommendations
   * @param result - Simulation result
   * @returns Array of improvement recommendations
   */
  getPerformanceRecommendations(result: CarSimulationResult): string[] {
    const recommendations: string[] = [];

    if (result.score < 60) {
      recommendations.push("Overall performance needs significant improvement");
    }

    if (result.maxSpeed < 50) {
      recommendations.push("Consider upgrading engine for better top speed");
    }

    if (result.finalPerformance.acceleration < 30) {
      recommendations.push(
        "Improve acceleration by reducing weight or increasing power"
      );
    }

    if (result.finalPerformance.handling < 40) {
      recommendations.push("Upgrade suspension and tires for better handling");
    }

    if (result.finalPerformance.fuelEfficiency < 5) {
      recommendations.push("Optimize components for better fuel efficiency");
    }

    if (result.distance < 500) {
      recommendations.push(
        "Increase power or reduce weight to achieve better distance"
      );
    }

    return recommendations;
  }
}
