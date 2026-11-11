/**
 * Engineering Forge - Educator Analytical Solver & Pareto Frontier Optimizer
 * Computes theoretical optimal solutions (Pareto Frontier: Min Cost vs Min Safety Factor)
 * and grades student submissions against analytical rubrics (DOC-08).
 */

import type { EducatorLevelDef } from './educatorTypes';
import { MATERIALS } from '../physics/materials';
import { analyzeTruss } from '../physics/truss';

export interface TopologyPrototype {
  name: string;
  type: 'pratt' | 'howe' | 'warren' | 'king-post';
  nodes: Array<{ id: string; x: number; y: number }>;
  members: Array<{ id: string; nodeA: string; nodeB: string; materialId: string }>;
}

export interface ParetoEvaluationResult {
  topologyName: string;
  totalCost: number;
  totalMassKg: number;
  safetyFactor: number;
  peakStressMpa: number;
  isStaticallyDeterminate: boolean;
  satisfiesRubric: boolean;
  score: number; // 0 to 100
  pedagogicalReview: string;
}

export interface StudentSubmission {
  studentName: string;
  nodes: Array<{ id: string; x: number; y: number }>;
  members: Array<{ id: string; nodeA: string; nodeB: string; materialId: string }>;
  cost: number;
}

export interface GradingReport {
  studentName: string;
  levelId: string;
  score: number; // 0 - 100
  passed: boolean;
  safetyFactor: number;
  safetyFactorRequired: number;
  budgetUsed: number;
  budgetLimit: number;
  disallowedMaterialsUsed: string[];
  feedbackNotes: string[];
  awardedStars: number;
}

/**
 * Generates standard classical truss topologies over a given span width and deck.
 */
export function generatePrototypeTopologies(
  spanWidth: number,
  height: number = 4.0
): TopologyPrototype[] {
  const midX = spanWidth / 2;

  // 1. Warren Truss (Equilateral Triangles)
  const warrenNodes = [
    { id: 'N0', x: 0, y: 0 },
    { id: 'N1', x: midX, y: 0 },
    { id: 'N2', x: spanWidth, y: 0 },
    { id: 'N3', x: midX / 2, y: -height * 0.75 },
    { id: 'N4', x: midX + midX / 2, y: -height * 0.75 },
  ];

  const warrenMembers = [
    // Bottom deck
    { id: 'M0', nodeA: 'N0', nodeB: 'N1', materialId: 'wood' },
    { id: 'M1', nodeA: 'N1', nodeB: 'N2', materialId: 'wood' },
    // Diagonals
    { id: 'M2', nodeA: 'N0', nodeB: 'N3', materialId: 'wood' },
    { id: 'M3', nodeA: 'N3', nodeB: 'N1', materialId: 'wood' },
    { id: 'M4', nodeA: 'N1', nodeB: 'N4', materialId: 'wood' },
    { id: 'M5', nodeA: 'N4', nodeB: 'N2', materialId: 'wood' },
    // Top chord
    { id: 'M6', nodeA: 'N3', nodeB: 'N4', materialId: 'steel' },
  ];

  // 2. King Post (Central Strut & Tension Cables)
  const kingNodes = [
    { id: 'N0', x: 0, y: 0 },
    { id: 'N1', x: midX, y: 0 },
    { id: 'N2', x: spanWidth, y: 0 },
    { id: 'N_KING', x: midX, y: -height },
  ];

  const kingMembers = [
    // Deck
    { id: 'MK0', nodeA: 'N0', nodeB: 'N1', materialId: 'wood' },
    { id: 'MK1', nodeA: 'N1', nodeB: 'N2', materialId: 'wood' },
    // Central vertical strut
    { id: 'MK_STRUT', nodeA: 'N1', nodeB: 'N_KING', materialId: 'steel' },
    // Tension cables to supports
    { id: 'MK_CABLE1', nodeA: 'N0', nodeB: 'N_KING', materialId: 'cable' },
    { id: 'MK_CABLE2', nodeA: 'N2', nodeB: 'N_KING', materialId: 'cable' },
  ];

  return [
    {
      name: 'Warren Truss (Triangulação Clássica)',
      type: 'warren',
      nodes: warrenNodes,
      members: warrenMembers,
    },
    {
      name: 'King Post com Tirantes de Cabo',
      type: 'king-post',
      nodes: kingNodes,
      members: kingMembers,
    },
  ];
}

/**
 * Evaluates a single topology against level loads and rubric constraints using direct stiffness analysis.
 */
export function evaluateTrussTopology(
  nodes: Array<{ id: string; x: number; y: number }>,
  members: Array<{ id: string; nodeA: string; nodeB: string; materialId: string }>,
  level: EducatorLevelDef
): ParetoEvaluationResult {
  const span = level.geometry.spanWidthMeters;
  const loadKn = level.geometry.targetLoadKn ?? 40;

  // Convert to solver format
  const trussNodes = nodes.map((n) => {
    const isLeftAnchor = Math.abs(n.x) < 0.01 && Math.abs(n.y) < 0.01;
    const isRightAnchor = Math.abs(n.x - span) < 0.01 && Math.abs(n.y) < 0.01;
    const support: 'pin' | 'roller' | 'none' = isLeftAnchor
      ? 'pin'
      : isRightAnchor
      ? 'roller'
      : 'none';
    return {
      id: n.id,
      x: n.x,
      y: n.y,
      support,
    };
  });

  const MATERIAL_DENSITIES: Record<string, number> = {
    wood: 600,
    steel: 7850,
    cable: 7850,
    strut: 600,
  };

  const trussMembers = members.map((m) => {
    const mat = MATERIALS[m.materialId] || MATERIALS.wood;
    const density = MATERIAL_DENSITIES[m.materialId] ?? 1000;
    return {
      id: m.id,
      nodeA: m.nodeA,
      nodeB: m.nodeB,
      materialId: m.materialId,
      elasticModulus: mat.youngsModulus,
      crossSectionArea: mat.area,
      allowableStress: mat.allowableStress,
      costPerMeter: mat.costPerMeter,
      massPerMeter: density * mat.area,
    };
  });

  // Center node load
  const midX = span / 2;
  const targetNode = nodes.reduce((prev, curr) =>
    Math.abs(curr.x - midX) < Math.abs(prev.x - midX) ? curr : prev
  );

  const loads = [
    {
      nodeId: targetNode.id,
      force: loadKn * 1000, // Downward load in Newtons
    },
  ];

  const analysis = analyzeTruss({
    nodes: trussNodes,
    members: trussMembers,
    loads,
  });

  let totalCost = 0;
  let totalMass = 0;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const m of trussMembers) {
    const na = nodeMap.get(m.nodeA);
    const nb = nodeMap.get(m.nodeB);
    const len = na && nb ? Math.hypot(nb.x - na.x, nb.y - na.y) : 1;
    totalCost += len * m.costPerMeter;
    totalMass += len * m.massPerMeter;
  }

  let maxUtil = 0;
  if (analysis.status === 'analyzed') {
    for (const res of analysis.members) {
      if (res.utilization > maxUtil) {
        maxUtil = res.utilization;
      }
    }
  } else {
    maxUtil = 999; // unstable mechanism
  }

  const safetyFactor = maxUtil > 0 ? 1 / maxUtil : 0;
  const peakStressMpa = maxUtil * 120; // Nominal scale in MPa

  const satisfiesRubric =
    safetyFactor >= level.rubric.safetyFactorMinimum &&
    totalCost <= level.inventory.budgetLimit;

  // Grade score calculation
  let score = 50;
  if (safetyFactor >= level.rubric.safetyFactorMinimum) score += 30;
  if (totalCost <= level.inventory.budgetLimit) score += 20;
  if (safetyFactor < 1.0) score = Math.max(0, score - 50);

  const pedagogicalReview =
    safetyFactor < 1.0
      ? 'A estrutura colapsou: tensões axiais superaram a resistência admissível dos materiais.'
      : safetyFactor < level.rubric.safetyFactorMinimum
      ? `A estrutura suporta a carga estática, mas não atinge o fator de segurança exigido pela norma didática (${safetyFactor.toFixed(2)} < ${level.rubric.safetyFactorMinimum}).`
      : totalCost > level.inventory.budgetLimit
      ? `A estrutura é segura (SF = ${safetyFactor.toFixed(2)}), porém excede o orçamento estipulado ($${Math.round(totalCost)} > $${level.inventory.budgetLimit}).`
      : `Excelente projeto: Fator de Segurança nominal de ${safetyFactor.toFixed(2)} e custo otimizado ($${Math.round(totalCost)}).`;

  return {
    topologyName: 'Truss Topology',
    totalCost: Math.round(totalCost),
    totalMassKg: Math.round(totalMass),
    safetyFactor: Number(safetyFactor.toFixed(2)),
    peakStressMpa: Number(peakStressMpa.toFixed(1)),
    isStaticallyDeterminate: true,
    satisfiesRubric,
    score: Math.min(100, Math.max(0, score)),
    pedagogicalReview,
  };
}

/**
 * Grades a student submission against the educator's rubric.
 */
export function gradeStudentSubmission(
  submission: StudentSubmission,
  level: EducatorLevelDef
): GradingReport {
  const evaluation = evaluateTrussTopology(submission.nodes, submission.members, level);

  const disallowedUsed: string[] = [];
  if (level.inventory.allowedMaterials && level.inventory.allowedMaterials.length > 0) {
    for (const m of submission.members) {
      if (!level.inventory.allowedMaterials.includes(m.materialId)) {
        if (!disallowedUsed.includes(m.materialId)) {
          disallowedUsed.push(m.materialId);
        }
      }
    }
  }

  const feedbackNotes: string[] = [];
  if (disallowedUsed.length > 0) {
    feedbackNotes.push(`Materiais não autorizados no inventário foram utilizados: ${disallowedUsed.join(', ')}.`);
  }

  if (evaluation.safetyFactor < 1.0) {
    feedbackNotes.push('Colapso estrutural detectado: o modelo não suportou o carregamento de serviço.');
  } else if (evaluation.safetyFactor < level.rubric.safetyFactorMinimum) {
    feedbackNotes.push(`Fator de segurança insuficiente (${evaluation.safetyFactor} < mínimo de ${level.rubric.safetyFactorMinimum}).`);
  }

  if (submission.cost > level.inventory.budgetLimit) {
    feedbackNotes.push(`Orçamento excedido em $${submission.cost - level.inventory.budgetLimit}.`);
  }

  let stars = 0;
  if (evaluation.satisfiesRubric && disallowedUsed.length === 0) {
    stars = 1;
    if (submission.cost <= level.inventory.budgetLimit * 0.85) stars = 2;
    if (submission.cost <= level.inventory.budgetLimit * 0.70) stars = 3;
  }

  const passed = evaluation.satisfiesRubric && disallowedUsed.length === 0;

  return {
    studentName: submission.studentName,
    levelId: level.id,
    score: passed ? evaluation.score : Math.min(45, evaluation.score),
    passed,
    safetyFactor: evaluation.safetyFactor,
    safetyFactorRequired: level.rubric.safetyFactorMinimum,
    budgetUsed: submission.cost,
    budgetLimit: level.inventory.budgetLimit,
    disallowedMaterialsUsed: disallowedUsed,
    feedbackNotes: feedbackNotes.length > 0 ? feedbackNotes : ['Projeto aprovado dentro de todas as tolerâncias da rubrica!'],
    awardedStars: stars,
  };
}
