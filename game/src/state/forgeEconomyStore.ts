/**
 * Engineering Forge - Game Economy & Tech Tree State Management
 * Implements the 4 Forge Currencies (Forge Credits F$, Research Points RP, Steel Scrap, Engineer XP)
 * and the RPG-style non-linear Technology Tree (DOC-10).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TechNode {
  id: string;
  name: string;
  branch: 'structures' | 'electricity' | 'machines';
  tier: 1 | 2 | 3 | 4;
  rpCost: number;
  creditsCost: number;
  unlocked: boolean;
  requiredNodeIds: string[];
  description: string;
  unlockedFeatureLabel: string;
}

export interface EconomyWallet {
  credits: number; // Forge Credits (F$)
  researchPoints: number; // RP
  steelScrapKg: number; // Scrap & Alloys
  engineerXp: number; // Experience
  engineerRank: 'Apprentice' | 'Journeyman' | 'Specialist' | 'Chief Engineer';
}

export const INITIAL_TECH_TREE: TechNode[] = [
  // Structures Branch
  {
    id: 'tech-str-01',
    name: 'Madeira Tratada & Encaixes Simples',
    branch: 'structures',
    tier: 1,
    rpCost: 0,
    creditsCost: 0,
    unlocked: true,
    requiredNodeIds: [],
    description: 'Barras de pinho tratadas para vãos curtos e prototipagem rápida.',
    unlockedFeatureLabel: 'Material Madeira (E = 11 GPa, σ = 40 MPa)',
  },
  {
    id: 'tech-str-02',
    name: 'Aço Estrutural ASTM A36',
    branch: 'structures',
    tier: 2,
    rpCost: 150,
    creditsCost: 800,
    unlocked: false,
    requiredNodeIds: ['tech-str-01'],
    description: 'Perfis laminados com alta resistência a escoamento e módulo de elasticidade 18x maior.',
    unlockedFeatureLabel: 'Material Aço Estrutural (E = 200 GPa, σ = 250 MPa)',
  },
  {
    id: 'tech-str-03',
    name: 'Cabos de Aço Trançado & Tirantes',
    branch: 'structures',
    tier: 3,
    rpCost: 350,
    creditsCost: 1600,
    unlocked: false,
    requiredNodeIds: ['tech-str-02'],
    description: 'Cabos flexíveis de altíssima tração para pontes estaiadas e suspensas.',
    unlockedFeatureLabel: 'Cabo de Aço Especial (σ = 600 MPa, Tração Pura)',
  },
  {
    id: 'tech-str-04',
    name: 'Liga de Titânio Aeroespacial Ti-6Al-4V',
    branch: 'structures',
    tier: 4,
    rpCost: 800,
    creditsCost: 4000,
    unlocked: false,
    requiredNodeIds: ['tech-str-03'],
    description: 'Material ultraleve e resistente à fadiga para grandes vãos sem suportes intermediários.',
    unlockedFeatureLabel: 'Titânio Aeroespacial (E = 114 GPa, σ = 880 MPa)',
  },

  // Electricity Branch
  {
    id: 'tech-elec-01',
    name: 'Condutores de Cobre & Lâmpadas Incandescentes',
    branch: 'electricity',
    tier: 1,
    rpCost: 0,
    creditsCost: 0,
    unlocked: true,
    requiredNodeIds: [],
    description: 'Fiação básica para circuitos resistivos simples em corrente contínua.',
    unlockedFeatureLabel: 'Condutores de Baixa Resistência & Lâmpadas 12V',
  },
  {
    id: 'tech-elec-02',
    name: 'Divisores de Tensão & Resistores Cerâmicos',
    branch: 'electricity',
    tier: 2,
    rpCost: 120,
    creditsCost: 600,
    unlocked: false,
    requiredNodeIds: ['tech-elec-01'],
    description: 'Controle de atenuação de potência e prevenção de sobrecarga térmica Joule.',
    unlockedFeatureLabel: 'Bancada de Resistores Ajustáveis (1Ω a 100kΩ)',
  },
  {
    id: 'tech-elec-03',
    name: 'Relés de Acionamento & Isolamento Galvânico',
    branch: 'electricity',
    tier: 3,
    rpCost: 300,
    creditsCost: 1500,
    unlocked: false,
    requiredNodeIds: ['tech-elec-02'],
    description: 'Acoplamento de chaves eletromecânicas para controle de atuadores de alta potência.',
    unlockedFeatureLabel: 'Relé Eletromecânico SPDT com Acoplamento Seguro',
  },
  {
    id: 'tech-elec-04',
    name: 'Circuitos Lógicos TTL & Portas Combinacionais',
    branch: 'electricity',
    tier: 4,
    rpCost: 750,
    creditsCost: 3500,
    unlocked: false,
    requiredNodeIds: ['tech-elec-03'],
    description: 'Lógica booleana integrada (AND, OR, NOT, XOR) para automação mecatrônica total.',
    unlockedFeatureLabel: 'Portas Lógicas Digitais TTL Integradas',
  },

  // Machines / Vehicles Branch
  {
    id: 'tech-mach-01',
    name: 'Motor DC Escovado & Chassi Tubular Leve',
    branch: 'machines',
    tier: 1,
    rpCost: 0,
    creditsCost: 0,
    unlocked: true,
    requiredNodeIds: [],
    description: 'Configuração automotiva básica para percursos planos e velocidade moderada.',
    unlockedFeatureLabel: 'Motor Small (1500N) + Chassi Leve (800kg)',
  },
  {
    id: 'tech-mach-02',
    name: 'Pneus de Alto Atrito & Caixa Redutora',
    branch: 'machines',
    tier: 2,
    rpCost: 180,
    creditsCost: 950,
    unlocked: false,
    requiredNodeIds: ['tech-mach-01'],
    description: 'Maximização do teto de aderência de Coulomb (μ = 1.1) para subidas íngremes.',
    unlockedFeatureLabel: 'Pneus de Competição Aderentes (μ = 1.15)',
  },
  {
    id: 'tech-mach-03',
    name: 'Motor V8 de Alto Torque & Chassi Reforçado',
    branch: 'machines',
    tier: 3,
    rpCost: 400,
    creditsCost: 2200,
    unlocked: false,
    requiredNodeIds: ['tech-mach-02'],
    description: 'Trem de força de alta densidade energética para cargas úteis pesadas em aclive.',
    unlockedFeatureLabel: 'Motor Large (3000N) + Chassi Reforçado',
  },
  {
    id: 'tech-mach-04',
    name: 'Turbina Turbo-Híbrida de Alta Potência',
    branch: 'machines',
    tier: 4,
    rpCost: 900,
    creditsCost: 4800,
    unlocked: false,
    requiredNodeIds: ['tech-mach-03'],
    description: 'Propulsão avançada com aceleração extrema e gerenciamento de inércia.',
    unlockedFeatureLabel: 'Motor Turbo Híbrido (8000N de Empuxo Constante)',
  },
];

interface ForgeEconomyState {
  wallet: EconomyWallet;
  techTree: TechNode[];

  // Actions
  addRewards: (credits: number, rp: number, scrapKg: number, xp: number) => void;
  unlockTechNode: (nodeId: string) => boolean;
  canUnlockNode: (nodeId: string) => { canUnlock: boolean; reason?: string };
  resetEconomyProgress: () => void;
}

export function computeEngineerRank(xp: number): EconomyWallet['engineerRank'] {
  if (xp >= 5000) return 'Chief Engineer';
  if (xp >= 2000) return 'Specialist';
  if (xp >= 600) return 'Journeyman';
  return 'Apprentice';
}

export const useForgeEconomyStore = create<ForgeEconomyState>()(
  persist(
    (set, get) => ({
      wallet: {
        credits: 1500,
        researchPoints: 200,
        steelScrapKg: 45,
        engineerXp: 350,
        engineerRank: 'Apprentice',
      },
      techTree: INITIAL_TECH_TREE,

      addRewards: (credits, rp, scrapKg, xp) => {
        set((state) => {
          const newXp = state.wallet.engineerXp + xp;
          return {
            wallet: {
              credits: state.wallet.credits + credits,
              researchPoints: state.wallet.researchPoints + rp,
              steelScrapKg: state.wallet.steelScrapKg + scrapKg,
              engineerXp: newXp,
              engineerRank: computeEngineerRank(newXp),
            },
          };
        });
      },

      canUnlockNode: (nodeId: string) => {
        const { wallet, techTree } = get();
        const node = techTree.find((n) => n.id === nodeId);
        if (!node) return { canUnlock: false, reason: 'Tecnologia inexistente.' };
        if (node.unlocked) return { canUnlock: false, reason: 'Já desbloqueada.' };

        // Check prerequisites
        for (const reqId of node.requiredNodeIds) {
          const reqNode = techTree.find((n) => n.id === reqId);
          if (!reqNode || !reqNode.unlocked) {
            return {
              canUnlock: false,
              reason: `Requer pré-requisito: ${reqNode?.name || reqId}`,
            };
          }
        }

        // Check wallet
        if (wallet.researchPoints < node.rpCost) {
          return {
            canUnlock: false,
            reason: `Pontos de P&D insuficientes (${wallet.researchPoints}/${node.rpCost} RP).`,
          };
        }
        if (wallet.credits < node.creditsCost) {
          return {
            canUnlock: false,
            reason: `Créditos insuficientes (${wallet.credits}/${node.creditsCost} F$).`,
          };
        }

        return { canUnlock: true };
      },

      unlockTechNode: (nodeId: string) => {
        const check = get().canUnlockNode(nodeId);
        if (!check.canUnlock) return false;

        const node = get().techTree.find((n) => n.id === nodeId)!;

        set((state) => ({
          wallet: {
            ...state.wallet,
            credits: state.wallet.credits - node.creditsCost,
            researchPoints: state.wallet.researchPoints - node.rpCost,
            engineerXp: state.wallet.engineerXp + node.rpCost * 2,
            engineerRank: computeEngineerRank(state.wallet.engineerXp + node.rpCost * 2),
          },
          techTree: state.techTree.map((n) =>
            n.id === nodeId ? { ...n, unlocked: true } : n
          ),
        }));

        return true;
      },

      resetEconomyProgress: () => {
        set({
          wallet: {
            credits: 1500,
            researchPoints: 200,
            steelScrapKg: 45,
            engineerXp: 350,
            engineerRank: 'Apprentice',
          },
          techTree: INITIAL_TECH_TREE,
        });
      },
    }),
    {
      name: 'engineering-forge-economy-v1',
    }
  )
);
