import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EducatorTrack, EducatorLevelDef } from './educatorTypes';
import { decodeTrackFromUrlHash, importFromClassPackage } from './educatorPackaging';

const PRESET_TRACKS: EducatorTrack[] = [
  {
    id: 'track-bncc-structures-01',
    title: 'Estática de Treliças & Deformação Estrutural',
    teacherName: 'Prof. Castilho (Engineering Guild)',
    institution: 'Instituto de Tecnologia & Ciências Aplicadas',
    createdAt: '2026-11-11T00:00:00.000Z',
    updatedAt: '2026-11-11T00:00:00.000Z',
    discipline: 'structures',
    gradeLevel: 'high-school',
    curriculumTags: ['EM13CNT101', 'EM13CNT102', 'MS-ETS1-2'],
    isPublished: true,
    levels: [
      {
        id: 'edu-struct-01',
        schemaVersion: 'forge-educator/1.0',
        title: 'Vão Livre Simples — Triangulação Fundamental',
        discipline: 'structures',
        description: 'Construa uma treliça capaz de vencer um vão livre de 16m sob carga pontual de 40kN com fator de segurança mínimo de 1.50.',
        learningObjectives: [
          'Identificar a estabilidade geométrica da triangulação',
          'Diferenciar barras tracionadas de barras comprimidas',
          'Calcular a margem de segurança sob o Método da Rigidez Direta',
        ],
        curriculumCodes: ['EM13CNT102', 'MS-ETS1-2'],
        difficultyGrade: 'high-school',
        inventory: {
          allowedMaterials: ['wood', 'steel', 'cable'],
          budgetLimit: 140,
        },
        rubric: {
          safetyFactorMinimum: 1.5,
          targetEfficiencyPercent: 80,
          revealHintAfterAttempts: 2,
          pedagogicalHint: 'Lembre-se: cabos são muito mais leves e baratos, mas só resistem à tração pura. Nunca utilize cabos em barras sujeitas à compressão.',
          theoreticalOptimalCost: 95,
        },
        geometry: {
          spanWidthMeters: 16,
          deckHeightMeters: 0,
          fixedAnchorsCount: 1,
          rollerAnchorsCount: 1,
          targetLoadKn: 40,
        },
      },
      {
        id: 'edu-struct-02',
        schemaVersion: 'forge-educator/1.0',
        title: 'Ponte Estaiada com Mastro Central',
        discipline: 'structures',
        description: 'Vença um vão de 24m utilizando um mastro central rígido e tirantes de cabo para suspender os nós centrais do tabuleiro.',
        learningObjectives: [
          'Aplicar cabos em tração axial balanceada',
          'Analisar a transferência de cargas para as fundações',
        ],
        curriculumCodes: ['EM13CNT101', 'HS-ETS1-3'],
        difficultyGrade: 'high-school',
        inventory: {
          allowedMaterials: ['wood', 'steel', 'cable', 'strut'],
          budgetLimit: 220,
        },
        rubric: {
          safetyFactorMinimum: 1.4,
          targetEfficiencyPercent: 75,
          revealHintAfterAttempts: 3,
          pedagogicalHint: 'O mastro central absorve compressão axial; use aço ou madeira reforçada nele, enquanto os tirantes diagonais trabalham em tração com cabos.',
        },
        geometry: {
          spanWidthMeters: 24,
          fixedAnchorsCount: 2,
          rollerAnchorsCount: 1,
          targetLoadKn: 60,
        },
      },
    ],
  },
  {
    id: 'track-bncc-circuits-01',
    title: 'Associação Mista & Dissipação Joule',
    teacherName: 'Coordenação de Física Experimental',
    institution: 'Laboratório Central de Eletricidade',
    createdAt: '2026-11-11T00:00:00.000Z',
    updatedAt: '2026-11-11T00:00:00.000Z',
    discipline: 'circuits',
    gradeLevel: 'high-school',
    curriculumTags: ['EM13CNT301', 'HS-ETS1-3'],
    isPublished: true,
    levels: [
      {
        id: 'edu-circ-01',
        schemaVersion: 'forge-educator/1.0',
        title: 'Divisor de Tensão e Proteção de Lâmpada',
        discipline: 'circuits',
        description: 'Conecte uma lâmpada de 3V a um barramento de 12V utilizando uma rede balanceada de resistores sem queimar o filamento.',
        learningObjectives: [
          'Compreender a primeira e segunda leis de Kirchhoff',
          'Calcular a queda de potencial em associação em série',
          'Dimensionar a potência dissipada para evitar sobretensão',
        ],
        curriculumCodes: ['EM13CNT301'],
        difficultyGrade: 'high-school',
        inventory: {
          allowedMaterials: ['wire', 'resistor_5', 'resistor_15'],
          budgetLimit: 80,
        },
        rubric: {
          safetyFactorMinimum: 1.2,
          targetEfficiencyPercent: 85,
          revealHintAfterAttempts: 2,
          pedagogicalHint: 'A lâmpada precisa de pelo menos 1W para acender mas queima com mais de 4W. Em 12V, a resistência limitadora deve dissipar a maior parte da tensão.',
        },
        geometry: {
          spanWidthMeters: 10,
          fixedAnchorsCount: 2,
          rollerAnchorsCount: 0,
          sourceVoltageV: 12,
        },
      },
    ],
  },
];

interface EducatorStoreState {
  tracks: EducatorTrack[];
  activeTrackId: string | null;
  addTrack: (track: EducatorTrack) => void;
  updateTrack: (id: string, partial: Partial<EducatorTrack>) => void;
  deleteTrack: (id: string) => void;
  setActiveTrack: (id: string | null) => void;
  addLevelToTrack: (trackId: string, level: EducatorLevelDef) => void;
  deleteLevelFromTrack: (trackId: string, levelId: string) => void;
  importTrack: (payload: string) => { success: boolean; track?: EducatorTrack; error?: string };
  resetToDefaults: () => void;
}

export const useEducatorStore = create<EducatorStoreState>()(
  persist(
    (set, get) => ({
      tracks: PRESET_TRACKS,
      activeTrackId: null,

      addTrack: (track: EducatorTrack) => {
        set((state) => ({
          tracks: [...state.tracks, track],
          activeTrackId: track.id,
        }));
      },

      updateTrack: (id: string, partial: Partial<EducatorTrack>) => {
        set((state) => ({
          tracks: state.tracks.map((t) =>
            t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTrack: (id: string) => {
        set((state) => ({
          tracks: state.tracks.filter((t) => t.id !== id),
          activeTrackId: state.activeTrackId === id ? null : state.activeTrackId,
        }));
      },

      setActiveTrack: (id: string | null) => {
        set({ activeTrackId: id });
      },

      addLevelToTrack: (trackId: string, level: EducatorLevelDef) => {
        set((state) => ({
          tracks: state.tracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  levels: [...t.levels, level],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      deleteLevelFromTrack: (trackId: string, levelId: string) => {
        set((state) => ({
          tracks: state.tracks.map((t) =>
            t.id === trackId
              ? {
                  ...t,
                  levels: t.levels.filter((lvl) => lvl.id !== levelId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      importTrack: (payload: string) => {
        // Try as URL hash first, then as JSON package
        let track = decodeTrackFromUrlHash(payload);
        if (!track) {
          track = importFromClassPackage(payload);
        }

        if (!track) {
          return { success: false, error: 'Formato inválido ou corrompido de trilha educacional.' };
        }

        // Avoid ID collisions by assigning fresh ID if duplicate
        const existing = get().tracks.find((t) => t.id === track?.id);
        const finalTrack: EducatorTrack = existing
          ? {
              ...track,
              id: `${track.id}-copy-${Date.now().toString(36)}`,
              title: `${track.title} (Importado)`,
              updatedAt: new Date().toISOString(),
            }
          : track;

        set((state) => ({
          tracks: [...state.tracks, finalTrack],
          activeTrackId: finalTrack.id,
        }));

        return { success: true, track: finalTrack };
      },

      resetToDefaults: () => {
        set({ tracks: PRESET_TRACKS, activeTrackId: null });
      },
    }),
    {
      name: 'engineering-forge-educator-tracks-v1',
    }
  )
);
