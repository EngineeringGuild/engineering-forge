import { describe, it, expect, beforeEach } from 'vitest';
import {
  useForgeEconomyStore,
  computeEngineerRank,
} from './forgeEconomyStore';

describe('Forge Economy & Tech Tree Engine', () => {
  beforeEach(() => {
    useForgeEconomyStore.getState().resetEconomyProgress();
  });

  it('calculates correct engineer rank based on earned XP', () => {
    expect(computeEngineerRank(100)).toBe('Apprentice');
    expect(computeEngineerRank(650)).toBe('Journeyman');
    expect(computeEngineerRank(2200)).toBe('Specialist');
    expect(computeEngineerRank(5500)).toBe('Chief Engineer');
  });

  it('correctly checks prerequisites and wallet balances before unlocking nodes', () => {
    const store = useForgeEconomyStore.getState();

    // tech-str-02 requires tech-str-01 (which starts unlocked), 150 RP and 800 F$
    const checkStr2 = store.canUnlockNode('tech-str-02');
    expect(checkStr2.canUnlock).toBe(true);

    // tech-str-03 requires tech-str-02 (locked initially)
    const checkStr3 = store.canUnlockNode('tech-str-03');
    expect(checkStr3.canUnlock).toBe(false);
    expect(checkStr3.reason).toContain('Requer pré-requisito');
  });

  it('unlocks node, deducts wallet currency and awards engineer XP', () => {
    const store = useForgeEconomyStore.getState();
    const initialCredits = store.wallet.credits;
    const initialRp = store.wallet.researchPoints;

    const success = store.unlockTechNode('tech-str-02');
    expect(success).toBe(true);

    const updated = useForgeEconomyStore.getState();
    expect(updated.wallet.credits).toBe(initialCredits - 800);
    expect(updated.wallet.researchPoints).toBe(initialRp - 150);

    const unlockedNode = updated.techTree.find((n) => n.id === 'tech-str-02');
    expect(unlockedNode?.unlocked).toBe(true);
  });

  it('adds rewards after contract completion', () => {
    const store = useForgeEconomyStore.getState();
    store.addRewards(500, 100, 20, 300);

    const updated = useForgeEconomyStore.getState();
    expect(updated.wallet.credits).toBe(2000);
    expect(updated.wallet.researchPoints).toBe(300);
    expect(updated.wallet.steelScrapKg).toBe(65);
    expect(updated.wallet.engineerXp).toBe(650);
    expect(updated.wallet.engineerRank).toBe('Journeyman');
  });
});
