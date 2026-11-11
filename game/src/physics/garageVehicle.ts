/**
 * Engineering Forge - Inventor's Garage & Vehicle Customizer Engine
 * Parametric chassis, suspension stiffness, tire friction calibration,
 * dynamic center-of-gravity (CoG) and powertrain tuning (DOC-10).
 */

export interface CustomVehicleConfig {
  id: string;
  name: string;
  chassisType: 'tubular' | 'monocoque' | 'heavy_duty';
  chassisMassKg: number;
  wheelbaseMeters: number; // e.g. 2.4m
  chassisLengthMeters: number; // e.g. 3.8m
  engineId: string;
  engineForceNewtons: number;
  cogOffsetRatio: number; // -0.3 (rear heavy) to +0.3 (front heavy)
  suspensionStiffnessNPerM: number; // 25,000 to 75,000 N/m
  suspensionDampingRatio: number; // 0.3 to 0.9 (zeta)
  tireCompound: 'standard' | 'offroad' | 'racing_slicks';
  tireFrictionMu: number; // 0.65 to 1.25
  payloadMassKg: number;
}

export interface GarageCalculatedMetrics {
  totalMassKg: number;
  weightNewtons: number;
  cogXPositionMeters: number;
  normalForceFrontN: number;
  normalForceRearN: number;
  maxStaticTractionForceN: number;
  accelerationMaxMs2: number;
  maxClimbableSlopeDeg: number;
  suspensionNaturalFrequencyHz: number;
  topSpeedEstimateMs: number;
}

const GRAVITY_M_S2 = 9.81;

/**
 * Calculates physical vehicle telemetry based on parametric garage configuration.
 */
export function calculateGarageVehicleMetrics(
  config: CustomVehicleConfig
): GarageCalculatedMetrics {
  const totalMassKg = config.chassisMassKg + config.payloadMassKg;
  const weightNewtons = totalMassKg * GRAVITY_M_S2;

  // Let x=0 be the Rear Axle and x=L be the Front Axle:
  // Neutral center is L/2.
  // Positive cogOffsetRatio moves CoG forward towards front axle (+x).
  // Negative cogOffsetRatio moves CoG rearward towards rear axle (-x).
  const halfWheelbase = config.wheelbaseMeters / 2;
  const cogXFromRear = halfWheelbase + config.cogOffsetRatio * halfWheelbase;

  // Moment equilibrium:
  // ΣM_rear = 0 => N_front * L = W * x_cog => N_front = W * (x_cog / L)
  // ΣM_front = 0 => N_rear * L = W * (L - x_cog) => N_rear = W * (L - x_cog) / L
  const normalForceFrontN = (weightNewtons * cogXFromRear) / config.wheelbaseMeters;
  const normalForceRearN = (weightNewtons * (config.wheelbaseMeters - cogXFromRear)) / config.wheelbaseMeters;

  // Maximum traction capacity before Coulomb slip (all-wheel drive approximation)
  const maxStaticTractionForceN = config.tireFrictionMu * weightNewtons;

  // Usable thrust cannot exceed friction limit
  const effectiveThrustN = Math.min(config.engineForceNewtons, maxStaticTractionForceN);
  const accelerationMaxMs2 = effectiveThrustN / totalMassKg;

  // Maximum climbable slope angle where thrust equals gravitational component along slope:
  // F_thrust = m * g * sin(theta) => theta = arcsin(F_thrust / (m * g))
  const sinTheta = Math.min(1.0, effectiveThrustN / weightNewtons);
  const maxClimbableSlopeDeg = (Math.asin(sinTheta) * 180) / Math.PI;

  // Suspension natural frequency: f_n = 1/(2*pi) * sqrt(k / m_corner)
  const cornerMassKg = totalMassKg / 4;
  const suspensionNaturalFrequencyHz =
    (1 / (2 * Math.PI)) * Math.sqrt(config.suspensionStiffnessNPerM / cornerMassKg);

  // Aerodynamic drag terminal velocity estimate (Cd = 0.38, frontal area A = 2.2 m², air density rho = 1.225 kg/m³)
  // P = F_thrust * v = 0.5 * rho * Cd * A * v^3 => v = sqrt(2 * F_thrust / (rho * Cd * A))
  const dragFactor = 0.5 * 1.225 * 0.38 * 2.2;
  const topSpeedEstimateMs = Math.sqrt(effectiveThrustN / dragFactor);

  return {
    totalMassKg: Math.round(totalMassKg),
    weightNewtons: Math.round(weightNewtons),
    cogXPositionMeters: Number(cogXFromRear.toFixed(2)),
    normalForceFrontN: Math.round(normalForceFrontN),
    normalForceRearN: Math.round(normalForceRearN),
    maxStaticTractionForceN: Math.round(maxStaticTractionForceN),
    accelerationMaxMs2: Number(accelerationMaxMs2.toFixed(2)),
    maxClimbableSlopeDeg: Number(maxClimbableSlopeDeg.toFixed(1)),
    suspensionNaturalFrequencyHz: Number(suspensionNaturalFrequencyHz.toFixed(2)),
    topSpeedEstimateMs: Number(topSpeedEstimateMs.toFixed(1)),
  };
}
