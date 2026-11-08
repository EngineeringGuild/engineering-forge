/**
 * Star Rating System (1-3 Stars)
 *
 * Evaluates player construction projects based on:
 * 1. Material Usage Efficiency (Cost vs. Budget constraint)
 * 2. Completion Time Efficiency (Elapsed solve time vs. Benchmark Par Time)
 *
 * Persisted in localStorage alongside level completion records.
 */

export interface StarRatingResult {
  passed: boolean;
  cost: number;
  budget: number;
  costRatio: number;
  stars: 0 | 1 | 2 | 3;
  timeSeconds?: number;
  parTimeSeconds: number;
  materialRating: 1 | 2 | 3;
  timeRating: 1 | 2 | 3;
  feedback: string;
}

/**
 * Returns default benchmark par time (seconds) based on level complexity.
 */
export function getDefaultParTime(order?: number): number {
  if (order === undefined || order <= 1) return 45; // 45s for tutorials
  if (order <= 3) return 60; // 60s for intermediate challenges
  return 80; // 80s for complex/multi-load configurations
}

/**
 * Computes 1-3 stars combining material economy and solve speed.
 */
export function computeStarRating(
  passed: boolean,
  cost: number,
  budget: number,
  timeSeconds?: number,
  customParTime?: number,
): StarRatingResult {
  const parTimeSeconds = customParTime ?? 60;
  const costRatio = budget > 0 ? cost / budget : 1;

  if (!passed || cost > budget) {
    return {
      passed: false,
      cost,
      budget,
      costRatio,
      stars: 0,
      timeSeconds,
      parTimeSeconds,
      materialRating: 1,
      timeRating: 1,
      feedback: cost > budget ? 'Over budget limit' : 'Physical requirements not met',
    };
  }

  // 1. Material Usage Efficiency Rating (1-3)
  // Low cost ratio = high material efficiency
  let materialRating: 1 | 2 | 3 = 1;
  if (costRatio <= 0.65) {
    materialRating = 3; // Excellent economy (<= 65% budget)
  } else if (costRatio <= 0.85) {
    materialRating = 2; // Moderate economy (65% - 85% budget)
  } else {
    materialRating = 1; // Baseline (85% - 100% budget)
  }

  // 2. Completion Time Efficiency Rating (1-3)
  let timeRating: 1 | 2 | 3 = 1;
  if (timeSeconds !== undefined && timeSeconds > 0) {
    if (timeSeconds <= parTimeSeconds) {
      timeRating = 3; // Fast solve (under par time)
    } else if (timeSeconds <= parTimeSeconds * 1.5) {
      timeRating = 2; // Decent pace (within 1.5x par)
    } else {
      timeRating = 1; // Methodical build
    }
  } else {
    // If time was not tracked or 0, synchronize timeRating with materialRating for consistency
    timeRating = materialRating;
  }

  // 3. Composite Star Rating (1 - 3 stars)
  let stars: 1 | 2 | 3 = 1;

  if (timeSeconds !== undefined && timeSeconds > 0) {
    // Criteria for 3 Stars (Master Engineer):
    // Both dimensions strong, OR exceptional single-dimension performance
    const isDualMastery =
      (materialRating === 3 && timeRating >= 2) || (materialRating >= 2 && timeRating === 3);
    const isUltraFrugal = materialRating === 3 && costRatio <= 0.5; // Under 50% budget
    const isSpeedrun = timeSeconds <= 25 && costRatio <= 0.75; // Sub-25s speedrun with good budget

    if (isDualMastery || isUltraFrugal || isSpeedrun) {
      stars = 3;
    } else if (materialRating >= 2 || timeRating >= 2) {
      stars = 2;
    } else {
      stars = 1;
    }
  } else {
    // Backward-compatible fallback matching original thresholds (<=0.6 -> 3, <=0.85 -> 2, else 1)
    stars = costRatio <= 0.6 ? 3 : costRatio <= 0.85 ? 2 : 1;
  }

  let feedback = '';
  if (stars === 3) {
    feedback = `Masterful build: ${(costRatio * 100).toFixed(0)}% budget used${
      timeSeconds ? ` in ${timeSeconds.toFixed(1)}s` : ''
    }.`;
  } else if (stars === 2) {
    feedback = `Sturdy design: ${(costRatio * 100).toFixed(0)}% budget. Trim materials or solve faster for 3 stars.`;
  } else {
    feedback = `Passed physics check! Refine structural efficiency to earn more stars.`;
  }

  return {
    passed: true,
    cost,
    budget,
    costRatio,
    stars,
    timeSeconds,
    parTimeSeconds,
    materialRating,
    timeRating,
    feedback,
  };
}
