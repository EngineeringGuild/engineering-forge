// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/physics/PhysicsEngine.ts

import { PositionVO } from "../../value-objects/Position";

/**
 * Physics State Interface
 * Represents the current state of the physics simulation
 */
export interface PhysicsState {
  position: PositionVO;
  velocity: number; // m/s
  acceleration: number; // m/s²
  time: number; // seconds
  distance: number; // meters
}

/**
 * Physics Configuration Interface
 * Configuration for physics simulation parameters
 */
export interface PhysicsConfig {
  timeStep: number; // seconds
  gravity: number; // m/s²
  airDensity: number; // kg/m³
  frictionCoefficient: number;
  enableDrag: boolean;
  enableFriction: boolean;
}

/**
 * Physics Engine
 * Handles all physics calculations for car simulation
 *
 * This engine is responsible for:
 * - Updating physics state based on forces
 * - Calculating position, velocity, and acceleration
 * - Managing time steps and integration
 * - Providing physics utilities
 */
export class PhysicsEngine {
  private config: PhysicsConfig;

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = {
      timeStep: 0.1,
      gravity: 9.81,
      airDensity: 1.225,
      frictionCoefficient: 0.7,
      enableDrag: true,
      enableFriction: true,
      ...config,
    };
  }

  /**
   * Update physics state based on forces
   * @param currentState - Current physics state
   * @param netForce - Net force acting on the car (Newtons)
   * @param mass - Mass of the car (kg)
   * @returns Updated physics state
   */
  updateState(
    currentState: PhysicsState,
    netForce: number,
    mass: number
  ): PhysicsState {
    if (mass <= 0) {
      throw new Error("Mass must be positive");
    }

    // Calculate acceleration from force
    const acceleration = netForce / mass;

    // Update velocity using Euler integration
    const newVelocity =
      currentState.velocity + acceleration * this.config.timeStep;

    // Update position using average velocity
    const averageVelocity = (currentState.velocity + newVelocity) / 2;
    const distanceIncrement = averageVelocity * this.config.timeStep;
    const newDistance = currentState.distance + distanceIncrement;

    // Update position (simplified 2D movement)
    const newPosition = new PositionVO(newDistance, 0);

    return {
      position: newPosition,
      velocity: Math.max(0, newVelocity), // Don't go backwards
      acceleration: acceleration,
      time: currentState.time + this.config.timeStep,
      distance: newDistance,
    };
  }

  /**
   * Convert velocity from m/s to km/h
   * @param velocityMs - Velocity in m/s
   * @returns Velocity in km/h
   */
  velocityToKmh(velocityMs: number): number {
    return velocityMs * 3.6;
  }

  /**
   * Convert velocity from km/h to m/s
   * @param velocityKmh - Velocity in km/h
   * @returns Velocity in m/s
   */
  velocityToMs(velocityKmh: number): number {
    return velocityKmh / 3.6;
  }

  /**
   * Calculate kinetic energy
   * @param velocity - Velocity in m/s
   * @param mass - Mass in kg
   * @returns Kinetic energy in Joules
   */
  calculateKineticEnergy(velocity: number, mass: number): number {
    return 0.5 * mass * velocity * velocity;
  }

  /**
   * Calculate momentum
   * @param velocity - Velocity in m/s
   * @param mass - Mass in kg
   * @returns Momentum in kg⋅m/s
   */
  calculateMomentum(velocity: number, mass: number): number {
    return mass * velocity;
  }

  /**
   * Check if car has reached target distance
   * @param currentDistance - Current distance in meters
   * @param targetDistance - Target distance in meters
   * @returns True if target reached
   */
  hasReachedTarget(currentDistance: number, targetDistance: number): boolean {
    return currentDistance >= targetDistance;
  }

  /**
   * Check if simulation time limit exceeded
   * @param currentTime - Current time in seconds
   * @param maxTime - Maximum time in seconds
   * @returns True if time limit exceeded
   */
  hasExceededTimeLimit(currentTime: number, maxTime: number): boolean {
    return currentTime >= maxTime;
  }

  /**
   * Get physics configuration
   * @returns Current physics configuration
   */
  getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  /**
   * Update physics configuration
   * @param newConfig - New configuration parameters
   */
  updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Create initial physics state
   * @param initialPosition - Initial position
   * @returns Initial physics state
   */
  createInitialState(
    initialPosition: PositionVO = PositionVO.zero()
  ): PhysicsState {
    return {
      position: initialPosition,
      velocity: 0,
      acceleration: 0,
      time: 0,
      distance: 0,
    };
  }

  /**
   * Calculate distance between two positions
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Distance in meters
   */
  calculateDistance(pos1: PositionVO, pos2: PositionVO): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate average velocity over time period
   * @param distance - Total distance traveled
   * @param time - Total time elapsed
   * @returns Average velocity in m/s
   */
  calculateAverageVelocity(distance: number, time: number): number {
    return time > 0 ? distance / time : 0;
  }
}
