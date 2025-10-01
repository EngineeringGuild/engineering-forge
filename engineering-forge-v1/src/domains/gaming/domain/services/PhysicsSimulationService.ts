// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/PhysicsSimulationService.ts

import { Component } from '../entities/Component';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';

export interface PhysicsInputs {
  components: Component[];
  environment: {
    gravity: number;
    airDensity: number;
    temperature: number;
    windSpeed: number;
  };
}

export interface PhysicsOutputs {
  performance: PerformanceMetrics;
  calculations: {
    acceleration: number;
    topSpeed: number;
    handling: number;
    efficiency: number;
  };
  factors: {
    weight: number;
    power: number;
    drag: number;
    friction: number;
  };
}

export class PhysicsSimulationService {
  public simulateProject(inputs: PhysicsInputs): PhysicsOutputs {
    const { components, environment } = inputs;

    // Calculate basic metrics
    const totalWeight = this.calculateTotalWeight(components);
    const totalPower = this.calculateTotalPower(components);
    // const totalEfficiency = this.calculateTotalEfficiency(components); // TODO: Use in future calculations

    // Calculate performance metrics
    const acceleration = this.calculateAcceleration(totalPower, totalWeight, environment);
    const topSpeed = this.calculateTopSpeed(totalPower, totalWeight, environment);
    const handling = this.calculateHandling(components, totalWeight);
    const fuelEfficiency = this.calculateFuelEfficiency(components, totalWeight);

    // Calculate overall performance
    const overall = this.calculateOverallPerformance(
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency
    );

    const performance = PerformanceMetrics.create({
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency,
      weight: totalWeight,
      power: totalPower,
      torque: totalPower * 0.7, // Estimate torque from power
      overall
    });

    return {
      performance,
      calculations: {
        acceleration,
        topSpeed,
        handling,
        efficiency: fuelEfficiency
      },
      factors: {
        weight: totalWeight,
        power: totalPower,
        drag: this.calculateDrag(components, environment),
        friction: this.calculateFriction(components, totalWeight)
      }
    };
  }

  private calculateTotalWeight(components: Component[]): number {
    return components.reduce((total, component) => total + component.properties.weight, 0);
  }

  private calculateTotalPower(components: Component[]): number {
    return components.reduce((total, component) => total + component.properties.power, 0);
  }

  // private calculateTotalEfficiency(components: Component[]): number {
  //   if (components.length === 0) return 0;
  //   const totalEfficiency = components.reduce(
  //     (total, component) => total + component.properties.efficiency,
  //     0
  //   );
  //   return totalEfficiency / components.length;
  // }

  private calculateAcceleration(power: number, weight: number, environment: any): number {
    if (weight === 0) {
return 0;
}

    // Basic physics: F = ma, P = Fv
    // Acceleration = Power / (Weight * Velocity)
    // Simplified formula for 0-100 km/h acceleration
    const powerToWeightRatio = power / weight;
    const baseAcceleration = powerToWeightRatio * 0.8; // Efficiency factor

    // Environmental factors
    const airResistance = environment.airDensity * 0.1;
    const finalAcceleration = baseAcceleration / (1 + airResistance);

    return Math.max(0, finalAcceleration);
  }

  private calculateTopSpeed(power: number, _weight: number, environment: any): number {
    if (power === 0) {
return 0;
}

    // Top speed is limited by air resistance
    // Simplified formula: v = sqrt(P / (0.5 * rho * Cd * A))
    const airDensity = environment.airDensity;
    const dragCoefficient = 0.3; // Typical car Cd
    const frontalArea = 2.5; // Typical car frontal area in m²

    const topSpeed = Math.sqrt(power / (0.5 * airDensity * dragCoefficient * frontalArea));

    // Convert to km/h and apply environmental factors
    const topSpeedKmh = topSpeed * 3.6;
    const windFactor = 1 - environment.windSpeed * 0.01;

    return Math.max(0, topSpeedKmh * windFactor);
  }

  private calculateHandling(components: Component[], totalWeight: number): number {
    if (components.length === 0) {
return 0;
}

    // Handling is affected by suspension, wheels, and weight distribution
    const suspensionComponents = components.filter(c => c.type === 'suspension');
    const wheelComponents = components.filter(c => c.type === 'wheels');

    let handlingScore = 50; // Base handling

    // Suspension quality
    if (suspensionComponents.length > 0) {
      const avgSuspensionQuality =
        suspensionComponents.reduce((sum, c) => sum + c.properties.efficiency, 0) /
        suspensionComponents.length;
      handlingScore += avgSuspensionQuality * 0.3;
    }

    // Wheel quality
    if (wheelComponents.length > 0) {
      const avgWheelQuality =
        wheelComponents.reduce((sum, c) => sum + c.properties.efficiency, 0) /
        wheelComponents.length;
      handlingScore += avgWheelQuality * 0.2;
    }

    // Weight penalty (lighter = better handling)
    const weightPenalty = Math.min(30, totalWeight / 100);
    handlingScore -= weightPenalty;

    return Math.max(0, Math.min(100, handlingScore));
  }

  private calculateFuelEfficiency(components: Component[], totalWeight: number): number {
    if (components.length === 0) {
return 0;
}

    // Fuel efficiency is affected by engine type and weight
    const engineComponents = components.filter(c => c.type === 'engine');
    const transmissionComponents = components.filter(c => c.type === 'transmission');

    let efficiency = 50; // Base efficiency

    // Engine efficiency
    if (engineComponents.length > 0) {
      const avgEngineEfficiency =
        engineComponents.reduce((sum, c) => sum + c.properties.efficiency, 0) /
        engineComponents.length;
      efficiency += avgEngineEfficiency * 0.4;
    }

    // Transmission efficiency
    if (transmissionComponents.length > 0) {
      const avgTransmissionEfficiency =
        transmissionComponents.reduce((sum, c) => sum + c.properties.efficiency, 0) /
        transmissionComponents.length;
      efficiency += avgTransmissionEfficiency * 0.2;
    }

    // Weight penalty
    const weightPenalty = Math.min(20, totalWeight / 200);
    efficiency -= weightPenalty;

    return Math.max(10, Math.min(100, efficiency));
  }

  private calculateOverallPerformance(
    acceleration: number,
    topSpeed: number,
    handling: number,
    efficiency: number
  ): number {
    // Weighted average of all performance metrics
    const weights = {
      acceleration: 0.3,
      topSpeed: 0.25,
      handling: 0.25,
      efficiency: 0.2
    };

    return (
      acceleration * weights.acceleration +
      topSpeed * weights.topSpeed +
      handling * weights.handling +
      efficiency * weights.efficiency
    );
  }

  private calculateDrag(_components: Component[], environment: any): number {
    // Simplified drag calculation
    const baseDrag = 0.3; // Base drag coefficient
    const airDensity = environment.airDensity;
    const frontalArea = 2.5; // m²

    return baseDrag * airDensity * frontalArea;
  }

  private calculateFriction(_components: Component[], totalWeight: number): number {
    // Simplified friction calculation
    const frictionCoefficient = 0.7; // Typical tire-road friction
    return frictionCoefficient * totalWeight * 9.81; // F = μ * m * g
  }
}
