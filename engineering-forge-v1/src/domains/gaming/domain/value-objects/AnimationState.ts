// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/AnimationState.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";
import { AnimationFrame } from "../../application/services/AnimationService";
import { AnimationEffect } from "./AnimationEffect";

export interface AnimationStateProps {
  readonly isAnimating: boolean;
  readonly currentFrame: AnimationFrame | null;
  readonly progress: number;
  readonly speed: number;
  readonly distance: number;
  readonly maxSpeed: number;
  readonly effects: AnimationEffect[];
}

export class AnimationState extends ValueObject<AnimationStateProps> {
  public static create(props: AnimationStateProps): AnimationState {
    this.validateAnimationState(props);
    return new AnimationState(props);
  }

  private static validateAnimationState(props: AnimationStateProps): void {
    if (props.progress < 0 || props.progress > 1) {
      throw new Error("Progress must be between 0 and 1");
    }

    if (props.speed < 0) {
      throw new Error("Speed must be non-negative");
    }

    if (props.distance < 0) {
      throw new Error("Distance must be non-negative");
    }

    if (props.maxSpeed < 0) {
      throw new Error("Max speed must be non-negative");
    }
  }

  get isAnimating(): boolean {
    return this.props.isAnimating;
  }

  get currentFrame(): AnimationFrame | null {
    return this.props.currentFrame;
  }

  get progress(): number {
    return this.props.progress;
  }

  get speed(): number {
    return this.props.speed;
  }

  get distance(): number {
    return this.props.distance;
  }

  get maxSpeed(): number {
    return this.props.maxSpeed;
  }

  get effects(): AnimationEffect[] {
    return [...this.props.effects];
  }

  /**
   * Update animation state
   */
  update(props: Partial<AnimationStateProps>): AnimationState {
    return new AnimationState({ ...this.props, ...props });
  }

  /**
   * Start animation
   */
  start(): AnimationState {
    return new AnimationState({ ...this.props, isAnimating: true });
  }

  /**
   * Stop animation
   */
  stop(): AnimationState {
    return new AnimationState({
      ...this.props,
      isAnimating: false,
      currentFrame: null,
      progress: 0,
      speed: 0,
      distance: 0,
      effects: [],
    });
  }

  /**
   * Reset animation state
   */
  reset(): AnimationState {
    return new AnimationState({
      isAnimating: false,
      currentFrame: null,
      progress: 0,
      speed: 0,
      distance: 0,
      maxSpeed: 0,
      effects: [],
    });
  }

  /**
   * Add effect to state
   */
  addEffect(effect: AnimationEffect): AnimationState {
    const newEffects = [...this.props.effects, effect];
    return new AnimationState({ ...this.props, effects: newEffects });
  }

  /**
   * Remove expired effects
   */
  removeExpiredEffects(currentTime: number): AnimationState {
    const activeEffects = this.props.effects.filter(
      (effect) => !effect.isExpired(currentTime)
    );
    return new AnimationState({ ...this.props, effects: activeEffects });
  }
}
