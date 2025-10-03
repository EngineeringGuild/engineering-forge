// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/application/services/CarSimulationManager.ts

import { Component } from "../../domain/entities/Component";
import { SimulationResult } from "../../domain/entities/SimulationResult";
import { CanvasRenderingService } from "../../domain/services/CanvasRenderingService";
import {
  CarSimulationResult,
  CarSimulationService,
} from "../../domain/services/CarSimulationService";
import { AnimationState } from "../../domain/value-objects/AnimationState";
import { SimulationStepData } from "../../domain/value-objects/SimulationStepData";
import { AnimationService } from "./AnimationService";

export interface CarSimulationConfig {
  trackLength: number;
  maxSimulationTime: number;
  enablePhysics: boolean;
  animationDuration: number;
  frameRate: number;
  enableEffects: boolean;
}

export interface CarSimulationEvents {
  onSimulationStart?: () => void;
  onSimulationStop?: () => void;
  onSimulationComplete?: (result: SimulationResult) => void;
  onAnimationFrame?: (state: AnimationState) => void;
  onError?: (error: string) => void;
}

export class CarSimulationManager {
  private simulationService: CarSimulationService;
  private animationService: AnimationService;
  private canvasRenderingService: CanvasRenderingService;
  private config: CarSimulationConfig;
  private events: CarSimulationEvents;
  private currentState: AnimationState;
  private simulationResult: CarSimulationResult | null = null;

  constructor(config: CarSimulationConfig, events: CarSimulationEvents = {}) {
    this.config = config;
    this.events = events;

    this.simulationService = new CarSimulationService();
    this.animationService = new AnimationService();
    this.canvasRenderingService = new CanvasRenderingService({
      trackLength: config.trackLength,
      canvasWidth: 800,
      canvasHeight: 256,
      enableEffects: config.enableEffects,
      enableProgressBar: true,
    });
    this.currentState = AnimationState.create({
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
   * Start car simulation
   */
  async startSimulation(components: Component[]): Promise<void> {
    try {
      console.log(
        "🚀 CarSimulationManager: Starting simulation with",
        components.length,
        "components"
      );
      this.validateComponents(components);
      this.events.onSimulationStart?.();

      // Run simulation
      console.log("⚙️ CarSimulationManager: Running simulation service...");
      const result = await this.simulationService.runSimulation(components, {
        trackLength: this.config.trackLength,
        maxSimulationTime: this.config.maxSimulationTime,
        enablePhysics: this.config.enablePhysics,
      });

      console.log(
        "✅ CarSimulationManager: Simulation completed with",
        result.simulationSteps.length,
        "steps"
      );
      this.simulationResult = result;

      // Start animation
      console.log("🎬 CarSimulationManager: Starting animation...");
      await this.startAnimation(result.simulationSteps);
      console.log("🎬 CarSimulationManager: Animation started successfully");
    } catch (error) {
      console.error("❌ CarSimulationManager: Simulation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Simulation failed";
      this.events.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Stop simulation
   */
  stopSimulation(): void {
    this.animationService.stopAnimation();
    this.currentState = this.currentState.stop();
    this.events.onSimulationStop?.();
  }

  /**
   * Reset simulation
   */
  resetSimulation(): void {
    this.stopSimulation();
    this.currentState = this.currentState.reset();
    this.simulationResult = null;
  }

  /**
   * Get current animation state
   */
  getCurrentState(): AnimationState {
    return this.currentState;
  }

  /**
   * Get simulation result
   */
  getSimulationResult(): CarSimulationResult | null {
    return this.simulationResult;
  }

  /**
   * Render canvas
   */
  renderCanvas(ctx: CanvasRenderingContext2D): void {
    this.canvasRenderingService.clearCanvas(ctx);
    this.canvasRenderingService.renderTrack(ctx, this.config.trackLength);

    if (this.currentState.currentFrame) {
      this.canvasRenderingService.renderEffects(ctx, this.currentState.effects);
      this.canvasRenderingService.renderCar(
        ctx,
        this.currentState.currentFrame,
        this.config.trackLength
      );
    }

    if (this.currentState.isAnimating) {
      this.canvasRenderingService.renderProgressBar(
        ctx,
        this.currentState.progress
      );
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CarSimulationConfig>): void {
    this.config = { ...this.config, ...config };
    this.canvasRenderingService.updateConfig({
      trackLength: this.config.trackLength,
      enableEffects: this.config.enableEffects,
    });
  }

  /**
   * Update events
   */
  updateEvents(events: Partial<CarSimulationEvents>): void {
    this.events = { ...this.events, ...events };
  }

  // Private methods
  private validateComponents(components: Component[]): void {
    const hasChassis = components.some((c) => c.type === "chassis");
    const hasEngine = components.some((c) => c.type === "engine");
    const hasWheels = components.some((c) => c.type === "wheels");

    if (!hasChassis || !hasEngine || !hasWheels) {
      const missing = [];
      if (!hasChassis) missing.push("chassis");
      if (!hasEngine) missing.push("engine");
      if (!hasWheels) missing.push("wheels");
      throw new Error(
        `Car must have chassis, engine, and wheels to run simulation. Missing: ${missing.join(
          ", "
        )}`
      );
    }
  }

  private async startAnimation(simulationSteps: any[]): Promise<void> {
    try {
      this.currentState = this.currentState.start();

      // Add animation event listeners
      this.animationService.addEventListener("frame", (event) => {
        if (event.data) {
          const stepData = SimulationStepData.create({
            timestamp: event.data.timestamp,
            position: event.data.position,
            speed: event.data.speed,
            acceleration: event.data.acceleration,
            performance: event.data.performance,
            effects: event.data.effects || [],
            rotation: event.data.rotation || 0,
            scale: event.data.scale || 1,
            opacity: event.data.opacity || 1,
          });

          this.currentState = this.currentState.update({
            currentFrame: event.data,
            progress: event.data.position.x / this.config.trackLength,
            speed: event.data.speed,
            distance: event.data.position.x,
            effects: stepData.effects,
          });

          this.events.onAnimationFrame?.(this.currentState);
        }
      });

      this.animationService.addEventListener("stop", () => {
        this.currentState = this.currentState.stop();
        this.events.onSimulationStop?.();
      });

      this.animationService.addEventListener("complete", () => {
        this.currentState = this.currentState.stop();
        this.events.onSimulationStop?.();

        if (this.simulationResult) {
          const simulationResult = new SimulationResult(
            this.simulationResult.id,
            {
              startTime: this.simulationResult.startTime,
              endTime: this.simulationResult.endTime,
              duration: this.simulationResult.duration,
              distance: this.simulationResult.distance,
              maxSpeed: this.simulationResult.maxSpeed,
              averageSpeed: this.simulationResult.averageSpeed,
              finalPerformance: this.simulationResult.finalPerformance,
              score: this.simulationResult.score,
              passed: this.simulationResult.passed,
              simulationSteps: simulationSteps,
              userId: "user-001",
            }
          );

          this.events.onSimulationComplete?.(simulationResult);
        }
      });

      // Start animation
      await this.animationService.startAnimation(simulationSteps, {
        duration: this.config.animationDuration,
        frameRate: this.config.frameRate,
        easing: "easeInOut",
        enableParticles: this.config.enableEffects,
        enableTrail: this.config.enableEffects,
        enableSpeedLines: this.config.enableEffects,
      });
    } catch (error) {
      this.currentState = this.currentState.stop();
      throw error;
    }
  }
}
