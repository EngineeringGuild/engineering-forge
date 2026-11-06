/**
 * Standardized Physics Metrics Contracts across all Engineering Forge domains.
 * Provides unified telemetry, units, and safety factor calculations.
 */

export interface StructuralTelemetry {
  peakUtilization: number; // 0.0 to 1.0+
  safetyFactor: number; // 1 / utilization
  safetyRating: 'generous' | 'nominal' | 'marginal' | 'failing';
  maxDeflectionMm: number;
  activeVehicleWeightN: number;
  highestStressedMemberId: string | null;
  highestStressedMemberForceN: number;
  highestStressedMemberType: 'tension' | 'compression' | 'neutral';
  supportReactions: Record<string, { rx: number; ry: number }>;
  isCollapsed: boolean;
}

export interface VehicleTelemetry {
  speedMps: number;
  speedKmh: number;
  accelerationMps2: number;
  gForce: number;
  thrustN: number;
  normalForceN: number;
  tractionLimitN: number;
  gripRatio: number; // 0 to 1 (1 = max grip, > 1 = slip/spin)
  isTractionLimited: boolean;
  aerodynamicDragN: number;
  slopeForceN: number;
  powerWatt: number;
  powerHp: number;
  kineticEnergyJoule: number;
  isStalled: boolean;
}

export interface CircuitTelemetry {
  totalSourceCurrentA: number;
  loopVoltageV: number;
  totalPowerW: number;
  totalJouleEnergyJ: number;
  peakComponentUtilization: number;
  highestLoadedEdgeId: string | null;
  kirchhoffResidualA: number; // sum of nodal currents (should be < 1e-5)
  breakerMarginPercent: number; // headroom before trip
  breakerTripped: boolean;
  activeSparkCount: number;
}

/**
 * Calculates vehicle aerodynamic drag based on ISO 80000 fluid dynamics:
 * F_drag = 0.5 * rho * v^2 * Cd * A
 */
export function calculateAerodynamicDrag(
  speedMps: number,
  dragCoefficient: number = 0.32,
  frontalAreaM2: number = 1.8,
  airDensity: number = 1.225,
): number {
  return 0.5 * airDensity * (speedMps * speedMps) * dragCoefficient * frontalAreaM2;
}

/**
 * Calculates normal and slope gravity forces on an incline:
 * F_N = m * g * cos(theta)
 * F_slope = m * g * sin(theta)
 */
export function calculateInclineForces(
  totalMassKg: number,
  inclineDegrees: number,
  gravity: number = 9.80665,
): { normalForceN: number; slopeGravityN: number } {
  const thetaRad = (inclineDegrees * Math.PI) / 180;
  const normalForceN = totalMassKg * gravity * Math.cos(thetaRad);
  const slopeGravityN = totalMassKg * gravity * Math.sin(thetaRad);
  return { normalForceN, slopeGravityN };
}
