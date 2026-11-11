import { describe, it, expect, beforeEach } from 'vitest';
import { useAchievementStore } from './achievementStore';

describe('AchievementStore Milestone Tracking', () => {
  beforeEach(() => {
    useAchievementStore.getState().resetAchievements();
  });

  it('initializes with zero achievements unlocked', () => {
    const store = useAchievementStore.getState();
    expect(Object.keys(store.unlocked).length).toBe(0);
    expect(store.getTotalPoints()).toBe(0);
  });

  it('unlocks milestones and awards engineering XP points', () => {
    const store = useAchievementStore.getState();

    const newlyUnlocked = store.unlockAchievement('first_bridge');
    expect(newlyUnlocked).toBe(true);
    expect(store.isUnlocked('first_bridge')).toBe(true);
    expect(store.getTotalPoints()).toBe(100);

    // Unlocking duplicate returns false and does not double-award points
    const duplicate = store.unlockAchievement('first_bridge');
    expect(duplicate).toBe(false);
    expect(store.getTotalPoints()).toBe(100);
  });

  it('tracks recent unlocked banner and allows clearing', () => {
    useAchievementStore.getState().unlockAchievement('master_builder');

    const updated = useAchievementStore.getState();
    expect(updated.recentUnlocked).toBeDefined();
    expect(updated.recentUnlocked?.id).toBe('master_builder');

    updated.clearRecentBanner();
    expect(useAchievementStore.getState().recentUnlocked).toBeNull();
  });

  it('aggregates total points across multiple achievements', () => {
    const store = useAchievementStore.getState();
    store.unlockAchievement('first_bridge'); // 100
    store.unlockAchievement('first_spark'); // 100
    store.unlockAchievement('mechatronics_maestro'); // 300

    expect(store.getTotalPoints()).toBe(500);
  });
});
