/**
 * Engineering Forge - Educator Diagnostic Telemetry Engine
 * Aggregates student submissions, identifies failure fingerprints (e.g. Euler buckling,
 * short-circuit, gravitational stall), and computes failure heatmaps for classrooms (DOC-08).
 */

export interface StudentFailureRecord {
  submissionId: string;
  studentAnonymousAlias: string; // e.g. "Ada Lovelace", "Nikola Tesla"
  discipline: 'structures' | 'electricity' | 'machines';
  failedMemberIds?: string[];
  failedNodeCoords?: Array<{ x: number; y: number }>;
  failureType:
    | 'euler_buckling'
    | 'tensile_rupture'
    | 'cable_slack'
    | 'unstable_mechanism'
    | 'short_circuit'
    | 'overpower_burn'
    | 'gravitational_stall'
    | 'traction_loss'
    | 'budget_exceeded';
  safetyFactorAchieved: number;
  cost: number;
  timeSpentSeconds: number;
  timestamp: number;
}

export interface ConceptualDiagnosticSummary {
  totalSubmissions: number;
  passRatePercent: number;
  averageSafetyFactor: number;
  averageCost: number;
  topFailureCauses: Array<{
    type: string;
    label: string;
    percentage: number;
    count: number;
    pedagogicalIntervention: string;
  }>;
  nodeFailureHeatmap: Array<{
    x: number;
    y: number;
    failureCount: number;
    intensity: number; // 0.0 to 1.0
  }>;
}

const HISTORICAL_ENGINEER_ALIASES = [
  'Ada Lovelace',
  'Nikola Tesla',
  'Gustave Eiffel',
  'Santos Dumont',
  'Marie Curie',
  'Leonardo da Vinci',
  'Grace Hopper',
  'Hedy Lamarr',
  'James Watt',
  'Thomas Edison',
  'Alan Turing',
  'Archimedes',
  'Carl Friedrich Gauss',
  'Isambard Kingdom Brunel',
];

export function getAnonymousStudentAlias(index: number): string {
  return HISTORICAL_ENGINEER_ALIASES[index % HISTORICAL_ENGINEER_ALIASES.length];
}

const FAILURE_LABELS_AND_HINTS: Record<
  StudentFailureRecord['failureType'],
  { label: string; intervention: string }
> = {
  euler_buckling: {
    label: 'Flambagem Elástica de Euler (Compressão Excessiva)',
    intervention:
      'Reforçar o conceito de esbeltez de colunas: barras comprimidas longas colapsam por instabilidade geométrica, não apenas tensão de escoamento. Sugira barras mais curtas ou triangulação adicional.',
  },
  tensile_rupture: {
    label: 'Ruptura por Tração (Tensão Axial Admissível)',
    intervention:
      'Apresentar a fórmula σ = F/A. O carregamento de tração excedeu a capacidade do material. Indicar troca para aço ou adição de cabos tensores.',
  },
  cable_slack: {
    label: 'Afrouxamento de Cabos (Compressão em Elemento Flexível)',
    intervention:
      'Lembrar que cabos suportam apenas tração pura. Quando submetidos a compressão, eles perdem rigidez e colapsam a estrutura.',
  },
  unstable_mechanism: {
    label: 'Mecanismo Instável (Grau de Liberdade Móvel)',
    intervention:
      'Explicar a condição estática m = 2j - 3 para treliças planas. Quadriláteros sem diagonais não são rígidos e giram sob carga.',
  },
  short_circuit: {
    label: 'Curto-Circuito (Ausência de Resistência de Carga)',
    intervention:
      'Demonstrar a Lei de Ohm (I = V/R). Quando R tende a zero, a corrente tende ao infinito, provocando sobreaquecimento.',
  },
  overpower_burn: {
    label: 'Sobreaquecimento Joule (Potência Excessiva)',
    intervention:
      'Explicar dissipação de potência P = R·I² = V²/R. Indicar uso de resistores atenuadores ou fontes de menor tensão.',
  },
  gravitational_stall: {
    label: 'Estol Gravitacional em Rampa (Força Resultante Negativa)',
    intervention:
      'Explicar decomposição de forças no plano inclinado (Px = mg·sen θ). O empuxo do motor é insuficiente para vencer a gravidade.',
  },
  traction_loss: {
    label: 'Patinagem de Pneus (Teto de Atrito de Coulomb Excedido)',
    intervention:
      'Relembrar atrito estático máximo F_max = μ·N. Motores com torque excessivo ou veículos excessivamente leves patinam sem acelerar.',
  },
  budget_exceeded: {
    label: 'Estouro de Orçamento / Superdimensionamento',
    intervention:
      'Discutir otimização custo-benefício em engenharia: uma solução superdimensionada não é necessariamente um bom projeto econômico.',
  },
};

/**
 * Computes diagnostic statistics, aggregated failure causes, and spatial heatmap across submissions.
 */
export function analyzeClassroomDiagnostics(
  records: StudentFailureRecord[]
): ConceptualDiagnosticSummary {
  if (records.length === 0) {
    return {
      totalSubmissions: 0,
      passRatePercent: 100,
      averageSafetyFactor: 1.5,
      averageCost: 0,
      topFailureCauses: [],
      nodeFailureHeatmap: [],
    };
  }

  const passedCount = records.filter((r) => r.safetyFactorAchieved >= 1.0).length;
  const passRatePercent = Math.round((passedCount / records.length) * 100);

  const avgSF =
    records.reduce((acc, r) => acc + r.safetyFactorAchieved, 0) / records.length;
  const avgCost =
    records.reduce((acc, r) => acc + r.cost, 0) / records.length;

  // Failure counts
  const failureCounts: Partial<Record<StudentFailureRecord['failureType'], number>> = {};
  const heatmapBuckets: Map<string, { x: number; y: number; count: number }> = new Map();

  for (const r of records) {
    if (r.safetyFactorAchieved < 1.0 || r.failureType === 'budget_exceeded') {
      failureCounts[r.failureType] = (failureCounts[r.failureType] || 0) + 1;
    }

    if (r.failedNodeCoords) {
      for (const node of r.failedNodeCoords) {
        // Round to nearest 0.5m grid
        const gx = Math.round(node.x * 2) / 2;
        const gy = Math.round(node.y * 2) / 2;
        const key = `${gx},${gy}`;
        const existing = heatmapBuckets.get(key) || { x: gx, y: gy, count: 0 };
        existing.count += 1;
        heatmapBuckets.set(key, existing);
      }
    }
  }

  const failedRecordsTotal = records.filter(
    (r) => r.safetyFactorAchieved < 1.0 || r.failureType === 'budget_exceeded'
  ).length;

  const topFailureCauses = Object.entries(failureCounts)
    .map(([typeKey, count]) => {
      const type = typeKey as StudentFailureRecord['failureType'];
      const meta = FAILURE_LABELS_AND_HINTS[type];
      const percentage =
        failedRecordsTotal > 0 ? Math.round((count! / failedRecordsTotal) * 100) : 0;
      return {
        type,
        label: meta ? meta.label : type,
        percentage,
        count: count!,
        pedagogicalIntervention: meta
          ? meta.intervention
          : 'Revisar conceitos físicos de equilíbrio e conservação.',
      };
    })
    .sort((a, b) => b.count - a.count);

  // Compute spatial heatmap intensities
  let maxNodeFailures = 1;
  heatmapBuckets.forEach((b) => {
    if (b.count > maxNodeFailures) maxNodeFailures = b.count;
  });

  const nodeFailureHeatmap = Array.from(heatmapBuckets.values()).map((b) => ({
    x: b.x,
    y: b.y,
    failureCount: b.count,
    intensity: Number((b.count / maxNodeFailures).toFixed(2)),
  }));

  return {
    totalSubmissions: records.length,
    passRatePercent,
    averageSafetyFactor: Number(avgSF.toFixed(2)),
    averageCost: Math.round(avgCost),
    topFailureCauses,
    nodeFailureHeatmap,
  };
}
