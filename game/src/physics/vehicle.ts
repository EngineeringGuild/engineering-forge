import type { Chassis, Engine } from './vehicleParts';

const GRAVITY = 9.8; // m/s^2
const TIRE_GRIP = 0.8; // coefficient of friction, fixed for the MVP

export interface VehicleAnalysis {
  /** Force actually available at the wheels, after the traction cap. */
  effectiveForce: number;
  tractionLimit: number;
  tractionLimited: boolean;
  acceleration: number;
  /** Speed reached at the end of the run, from rest, uniform acceleration. */
  finalSpeed: number;
}

/**
 * Straight-line run from rest over a fixed distance: Newton's second law for
 * acceleration, kinematics (v² = u² + 2as, u = 0) for the speed reached. The
 * engine's thrust is capped by the tires' traction limit (Coulomb friction,
 * F ≤ μmg) — a real vehicle with more engine force than its tires can grip
 * just spins the wheels rather than accelerating faster.
 */
export function analyzeVehicle(engine: Engine, chassis: Chassis, distance: number): VehicleAnalysis {
  const tractionLimit = TIRE_GRIP * chassis.mass * GRAVITY;
  const effectiveForce = Math.min(engine.force, tractionLimit);
  const acceleration = effectiveForce / chassis.mass;
  const finalSpeed = Math.sqrt(2 * acceleration * distance);
  return {
    effectiveForce,
    tractionLimit,
    tractionLimited: engine.force > tractionLimit,
    acceleration,
    finalSpeed,
  };
}
