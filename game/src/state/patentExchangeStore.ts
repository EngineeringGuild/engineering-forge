/**
 * Engineering Forge - Blueprint Patent & Royalties Exchange Engine
 * Allows players to register their engineered blueprints as guild patents,
 * set licensing royalty fees in Forge Credits (F$), and earn passive royalties (DOC-10).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useForgeEconomyStore } from './forgeEconomyStore';

export interface PatentBlueprint {
  id: string;
  patentNumber: string; // e.g. "PAT-STR-8492"
  title: string;
  discipline: 'structures' | 'electricity' | 'machines';
  authorName: string;
  authorWalletAddress: string;
  registeredAt: string;
  licenseFeeCredits: number; // e.g. 150 F$
  downloadsCount: number;
  totalRoyaltiesEarned: number;
  blueprintPayloadJson: string;
  technicalHighlights: {
    safetyFactor: number;
    cost: number;
    partsCount: number;
  };
}

interface PatentExchangeState {
  registeredPatents: PatentBlueprint[];

  // Actions
  registerNewPatent: (
    patent: Omit<PatentBlueprint, 'id' | 'patentNumber' | 'registeredAt' | 'downloadsCount' | 'totalRoyaltiesEarned'>
  ) => PatentBlueprint;
  licensePatent: (patentId: string, buyerWallet: string) => { success: boolean; reason?: string };
  getUserEarnedRoyalties: (authorName: string) => number;
}

const INITIAL_COMMUNITY_PATENTS: PatentBlueprint[] = [
  {
    id: 'pat-warren-optima',
    patentNumber: 'PAT-STR-1042',
    title: 'Treliça Warren Ultraleve com Tirantes de Cabo',
    discipline: 'structures',
    authorName: 'Gustave Eiffel (AI)',
    authorWalletAddress: '0x1889EiffelTowerParisFrance0000000001',
    registeredAt: '2026-11-01T10:00:00Z',
    licenseFeeCredits: 120,
    downloadsCount: 14,
    totalRoyaltiesEarned: 1680,
    blueprintPayloadJson: '{"type":"warren-cables","nodes":5,"members":7}',
    technicalHighlights: {
      safetyFactor: 1.62,
      cost: 1450,
      partsCount: 12,
    },
  },
  {
    id: 'pat-hbridge-mosfet',
    patentNumber: 'PAT-ELEC-2091',
    title: 'Ponte H de Inversão Rápida com Relé Intertravado',
    discipline: 'electricity',
    authorName: 'Nikola Tesla (AI)',
    authorWalletAddress: '0x1893WardenclyffeTowerACPower000002',
    registeredAt: '2026-11-05T14:30:00Z',
    licenseFeeCredits: 200,
    downloadsCount: 8,
    totalRoyaltiesEarned: 1600,
    blueprintPayloadJson: '{"type":"h-bridge","relays":2,"resistors":4}',
    technicalHighlights: {
      safetyFactor: 1.85,
      cost: 850,
      partsCount: 9,
    },
  },
  {
    id: 'pat-crawler-coulomb',
    patentNumber: 'PAT-MACH-3419',
    title: 'Powertrain AWD com Teto de Atrito Pacejka Máximo',
    discipline: 'machines',
    authorName: 'Santos Dumont (AI)',
    authorWalletAddress: '0x1906DemoiselleAeroGuild000000000003',
    registeredAt: '2026-11-08T09:15:00Z',
    licenseFeeCredits: 250,
    downloadsCount: 19,
    totalRoyaltiesEarned: 4750,
    blueprintPayloadJson: '{"type":"crawler-awd","engine":"turbo","chassis":"heavy"}',
    technicalHighlights: {
      safetyFactor: 1.55,
      cost: 2400,
      partsCount: 6,
    },
  },
];

export const usePatentExchangeStore = create<PatentExchangeState>()(
  persist(
    (set, get) => ({
      registeredPatents: INITIAL_COMMUNITY_PATENTS,

      registerNewPatent: (input) => {
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const prefix = input.discipline.slice(0, 3).toUpperCase();
        const patentNumber = `PAT-${prefix}-${randomDigits}`;
        const newPatent: PatentBlueprint = {
          ...input,
          id: `pat-${Date.now().toString(36)}`,
          patentNumber,
          registeredAt: new Date().toISOString(),
          downloadsCount: 0,
          totalRoyaltiesEarned: 0,
        };

        set((state) => ({
          registeredPatents: [newPatent, ...state.registeredPatents],
        }));

        return newPatent;
      },

      licensePatent: (patentId: string, _buyerWallet: string) => {
        const { registeredPatents } = get();
        const patent = registeredPatents.find((p) => p.id === patentId);
        if (!patent) {
          return { success: false, reason: 'Patente não encontrada no catálogo.' };
        }

        const economy = useForgeEconomyStore.getState();
        if (economy.wallet.credits < patent.licenseFeeCredits) {
          return {
            success: false,
            reason: `Saldo insuficiente de Créditos da Forja (${economy.wallet.credits}/${patent.licenseFeeCredits} F$).`,
          };
        }

        // Deduct license fee from buyer wallet and award 50 XP
        economy.addRewards(-patent.licenseFeeCredits, 0, 0, 50);

        // Update patent downloads and royalties
        set((state) => ({
          registeredPatents: state.registeredPatents.map((p) =>
            p.id === patentId
              ? {
                  ...p,
                  downloadsCount: p.downloadsCount + 1,
                  totalRoyaltiesEarned: p.totalRoyaltiesEarned + patent.licenseFeeCredits,
                }
              : p
          ),
        }));

        return { success: true };
      },

      getUserEarnedRoyalties: (authorName: string) => {
        const patents = get().registeredPatents.filter((p) => p.authorName === authorName);
        return patents.reduce((acc, p) => acc + p.totalRoyaltiesEarned, 0);
      },
    }),
    {
      name: 'engineering-forge-patents-v1',
    }
  )
);
