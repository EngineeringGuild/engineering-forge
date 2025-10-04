// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/CanvasRenderingService.ts

import { AnimationFrame } from "../../application/services/AnimationService";
import { AnimationEffect } from "../value-objects/AnimationEffect";

export interface CanvasRenderingConfig {
  trackLength: number;
  canvasWidth: number;
  canvasHeight: number;
  enableEffects: boolean;
  enableProgressBar: boolean;
}

export class CanvasRenderingService {
  private config: CanvasRenderingConfig;

  constructor(config: CanvasRenderingConfig) {
    this.config = config;
  }

  /**
   * Render car on canvas
   */
  renderCar(
    ctx: CanvasRenderingContext2D,
    frame: AnimationFrame,
    trackLength: number
  ): void {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const carX =
      centerX +
      (frame.position.x / trackLength) * (canvas.width * 0.8) -
      canvas.width * 0.4;
    const carY = canvas.height / 2;

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(carX, carY);
    ctx.scale(frame.scale, frame.scale);
    ctx.rotate(frame.rotation);
    ctx.globalAlpha = frame.opacity;

    // Draw car body
    ctx.fillStyle = "#3B82F6";
    ctx.fillRect(-30, -15, 60, 30);

    // Draw wheels
    ctx.fillStyle = "#1F2937";
    ctx.fillRect(-25, -20, 8, 10);
    ctx.fillRect(17, -20, 8, 10);
    ctx.fillRect(-25, 10, 8, 10);
    ctx.fillRect(17, 10, 8, 10);

    // Draw speed indicator
    if (frame.speed > 0) {
      ctx.fillStyle = "#10B981";
      ctx.font = "12px Arial";
      ctx.fillText(`${Math.round(frame.speed)} km/h`, -20, -25);
    }

    // Restore context
    ctx.restore();
  }

  /**
   * Render track on canvas
   */
  renderTrack(ctx: CanvasRenderingContext2D, trackLength: number): void {
    const canvas = ctx.canvas;
    const trackY = canvas.height / 2;

    // Draw track background
    ctx.fillStyle = "#374151";
    ctx.fillRect(0, trackY - 50, canvas.width, 100);

    // Draw track lines
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, trackY);
    ctx.lineTo(canvas.width, trackY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw track borders
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, trackY - 50);
    ctx.lineTo(canvas.width, trackY - 50);
    ctx.moveTo(0, trackY + 50);
    ctx.lineTo(canvas.width, trackY + 50);
    ctx.stroke();

    // Draw distance markers
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "12px Arial";
    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i;
      const distance = (i / 10) * trackLength;
      ctx.fillText(`${Math.round(distance)}m`, x, trackY - 60);
    }
  }

  /**
   * Render effects on canvas
   */
  renderEffects(
    ctx: CanvasRenderingContext2D,
    effects: AnimationEffect[]
  ): void {
    if (!this.config.enableEffects) return;

    effects.forEach((effect) => {
      ctx.save();
      ctx.globalAlpha = effect.opacity * effect.intensity;

      switch (effect.type) {
        case "particle":
          this.renderParticleEffect(ctx, effect);
          break;
        case "trail":
          this.renderTrailEffect(ctx, effect);
          break;
        case "speedLine":
          this.renderSpeedLineEffect(ctx, effect);
          break;
        case "dust":
          this.renderDustEffect(ctx, effect);
          break;
        case "explosion":
          this.renderExplosionEffect(ctx, effect);
          break;
        case "smoke":
          this.renderSmokeEffect(ctx, effect);
          break;
      }

      ctx.restore();
    });
  }

  /**
   * Render progress bar
   */
  renderProgressBar(ctx: CanvasRenderingContext2D, progress: number): void {
    if (!this.config.enableProgressBar) return;

    const canvas = ctx.canvas;
    ctx.fillStyle = "#10B981";
    ctx.fillRect(0, canvas.height - 4, canvas.width * progress, 4);
  }

  /**
   * Clear canvas
   */
  clearCanvas(ctx: CanvasRenderingContext2D): void {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Private effect rendering methods
  private renderParticleEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.arc(
      effect.position.x,
      effect.position.y,
      effect.size || 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  private renderTrailEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = effect.size || 2;
    ctx.beginPath();
    ctx.moveTo(effect.position.x, effect.position.y - 5);
    ctx.lineTo(effect.position.x, effect.position.y + 5);
    ctx.stroke();
  }

  private renderSpeedLineEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(effect.position.x - 20, effect.position.y);
    ctx.lineTo(effect.position.x + 20, effect.position.y);
    ctx.stroke();
  }

  private renderDustEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    ctx.fillStyle = effect.color;
    ctx.beginPath();
    ctx.arc(
      effect.position.x,
      effect.position.y,
      effect.size || 1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  private renderExplosionEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    const size = effect.size || 5;
    const gradient = ctx.createRadialGradient(
      effect.position.x,
      effect.position.y,
      0,
      effect.position.x,
      effect.position.y,
      size * 2
    );
    gradient.addColorStop(0, effect.color);
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(effect.position.x, effect.position.y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSmokeEffect(
    ctx: CanvasRenderingContext2D,
    effect: AnimationEffect
  ): void {
    ctx.fillStyle = effect.color;
    ctx.globalAlpha = (effect.opacity || 1) * 0.5;
    ctx.beginPath();
    ctx.arc(
      effect.position.x,
      effect.position.y,
      effect.size || 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CanvasRenderingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
