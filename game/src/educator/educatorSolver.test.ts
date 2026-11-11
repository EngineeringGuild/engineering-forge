import { describe, it, expect } from 'vitest';
import {
  generatePrototypeTopologies,
  evaluateTrussTopology,
  gradeStudentSubmission,
} from './educatorSolver';
import type { EducatorLevelDef } from './educatorTypes';

describe('Educator Solver & Analytical Rubric Engine', () => {
  const sampleLevel: EducatorLevelDef = {
    id: 'lvl-test-warren',
    schemaVersion: 'forge-educator/1.0',
    title: 'Desafio Didático de Teste',
    description: 'Vão de 8 metros para teste de rubrica',
    discipline: 'structures',
    learningObjectives: ['Análise de treliças Warren'],
    curriculumCodes: ['EM13CNT301'],
    difficultyGrade: 'high-school',
    geometry: {
      spanWidthMeters: 8,
      fixedAnchorsCount: 1,
      rollerAnchorsCount: 1,
      targetLoadKn: 40,
    },
    inventory: {
      budgetLimit: 2500,
      allowedMaterials: ['wood', 'steel', 'cable'],
    },
    rubric: {
      safetyFactorMinimum: 1.3,
      targetEfficiencyPercent: 80,
      revealHintAfterAttempts: 2,
      pedagogicalHint: 'Explique a distribuição das forças de tração e compressão.',
    },
  };

  it('generates standard classical topologies (Warren and King-Post)', () => {
    const prototypes = generatePrototypeTopologies(sampleLevel.geometry.spanWidthMeters, 4);
    expect(prototypes.length).toBeGreaterThanOrEqual(2);

    const warren = prototypes.find((p) => p.type === 'warren');
    expect(warren).toBeDefined();
    expect(warren?.nodes.length).toBe(5);
    expect(warren?.members.length).toBe(7);

    const kingPost = prototypes.find((p) => p.type === 'king-post');
    expect(kingPost).toBeDefined();
    expect(kingPost?.members.some((m) => m.materialId === 'cable')).toBe(true);
  });

  it('evaluates a valid truss topology with safety factor and cost calculations', () => {
    const prototypes = generatePrototypeTopologies(8, 4);
    const warren = prototypes[0];

    const result = evaluateTrussTopology(warren.nodes, warren.members, sampleLevel);

    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.totalMassKg).toBeGreaterThan(0);
    expect(result.safetyFactor).toBeGreaterThan(0);
    expect(typeof result.score).toBe('number');
    expect(result.pedagogicalReview).toBeTruthy();
  });

  it('correctly grades a compliant student submission', () => {
    const prototypes = generatePrototypeTopologies(8, 4);
    const warren = prototypes[0];

    const submission = {
      studentName: 'Ana Clara',
      nodes: warren.nodes,
      members: warren.members,
      cost: 1800,
    };

    const report = gradeStudentSubmission(submission, sampleLevel);

    expect(report.studentName).toBe('Ana Clara');
    expect(report.budgetLimit).toBe(2500);
    expect(report.budgetUsed).toBe(1800);
    expect(report.disallowedMaterialsUsed).toHaveLength(0);
  });

  it('flags disallowed materials in student submissions', () => {
    const strictLevel: EducatorLevelDef = {
      ...sampleLevel,
      inventory: {
        ...sampleLevel.inventory,
        allowedMaterials: ['wood'], // Only wood allowed
      },
    };

    const prototypes = generatePrototypeTopologies(8, 4);
    const warren = prototypes[0]; // has steel top chord

    const submission = {
      studentName: 'Bruno Engenheiro',
      nodes: warren.nodes,
      members: warren.members,
      cost: 1500,
    };

    const report = gradeStudentSubmission(submission, strictLevel);

    expect(report.disallowedMaterialsUsed).toContain('steel');
    expect(report.passed).toBe(false);
    expect(report.feedbackNotes.some((n) => n.includes('não autorizados'))).toBe(true);
  });

  it('penalizes budget overruns', () => {
    const prototypes = generatePrototypeTopologies(8, 4);
    const warren = prototypes[0];

    const submission = {
      studentName: 'Carlos Ousado',
      nodes: warren.nodes,
      members: warren.members,
      cost: 3200, // Budget is 2500
    };

    const report = gradeStudentSubmission(submission, sampleLevel);

    expect(report.feedbackNotes.some((n) => n.includes('Orçamento excedido'))).toBe(true);
  });
});
