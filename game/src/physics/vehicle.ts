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
  /** Phase 2: Pacejka Magic Formula Longitudinal Slip Ratio (0 to 1+) */
  slipRatio?: number;
}

/**
 * Phase 2: Pacejka Magic Formula Tire Longitudinal Force Model:
 * F_x(kappa) = D * sin(C * arctan(B * kappa - E * (B * kappa - arctan(B * kappa))))
 * where:
 *   B = Stiffness factor (typically 10)
 *   C = Shape factor (typically 1.65)
 *   D = Peak value = mu_peak * F_N
 *   E = Curvature factor (typically -1.0)
 *   kappa = Longitudinal slip ratio (wheel angular velocity vs vehicle linear velocity)
 */
export function calculatePacejkaTraction(
  normalForceN: number,
  slipRatio: number,
  peakFrictionMu: number = 0.85,
  B = 10,
  C = 1.65,
  E = -1.0,
): number {
  const D = peakFrictionMu * normalForceN;
  const B_kappa = B * slipRatio;
  const inner = B_kappa - E * (B_kappa - Math.atan(B_kappa));
  return D * Math.sin(C * Math.atan(inner));
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
 *
 * A given, fixed payload (cargo the level requires carrying, not a part the
 * player picks) adds straight onto the chassis mass for both the traction
 * limit and F=ma — the same "given, fixed thing you build around" pattern
 * as the deck load in Structures or the bulb in Circuits, applied here to
 * mass instead of a spatial/electrical element.
 */
export function analyzeVehicle(
  engine: Engine,
  chassis: Chassis,
  distance: number,
  inclineDegrees = 0,
  payloadMass = 0,
): VehicleAnalysis {
  const theta = (inclineDegrees * Math.PI) / 180;
  const totalMass = chassis.mass + payloadMass;
  const normalForce = totalMass * GRAVITY * Math.cos(theta);
  const tractionLimit = TIRE_GRIP * normalForce;
  const effectiveForce = Math.min(engine.force, tractionLimit);
  const gravityAlongSlope = totalMass * GRAVITY * Math.sin(theta);
  const acceleration = (effectiveForce - gravityAlongSlope) / totalMass;
  const stalled = acceleration <= 0;
  const finalSpeed = stalled ? 0 : Math.sqrt(2 * acceleration * distance);

  // Phase 2: Compute longitudinal slip ratio
  const slipRatio = normalForce > 0 ? Math.min(1.0, engine.force / (1.2 * tractionLimit)) : 1.0;

  return {
    effectiveForce,
    tractionLimit,
    tractionLimited: engine.force > tractionLimit,
    acceleration,
    finalSpeed,
    stalled,
    slipRatio,
  };
}
