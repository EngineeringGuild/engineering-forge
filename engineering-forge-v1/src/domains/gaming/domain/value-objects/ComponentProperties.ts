// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/ComponentProperties.ts

import { ValueObject } from '../../../../shared/domain/ValueObject';

export interface ComponentPropertiesProps {
  readonly power: number; // Engine power in HP
  readonly weight: number; // Weight in kg
  readonly efficiency: number; // Efficiency rating 0-100
  readonly durability: number; // Durability rating 0-100
  readonly cost: number; // Cost in credits
  readonly unlockLevel: number; // Required level to unlock
}

export class ComponentProperties extends ValueObject<ComponentPropertiesProps> {
  public static create(props: ComponentPropertiesProps): ComponentProperties {
    this.validateProperties(props);
    return new ComponentProperties(props);
  }

  private static validateProperties(props: ComponentPropertiesProps): void {
    if (props.power < 0) {
      throw new Error('Power must be non-negative');
    }

    if (props.weight <= 0) {
      throw new Error('Weight must be positive');
    }

    if (props.efficiency < 0 || props.efficiency > 100) {
      throw new Error('Efficiency must be between 0 and 100');
    }

    if (props.durability < 0 || props.durability > 100) {
      throw new Error('Durability must be between 0 and 100');
    }

    if (props.cost < 0) {
      throw new Error('Cost must be non-negative');
    }

    if (props.unlockLevel < 1) {
      throw new Error('Unlock level must be at least 1');
    }
  }

  get power(): number {
    return this.props.power;
  }

  get weight(): number {
    return this.props.weight;
  }

  get efficiency(): number {
    return this.props.efficiency;
  }

  get durability(): number {
    return this.props.durability;
  }

  get cost(): number {
    return this.props.cost;
  }

  get unlockLevel(): number {
    return this.props.unlockLevel;
  }

  public getPowerToWeightRatio(): number {
    return this.weight > 0 ? this.power / this.weight : 0;
  }

  public getEfficiencyScore(): number {
    return (this.efficiency + this.durability) / 2;
  }

  public isUnlockedForLevel(userLevel: number): boolean {
    return userLevel >= this.unlockLevel;
  }
}
