import { describe, it, expect } from 'vitest';
import { computeStarRating, getDefaultParTime } from './starRating';

describe('Star Rating System (Time and Material Efficiency)', () => {
  const budget = 1000;
  const parTime = 60; // 60s benchmark

  describe('Failure Conditions', () => {
    it('awards 0 stars when physics verification fails regardless of budget or time', () => {
      const result = computeStarRating(false, 300, budget, 20, parTime);
      expect(result.stars).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('awards 0 stars when cost exceeds budget even if structurally sound and fast', () => {
      const result = computeStarRating(true, 1050, budget, 15, parTime);
      expect(result.stars).toBe(0);
      expect(result.passed).toBe(false);
    });
  });

  describe('Material and Time Combined Criteria', () => {
    it('awards 3 stars for dual excellence in material savings and speed', () => {
      // 55% budget ($550) + fast solve (40s <= 60s par)
      const result = computeStarRating(true, 550, budget, 40, parTime);
      expect(result.stars).toBe(3);
      expect(result.materialRating).toBe(3);
      expect(result.timeRating).toBe(3);
      expect(result.feedback).toContain('Masterful');
    });

    it('awards 3 stars for extreme material economy (<50% budget) even with longer solve times', () => {
      // 45% budget ($450) + deliberate solve (100s > par)
      const result = computeStarRating(true, 450, budget, 100, parTime);
      expect(result.stars).toBe(3);
      expect(result.materialRating).toBe(3);
      expect(result.timeRating).toBe(1);
    });

    it('awards 3 stars for ultra-rapid speedruns (<25s) with good budget efficiency', () => {
      // 70% budget ($700) + speedrun (22s)
      const result = computeStarRating(true, 700, budget, 22, parTime);
      expect(result.stars).toBe(3);
    });

    it('awards 2 stars for moderate material efficiency with decent solve pace', () => {
      // 75% budget ($750) + 70s solve (within 1.5x par)
      const result = computeStarRating(true, 750, budget, 70, parTime);
      expect(result.stars).toBe(2);
      expect(result.materialRating).toBe(2);
      expect(result.timeRating).toBe(2);
    });

    it('awards 2 stars for rapid solves with standard budget usage', () => {
      // 90% budget ($900, materialRating=1) + rapid solve (35s <= 60s, timeRating=3)
      const result = computeStarRating(true, 900, budget, 35, parTime);
      expect(result.stars).toBe(2);
      expect(result.materialRating).toBe(1);
      expect(result.timeRating).toBe(3);
    });

    it('awards 1 star for baseline passing solutions using high budget and long solve times', () => {
      // 95% budget ($950) + long solve (120s > 1.5x par)
      const result = computeStarRating(true, 950, budget, 120, parTime);
      expect(result.stars).toBe(1);
      expect(result.materialRating).toBe(1);
      expect(result.timeRating).toBe(1);
      expect(result.feedback).toContain('Passed physics check');
    });
  });

  describe('Backward-Compatibility (Omitted Time)', () => {
    it('evaluates purely on cost ratio when time is undefined', () => {
      expect(computeStarRating(true, 500, budget).stars).toBe(3); // 50% <= 60%
      expect(computeStarRating(true, 750, budget).stars).toBe(2); // 75% <= 85%
      expect(computeStarRating(true, 900, budget).stars).toBe(1); // 90% > 85%
    });
  });

  describe('Par Time Calibration', () => {
    it('calibrates benchmark par times according to level progression order', () => {
      expect(getDefaultParTime(0)).toBe(45);
      expect(getDefaultParTime(1)).toBe(45);
      expect(getDefaultParTime(2)).toBe(60);
      expect(getDefaultParTime(3)).toBe(60);
      expect(getDefaultParTime(4)).toBe(80);
      expect(getDefaultParTime(10)).toBe(80);
    });
  });
});
