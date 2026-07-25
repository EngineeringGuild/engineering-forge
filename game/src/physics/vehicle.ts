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
  /** True when gravity along the grade outweighs the force reaching the road — the vehicle can't move forward at all. */
  stalled: boolean;
}

/**
 * Straight-line run from rest over a fixed distance: Newton's second law for
 * acceleration, kinematics (v² = u² + 2as, u = 0) for the speed reached. The
 * engine's thrust is capped by the tires' traction limit (Coulomb friction,
 * F ≤ μmg) — a real vehicle with more engine force than its tires can grip
 * just spins the wheels rather than accelerating faster.
 *
 * On a grade, the normal force (and so the traction limit) shrinks by cos θ,
 * and gravity's component along the slope (mg sin θ) subtracts directly from
 * the net driving force — if that component wins, acceleration goes
 * non-positive and the vehicle stalls rather than crawling forward.
 */
export function analyzeVehicle(
  engine: Engine,
  chassis: Chassis,
  distance: number,
  inclineDegrees = 0,
): VehicleAnalysis {
  const theta = (inclineDegrees * Math.PI) / 180;
  const tractionLimit = TIRE_GRIP * chassis.mass * GRAVITY * Math.cos(theta);
  const effectiveForce = Math.min(engine.force, tractionLimit);
  const gravityAlongSlope = chassis.mass * GRAVITY * Math.sin(theta);
  const acceleration = (effectiveForce - gravityAlongSlope) / chassis.mass;
  const stalled = acceleration <= 0;
  const finalSpeed = stalled ? 0 : Math.sqrt(2 * acceleration * distance);
  return {
    effectiveForce,
    tractionLimit,
    tractionLimited: engine.force > tractionLimit,
    acceleration,
    finalSpeed,
    stalled,
  };
}
