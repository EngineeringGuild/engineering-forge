/**
 * PhysicsPerformanceTracker
 * 
 * High-precision performance monitor tracking frame-by-frame physics calculation times,
 * rolling latency metrics, peak compute spikes, and CPU budget utilization.
 */

export interface PhysicsPerformanceMetrics {
  /** Calculation time of the most recent physics step in milliseconds */
  lastCalculationTimeMs: number;
  /** Rolling window average calculation time in milliseconds */
  averageCalculationTimeMs: number;
  /** Maximum calculation time observed in the current rolling window in milliseconds */
  peakCalculationTimeMs: number;
  /** Minimum calculation time observed in the current rolling window in milliseconds */
  minCalculationTimeMs: number;
  /**
   * Estimated CPU budget utilization (0% - 100%+).
   * Computed as: (calculationTimeMs / targetBudgetMs) * 100
   * Where targetBudgetMs is typically 16.67ms for a 60 FPS frame rate.
   */
  cpuUsagePercent: number;
  /** Rolling average CPU budget utilization */
  averageCpuUsagePercent: number;
  /** Array of recent calculation time samples for sparkline / histogram rendering */
  samples: number[];
  /** Target frame budget in milliseconds (default 16.67ms for 60Hz) */
  targetBudgetMs: number;
  /** Total number of recorded frame calculations */
  totalFrames: number;
}

export class PhysicsPerformanceTracker {
  private static instance: PhysicsPerformanceTracker | null = null;
  private samples: number[] = [];
  private maxSamples: number;
  private targetBudgetMs: number;
  private totalFrames: number = 0;

  constructor(maxSamples: number = 40, targetBudgetMs: number = 1000 / 60) {
    this.maxSamples = maxSamples;
    this.targetBudgetMs = targetBudgetMs;
  }

  public static getInstance(): PhysicsPerformanceTracker {
    if (!PhysicsPerformanceTracker.instance) {
      PhysicsPerformanceTracker.instance = new PhysicsPerformanceTracker();
    }
    return PhysicsPerformanceTracker.instance;
  }

  /**
   * Records a frame's physics computation duration.
   * @param calculationTimeMs Execution duration in milliseconds
   */
  public recordSample(calculationTimeMs: number): void {
    const validTime = Math.max(0.001, calculationTimeMs);
    this.samples.push(validTime);
    this.totalFrames++;

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Measures the execution of a synchronous physics calculation callback.
   * @param fn Function to execute and measure
   * @returns Result of the function
   */
  public measure<T>(fn: () => T): T {
    const t0 = performance.now();
    try {
      return fn();
    } finally {
      const dt = performance.now() - t0;
      this.recordSample(dt);
    }
  }

  /**
   * Returns calculated real-time performance metrics and rolling history.
   */
  public getMetrics(): PhysicsPerformanceMetrics {
    if (this.samples.length === 0) {
      return {
        lastCalculationTimeMs: 0,
        averageCalculationTimeMs: 0,
        peakCalculationTimeMs: 0,
        minCalculationTimeMs: 0,
        cpuUsagePercent: 0,
        averageCpuUsagePercent: 0,
        samples: [],
        targetBudgetMs: this.targetBudgetMs,
        totalFrames: this.totalFrames,
      };
    }

    const last = this.samples[this.samples.length - 1];
    let sum = 0;
    let peak = -Infinity;
    let min = Infinity;

    for (let i = 0; i < this.samples.length; i++) {
      const val = this.samples[i];
      sum += val;
      if (val > peak) peak = val;
      if (val < min) min = val;
    }

    const avg = sum / this.samples.length;
    const cpuUsagePercent = Math.min(100, (last / this.targetBudgetMs) * 100);
    const averageCpuUsagePercent = Math.min(100, (avg / this.targetBudgetMs) * 100);

    return {
      lastCalculationTimeMs: last,
      averageCalculationTimeMs: avg,
      peakCalculationTimeMs: peak === -Infinity ? 0 : peak,
      minCalculationTimeMs: min === Infinity ? 0 : min,
      cpuUsagePercent,
      averageCpuUsagePercent,
      samples: [...this.samples],
      targetBudgetMs: this.targetBudgetMs,
      totalFrames: this.totalFrames,
    };
  }

  /**
   * Resets the sample history.
   */
  public reset(): void {
    this.samples = [];
    this.totalFrames = 0;
  }
}

export const physicsPerformanceTracker = PhysicsPerformanceTracker.getInstance();
