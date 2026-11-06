import { describe, it, expect } from 'vitest';
import {
  PhysicsPerformanceTracker,
  physicsPerformanceTracker,
} from './PhysicsPerformanceTracker';

describe('PhysicsPerformanceTracker', () => {
  it('provides singleton instance and allows custom instances', () => {
    expect(PhysicsPerformanceTracker.getInstance()).toBe(physicsPerformanceTracker);

    const custom = new PhysicsPerformanceTracker(10, 16.6667);
    expect(custom).toBeInstanceOf(PhysicsPerformanceTracker);
  });

  it('records frame calculation times and computes correct statistics', () => {
    const tracker = new PhysicsPerformanceTracker(5, 16.6667);

    // Initial empty state
    const initial = tracker.getMetrics();
    expect(initial.lastCalculationTimeMs).toBe(0);
    expect(initial.averageCalculationTimeMs).toBe(0);
    expect(initial.totalFrames).toBe(0);

    // Record samples: 2ms, 4ms, 6ms
    tracker.recordSample(2.0);
    tracker.recordSample(4.0);
    tracker.recordSample(6.0);

    const m = tracker.getMetrics();
    expect(m.totalFrames).toBe(3);
    expect(m.lastCalculationTimeMs).toBeCloseTo(6.0);
    expect(m.averageCalculationTimeMs).toBeCloseTo(4.0); // (2+4+6)/3
    expect(m.minCalculationTimeMs).toBeCloseTo(2.0);
    expect(m.peakCalculationTimeMs).toBeCloseTo(6.0);
    expect(m.samples).toEqual([2.0, 4.0, 6.0]);

    // Check CPU percentage calculation (6ms on 16.667ms budget = 36%)
    expect(m.cpuUsagePercent).toBeCloseTo((6.0 / 16.6667) * 100, 1);
    expect(m.averageCpuUsagePercent).toBeCloseTo((4.0 / 16.6667) * 100, 1);
  });

  it('enforces maximum rolling window sample limit', () => {
    const tracker = new PhysicsPerformanceTracker(3, 16.6667);

    tracker.recordSample(1.0);
    tracker.recordSample(2.0);
    tracker.recordSample(3.0);
    tracker.recordSample(4.0);
    tracker.recordSample(5.0);

    const m = tracker.getMetrics();
    expect(m.totalFrames).toBe(5);
    // Should keep only the last 3 samples: [3.0, 4.0, 5.0]
    expect(m.samples).toEqual([3.0, 4.0, 5.0]);
    expect(m.minCalculationTimeMs).toBe(3.0);
    expect(m.peakCalculationTimeMs).toBe(5.0);
    expect(m.averageCalculationTimeMs).toBeCloseTo(4.0);
  });

  it('measures synchronous computation execution with measure()', () => {
    const tracker = new PhysicsPerformanceTracker(10, 16.6667);

    const result = tracker.measure(() => {
      let acc = 0;
      for (let i = 0; i < 10000; i++) {
        acc += i;
      }
      return acc;
    });

    expect(result).toBe(49995000);
    const m = tracker.getMetrics();
    expect(m.totalFrames).toBe(1);
    expect(m.lastCalculationTimeMs).toBeGreaterThan(0);
  });

  it('resets history cleanly', () => {
    const tracker = new PhysicsPerformanceTracker(10, 16.6667);
    tracker.recordSample(3.5);
    tracker.recordSample(7.2);
    expect(tracker.getMetrics().totalFrames).toBe(2);

    tracker.reset();
    expect(tracker.getMetrics().totalFrames).toBe(0);
    expect(tracker.getMetrics().samples).toEqual([]);
  });
});
