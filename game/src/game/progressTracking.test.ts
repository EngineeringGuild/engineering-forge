import { describe, expect, it } from 'vitest';
import { LEVELS } from '../content/levels';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';

describe('Level Progress Tracking Logic', () => {
  it('identifies completed levels correctly based on stars > 0', () => {
    const mockProgress: Record<string, { stars: 1 | 2 | 3; bestCost: number }> = {
      [LEVELS[0].id]: { stars: 3, bestCost: 80 },
      [LEVELS[1].id]: { stars: 2, bestCost: 150 },
    };

    const isCompleted = (id: string) => (mockProgress[id]?.stars ?? 0) > 0;

    expect(isCompleted(LEVELS[0].id)).toBe(true);
    expect(isCompleted(LEVELS[1].id)).toBe(true);
    expect(isCompleted(LEVELS[2].id)).toBe(false);

    const completedCount = LEVELS.filter((l) => isCompleted(l.id)).length;
    expect(completedCount).toBe(2);
  });

  it('calculates pack progress percentages accurately', () => {
    const totalCircuits = CIRCUIT_LEVELS.length;
    expect(totalCircuits).toBeGreaterThan(0);

    const calcPercent = (completed: number, total: number) =>
      total > 0 ? Math.round((completed / total) * 100) : 0;

    expect(calcPercent(0, totalCircuits)).toBe(0);
    expect(calcPercent(totalCircuits, totalCircuits)).toBe(100);
    expect(calcPercent(3, 6)).toBe(50);
  });

  it('calculates total stars earned vs max stars', () => {
    const totalVehicles = VEHICLE_LEVELS.length;
    const maxStars = totalVehicles * 3;

    const mockVehicleProgress: Record<string, { stars: 1 | 2 | 3; bestCost: number }> = {
      [VEHICLE_LEVELS[0].id]: { stars: 3, bestCost: 50 },
      [VEHICLE_LEVELS[1].id]: { stars: 1, bestCost: 90 },
    };

    const earnedStars = VEHICLE_LEVELS.reduce(
      (acc, lvl) => acc + (mockVehicleProgress[lvl.id]?.stars ?? 0),
      0,
    );

    expect(earnedStars).toBe(4);
    expect(maxStars).toBe(15);
  });

  it('ProgressManager records completions and preserves highest star score', async () => {
    const { progressManager } = await import('../state/ProgressManager');
    progressManager.resetAllProgress();

    // Record initial completion: 2 stars at $120, 52 seconds
    progressManager.recordLevelCompletion('structures', LEVELS[0].id, 2, 120, 52);
    expect(progressManager.isLevelCompleted('structures', LEVELS[0].id)).toBe(true);
    expect(progressManager.getStarsForLevel('structures', LEVELS[0].id)).toBe(2);

    // Replay with 1 star at lower cost ($90) and faster time (41 seconds) -> Stars must NOT regress!
    progressManager.recordLevelCompletion('structures', LEVELS[0].id, 1, 90, 41);
    expect(progressManager.getStarsForLevel('structures', LEVELS[0].id)).toBe(2);

    // Replay with 3 stars at $85 and 28 seconds -> Stars must upgrade to 3
    progressManager.recordLevelCompletion('structures', LEVELS[0].id, 3, 85, 28);
    expect(progressManager.getStarsForLevel('structures', LEVELS[0].id)).toBe(3);

    // Pack progress verification
    const structProgress = progressManager.getPackProgress('structures');
    expect(structProgress.completed).toBe(1);
    expect(structProgress.earnedStars).toBe(3);
    expect(structProgress.total).toBe(LEVELS.length);
    expect(structProgress.percent).toBeGreaterThan(0);

    // Global progress verification
    const globalProg = progressManager.getGlobalProgress();
    expect(globalProg.completedLevels).toBe(1);
    expect(globalProg.totalLevels).toBe(
      LEVELS.length + CIRCUIT_LEVELS.length + VEHICLE_LEVELS.length,
    );
    expect(globalProg.earnedStars).toBe(3);

    // Reset pack progress
    progressManager.resetPackProgress('structures');
    expect(progressManager.isLevelCompleted('structures', LEVELS[0].id)).toBe(false);
  });
});

