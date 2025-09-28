// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/PerformanceMetrics.ts

import { ValueObject } from '../../../../shared/domain/ValueObject';

export interface PerformanceMetricsProps {
  readonly acceleration: number; // 0-100 km/h in seconds
  readonly topSpeed: number; // km/h
  readonly handling: number; // 0-100 rating
  readonly fuelEfficiency: number; // km/l
  readonly weight: number; // kg
  readonly power: number; // HP
  readonly torque: number; // Nm
  readonly overall: number; // Overall rating 0-100
}

export class PerformanceMetrics extends ValueObject<PerformanceMetricsProps> {
  public static create(props: PerformanceMetricsProps): PerformanceMetrics {
    this.validateMetrics(props);
    return new PerformanceMetrics(props);
  }

  private static validateMetrics(props: PerformanceMetricsProps): void {
    if (props.acceleration <= 0) {
      throw new Error('Acceleration must be positive');
    }

    if (props.topSpeed < 0) {
      throw new Error('Top speed must be non-negative');
    }

    if (props.handling < 0 || props.handling > 100) {
      throw new Error('Handling must be between 0 and 100');
    }

    if (props.fuelEfficiency <= 0) {
      throw new Error('Fuel efficiency must be positive');
    }

    if (props.weight <= 0) {
      throw new Error('Weight must be positive');
    }

    if (props.power < 0) {
      throw new Error('Power must be non-negative');
    }

    if (props.torque < 0) {
      throw new Error('Torque must be non-negative');
    }

    if (props.overall < 0 || props.overall > 100) {
      throw new Error('Overall rating must be between 0 and 100');
    }
  }

  get acceleration(): number {
    return this.props.acceleration;
  }

  get topSpeed(): number {
    return this.props.topSpeed;
  }

  get handling(): number {
    return this.props.handling;
  }

  get fuelEfficiency(): number {
    return this.props.fuelEfficiency;
  }

  get weight(): number {
    return this.props.weight;
  }

  get power(): number {
    return this.props.power;
  }

  get torque(): number {
    return this.props.torque;
  }

  get overall(): number {
    return this.props.overall;
  }

  public getPowerToWeightRatio(): number {
    return this.weight > 0 ? this.power / this.weight : 0;
  }

  public getAccelerationScore(): number {
    // Lower acceleration time = higher score
    return Math.max(0, 100 - this.acceleration * 2);
  }

  public getSpeedScore(): number {
    // Higher top speed = higher score (capped at 100)
    return Math.min(100, this.topSpeed / 2);
  }

  public getEfficiencyScore(): number {
    // Higher efficiency = higher score (capped at 100)
    return Math.min(100, this.fuelEfficiency * 2);
  }

  public compareTo(other: PerformanceMetrics): number {
    return this.overall - other.overall;
  }

  public isBetterThan(other: PerformanceMetrics): boolean {
    return this.overall > other.overall;
  }
}
