import type { VehicleAnalysis } from '../physics/vehicle';
import { analyzeVehicleWithMatter } from '../physics/matterVehicle';
import { CHASSIS, ENGINES } from '../physics/vehicleParts';
import type { VehicleLevelDef } from '../content/vehicleTypes';
import { computeStarRating, getDefaultParTime, type StarRatingResult } from './starRating';

export function totalVehicleCost(engineId: string, chassisId: string): number {
  return ENGINES[engineId].cost + CHASSIS[chassisId].cost;
}

export interface VehicleStarResult {
  passed: boolean;
  cost: number;
  stars: 0 | 1 | 2 | 3;
  ratingDetails?: StarRatingResult;
}

export function scoreVehicleAttempt(
  level: VehicleLevelDef,
  analysis: VehicleAnalysis,
  cost: number,
  timeSeconds?: number,
): VehicleStarResult {
  const withinSpeedWindow =
    analysis.finalSpeed >= level.targetSpeed &&
    analysis.finalSpeed <= (level.maxSpeed ?? Infinity);
  const passed = withinSpeedWindow && cost <= level.budget;

  const parTime = getDefaultParTime(level.order);
  const rating = computeStarRating(passed, cost, level.budget, timeSeconds, parTime);

  const res: VehicleStarResult = {
    passed: rating.passed,
    cost,
    stars: rating.stars,
  };
  if (timeSeconds !== undefined) {
    res.ratingDetails = rating;
  }
  return res;
}

export function runVehicleTest(
  level: VehicleLevelDef,
  engineId: string,
  chassisId: string,
  timeSeconds?: number,
): { analysis: VehicleAnalysis; cost: number; score: VehicleStarResult } {
  const analysis = analyzeVehicleWithMatter(
    ENGINES[engineId],
    CHASSIS[chassisId],
    level.distance,
    level.inclineDegrees,
    level.payloadMass,
  );
  const cost = totalVehicleCost(engineId, chassisId);
  const score = scoreVehicleAttempt(level, analysis, cost, timeSeconds);
  return { analysis, cost, score };
}
