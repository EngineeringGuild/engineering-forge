import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameProgressionStore } from './gameProgressionStore';
import { LEVELS } from '../content/levels';
import { CIRCUIT_LEVELS } from '../content/circuitLevels';
import { VEHICLE_LEVELS } from '../content/vehicleLevels';

describe('useGameProgressionStore', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const fakeLocalStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    vi.stubGlobal('window', { localStorage: fakeLocalStorage });
    vi.stubGlobal('localStorage', fakeLocalStorage);
    useGameProgressionStore.getState().resetAllProgression();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unlocks the first level in any category by default', () => {
    const store = useGameProgressionStore.getState();
    expect(store.isLevelUnlocked('structures', LEVELS[0].id)).toBe(true);
    expect(store.isLevelUnlocked('circuits', CIRCUIT_LEVELS[0].id)).toBe(true);
    expect(store.isLevelUnlocked('machines', VEHICLE_LEVELS[0].id)).toBe(true);
  });

  it('keeps subsequent levels locked until previous level is completed', () => {
    const store = useGameProgressionStore.getState();
    const secondStruct = LEVELS[1].id;
    expect(store.isLevelUnlocked('structures', secondStruct)).toBe(false);

    // Complete the first level
    store.recordLevelCompletion('structures', LEVELS[0].id, 3, 50, 15);

    expect(useGameProgressionStore.getState().isLevelCompleted('structures', LEVELS[0].id)).toBe(true);
    expect(useGameProgressionStore.getState().isLevelUnlocked('structures', secondStruct)).toBe(true);
  });

  it('computes category completion badges accurately through progress tiers', () => {
    const store = useGameProgressionStore.getState();

    // Initial state: Initiate
    let badge = store.getCategoryBadge('circuits');
    expect(badge.tier).toBe('initiate');
    expect(badge.percent).toBe(0);
    expect(badge.isFullyCompleted).toBe(false);

    // Solve 1 level: Apprentice
    store.recordLevelCompletion('circuits', CIRCUIT_LEVELS[0].id, 2, 80, 25);
    badge = useGameProgressionStore.getState().getCategoryBadge('circuits');
    expect(badge.tier).toBe('apprentice');
    expect(badge.completedCount).toBe(1);

    // Solve all remaining levels in circuits: Master
    for (let i = 1; i < CIRCUIT_LEVELS.length; i++) {
      useGameProgressionStore.getState().recordLevelCompletion('circuits', CIRCUIT_LEVELS[i].id, 3, 60, 20);
    }

    badge = useGameProgressionStore.getState().getCategoryBadge('circuits');
    expect(badge.tier).toBe('master');
    expect(badge.isFullyCompleted).toBe(true);
    expect(badge.percent).toBe(100);
    expect(badge.icon).toBe('🏆');
  });

  it('aggregates overall stats across all 3 categories', () => {
    const store = useGameProgressionStore.getState();
    store.recordLevelCompletion('structures', LEVELS[0].id, 3, 40, 12);
    store.recordLevelCompletion('machines', VEHICLE_LEVELS[0].id, 3, 90, 8);

    const stats = useGameProgressionStore.getState().getOverallStats();
    expect(stats.totalCompleted).toBe(2);
    expect(stats.earnedStars).toBe(6);
    expect(stats.allCategoriesMastered).toBe(false);
  });
});
