import { describe, it, expect, beforeEach } from 'vitest';
import { usePatentExchangeStore } from './patentExchangeStore';
import { useForgeEconomyStore } from './forgeEconomyStore';

describe('Patent Exchange & Blueprint Royalties Store', () => {
  beforeEach(() => {
    useForgeEconomyStore.getState().resetEconomyProgress();
  });

  it('initializes with seed community patents from historical engineers', () => {
    const store = usePatentExchangeStore.getState();
    expect(store.registeredPatents.length).toBeGreaterThanOrEqual(3);

    const warren = store.registeredPatents.find((p) => p.patentNumber.startsWith('PAT-STR-'));
    expect(warren).toBeDefined();
    expect(warren?.licenseFeeCredits).toBe(120);
  });

  it('allows registering a new player patent with deterministic patent number', () => {
    const store = usePatentExchangeStore.getState();

    const created = store.registerNewPatent({
      title: 'Viga em Treliça K-Truss Hiperestática',
      discipline: 'structures',
      authorName: 'Caio Castilho',
      authorWalletAddress: '0x9999GuildPresidentAddress00000000001',
      licenseFeeCredits: 180,
      blueprintPayloadJson: '{"type":"k-truss","nodes":8}',
      technicalHighlights: {
        safetyFactor: 1.95,
        cost: 2100,
        partsCount: 16,
      },
    });

    expect(created.patentNumber).toMatch(/^PAT-STR-\d{4}$/);
    expect(created.downloadsCount).toBe(0);

    const currentList = usePatentExchangeStore.getState().registeredPatents;
    expect(currentList[0].id).toBe(created.id);
  });

  it('licenses a patent, deducting credits from buyer and accumulating royalties', () => {
    const store = usePatentExchangeStore.getState();
    const economy = useForgeEconomyStore.getState();
    const initialCredits = economy.wallet.credits; // 1500

    const patent = store.registeredPatents[0];
    const initialDownloads = patent.downloadsCount;

    const result = store.licensePatent(patent.id, '0xBuyerWalletAddress');
    expect(result.success).toBe(true);

    const updatedEconomy = useForgeEconomyStore.getState();
    expect(updatedEconomy.wallet.credits).toBe(initialCredits - patent.licenseFeeCredits);

    const updatedPatent = usePatentExchangeStore.getState().registeredPatents.find((p) => p.id === patent.id);
    expect(updatedPatent?.downloadsCount).toBe(initialDownloads + 1);
    expect(updatedPatent?.totalRoyaltiesEarned).toBe(patent.totalRoyaltiesEarned + patent.licenseFeeCredits);
  });
});
