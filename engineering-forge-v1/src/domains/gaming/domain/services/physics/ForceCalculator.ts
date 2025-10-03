// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/physics/ForceCalculator.ts

import { Component } from "../../entities/Component";

/**
 * Force Configuration Interface
 * Configuration for force calculations
 */
export interface ForceConfig {
  dragCoefficient: number;
  frontalArea: number; // m²
  airDensity: number; // kg/m³
  frictionCoefficient: number;
  gravity: number; // m/s²
}

/**
 * Force Result Interface
 * Result of force calculations
 */
export interface ForceResult {
  engineForce: number; // Newtons
  dragForce: number; // Newtons
  frictionForce: number; // Newtons
  netForce: number; // Newtons
}

/**
 * Force Calculator
 * Handles all force calculations for car simulation
 *
 * This calculator is responsible for:
 * - Calculating engine force based on power and speed
 * - Calculating drag force based on speed and air resistance
 * - Calculating friction force based on weight and surface
 * - Combining all forces to get net force
 */
export class ForceCalculator {
  private config: ForceConfig;

  constructor(config: Partial<ForceConfig> = {}) {
    this.config = {
      dragCoefficient: 0.3,
      frontalArea: 2.5,
      airDensity: 1.225,
      frictionCoefficient: 0.7,
      gravity: 9.81,
      ...config,
    };
  }

  /**
   * Calculate all forces acting on the car
   * @param components - Car components
   * @param velocity - Current velocity in m/s
   * @param enableDrag - Whether to include drag force
   * @param enableFriction - Whether to include friction force
   * @returns Force calculation result
   */
  calculateForces(
    components: Component[],
    velocity: number,
    enableDrag: boolean = true,
    enableFriction: boolean = true
  ): ForceResult {
    const carProperties = this.calculateCarProperties(components);

    const engineForce = this.calculateEngineForce(
      carProperties.power,
      velocity
    );
    const dragForce = enableDrag ? this.calculateDragForce(velocity) : 0;
    const frictionForce = enableFriction
      ? this.calculateFrictionForce(carProperties.weight)
      : 0;

    const netForce = engineForce - dragForce - frictionForce;

    return {
      engineForce,
      dragForce,
      frictionForce,
      netForce,
    };
  }

  /**
   * Calculate engine force based on power and velocity
   * @param power - Engine power in hp
   * @param velocity - Current velocity in m/s
   * @returns Engine force in Newtons
   */
  calculateEngineForce(power: number, velocity: number): number {
    if (power <= 0) return 0;

    // Convert hp to watts
    const powerWatts = power * 746;

    // Calculate force based on power and velocity
    // At very low speeds, provide maximum torque (realistic engine behavior)
    let force: number;
    if (velocity < 1.0) {
      // Maximum force at very low speeds (standing start)
      // Use realistic torque multiplier for low speeds
      force = powerWatts * 0.8; // Higher multiplier for starting force
    } else {
      // Force = Power / Velocity (correct physics formula)
      // Apply realistic scaling factor
      force = powerWatts / Math.max(velocity, 0.5);
    }

    // Ensure minimum force for movement
    const minForce = powerWatts * 0.1; // Minimum force to ensure movement
    force = Math.max(force, minForce);

    // Cap the force to prevent unrealistic values
    const maxForce = powerWatts * 1.5; // Realistic maximum force cap
    return Math.min(force, maxForce);
  }

  /**
   * Calculate drag force based on velocity
   * @param velocity - Current velocity in m/s
   * @returns Drag force in Newtons
   */
  calculateDragForce(velocity: number): number {
    if (velocity <= 0) return 0;

    // Drag force is proportional to the square of velocity
    return (
      0.5 *
      this.config.dragCoefficient *
      this.config.airDensity *
      this.config.frontalArea *
      velocity *
      velocity
    );
  }

  /**
   * Calculate friction force based on weight
   * @param weight - Car weight in kg
   * @returns Friction force in Newtons
   */
  calculateFrictionForce(weight: number): number {
    if (weight <= 0) return 0;

    // Rolling resistance is much lower than static friction
    return (
      weight * this.config.gravity * this.config.frictionCoefficient * 0.01
    );
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
   * Calculate power-to-weight ratio
   * @param power - Engine power in hp
   * @param weight - Car weight in kg
   * @returns Power-to-weight ratio
   */
  calculatePowerToWeightRatio(power: number, weight: number): number {
    return weight > 0 ? power / weight : 0;
  }

  /**
   * Calculate torque from power and RPM
   * @param power - Engine power in hp
   * @param rpm - Engine RPM
   * @returns Torque in N⋅m
   */
  calculateTorque(power: number, rpm: number = 5000): number {
    if (rpm <= 0) return 0;

    // Convert hp to watts, then to torque
    const powerWatts = power * 746;
    return (powerWatts * 60) / (2 * Math.PI * rpm);
  }

  /**
   * Calculate force required to maintain constant velocity
   * @param velocity - Target velocity in m/s
   * @param weight - Car weight in kg
   * @returns Required force in Newtons
   */
  calculateForceForConstantVelocity(velocity: number, weight: number): number {
    const dragForce = this.calculateDragForce(velocity);
    const frictionForce = this.calculateFrictionForce(weight);
    return dragForce + frictionForce;
  }

  /**
   * Calculate maximum theoretical speed
   * @param power - Engine power in hp
   * @param weight - Car weight in kg
   * @returns Maximum speed in m/s
   */
  calculateMaxSpeed(power: number, weight: number): number {
    if (power <= 0 || weight <= 0) return 0;

    // Solve for velocity where engine force equals drag + friction
    const powerWatts = power * 746;
    const dragCoeff =
      this.config.dragCoefficient *
      this.config.airDensity *
      this.config.frontalArea;
    const frictionCoeff =
      weight * this.config.gravity * this.config.frictionCoefficient * 0.01;

    // Quadratic equation: dragCoeff * v² + frictionCoeff * v - powerWatts = 0
    const a = dragCoeff;
    const b = frictionCoeff;
    const c = -powerWatts;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return 0;

    const v1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const v2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    return Math.max(0, Math.max(v1, v2));
  }

  /**
   * Get force configuration
   * @returns Current force configuration
   */
  getConfig(): ForceConfig {
    return { ...this.config };
  }

  /**
   * Update force configuration
   * @param newConfig - New configuration parameters
   */
  updateConfig(newConfig: Partial<ForceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
