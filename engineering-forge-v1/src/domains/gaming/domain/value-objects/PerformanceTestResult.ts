// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/PerformanceTestResult.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";

export interface PerformanceTestResultProps {
  readonly fps: number;
  readonly memoryUsage: number;
  readonly loadTime: number;
  readonly renderTime: number;
  readonly score: number;
  readonly grade: "A" | "B" | "C" | "D" | "F";
  readonly recommendations: string[];
  readonly timestamp: Date;
}

export class PerformanceTestResult extends ValueObject<PerformanceTestResultProps> {
  public static create(
    props: Omit<PerformanceTestResultProps, "timestamp">
  ): PerformanceTestResult {
    this.validateTestResult(props);
    return new PerformanceTestResult({
      ...props,
      timestamp: new Date(),
    });
  }

  private static validateTestResult(
    props: Omit<PerformanceTestResultProps, "timestamp">
  ): void {
    if (props.fps < 0) {
      throw new Error("FPS must be non-negative");
    }

    if (props.memoryUsage < 0) {
      throw new Error("Memory usage must be non-negative");
    }

    if (props.loadTime < 0) {
      throw new Error("Load time must be non-negative");
    }

    if (props.renderTime < 0) {
      throw new Error("Render time must be non-negative");
    }

    if (props.score < 0 || props.score > 100) {
      throw new Error("Score must be between 0 and 100");
    }

    if (!["A", "B", "C", "D", "F"].includes(props.grade)) {
      throw new Error("Grade must be A, B, C, D, or F");
    }

    if (!Array.isArray(props.recommendations)) {
      throw new Error("Recommendations must be an array");
    }
  }

  get fps(): number {
    return this.props.fps;
  }

  get memoryUsage(): number {
    return this.props.memoryUsage;
  }

  get loadTime(): number {
    return this.props.loadTime;
  }

  get renderTime(): number {
    return this.props.renderTime;
  }

  get score(): number {
    return this.props.score;
  }

  get grade(): "A" | "B" | "C" | "D" | "F" {
    return this.props.grade;
  }

  get recommendations(): string[] {
    return [...this.props.recommendations];
  }

  get timestamp(): Date {
    return new Date(this.props.timestamp);
  }

  /**
   * Calculate performance grade based on score
   */
  static calculateGrade(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  /**
   * Generate recommendations based on performance metrics
   */
  static generateRecommendations(
    fps: number,
    memoryUsage: number,
    loadTime: number,
    renderTime: number
  ): string[] {
    const recommendations: string[] = [];

    if (fps < 30) {
      recommendations.push("Consider reducing visual effects to improve FPS");
    }

    if (memoryUsage > 100) {
      recommendations.push("Optimize memory usage by reducing texture quality");
    }

    if (loadTime > 3000) {
      recommendations.push(
        "Implement lazy loading to reduce initial load time"
      );
    }

    if (renderTime > 16) {
      recommendations.push(
        "Optimize rendering pipeline for better performance"
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Performance is excellent! No optimizations needed."
      );
    }

    return recommendations;
  }

  /**
   * Calculate overall performance score
   */
  static calculateScore(
    fps: number,
    memoryUsage: number,
    loadTime: number,
    renderTime: number
  ): number {
    let score = 100;

    // FPS scoring (target: 60fps)
    if (fps < 30) score -= 30;
    else if (fps < 45) score -= 20;
    else if (fps < 60) score -= 10;

    // Memory usage scoring (target: <50MB)
    if (memoryUsage > 100) score -= 25;
    else if (memoryUsage > 75) score -= 15;
    else if (memoryUsage > 50) score -= 10;

    // Load time scoring (target: <2s)
    if (loadTime > 5000) score -= 25;
    else if (loadTime > 3000) score -= 15;
    else if (loadTime > 2000) score -= 10;

    // Render time scoring (target: <16ms for 60fps)
    if (renderTime > 32) score -= 20;
    else if (renderTime > 24) score -= 15;
    else if (renderTime > 16) score -= 10;

    return Math.max(0, Math.min(100, score));
  }
}
