/**
 * Engineering Forge - Educator Academy & Curriculum Types
 * Standard schema adhering to DOC-08 (Modo Educador Master Plan)
 * Aligned with BNCC, NGSS and ABET engineering criteria.
 */

export type EducationalDiscipline = 'structures' | 'circuits' | 'machines' | 'mechatronics';

export type DifficultyGrade = 'middle-school' | 'high-school' | 'undergraduate';

export interface CurriculumStandard {
  code: string;
  framework: 'BNCC' | 'NGSS' | 'ABET';
  description: string;
  competencyDomain: 'mechanics' | 'electricity' | 'systems' | 'design-optimization';
}

export const CURRICULUM_STANDARDS: Record<string, CurriculumStandard> = {
  'EM13CNT101': {
    code: 'EM13CNT101',
    framework: 'BNCC',
    description: 'Analisar e prever movimentos de corpos a partir das leis de Newton e conservação de energia.',
    competencyDomain: 'mechanics',
  },
  'EM13CNT102': {
    code: 'EM13CNT102',
    framework: 'BNCC',
    description: 'Construir modelos estáticos e dinâmicos para avaliar deformações, tensões e equilíbrio.',
    competencyDomain: 'mechanics',
  },
  'EM13CNT301': {
    code: 'EM13CNT301',
    framework: 'BNCC',
    description: 'Investigar circuitos elétricos, divisores de tensão e dissipação por efeito Joule.',
    competencyDomain: 'electricity',
  },
  'MS-ETS1-2': {
    code: 'MS-ETS1-2',
    framework: 'NGSS',
    description: 'Evaluate competing design solutions using a systematic process to determine how well they meet criteria and constraints.',
    competencyDomain: 'design-optimization',
  },
  'HS-ETS1-3': {
    code: 'HS-ETS1-3',
    framework: 'NGSS',
    description: 'Evaluate a solution to a complex real-world problem based on prioritized criteria and trade-offs (cost, safety, reliability).',
    competencyDomain: 'design-optimization',
  },
};

export interface InventoryRestrictions {
  allowedMaterials: string[]; // e.g. ['wood', 'cable']
  budgetLimit: number;
  maxPartsLimit?: number;
  forceMaterialOnly?: string;
  disallowedMaterials?: string[];
}

export interface AnalyticalRubric {
  safetyFactorMinimum: number; // e.g. 1.50
  targetEfficiencyPercent: number; // e.g. 75%
  maxAttemptsAllowed?: number;
  revealHintAfterAttempts: number;
  pedagogicalHint: string;
  theoreticalOptimalCost?: number;
}

export interface EducatorLevelDef {
  id: string;
  schemaVersion: 'forge-educator/1.0';
  title: string;
  discipline: EducationalDiscipline;
  description: string;
  learningObjectives: string[];
  curriculumCodes: string[];
  difficultyGrade: DifficultyGrade;
  inventory: InventoryRestrictions;
  rubric: AnalyticalRubric;
  // Canvas boundary & physical anchors
  geometry: {
    spanWidthMeters: number;
    deckHeightMeters?: number;
    fixedAnchorsCount: number;
    rollerAnchorsCount: number;
    targetLoadKn?: number;
    sourceVoltageV?: number;
  };
}

export interface EducatorTrack {
  id: string;
  title: string;
  teacherName: string;
  institution?: string;
  createdAt: string;
  updatedAt: string;
  discipline: EducationalDiscipline;
  gradeLevel: DifficultyGrade;
  curriculumTags: string[];
  levels: EducatorLevelDef[];
  isPublished: boolean;
}

export interface ForgeClassPackage {
  format: 'forge-class/1.0';
  exportedAt: string;
  checksumSha256?: string;
  track: EducatorTrack;
}
