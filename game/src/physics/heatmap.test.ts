import { describe, it, expect } from 'vitest';
import {
  getStressHeatmapRgb,
  calculateSafetyFactor,
  formatForce,
  STRESS_HEATMAP_STOPS,
} from './heatmap';

describe('Physics Heatmap & Stress Utilities', () => {
  it('defines 6 stops from 0% to 100% in STRESS_HEATMAP_STOPS', () => {
    expect(STRESS_HEATMAP_STOPS.length).toBe(6);
    expect(STRESS_HEATMAP_STOPS[0].stop).toBe(0.0);
    expect(STRESS_HEATMAP_STOPS[5].stop).toBe(1.0);
  });

  it('interpolates colors correctly across the 6-stop spectrum from blue to red', () => {
    // 0% utilization should match royal blue stop
    const blue = getStressHeatmapRgb(0.0);
    expect(blue).toBe('rgb(37, 99, 235)');

    // 50% utilization should match emerald green stop
    const green = getStressHeatmapRgb(0.5);
    expect(green).toBe('rgb(16, 185, 129)');

    // 100% utilization should match crimson red stop
    const red = getStressHeatmapRgb(1.0);
    expect(red).toBe('rgb(239, 68, 68)');

    // When isFailed is true, return red
    expect(getStressHeatmapRgb(0.2, true)).toBe('#ef4444');
  });

  it('clamps utilization to [0, 1] for smooth gradient computation', () => {
    const under = getStressHeatmapRgb(-0.5);
    expect(under).toBe('rgb(37, 99, 235)');

    const over = getStressHeatmapRgb(2.5);
    expect(over).toBe('rgb(239, 68, 68)');
  });

  it('calculates engineering safety factor SF = 1 / utilization', () => {
    const safe = calculateSafetyFactor(0.5);
    expect(safe.sf).toBeCloseTo(2.0);
    expect(safe.rating).toBe('nominal');

    const failing = calculateSafetyFactor(1.25);
    expect(failing.sf).toBeCloseTo(0.8);
    expect(failing.rating).toBe('failing');

    const zero = calculateSafetyFactor(0);
    expect(zero.rating).toBe('generous');
  });

  it('formats forces accurately in Newtons and kiloNewtons with tension/compression designation', () => {
    const tension = formatForce(8500);
    expect(tension.type).toBe('tension');
    expect(tension.formatted).toBe('+8.5 kN (T)');

    const compression = formatForce(-12200);
    expect(compression.type).toBe('compression');
    expect(compression.formatted).toBe('-12.2 kN (C)');

    const small = formatForce(250);
    expect(small.formatted).toBe('+250 N (T)');

    const neutral = formatForce(0);
    expect(neutral.type).toBe('neutral');
  });
});
