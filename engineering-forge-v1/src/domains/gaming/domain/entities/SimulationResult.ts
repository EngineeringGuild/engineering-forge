// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/SimulationResult.ts

import { BaseEntity } from '../../../../shared/domain/BaseEntity';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';
import { Position } from '../value-objects/Position';

/**
 * Simulation Step Props Interface
 * Properties for a single simulation step
 */
export interface SimulationStepProps {
  timestamp: number; // in seconds
  position: Position;
  speed: number; // in km/h
  acceleration: number; // in m/s²
  performance: PerformanceMetrics;
}

/**
 * Simulation Result Props Interface
 * Properties for a complete simulation result
 */
export interface SimulationResultProps {
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
  userId: string;
  projectId?: string;
}

/**
 * Simulation Step Entity
 * Represents a single step in a car simulation
 *
 * This entity encapsulates the state of the car at a specific moment
 * during the simulation, including position, speed, and performance metrics.
 */
export class SimulationStep extends BaseEntity<string> {
  private _timestamp: number;
  private _position: Position;
  private _speed: number;
  private _acceleration: number;
  private _performance: PerformanceMetrics;

  constructor(id: string, props: SimulationStepProps) {
    super(id);

    this.validateProps(props);

    this._timestamp = props.timestamp;
    this._position = props.position;
    this._speed = props.speed;
    this._acceleration = props.acceleration;
    this._performance = props.performance;
  }

  /**
   * Validate simulation step properties
   * @param props - Properties to validate
   * @throws Error if validation fails
   */
  private validateProps(props: SimulationStepProps): void {
    if (props.timestamp < 0) {
      throw new Error('Timestamp must be non-negative');
    }
    if (props.speed < 0) {
      throw new Error('Speed must be non-negative');
    }
    if (props.performance.overall < 0 || props.performance.overall > 100) {
      throw new Error('Performance overall must be between 0 and 100');
    }
  }

  // Getters
  get timestamp(): number {
    return this._timestamp;
  }

  get position(): Position {
    return this._position;
  }

  get speed(): number {
    return this._speed;
  }

  get acceleration(): number {
    return this._acceleration;
  }

  get performance(): PerformanceMetrics {
    return this._performance;
  }

  /**
   * Update simulation step with new data
   * @param props - New properties to update
   */
  updateStep(props: Partial<SimulationStepProps>): void {
    const updatedProps = {
      timestamp: props.timestamp ?? this._timestamp,
      position: props.position ?? this._position,
      speed: props.speed ?? this._speed,
      acceleration: props.acceleration ?? this._acceleration,
      performance: props.performance ?? this._performance
    };

    this.validateProps(updatedProps);

    this._timestamp = updatedProps.timestamp;
    this._position = updatedProps.position;
    this._speed = updatedProps.speed;
    this._acceleration = updatedProps.acceleration;
    this._performance = updatedProps.performance;
  }

  /**
   * Get speed in different units
   * @param unit - Target unit ('kmh', 'mph', 'ms')
   * @returns Speed in specified unit
   */
  getSpeedInUnit(unit: 'kmh' | 'mph' | 'ms'): number {
    switch (unit) {
      case 'kmh':
        return this._speed;
      case 'mph':
        return this._speed * 0.621371;
      case 'ms':
        return this._speed / 3.6;
      default:
        throw new Error('Invalid speed unit');
    }
  }

  /**
   * Check if this step represents a new maximum speed
   * @param previousMaxSpeed - Previous maximum speed
   * @returns True if this is a new maximum
   */
  isNewMaxSpeed(previousMaxSpeed: number): boolean {
    return this._speed > previousMaxSpeed;
  }

  /**
   * Calculate distance from previous step
   * @param previousPosition - Previous position
   * @returns Distance in meters
   */
  calculateDistanceFrom(previousPosition: Position): number {
    const dx = this._position.x - previousPosition.x;
    const dy = this._position.y - previousPosition.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Simulation Result Entity
 * Represents the complete result of a car simulation
 *
 * This entity aggregates all simulation steps and provides
 * methods to analyze the overall performance and results.
 */
export class SimulationResult extends BaseEntity<string> {
  private _startTime: Date;
  private _endTime: Date;
  private _duration: number;
  private _distance: number;
  private _maxSpeed: number;
  private _averageSpeed: number;
  private _finalPerformance: PerformanceMetrics;
  private _score: number;
  private _passed: boolean;
  private _simulationSteps: SimulationStep[];
  private _userId: string;
  private _projectId?: string;

  constructor(id: string, props: SimulationResultProps) {
    super(id);

    this.validateProps(props);

    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._duration = props.duration;
    this._distance = props.distance;
    this._maxSpeed = props.maxSpeed;
    this._averageSpeed = props.averageSpeed;
    this._finalPerformance = props.finalPerformance;
    this._score = props.score;
    this._passed = props.passed;
    this._simulationSteps = props.simulationSteps;
    this._userId = props.userId;
    this._projectId = props.projectId;
  }

  /**
   * Validate simulation result properties
   * @param props - Properties to validate
   * @throws Error if validation fails
   */
  private validateProps(props: SimulationResultProps): void {
    if (props.duration <= 0) {
      throw new Error('Duration must be positive');
    }
    if (props.distance < 0) {
      throw new Error('Distance must be non-negative');
    }
    if (props.maxSpeed < 0) {
      throw new Error('Max speed must be non-negative');
    }
    if (props.averageSpeed < 0) {
      throw new Error('Average speed must be non-negative');
    }
    if (props.score < 0 || props.score > 100) {
      throw new Error('Score must be between 0 and 100');
    }
    if (props.startTime >= props.endTime) {
      throw new Error('Start time must be before end time');
    }
    if (!props.userId || props.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }

  // Getters
  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date {
    return this._endTime;
  }

  get duration(): number {
    return this._duration;
  }

  get distance(): number {
    return this._distance;
  }

  get maxSpeed(): number {
    return this._maxSpeed;
  }

  get averageSpeed(): number {
    return this._averageSpeed;
  }

  get finalPerformance(): PerformanceMetrics {
    return this._finalPerformance;
  }

  get score(): number {
    return this._score;
  }

  get passed(): boolean {
    return this._passed;
  }

  get simulationSteps(): SimulationStep[] {
    return [...this._simulationSteps]; // Return copy to prevent mutation
  }

  get userId(): string {
    return this._userId;
  }

  get projectId(): string | undefined {
    return this._projectId;
  }

  /**
   * Get grade based on score
   * @returns Grade letter (A, B, C, D, F)
   */
  getGrade(): string {
    if (this._score >= 90) return 'A';
    if (this._score >= 80) return 'B';
    if (this._score >= 70) return 'C';
    if (this._score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get performance rating
   * @returns Performance rating string
   */
  getPerformanceRating(): string {
    if (this._score >= 90) return 'Excellent';
    if (this._score >= 80) return 'Good';
    if (this._score >= 70) return 'Average';
    if (this._score >= 60) return 'Below Average';
    return 'Poor';
  }

  /**
   * Calculate efficiency metrics
   * @returns Efficiency metrics object
   */
  getEfficiencyMetrics(): {
    distancePerSecond: number;
    speedEfficiency: number;
    accelerationEfficiency: number;
    overallEfficiency: number;
  } {
    const distancePerSecond = this._distance / this._duration;
    const speedEfficiency = this._maxSpeed / 200; // Normalize to 200 km/h
    const accelerationEfficiency = this._finalPerformance.acceleration / 100;
    const overallEfficiency = (speedEfficiency + accelerationEfficiency) / 2;

    return {
      distancePerSecond,
      speedEfficiency: Math.min(1, speedEfficiency),
      accelerationEfficiency: Math.min(1, accelerationEfficiency),
      overallEfficiency: Math.min(1, overallEfficiency)
    };
  }

  /**
   * Get simulation statistics
   * @returns Simulation statistics object
   */
  getStatistics(): {
    totalSteps: number;
    averageTimePerStep: number;
    maxAcceleration: number;
    minSpeed: number;
    totalAcceleration: number;
  } {
    if (this._simulationSteps.length === 0) {
      return {
        totalSteps: 0,
        averageTimePerStep: 0,
        maxAcceleration: 0,
        minSpeed: 0,
        totalAcceleration: 0
      };
    }

    const maxAcceleration = Math.max(...this._simulationSteps.map(s => s.acceleration));
    const minSpeed = Math.min(...this._simulationSteps.map(s => s.speed));
    const totalAcceleration = this._simulationSteps.reduce((sum, s) => sum + s.acceleration, 0);
    const averageTimePerStep = this._duration / this._simulationSteps.length;

    return {
      totalSteps: this._simulationSteps.length,
      averageTimePerStep,
      maxAcceleration,
      minSpeed,
      totalAcceleration
    };
  }

  /**
   * Get steps within a time range
   * @param startTime - Start time in seconds
   * @param endTime - End time in seconds
   * @returns Filtered simulation steps
   */
  getStepsInTimeRange(startTime: number, endTime: number): SimulationStep[] {
    return this._simulationSteps.filter(
      step => step.timestamp >= startTime && step.timestamp <= endTime
    );
  }

  /**
   * Get steps within a distance range
   * @param startDistance - Start distance in meters
   * @param endDistance - End distance in meters
   * @returns Filtered simulation steps
   */
  getStepsInDistanceRange(startDistance: number, endDistance: number): SimulationStep[] {
    return this._simulationSteps.filter(
      step => step.position.x >= startDistance && step.position.x <= endDistance
    );
  }

  /**
   * Check if simulation was successful
   * @returns True if simulation passed and met minimum requirements
   */
  isSuccessful(): boolean {
    return this._passed && this._score >= 60 && this._distance > 0;
  }

  /**
   * Get recommendations for improvement
   * @returns Array of improvement recommendations
   */
  getImprovementRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this._score < 60) {
      recommendations.push('Overall performance needs significant improvement');
    }

    if (this._maxSpeed < 50) {
      recommendations.push('Consider upgrading engine for better top speed');
    }

    if (this._finalPerformance.acceleration < 30) {
      recommendations.push('Improve acceleration by reducing weight or increasing power');
    }

    if (this._finalPerformance.handling < 40) {
      recommendations.push('Upgrade suspension and tires for better handling');
    }

    if (this._finalPerformance.fuelEfficiency < 5) {
      recommendations.push('Optimize components for better fuel efficiency');
    }

    if (this._distance < 500) {
      recommendations.push('Increase power or reduce weight to achieve better distance');
    }

    return recommendations;
  }

  /**
   * Export simulation data as JSON
   * @returns JSON representation of simulation result
   */
  toJSON(): string {
    return JSON.stringify({
      id: this.id,
      startTime: this._startTime.toISOString(),
      endTime: this._endTime.toISOString(),
      duration: this._duration,
      distance: this._distance,
      maxSpeed: this._maxSpeed,
      averageSpeed: this._averageSpeed,
      finalPerformance: this._finalPerformance,
      score: this._score,
      passed: this._passed,
      simulationSteps: this._simulationSteps.map(step => ({
        id: step.id,
        timestamp: step.timestamp,
        position: { x: step.position.x, y: step.position.y },
        speed: step.speed,
        acceleration: step.acceleration,
        performance: step.performance
      })),
      userId: this._userId,
      projectId: this._projectId
    });
  }
}
