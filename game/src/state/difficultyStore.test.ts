import { describe, it, expect, beforeEach } from 'vitest';
import { useDifficultyStore } from './difficultyStore';

describe('DifficultyStore Physics Modifiers', () => {
  beforeEach(() => {
    useDifficultyStore.getState().resetAllDifficulties();
  });

  it('provides nominal 1.0x multipliers by default', () => {
    const store = useDifficultyStore.getState();
    expect(store.globalDifficulty).toBe('medium');

    const mods = store.getModifiersForLevel();
    expect(mods.gravityMultiplier).toBe(1.0);
    expect(mods.stressCapacityMultiplier).toBe(1.0);
    expect(mods.burnoutPowerMultiplier).toBe(1.0);
  });

  it('adjusts physics parameters when easy difficulty is selected', () => {
    const store = useDifficultyStore.getState();
    store.setGlobalDifficulty('easy');

    const mods = store.getModifiersForLevel();
    expect(mods.gravityMultiplier).toBe(0.8);
    expect(mods.stressCapacityMultiplier).toBe(1.25);
    expect(mods.burnoutPowerMultiplier).toBe(1.25);
  });

  it('adjusts physics parameters when hard difficulty is selected', () => {
    const store = useDifficultyStore.getState();
    store.setGlobalDifficulty('hard');

    const mods = store.getModifiersForLevel();
    expect(mods.gravityMultiplier).toBe(1.15);
    expect(mods.stressCapacityMultiplier).toBe(0.85);
    expect(mods.burnoutPowerMultiplier).toBe(0.9);
    expect(mods.scoreBonusMultiplier).toBe(1.4);
  });

  it('supports level-specific overrides over global difficulty', () => {
    const store = useDifficultyStore.getState();
    store.setGlobalDifficulty('medium');

    // Override specifically for level 'the-chasm'
    store.setLevelDifficulty('the-chasm', 'hard');

    expect(store.getDifficultyForLevel('the-chasm')).toBe('hard');
    expect(store.getModifiersForLevel('the-chasm').gravityMultiplier).toBe(1.15);

    // Other levels retain global medium
    expect(store.getDifficultyForLevel('level-1')).toBe('medium');
    expect(store.getModifiersForLevel('level-1').gravityMultiplier).toBe(1.0);
  });
});
