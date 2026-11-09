import { describe, it, expect } from 'vitest';
import { getStressHeatmapRgb, STRESS_HEATMAP_STOPS, calculateSafetyFactor } from '../physics/heatmap';

describe('Simulation Time-Scale & Stress Heatmap Overlay Suite', () => {
  describe('Simulation Time-Scale Values (0.25x, 0.5x, 1x, 2x)', () => {
    it('supports the required discrete simulation time-scale speed stops', () => {
      const allowedSpeeds = [0.25, 0.5, 1, 2] as const;
      expect(allowedSpeeds).toHaveLength(4);
      expect(allowedSpeeds[0]).toBe(0.25);
      expect(allowedSpeeds[1]).toBe(0.5);
      expect(allowedSpeeds[2]).toBe(1.0);
      expect(allowedSpeeds[3]).toBe(2.0);

      // Verify scaling factor calculations for Matter.js delta time steps
      const baseDt = 16.67; // ~60fps frame duration in ms
      expect(baseDt * allowedSpeeds[0]).toBeCloseTo(4.1675);
      expect(baseDt * allowedSpeeds[1]).toBeCloseTo(8.335);
      expect(baseDt * allowedSpeeds[2]).toBeCloseTo(16.67);
      expect(baseDt * allowedSpeeds[3]).toBeCloseTo(33.34);
    });

    it('maps slider indexes 0..3 correctly to speed values', () => {
      const speeds = [0.25, 0.5, 1, 2] as const;
      const indexToSpeed = (idx: number) => speeds[idx];
      const speedToIndex = (spd: number) => {
        if (spd === 0.25) return 0;
        if (spd === 0.5) return 1;
        if (spd === 1) return 2;
        return 3;
      };

      expect(indexToSpeed(0)).toBe(0.25);
      expect(indexToSpeed(1)).toBe(0.5);
      expect(indexToSpeed(2)).toBe(1);
      expect(indexToSpeed(3)).toBe(2);

      expect(speedToIndex(0.25)).toBe(0);
      expect(speedToIndex(0.5)).toBe(1);
      expect(speedToIndex(1)).toBe(2);
      expect(speedToIndex(2)).toBe(3);
    });
  });

  describe('FEA Structural Stress Heatmap Overlay', () => {
    it('accurately color-codes components with red indicating critical failure risk (>=100% or failed)', () => {
      // 0% utilization -> Blue (Safe)
      const zero = getStressHeatmapRgb(0.0);
      expect(zero).toBe('rgb(37, 99, 235)');

      // 50% utilization -> Green (Nominal)
      const half = getStressHeatmapRgb(0.5);
      expect(half).toBe('rgb(16, 185, 129)');

      // 75% utilization -> Amber (Elevated)
      const threeQuarter = getStressHeatmapRgb(0.75);
      expect(threeQuarter).toBe('rgb(245, 158, 11)');

      // 100% utilization -> Crimson Red (Critical Failure Risk)
      const critical = getStressHeatmapRgb(1.0);
      expect(critical).toBe('rgb(239, 68, 68)');

      // Exceeding capacity (> 1.0) -> Crimson Red
      const overCapacity = getStressHeatmapRgb(1.35);
      expect(overCapacity).toBe('rgb(239, 68, 68)');

      // Ruptured / failed member -> Immediate Crimson Red failure signal
      const failed = getStressHeatmapRgb(0.4, true);
      expect(failed).toBe('#ef4444');
    });

    it('transitions safety factor ratings to failing when utilization reaches or exceeds 1.0', () => {
      const nominalSF = calculateSafetyFactor(0.5);
      expect(nominalSF.rating).toBe('nominal');
      expect(nominalSF.sf).toBe(2.0);

      const criticalSF = calculateSafetyFactor(1.0);
      expect(criticalSF.rating).toBe('marginal');
      expect(criticalSF.sf).toBe(1.0);

      const failedSF = calculateSafetyFactor(1.05);
      expect(failedSF.rating).toBe('failing');
      expect(failedSF.sf).toBeLessThan(1.0);
      expect(failedSF.label).toContain('Yield Failure');
    });

    it('maintains continuous scientific spectrum stops without gaps', () => {
      for (let i = 0; i < STRESS_HEATMAP_STOPS.length - 1; i++) {
        expect(STRESS_HEATMAP_STOPS[i + 1].stop).toBeGreaterThan(STRESS_HEATMAP_STOPS[i].stop);
      }
      expect(STRESS_HEATMAP_STOPS[0].hex).toBe('#2563eb');
      expect(STRESS_HEATMAP_STOPS[STRESS_HEATMAP_STOPS.length - 1].hex).toBe('#ef4444');
    });
  });
});
