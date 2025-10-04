// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/application/services/AnimationService.ts

import { AnimationEffect as AnimationEffectVO } from "../../domain/value-objects/AnimationEffect";
import { PositionVO } from "../../domain/value-objects/Position";
import { SimulationStepData } from "../../domain/value-objects/SimulationStepData";

/**
 * Animation Configuration Interface
 * Configuration for animation parameters
 */
export interface AnimationConfig {
  duration: number; // Total animation duration in ms
  frameRate: number; // Frames per second
  easing: EasingFunction;
  enableParticles: boolean;
  enableTrail: boolean;
  enableSpeedLines: boolean;
  particleCount: number;
  trailLength: number;
}

/**
 * Animation Frame Interface
 * Represents a single animation frame
 */
export interface AnimationFrame {
  timestamp: number;
  position: PositionVO;
  speed: number;
  acceleration: number;
  opacity: number;
  scale: number;
  rotation: number;
  effects: AnimationEffect[];
}

/**
 * Animation Effect Interface
 * Represents visual effects for animation
 */
export interface AnimationEffect {
  type: "particle" | "trail" | "speedLine" | "dust" | "explosion" | "smoke";
  position: { x: number; y: number };
  intensity: number;
  duration: number;
  color: string;
  size?: number;
  opacity?: number;
  velocity?: { x: number; y: number };
}

/**
 * Easing Function Type
 * Defines easing function for smooth animations
 */
export type EasingFunction =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "bounce"
  | "elastic";

/**
 * Animation Event Interface
 * Events emitted during animation
 */
export interface AnimationEvent {
  type: "start" | "frame" | "complete" | "pause" | "resume" | "stop";
  data?: any;
  timestamp: number;
}

/**
 * Animation Service
 * Handles car simulation animations and visual effects
 *
 * This service is responsible for:
 * - Converting simulation steps to animation frames
 * - Managing animation timing and easing
 * - Generating visual effects (particles, trails, etc.)
 * - Providing smooth interpolation between simulation steps
 */
export class AnimationService {
  private defaultConfig: AnimationConfig = {
    duration: 5000, // 5 seconds default
    frameRate: 60, // 60 FPS
    easing: "easeInOut",
    enableParticles: true,
    enableTrail: true,
    enableSpeedLines: true,
    particleCount: 50,
    trailLength: 20,
  };

  private animationId: number | null = null;
  private isAnimating: boolean = false;
  private currentFrame: number = 0;
  private totalFrames: number = 0;
  private startTime: number = 0;
  private eventListeners: Map<string, ((event: AnimationEvent) => void)[]> =
    new Map();

  /**
   * Start animation from simulation steps
   * @param simulationSteps - Array of simulation steps
   * @param config - Optional animation configuration
   * @returns Promise that resolves when animation completes
   */
  async startAnimation(
    simulationSteps: SimulationStepData[],
    config?: Partial<AnimationConfig>
  ): Promise<void> {
    if (this.isAnimating) {
      throw new Error("Animation is already running");
    }

    console.log(
      "🎬 AnimationService: Starting animation with",
      simulationSteps.length,
      "steps"
    );

    const animationConfig = { ...this.defaultConfig, ...config };
    this.validateConfig(animationConfig);

    // Calculate total frames needed
    this.totalFrames = Math.ceil(
      (animationConfig.duration / 1000) * animationConfig.frameRate
    );
    this.currentFrame = 0;
    this.isAnimating = true;

    console.log(
      "🎬 AnimationService: Total frames:",
      this.totalFrames,
      "Duration:",
      animationConfig.duration
    );

    // Emit start event
    this.emitEvent({
      type: "start",
      timestamp: Date.now(),
    });

    return new Promise((resolve) => {
      this.startTime = Date.now();
      this.runAnimationLoop(simulationSteps, animationConfig, resolve);
    });
  }

  /**
   * Stop current animation
   */
  stopAnimation(): void {
    console.log("🛑 AnimationService: Stopping animation");

    // Cancel animation frame if running
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log("🛑 AnimationService: Animation frame cancelled");
    }

    // Reset animation state
    this.isAnimating = false;
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.startTime = 0;

    console.log("🛑 AnimationService: Animation state reset");

    // Emit stop event
    this.emitEvent({
      type: "stop",
      timestamp: Date.now(),
    });

    console.log("🛑 AnimationService: Stop event emitted");
  }

  /**
   * Pause current animation
   */
  pauseAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Emit pause event
    this.emitEvent({
      type: "pause",
      timestamp: Date.now(),
    });
  }

  /**
   * Resume paused animation
   */
  resumeAnimation(): void {
    if (!this.isAnimating) {
      throw new Error("No animation to resume");
    }

    this.startTime =
      Date.now() -
      (this.currentFrame / this.totalFrames) * this.defaultConfig.duration;

    // Emit resume event
    this.emitEvent({
      type: "resume",
      timestamp: Date.now(),
    });
  }

  /**
   * Run animation loop
   * @param simulationSteps - Simulation steps to animate
   * @param config - Animation configuration
   * @param onComplete - Callback when animation completes
   */
  private runAnimationLoop(
    simulationSteps: SimulationStepData[],
    config: AnimationConfig,
    onComplete: () => void
  ): void {
    const animate = () => {
      // Check if animation was stopped
      if (!this.isAnimating) {
        console.log("🛑 AnimationService: Animation stopped, exiting loop");
        onComplete();
        return;
      }

      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / config.duration, 1);

      // Calculate current frame
      this.currentFrame = Math.floor(progress * this.totalFrames);

      // Generate animation frame
      const frame = this.generateAnimationFrame(
        simulationSteps,
        progress,
        config
      );

      // Emit frame event
      this.emitEvent({
        type: "frame",
        data: frame,
        timestamp: Date.now(),
      });

      if (progress >= 1) {
        // Animation complete
        console.log("✅ AnimationService: Animation completed naturally");
        this.isAnimating = false;
        this.currentFrame = this.totalFrames;

        // Emit complete event
        this.emitEvent({
          type: "complete",
          timestamp: Date.now(),
        });

        onComplete();
        return;
      }

      // Schedule next frame
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  /**
   * Generate animation frame from simulation steps
   * @param simulationSteps - Simulation steps
   * @param progress - Animation progress (0-1)
   * @param config - Animation configuration
   * @returns Animation frame
   */
  private generateAnimationFrame(
    simulationSteps: SimulationStepData[],
    progress: number,
    config: AnimationConfig
  ): AnimationFrame {
    // Apply easing to progress
    const easedProgress = this.applyEasing(progress, config.easing);

    // Interpolate between simulation steps
    const interpolatedStep = this.interpolateSimulationSteps(
      simulationSteps,
      easedProgress
    );

    // Generate visual effects
    const effects = this.generateEffects(interpolatedStep, config);

    return {
      timestamp: Date.now(),
      position: interpolatedStep.position,
      speed: interpolatedStep.speed,
      acceleration: interpolatedStep.acceleration,
      opacity: this.calculateOpacity(easedProgress),
      scale: this.calculateScale(easedProgress),
      rotation: this.calculateRotation(interpolatedStep.speed),
      effects,
    };
  }

  /**
   * Interpolate between simulation steps
   * @param simulationSteps - Array of simulation steps
   * @param progress - Progress value (0-1)
   * @returns Interpolated simulation step
   */
  private interpolateSimulationSteps(
    simulationSteps: SimulationStepData[],
    progress: number
  ): {
    position: PositionVO;
    speed: number;
    acceleration: number;
  } {
    if (simulationSteps.length === 0) {
      throw new Error("No simulation steps provided");
    }

    if (simulationSteps.length === 1) {
      const step = simulationSteps[0];
      return {
        position: step.position,
        speed: step.speed,
        acceleration: step.acceleration,
      };
    }

    // Find the two steps to interpolate between
    const targetTime =
      progress * simulationSteps[simulationSteps.length - 1].timestamp;

    let beforeStep: SimulationStepData | null = null;
    let afterStep: SimulationStepData | null = null;

    for (let i = 0; i < simulationSteps.length - 1; i++) {
      const currentStep = simulationSteps[i];
      const nextStep = simulationSteps[i + 1];

      if (
        currentStep &&
        nextStep &&
        currentStep.timestamp <= targetTime &&
        nextStep.timestamp >= targetTime
      ) {
        beforeStep = currentStep;
        afterStep = nextStep;
        break;
      }
    }

    if (!beforeStep || !afterStep) {
      // Use last step if we're past the end
      const lastStep = simulationSteps[simulationSteps.length - 1];
      if (!lastStep) {
        throw new Error("No simulation steps available");
      }
      return {
        position: lastStep.position,
        speed: lastStep.speed,
        acceleration: lastStep.acceleration,
      };
    }

    // Calculate interpolation factor
    const timeDiff = afterStep.timestamp - beforeStep.timestamp;
    const factor =
      timeDiff > 0 ? (targetTime - beforeStep.timestamp) / timeDiff : 0;

    // Interpolate values
    const position = new PositionVO(
      beforeStep.position.x +
        (afterStep.position.x - beforeStep.position.x) * factor,
      beforeStep.position.y +
        (afterStep.position.y - beforeStep.position.y) * factor
    );

    const speed =
      beforeStep.speed + (afterStep.speed - beforeStep.speed) * factor;
    const acceleration =
      beforeStep.acceleration +
      (afterStep.acceleration - beforeStep.acceleration) * factor;

    return { position, speed, acceleration };
  }

  /**
   * Apply easing function to progress
   * @param progress - Linear progress (0-1)
   * @param easing - Easing function type
   * @returns Eased progress value
   */
  private applyEasing(progress: number, easing: EasingFunction): number {
    switch (easing) {
      case "linear":
        return progress;
      case "easeIn":
        return progress * progress;
      case "easeOut":
        return 1 - (1 - progress) * (1 - progress);
      case "easeInOut":
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case "bounce":
        return this.bounceEasing(progress);
      case "elastic":
        return this.elasticEasing(progress);
      default:
        return progress;
    }
  }

  /**
   * Bounce easing function
   * @param progress - Linear progress (0-1)
   * @returns Bounced progress value
   */
  private bounceEasing(progress: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } else if (progress < 2 / d1) {
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } else {
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
    }
  }

  /**
   * Elastic easing function
   * @param progress - Linear progress (0-1)
   * @returns Elastic progress value
   */
  private elasticEasing(progress: number): number {
    const c4 = (2 * Math.PI) / 3;

    return progress === 0
      ? 0
      : progress === 1
      ? 1
      : progress < 0.5
      ? -(
          Math.pow(2, 20 * progress - 10) *
          Math.sin((20 * progress - 11.125) * c4)
        ) / 2
      : (Math.pow(2, -20 * progress + 10) *
          Math.sin((20 * progress - 11.125) * c4)) /
          2 +
        1;
  }

  /**
   * Generate visual effects for animation frame
   * @param interpolatedStep - Interpolated simulation step
   * @param config - Animation configuration
   * @returns Array of animation effects
   */
  private generateEffects(
    interpolatedStep: {
      position: PositionVO;
      speed: number;
      acceleration: number;
    },
    config: AnimationConfig
  ): AnimationEffect[] {
    const effects: AnimationEffect[] = [];

    if (config.enableParticles && interpolatedStep.speed > 10) {
      // Generate particles based on speed
      const particleCount = Math.floor(
        (interpolatedStep.speed / 100) * config.particleCount
      );

      for (let i = 0; i < particleCount; i++) {
        effects.push(
          AnimationEffectVO.create({
            type: "particle",
            position: {
              x: interpolatedStep.position.x + (Math.random() - 0.5) * 20,
              y: interpolatedStep.position.y + (Math.random() - 0.5) * 20,
            },
            intensity: Math.random(),
            duration: 1000 + Math.random() * 2000,
            color: "#FFD700", // Gold particles
            size: 2 + Math.random() * 3,
            opacity: 0.8 + Math.random() * 0.2,
          })
        );
      }
    }

    if (config.enableTrail) {
      // Generate trail effect
      for (let i = 0; i < config.trailLength; i++) {
        const trailProgress = i / config.trailLength;
        effects.push(
          AnimationEffectVO.create({
            type: "trail",
            position: {
              x:
                interpolatedStep.position.x -
                interpolatedStep.speed * trailProgress * 0.1,
              y: interpolatedStep.position.y,
            },
            intensity: 1 - trailProgress,
            duration: 500,
            color: "#00FFFF", // Cyan trail
            size: 2,
            opacity: 1 - trailProgress,
          })
        );
      }
    }

    if (config.enableSpeedLines && interpolatedStep.speed > 50) {
      // Generate speed lines
      const lineCount = Math.floor(interpolatedStep.speed / 25);

      for (let i = 0; i < lineCount; i++) {
        effects.push(
          AnimationEffectVO.create({
            type: "speedLine",
            position: {
              x: interpolatedStep.position.x + (Math.random() - 0.5) * 100,
              y: interpolatedStep.position.y + (Math.random() - 0.5) * 100,
            },
            intensity: interpolatedStep.speed / 100,
            duration: 200,
            color: "#FFFFFF", // White speed lines
            size: 1,
            opacity: 0.8,
          })
        );
      }
    }

    // Generate dust particles at low speeds
    if (interpolatedStep.speed > 5 && interpolatedStep.speed < 30) {
      effects.push(
        AnimationEffectVO.create({
          type: "dust",
          position: {
            x: interpolatedStep.position.x + (Math.random() - 0.5) * 30,
            y: interpolatedStep.position.y + (Math.random() - 0.5) * 30,
          },
          intensity: 0.5,
          duration: 1500,
          color: "#8B4513", // Brown dust
          size: 1,
          opacity: 0.6,
        })
      );
    }

    return effects;
  }

  /**
   * Calculate opacity based on progress
   * @param progress - Animation progress
   * @returns Opacity value (0-1)
   */
  private calculateOpacity(progress: number): number {
    // Fade in at start, fade out at end
    if (progress < 0.1) {
      return progress / 0.1;
    } else if (progress > 0.9) {
      return (1 - progress) / 0.1;
    }
    return 1;
  }

  /**
   * Calculate scale based on progress
   * @param progress - Animation progress
   * @returns Scale value
   */
  private calculateScale(progress: number): number {
    // Scale up at start, then maintain
    if (progress < 0.2) {
      return 0.5 + (progress / 0.2) * 0.5;
    }
    return 1;
  }

  /**
   * Calculate rotation based on speed
   * @param speed - Current speed
   * @returns Rotation in radians
   */
  private calculateRotation(speed: number): number {
    // Rotate based on speed (wheels spinning faster)
    return (speed / 100) * Math.PI * 2;
  }

  /**
   * Add event listener for animation events
   * @param eventType - Type of event to listen for
   * @param callback - Callback function
   */
  addEventListener(
    eventType: string,
    callback: (event: AnimationEvent) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   * @param eventType - Type of event
   * @param callback - Callback function to remove
   */
  removeEventListener(
    eventType: string,
    callback: (event: AnimationEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit animation event
   * @param event - Animation event to emit
   */
  private emitEvent(event: AnimationEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }
  }

  /**
   * Validate animation configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: AnimationConfig): void {
    if (config.duration <= 0) {
      throw new Error("Animation duration must be positive");
    }
    if (config.frameRate <= 0 || config.frameRate > 120) {
      throw new Error("Frame rate must be between 1 and 120 FPS");
    }
    if (config.particleCount < 0 || config.particleCount > 1000) {
      throw new Error("Particle count must be between 0 and 1000");
    }
    if (config.trailLength < 0 || config.trailLength > 100) {
      throw new Error("Trail length must be between 0 and 100");
    }
  }

  /**
   * Get current animation status
   * @returns Animation status object
   */
  getStatus(): {
    isAnimating: boolean;
    currentFrame: number;
    totalFrames: number;
    progress: number;
  } {
    return {
      isAnimating: this.isAnimating,
      currentFrame: this.currentFrame,
      totalFrames: this.totalFrames,
      progress: this.totalFrames > 0 ? this.currentFrame / this.totalFrames : 0,
    };
  }

  /**
   * Get default animation configuration
   * @returns Default configuration
   */
  getDefaultConfig(): AnimationConfig {
    return { ...this.defaultConfig };
  }
}
