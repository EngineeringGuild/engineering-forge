// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/utils/CarPropertiesCalculator.ts

import { Component } from "../../entities/Component";

/**
 * Car Properties Interface
 * Represents calculated car properties from components
 */
export interface CarProperties {
  power: number; // HP
  weight: number; // kg
  efficiency: number; // 0-100
  powerToWeightRatio: number; // HP/kg
}

/**
 * Car Properties Calculator
 * Utility class to calculate car properties from components
 *
 * This eliminates code duplication across multiple services
 */
export class CarPropertiesCalculator {
  /**
   * Calculate car properties from components
   * @param components - Car components
   * @returns Car properties object
   */
  static calculateCarProperties(components: Component[]): CarProperties {
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
   * Calculate power-to-weight ratio
   * @param power - Engine power in HP
   * @param weight - Car weight in kg
   * @returns Power-to-weight ratio
   */
  static calculatePowerToWeightRatio(power: number, weight: number): number {
    return weight > 0 ? power / weight : 0;
  }

  /**
   * Validate car properties
   * @param properties - Car properties to validate
   * @throws Error if properties are invalid
   */
  static validateCarProperties(properties: CarProperties): void {
    if (properties.power < 0) {
      throw new Error("Power must be non-negative");
    }
    if (properties.weight <= 0) {
      throw new Error("Weight must be positive");
    }
    if (properties.efficiency < 0 || properties.efficiency > 100) {
      throw new Error("Efficiency must be between 0 and 100");
    }
    if (properties.powerToWeightRatio < 0) {
      throw new Error("Power-to-weight ratio must be non-negative");
    }
  }
}
