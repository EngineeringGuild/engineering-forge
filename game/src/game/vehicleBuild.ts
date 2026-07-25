import { analyzeVehicle, type VehicleAnalysis } from '../physics/vehicle';
import { CHASSIS, ENGINES } from '../physics/vehicleParts';
import type { VehicleLevelDef } from '../content/vehicleTypes';

export function totalVehicleCost(engineId: string, chassisId: string): number {
  return ENGINES[engineId].cost + CHASSIS[chassisId].cost;
}

export interface VehicleStarResult {
  passed: boolean;
  cost: number;
  stars: 0 | 1 | 2 | 3;
}

export function scoreVehicleAttempt(
  level: VehicleLevelDef,
  analysis: VehicleAnalysis,
  cost: number,
): VehicleStarResult {
  const passed = analysis.finalSpeed >= level.targetSpeed && cost <= level.budget;
  if (!passed) {
    return { passed: false, cost, stars: 0 };
  }
  const ratio = cost / level.budget;
  const stars = ratio <= 0.6 ? 3 : ratio <= 0.85 ? 2 : 1;
  return { passed: true, cost, stars };
}

export function runVehicleTest(
  level: VehicleLevelDef,
  engineId: string,
  chassisId: string,
): { analysis: VehicleAnalysis; cost: number; score: VehicleStarResult } {
  const analysis = analyzeVehicle(
    ENGINES[engineId],
    CHASSIS[chassisId],
    level.distance,
    level.inclineDegrees,
  );
  const cost = totalVehicleCost(engineId, chassisId);
  const score = scoreVehicleAttempt(level, analysis, cost);
  return { analysis, cost, score };
}
