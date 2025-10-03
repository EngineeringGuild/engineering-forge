// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/performance/PerformanceCalculator.ts

import { Component } from "../../entities/Component";
import { PerformanceMetrics } from "../../value-objects/PerformanceMetrics";

/**
 * Performance Configuration Interface
 * Configuration for performance calculations
 */
export interface PerformanceConfig {
  maxAcceleration: number; // m/s²
  maxSpeed: number; // km/h
  maxHandling: number; // 0-100
  maxEfficiency: number; // km/l
  speedFactor: number; // Speed influence factor
  distanceFactor: number; // Distance influence factor
}

/**
 * Performance Context Interface
 * Context for performance calculations
 */
export interface PerformanceContext {
  initialPerformance: PerformanceMetrics;
  currentSpeed: number; // km/h
  currentDistance: number; // meters
  totalDistance: number; // meters
  timeElapsed: number; // seconds
}

/**
 * Performance Calculator
 * Handles all performance calculations for car simulation
 *
 * This calculator is responsible for:
 * - Calculating initial performance from components
 * - Updating performance based on simulation state
 * - Calculating final performance scores
 * - Providing performance analysis and recommendations
 */
export class PerformanceCalculator {
  private config: PerformanceConfig;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxAcceleration: 100, // m/s²
      maxSpeed: 300, // km/h
      maxHandling: 100,
      maxEfficiency: 20, // km/l
      speedFactor: 0.1,
      distanceFactor: 0.05,
      ...config,
    };
  }

  /**
   * Calculate initial performance from components
   * @param components - Car components
   * @returns Initial performance metrics
   */
  calculateInitialPerformance(components: Component[]): PerformanceMetrics {
    const carProperties = this.calculateCarProperties(components);

    // Calculate derived metrics with better scaling
    const acceleration = this.calculateAcceleration(carProperties);
    const topSpeed = this.calculateTopSpeed(carProperties);
    const handling = this.calculateHandling(carProperties);
    const fuelEfficiency = this.calculateFuelEfficiency(carProperties);

    const overall = (acceleration + topSpeed + handling + fuelEfficiency) / 4;

    console.log(
      `📊 Performance calculated - Power: ${carProperties.power}hp, Weight: ${
        carProperties.weight
      }kg, Overall: ${overall.toFixed(1)}`
    );

    return new PerformanceMetrics({
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency,
      weight: carProperties.weight,
      power: carProperties.power,
      torque: carProperties.power * 0.8, // Estimate torque from power
      overall,
    });
  }

  /**
   * Update performance based on current simulation state
   * @param context - Performance context
   * @returns Updated performance metrics
   */
  updatePerformance(context: PerformanceContext): PerformanceMetrics {
    const {
      initialPerformance,
      currentSpeed,
      currentDistance,
      totalDistance,
      timeElapsed,
    } = context;

    // Calculate influence factors
    const speedFactor = Math.min(1, currentSpeed / 100); // Normalize speed factor
    const distanceFactor = Math.min(1, currentDistance / totalDistance); // Normalize distance factor
    const timeFactor = Math.min(1, timeElapsed / 60); // Normalize time factor

    // Update performance based on current state
    const acceleration = this.updateAcceleration(
      initialPerformance.acceleration,
      speedFactor
    );
    const topSpeed = Math.max(initialPerformance.topSpeed, currentSpeed);
    const handling = this.updateHandling(
      initialPerformance.handling,
      speedFactor,
      distanceFactor
    );
    const fuelEfficiency = this.updateFuelEfficiency(
      initialPerformance.fuelEfficiency,
      speedFactor,
      timeFactor
    );

    const overall = (acceleration + topSpeed + handling + fuelEfficiency) / 4;

    return new PerformanceMetrics({
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency,
      weight: initialPerformance.weight,
      power: initialPerformance.power,
      torque: initialPerformance.torque,
      overall,
    });
  }

  /**
   * Calculate final performance score
   * @param context - Performance context
   * @param trackLength - Total track length in meters
   * @returns Performance score (0-100)
   */
  calculateFinalScore(
    context: PerformanceContext,
    trackLength: number
  ): number {
    const { currentSpeed, currentDistance, timeElapsed } = context;

    // Calculate individual scores
    const distanceScore = Math.min(100, (currentDistance / trackLength) * 100);
    const speedScore = Math.min(
      100,
      (currentSpeed / this.config.maxSpeed) * 100
    );
    const efficiencyScore = Math.min(
      100,
      (context.initialPerformance.fuelEfficiency / this.config.maxEfficiency) *
        100
    );
    const timeScore =
      timeElapsed > 0 ? Math.min(100, (trackLength / timeElapsed) * 10) : 0; // Bonus for speed

    // Weighted average
    const totalScore =
      distanceScore * 0.4 +
      speedScore * 0.3 +
      efficiencyScore * 0.2 +
      timeScore * 0.1;

    return Math.round(Math.max(0, Math.min(100, totalScore)));
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
    powerToWeightRatio: number;
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
    const averageEfficiency =
      componentCount > 0 ? totalEfficiency / componentCount : 50;
    const powerToWeightRatio = totalWeight > 0 ? totalPower / totalWeight : 0;

    return {
      power: totalPower,
      weight: totalWeight,
      efficiency: averageEfficiency,
      powerToWeightRatio,
    };
  }

  /**
   * Calculate acceleration performance
   * @param carProperties - Car properties
   * @returns Acceleration score (0-100)
   */
  private calculateAcceleration(carProperties: {
    powerToWeightRatio: number;
    efficiency: number;
  }): number {
    const baseAcceleration = carProperties.powerToWeightRatio * 20;
    const efficiencyBonus = carProperties.efficiency * 0.1;
    return Math.min(
      this.config.maxAcceleration,
      Math.max(10, baseAcceleration + efficiencyBonus)
    );
  }

  /**
   * Calculate top speed performance
   * @param carProperties - Car properties
   * @returns Top speed in km/h
   */
  private calculateTopSpeed(carProperties: {
    power: number;
    efficiency: number;
  }): number {
    const baseSpeed = Math.sqrt(carProperties.power * 3);
    const efficiencyBonus = carProperties.efficiency * 0.5;
    return Math.min(
      this.config.maxSpeed,
      Math.max(50, baseSpeed + efficiencyBonus)
    );
  }

  /**
   * Calculate handling performance
   * @param carProperties - Car properties
   * @returns Handling score (0-100)
   */
  private calculateHandling(carProperties: {
    efficiency: number;
    powerToWeightRatio: number;
  }): number {
    const baseHandling = carProperties.efficiency * 1.5;
    const weightPenalty = Math.min(20, carProperties.powerToWeightRatio * 5); // Heavier cars handle worse
    return Math.min(
      this.config.maxHandling,
      Math.max(20, baseHandling - weightPenalty)
    );
  }

  /**
   * Calculate fuel efficiency performance
   * @param carProperties - Car properties
   * @returns Fuel efficiency in km/l
   */
  private calculateFuelEfficiency(carProperties: {
    efficiency: number;
    powerToWeightRatio: number;
  }): number {
    const baseEfficiency = carProperties.efficiency * 0.3;
    const powerPenalty = Math.min(5, carProperties.powerToWeightRatio * 2); // More powerful cars are less efficient
    return Math.min(
      this.config.maxEfficiency,
      Math.max(2, baseEfficiency - powerPenalty)
    );
  }

  /**
   * Update acceleration based on current state
   * @param initialAcceleration - Initial acceleration
   * @param speedFactor - Speed influence factor
   * @returns Updated acceleration
   */
  private updateAcceleration(
    initialAcceleration: number,
    speedFactor: number
  ): number {
    // Acceleration improves slightly with speed (momentum)
    return initialAcceleration * (1 + speedFactor * this.config.speedFactor);
  }

  /**
   * Update handling based on current state
   * @param initialHandling - Initial handling
   * @param speedFactor - Speed influence factor
   * @param distanceFactor - Distance influence factor
   * @returns Updated handling
   */
  private updateHandling(
    initialHandling: number,
    speedFactor: number,
    distanceFactor: number
  ): number {
    // Handling decreases at high speeds but improves with distance (driver experience)
    const speedPenalty = speedFactor * 0.05;
    const distanceBonus = distanceFactor * 0.1;
    return initialHandling * (1 - speedPenalty) * (1 + distanceBonus);
  }

  /**
   * Update fuel efficiency based on current state
   * @param initialEfficiency - Initial efficiency
   * @param speedFactor - Speed influence factor
   * @param timeFactor - Time influence factor
   * @returns Updated efficiency
   */
  private updateFuelEfficiency(
    initialEfficiency: number,
    speedFactor: number,
    timeFactor: number
  ): number {
    // Efficiency decreases at high speeds and over time (engine wear)
    const speedPenalty = speedFactor * 0.2;
    const timePenalty = timeFactor * 0.1;
    return initialEfficiency * (1 - speedPenalty) * (1 - timePenalty);
  }

  /**
   * Get performance grade based on score
   * @param score - Performance score (0-100)
   * @returns Grade letter (A, B, C, D, F)
   */
  getGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  /**
   * Get performance rating based on score
   * @param score - Performance score (0-100)
   * @returns Performance rating string
   */
  getPerformanceRating(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 70) return "Average";
    if (score >= 60) return "Below Average";
    return "Poor";
  }

  /**
   * Get performance configuration
   * @returns Current performance configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update performance configuration
   * @param newConfig - New configuration parameters
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
