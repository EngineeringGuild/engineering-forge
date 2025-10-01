// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/CarSimulationService.ts

import { Component } from '../entities/Component';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';
import { Position, PositionVO } from '../value-objects/Position';

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
  position: Position;
  speed: number; // in km/h
  acceleration: number; // in m/s²
  performance: PerformanceMetrics;
}

/**
 * Simulation Configuration Interface
 * Configuration for car simulation parameters
 */
export interface SimulationConfig {
  trackLength: number; // in meters
  maxSimulationTime: number; // in seconds
  timeStep: number; // in seconds
  gravity: number; // in m/s²
  airDensity: number; // in kg/m³
  frictionCoefficient: number;
  enablePhysics: boolean;
  enableDrag: boolean;
}

/**
 * Car Simulation Service
 * Handles car simulation logic following DDD patterns
 *
 * This service is responsible for:
 * - Running car simulations based on components
 * - Calculating physics and performance
 * - Generating simulation results
 * - Managing simulation state
 */
export class CarSimulationService {
  private defaultConfig: SimulationConfig = {
    trackLength: 1000, // 1km track
    maxSimulationTime: 60, // 60 seconds max
    timeStep: 0.1, // 100ms steps
    gravity: 9.81,
    airDensity: 1.225, // Sea level air density
    frictionCoefficient: 0.7,
    enablePhysics: true,
    enableDrag: true
  };

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
    const simulationConfig = { ...this.defaultConfig, ...config };

    // Validate components
    this.validateComponents(components);

    // Calculate initial performance
    const initialPerformance = this.calculateInitialPerformance(components);

    // Initialize simulation
    const simulationId = this.generateSimulationId();
    const startTime = new Date();

    // Run simulation steps
    const simulationSteps = this.runSimulationSteps(
      components,
      initialPerformance,
      simulationConfig
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
      simulationConfig
    );

    return result;
  }

  /**
   * Validate that all required components are present
   * @param components - Array of components to validate
   * @throws Error if validation fails
   */
  private validateComponents(components: Component[]): void {
    const hasChassis = components.some(c => c.type === 'chassis');
    const hasEngine = components.some(c => c.type === 'engine');
    const hasWheels = components.some(c => c.type === 'wheels');

    if (!hasChassis || !hasEngine || !hasWheels) {
      throw new Error('Car must have chassis, engine, and wheels to run simulation');
    }
  }

  /**
   * Calculate initial performance based on components
   * @param components - Array of car components
   * @returns PerformanceMetrics
   */
  private calculateInitialPerformance(components: Component[]): PerformanceMetrics {
    let totalPower = 0;
    let totalWeight = 0;
    let totalEfficiency = 0;
    let componentCount = 0;

    components.forEach(component => {
      totalPower += component.properties.power || 0;
      totalWeight += component.properties.weight || 0;
      totalEfficiency += component.properties.efficiency || 0;
      componentCount++;
    });

    // Calculate derived metrics
    const powerToWeightRatio = totalWeight > 0 ? totalPower / totalWeight : 0;
    const averageEfficiency = componentCount > 0 ? totalEfficiency / componentCount : 0;

    // Estimate performance metrics
    const acceleration = Math.min(100, powerToWeightRatio * 10);
    const topSpeed = Math.min(300, Math.sqrt(totalPower * 2));
    const handling = Math.min(100, averageEfficiency * 1.2);
    const fuelEfficiency = Math.min(20, averageEfficiency * 0.5);

    const overall = (acceleration + topSpeed + handling + fuelEfficiency) / 4;

    return new PerformanceMetrics({
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency,
      weight: totalWeight,
      power: totalPower,
      torque: totalPower * 0.8, // Estimate torque from power
      overall
    });
  }

  /**
   * Run simulation steps
   * @param components - Car components
   * @param initialPerformance - Initial performance metrics
   * @param config - Simulation configuration
   * @returns Array of simulation steps
   */
  private runSimulationSteps(
    components: Component[],
    initialPerformance: PerformanceMetrics,
    config: SimulationConfig
  ): SimulationStep[] {
    const steps: SimulationStep[] = [];

    let currentTime = 0;
    let currentSpeed = 0; // km/h
    let currentDistance = 0; // meters
    let currentPosition = new PositionVO(0, 0);

    // Calculate car properties
    const totalWeight = components.reduce((sum, c) => sum + (c.properties.weight || 0), 0);
    const totalPower = components.reduce((sum, c) => sum + (c.properties.power || 0), 0);

    // Simulation loop
    while (currentTime < config.maxSimulationTime && currentDistance < config.trackLength) {
      // Calculate forces
      const engineForce = this.calculateEngineForce(totalPower, currentSpeed);
      const dragForce = config.enableDrag
        ? this.calculateDragForce(currentSpeed, config.airDensity)
        : 0;
      const frictionForce = this.calculateFrictionForce(totalWeight, config.frictionCoefficient);

      // Calculate net force and acceleration
      const netForce = engineForce - dragForce - frictionForce;
      const acceleration = netForce / totalWeight; // m/s²

      // Update physics
      currentSpeed += acceleration * config.timeStep * 3.6; // Convert to km/h
      currentSpeed = Math.max(0, currentSpeed); // Don't go backwards

      const distanceIncrement = (currentSpeed / 3.6) * config.timeStep; // Convert to m/s
      currentDistance += distanceIncrement;

      // Update position (simplified 2D movement)
      currentPosition = new PositionVO(currentDistance, 0);

      // Create simulation step
      const step: SimulationStep = {
        timestamp: currentTime,
        position: currentPosition,
        speed: currentSpeed,
        acceleration: acceleration,
        performance: this.calculateStepPerformance(
          initialPerformance,
          currentSpeed,
          currentDistance
        )
      };

      steps.push(step);

      currentTime += config.timeStep;

      // Stop if we've reached the end
      if (currentDistance >= config.trackLength) {
        break;
      }
    }

    return steps;
  }

  /**
   * Calculate engine force based on power and current speed
   * @param power - Engine power in hp
   * @param speed - Current speed in km/h
   * @returns Force in Newtons
   */
  private calculateEngineForce(power: number, speed: number): number {
    // Convert hp to watts
    const powerWatts = power * 746;

    // Calculate force based on power and speed
    const speedMs = speed / 3.6; // Convert km/h to m/s
    const force = speedMs > 0 ? powerWatts / speedMs : powerWatts * 10; // High force at low speeds

    return force;
  }

  /**
   * Calculate drag force based on speed and air density
   * @param speed - Current speed in km/h
   * @param airDensity - Air density in kg/m³
   * @returns Drag force in Newtons
   */
  private calculateDragForce(speed: number, airDensity: number): number {
    const speedMs = speed / 3.6; // Convert km/h to m/s
    const dragCoefficient = 0.3; // Typical car drag coefficient
    const frontalArea = 2.5; // m² - typical car frontal area

    return 0.5 * dragCoefficient * airDensity * frontalArea * speedMs * speedMs;
  }

  /**
   * Calculate friction force
   * @param weight - Car weight in kg
   * @param frictionCoefficient - Friction coefficient
   * @returns Friction force in Newtons
   */
  private calculateFrictionForce(weight: number, frictionCoefficient: number): number {
    return weight * this.defaultConfig.gravity * frictionCoefficient * 0.1; // Reduced for rolling friction
  }

  /**
   * Calculate performance for a simulation step
   * @param initialPerformance - Initial performance metrics
   * @param currentSpeed - Current speed
   * @param currentDistance - Current distance
   * @returns Updated performance metrics
   */
  private calculateStepPerformance(
    initialPerformance: PerformanceMetrics,
    currentSpeed: number,
    currentDistance: number
  ): PerformanceMetrics {
    // Adjust performance based on current state
    const speedFactor = Math.min(1, currentSpeed / 100); // Normalize speed factor
    // const distanceFactor = Math.min(1, currentDistance / 1000); // Normalize distance factor

    return new PerformanceMetrics({
      acceleration: initialPerformance.acceleration * (1 + speedFactor * 0.1),
      topSpeed: Math.max(initialPerformance.topSpeed, currentSpeed),
      handling: initialPerformance.handling * (1 - speedFactor * 0.05), // Handling decreases at high speeds
      fuelEfficiency: initialPerformance.fuelEfficiency * (1 - speedFactor * 0.2), // Efficiency decreases at high speeds
      weight: initialPerformance.weight,
      power: initialPerformance.power,
      torque: initialPerformance.torque,
      overall: (initialPerformance.overall + speedFactor * 10) / 2
    });
  }

  /**
   * Calculate final simulation result
   * @param simulationId - Unique simulation ID
   * @param startTime - Simulation start time
   * @param endTime - Simulation end time
   * @param duration - Simulation duration
   * @param steps - Simulation steps
   * @param config - Simulation configuration
   * @returns CarSimulationResult
   */
  private calculateSimulationResult(
    simulationId: string,
    startTime: Date,
    endTime: Date,
    duration: number,
    steps: SimulationStep[],
    config: SimulationConfig
  ): CarSimulationResult {
    if (steps.length === 0) {
      throw new Error('No simulation steps generated');
    }

    const lastStep = steps[steps.length - 1];
    if (!lastStep) {
      throw new Error('Invalid simulation steps');
    }

    const maxSpeed = Math.max(...steps.map(s => s.speed));
    const averageSpeed = steps.reduce((sum, s) => sum + s.speed, 0) / steps.length;

    // Calculate score based on performance
    const distanceScore = Math.min(100, (lastStep.position.x / config.trackLength) * 100);
    const speedScore = Math.min(100, (maxSpeed / 200) * 100); // Normalize to 200 km/h
    const efficiencyScore = Math.min(100, lastStep.performance.fuelEfficiency * 5); // Normalize to 20 km/l

    const totalScore = (distanceScore + speedScore + efficiencyScore) / 3;
    const passed = totalScore >= 60; // Pass if score >= 60

    return {
      id: simulationId,
      startTime,
      endTime,
      duration,
      distance: lastStep.position.x,
      maxSpeed,
      averageSpeed,
      finalPerformance: lastStep.performance,
      score: Math.round(totalScore),
      passed,
      simulationSteps: steps
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
   * Get default simulation configuration
   * @returns Default simulation configuration
   */
  getDefaultConfig(): SimulationConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Validate simulation configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  validateConfig(config: Partial<SimulationConfig>): void {
    if (config.trackLength && config.trackLength <= 0) {
      throw new Error('Track length must be positive');
    }
    if (config.maxSimulationTime && config.maxSimulationTime <= 0) {
      throw new Error('Max simulation time must be positive');
    }
    if (config.timeStep !== undefined && (config.timeStep <= 0 || config.timeStep > 1)) {
      throw new Error('Time step must be between 0 and 1 seconds');
    }
  }
}
