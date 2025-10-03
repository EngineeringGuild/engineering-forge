// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/AnimationEffect.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";

export interface AnimationEffectProps {
  readonly type:
    | "particle"
    | "trail"
    | "speedLine"
    | "dust"
    | "explosion"
    | "smoke";
  readonly position: { x: number; y: number };
  readonly color: string;
  readonly intensity: number;
  readonly duration: number;
  readonly size: number;
  readonly velocity?: { x: number; y: number };
  readonly opacity: number;
}

export class AnimationEffect extends ValueObject<AnimationEffectProps> {
  public static create(props: AnimationEffectProps): AnimationEffect {
    this.validateEffect(props);
    return new AnimationEffect(props);
  }

  private static validateEffect(props: AnimationEffectProps): void {
    if (!props.type) {
      throw new Error("Effect type is required");
    }

    if (
      !props.position ||
      typeof props.position.x !== "number" ||
      typeof props.position.y !== "number"
    ) {
      throw new Error("Effect position must have valid x and y coordinates");
    }

    if (!props.color || typeof props.color !== "string") {
      throw new Error("Effect color must be a valid string");
    }

    if (props.intensity < 0 || props.intensity > 1) {
      throw new Error("Effect intensity must be between 0 and 1");
    }

    if (props.duration <= 0) {
      throw new Error("Effect duration must be positive");
    }

    if (props.size <= 0) {
      throw new Error("Effect size must be positive");
    }

    if (props.opacity < 0 || props.opacity > 1) {
      throw new Error("Effect opacity must be between 0 and 1");
    }
  }

  get type(): AnimationEffectProps["type"] {
    return this.props.type;
  }

  get position(): AnimationEffectProps["position"] {
    return { ...this.props.position };
  }

  get color(): string {
    return this.props.color;
  }

  get intensity(): number {
    return this.props.intensity;
  }

  get duration(): number {
    return this.props.duration;
  }

  get size(): number {
    return this.props.size;
  }

  get velocity(): { x: number; y: number } | undefined {
    return this.props.velocity ? { ...this.props.velocity } : undefined;
  }

  get opacity(): number {
    return this.props.opacity;
  }

  /**
   * Update effect properties
   */
  update(props: Partial<AnimationEffectProps>): AnimationEffect {
    return new AnimationEffect({ ...this.props, ...props });
  }

  /**
   * Check if effect is expired
   */
  isExpired(currentTime: number): boolean {
    return currentTime >= this.props.duration;
  }

  /**
   * Calculate effect progress (0 to 1)
   */
  getProgress(currentTime: number): number {
    return Math.min(currentTime / this.props.duration, 1);
  }
}
