// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/SimulationStepData.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";
import { AnimationEffect } from "./AnimationEffect";
import { PerformanceMetrics } from "./PerformanceMetrics";
import { PositionVO } from "./Position";

export interface SimulationStepDataProps {
  readonly timestamp: number;
  readonly position: PositionVO;
  readonly speed: number;
  readonly acceleration: number;
  readonly performance: PerformanceMetrics;
  readonly effects: AnimationEffect[];
  readonly rotation: number;
  readonly scale: number;
  readonly opacity: number;
}

export class SimulationStepData extends ValueObject<SimulationStepDataProps> {
  public static create(props: SimulationStepDataProps): SimulationStepData {
    this.validateStepData(props);
    return new SimulationStepData(props);
  }

  private static validateStepData(props: SimulationStepDataProps): void {
    if (props.timestamp < 0) {
      throw new Error("Timestamp must be non-negative");
    }

    if (props.speed < 0) {
      throw new Error("Speed must be non-negative");
    }

    if (props.rotation < 0 || props.rotation > Math.PI * 2) {
      throw new Error("Rotation must be between 0 and 2π");
    }

    if (props.scale <= 0) {
      throw new Error("Scale must be positive");
    }

    if (props.opacity < 0 || props.opacity > 1) {
      throw new Error("Opacity must be between 0 and 1");
    }
  }

  get timestamp(): number {
    return this.props.timestamp;
  }

  get position(): PositionVO {
    return this.props.position;
  }

  get speed(): number {
    return this.props.speed;
  }

  get acceleration(): number {
    return this.props.acceleration;
  }

  get performance(): PerformanceMetrics {
    return this.props.performance;
  }

  get effects(): AnimationEffect[] {
    return [...this.props.effects];
  }

  get rotation(): number {
    return this.props.rotation;
  }

  get scale(): number {
    return this.props.scale;
  }

  get opacity(): number {
    return this.props.opacity;
  }

  /**
   * Update step data
   */
  update(props: Partial<SimulationStepDataProps>): SimulationStepData {
    return new SimulationStepData({ ...this.props, ...props });
  }

  /**
   * Add effect to step
   */
  addEffect(effect: AnimationEffect): SimulationStepData {
    const newEffects = [...this.props.effects, effect];
    return new SimulationStepData({ ...this.props, effects: newEffects });
  }

  /**
   * Remove expired effects
   */
  removeExpiredEffects(currentTime: number): SimulationStepData {
    const activeEffects = this.props.effects.filter(
      (effect) => !effect.isExpired(currentTime)
    );
    return new SimulationStepData({ ...this.props, effects: activeEffects });
  }
}
