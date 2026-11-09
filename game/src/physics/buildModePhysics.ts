import type { LevelDef } from '../content/types';
import type { BuiltMember, BuiltNode } from '../game/build';
import { toTrussModel } from '../game/build';
import { analyzeTruss } from './truss';
import type { CircuitLevelDef } from '../content/circuitTypes';
import type { BuiltEdge } from '../game/circuitBuild';
import { COMPONENTS } from './components';
import { CHASSIS, ENGINES } from './vehicleParts';

/** Standard linear density (kg/m) based on material cross-section & density */
export const MATERIAL_LINEAR_DENSITY: Record<string, number> = {
  wood: 6.0, // 600 kg/m³ * 0.01 m²
  steel: 39.25, // 7850 kg/m³ * 0.005 m²
  cable: 15.7, // 7850 kg/m³ * 0.002 m²
  strut: 6.0, // 600 kg/m³ * 0.01 m²
};

export const DECK_LINEAR_DENSITY = 50.0; // 50 kg/m reinforced roadway deck
export const JOINT_PIN_MASS = 5.0; // 5 kg per pin joint assembly

export interface TrussBuildMetrics {
  totalMassKg: number;
  memberMassKg: number;
  jointMassKg: number;
  cog: { x: number; y: number };
  cogNormalized: { x: number; y: number };
  memberCount: number;
  jointCount: number;
  determinacyDiff: number;
  determinacyLabel: string;
  isStable: boolean;
  peakStressPercent: number;
  meanStressPercent: number;
  stressStatus: 'nominal' | 'elevated' | 'critical' | 'unstable';
  criticalMembersCount: number;
  failingMembersCount: number;
  leftSupportWeightKg: number;
  rightSupportWeightKg: number;
  leftWeightPercent: number;
  rightWeightPercent: number;
}

export function computeTrussBuildMetrics(
  level: LevelDef,
  builtNodes: BuiltNode[],
  builtMembers: BuiltMember[],
): TrussBuildMetrics {
  const allNodes = [...level.fixedNodes, ...builtNodes];
  const nodeMap = new Map(allNodes.map((n) => [n.id, { x: n.x, y: n.y }]));

  let totalWeightNumeratorX = 0;
  let totalWeightNumeratorY = 0;
  let memberMassKg = 0;

  // Deck members mass
  for (const dm of level.deckMembers) {
    const na = nodeMap.get(dm.nodeA);
    const nb = nodeMap.get(dm.nodeB);
    if (!na || !nb) continue;
    const len = Math.hypot(nb.x - na.x, nb.y - na.y);
    const m = len * DECK_LINEAR_DENSITY;
    memberMassKg += m;
    const midX = (na.x + nb.x) / 2;
    const midY = (na.y + nb.y) / 2;
    totalWeightNumeratorX += m * midX;
    totalWeightNumeratorY += m * midY;
  }

  // Built members mass
  for (const bm of builtMembers) {
    const na = nodeMap.get(bm.nodeA);
    const nb = nodeMap.get(bm.nodeB);
    if (!na || !nb) continue;
    const len = Math.hypot(nb.x - na.x, nb.y - na.y);
    const density = MATERIAL_LINEAR_DENSITY[bm.materialId] ?? 10.0;
    const m = len * density;
    memberMassKg += m;
    const midX = (na.x + nb.x) / 2;
    const midY = (na.y + nb.y) / 2;
    totalWeightNumeratorX += m * midX;
    totalWeightNumeratorY += m * midY;
  }

  // Joints mass
  const jointMassKg = allNodes.length * JOINT_PIN_MASS;
  for (const n of allNodes) {
    totalWeightNumeratorX += JOINT_PIN_MASS * n.x;
    totalWeightNumeratorY += JOINT_PIN_MASS * n.y;
  }

  const totalMassKg = memberMassKg + jointMassKg;
  const cogX = totalMassKg > 0 ? totalWeightNumeratorX / totalMassKg : 0;
  const cogY = totalMassKg > 0 ? totalWeightNumeratorY / totalMassKg : 0;

  // Calculate span center and support distribution
  const minX = level.buildArea.minX;
  const maxX = level.buildArea.maxX;
  const span = Math.max(1, maxX - minX);
  const cogNormX = Math.max(0, Math.min(1, (cogX - minX) / span));
  const cogNormY = cogY;

  // Static weight distribution between left and right boundaries
  const rightFraction = cogNormX;
  const leftFraction = 1 - rightFraction;
  const leftSupportWeightKg = totalMassKg * leftFraction;
  const rightSupportWeightKg = totalMassKg * rightFraction;

  // Maxwell determinacy condition
  const j = allNodes.length;
  const m = level.deckMembers.length + builtMembers.length;
  const determinacyDiff = m - (2 * j - 3);

  let determinacyLabel = 'Determinate (m = 2j - 3)';
  if (determinacyDiff < 0) {
    determinacyLabel = `Mechanism (${determinacyDiff})`;
  } else if (determinacyDiff > 0) {
    determinacyLabel = `Redundant (+${determinacyDiff})`;
  }

  // Real-time static dead-load analysis
  let isStable = false;
  let peakStressPercent = 0;
  let meanStressPercent = 0;
  let criticalMembersCount = 0;
  let failingMembersCount = 0;
  let stressStatus: TrussBuildMetrics['stressStatus'] = 'nominal';

  try {
    const trussModel = toTrussModel(level, builtNodes, builtMembers);
    const analysis = analyzeTruss(trussModel);

    if (analysis.status === 'analyzed') {
      isStable = true;
      let totalUtil = 0;
      let maxUtil = 0;

      for (const res of analysis.members) {
        const util = res.utilization * 100;
        totalUtil += util;
        if (util > maxUtil) maxUtil = util;
        if (util >= 100 || res.failed) failingMembersCount++;
        else if (util >= 75) criticalMembersCount++;
      }

      peakStressPercent = Number(maxUtil.toFixed(1));
      meanStressPercent =
        analysis.members.length > 0
          ? Number((totalUtil / analysis.members.length).toFixed(1))
          : 0;

      if (failingMembersCount > 0) {
        stressStatus = 'critical';
      } else if (peakStressPercent >= 75) {
        stressStatus = 'elevated';
      } else {
        stressStatus = 'nominal';
      }
    } else {
      stressStatus = 'unstable';
    }
  } catch {
    stressStatus = 'unstable';
  }

  return {
    totalMassKg: Number(totalMassKg.toFixed(1)),
    memberMassKg: Number(memberMassKg.toFixed(1)),
    jointMassKg: Number(jointMassKg.toFixed(1)),
    cog: { x: Number(cogX.toFixed(2)), y: Number(cogY.toFixed(2)) },
    cogNormalized: { x: Number(cogNormX.toFixed(3)), y: Number(cogNormY.toFixed(2)) },
    memberCount: m,
    jointCount: j,
    determinacyDiff,
    determinacyLabel,
    isStable,
    peakStressPercent,
    meanStressPercent,
    stressStatus,
    criticalMembersCount,
    failingMembersCount,
    leftSupportWeightKg: Number(leftSupportWeightKg.toFixed(1)),
    rightSupportWeightKg: Number(rightSupportWeightKg.toFixed(1)),
    leftWeightPercent: Math.round(leftFraction * 100),
    rightWeightPercent: Math.round(rightFraction * 100),
  };
}

export interface CircuitBuildMetrics {
  totalComponents: number;
  totalResistanceEstimate: number;
  estimatedPowerWatts: number;
  activeBranches: number;
  hasPowerSource: boolean;
  status: 'closed' | 'open' | 'high_power';
}

export function computeCircuitBuildMetrics(
  level: CircuitLevelDef,
  _builtNodes: BuiltNode[],
  builtEdges: BuiltEdge[],
): CircuitBuildMetrics {
  const allEdges = [...level.givenEdges, ...builtEdges];
  const hasPowerSource = (level?.sourceVoltage ?? 0) > 0;
  let totalResistance = 0;

  for (const edge of allEdges) {
    const comp = COMPONENTS[edge.componentId];
    if (comp) {
      totalResistance += comp.resistance;
    }
  }

  const v = level?.sourceVoltage || 9.0;
  const r = totalResistance > 0 ? totalResistance : 10.0;
  const power = (v * v) / r;

  return {
    totalComponents: allEdges.length,
    totalResistanceEstimate: Number(totalResistance.toFixed(1)),
    estimatedPowerWatts: Number(power.toFixed(2)),
    activeBranches: allEdges.length > 0 ? Math.max(1, Math.floor(allEdges.length / 2)) : 0,
    hasPowerSource,
    status: power > 50 ? 'high_power' : hasPowerSource && allEdges.length >= 3 ? 'closed' : 'open',
  };
}

export interface VehicleBuildMetrics {
  totalMassKg: number;
  engineMassKg: number;
  chassisMassKg: number;
  powerWatts: number;
  powerToWeightHpPerTon: number;
  cogHeightMeters: number;
  frontBiasPercent: number;
  rearBiasPercent: number;
  maxTractiveForceN: number;
}

export function computeVehicleBuildMetrics(
  engineId: string,
  chassisId: string,
): VehicleBuildMetrics {
  const engine = ENGINES[engineId] ?? ENGINES['engine-small'];
  const chassis = CHASSIS[chassisId] ?? CHASSIS['chassis-light'];

  const engineMass = 120; // nominal engine component mass
  const totalMass = chassis.mass + engineMass;
  const force = engine.force;
  const powerWatts = force * 20; // Estimated mechanical output at speed
  const powerHp = powerWatts / 745.7;
  const powerToWeight = totalMass > 0 ? powerHp / (totalMass / 1000) : 0;

  // Static chassis weight bias distribution
  const frontBias = 52;
  const rearBias = 48;

  return {
    totalMassKg: totalMass,
    engineMassKg: engineMass,
    chassisMassKg: chassis.mass,
    powerWatts: Math.round(powerWatts),
    powerToWeightHpPerTon: Number(powerToWeight.toFixed(1)),
    cogHeightMeters: 0.65,
    frontBiasPercent: frontBias,
    rearBiasPercent: rearBias,
    maxTractiveForceN: force,
  };
}
