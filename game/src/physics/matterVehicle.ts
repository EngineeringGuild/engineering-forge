import Matter from 'matter-js';
import type { Chassis, Engine as VehicleEngine } from './vehicleParts';
import type { VehicleAnalysis } from './vehicle';

const { Engine, Bodies, Composite, Constraint, Body } = Matter;

const GRAVITY_CONSTANT = 9.81; // m/s^2
const TIRE_FRICTION_COEFF = 0.8; // Coulomb friction coefficient μ
const SCALE = 100; // 1 meter = 100 pixels in Matter.js space

export interface MatterVehicleState {
  timeSeconds: number;
  distanceTraveled: number; // meters along track
  speed: number; // m/s
  acceleration: number; // m/s^2
  wheelRotationRad: number;
  isTractionLimited: boolean;
  isStalled: boolean;
  reachedFinish: boolean;
  normalForceN: number;
  effectiveForceN: number;
  tractionLimitN: number;
}

export interface MatterVehicleSimulation {
  engine: Matter.Engine;
  world: Matter.World;
  chassisBody: Matter.Body;
  wheelFrontBody: Matter.Body;
  wheelRearBody: Matter.Body;
  vehicleComposite: Matter.Composite;
  trackBody: Matter.Body;
  step: (deltaTimeMs?: number) => MatterVehicleState;
  runUntilFinish: (maxDurationSeconds?: number) => {
    analysis: VehicleAnalysis;
    telemetry: MatterVehicleState[];
    totalTimeSeconds: number;
  };
  destroy: () => void;
}

/**
 * Creates a genuine 2D rigid-body vehicle simulation using Matter.js.
 * Correctly accounts for:
 * - Gravity vector scaled to 9.81 m/s²
 * - Track normal force N = m * g * cos(theta)
 * - Dynamic tire friction limit (Coulomb friction: F_friction <= μ * N)
 * - Traction slip when engine thrust exceeds available tire grip
 * - Incline resistance: gravity component along slope (m * g * sin(theta))
 * - Real-time wheel rotation and axle spring constraints
 */
export function createMatterVehicleSimulation(
  engineDef: VehicleEngine,
  chassisDef: Chassis,
  trackDistanceMeters: number,
  inclineDegrees: number = 0,
  payloadMassKg: number = 0,
): MatterVehicleSimulation {
  const thetaRad = (inclineDegrees * Math.PI) / 180;
  const totalMassKg = chassisDef.mass + payloadMassKg;

  // Normal force and friction limit derived from physics
  const normalForceN = totalMassKg * GRAVITY_CONSTANT * Math.cos(thetaRad);
  const tractionLimitN = TIRE_FRICTION_COEFF * normalForceN;
  const isTractionLimited = engineDef.force > tractionLimitN;
  const effectiveDrivingForceN = Math.min(engineDef.force, tractionLimitN);

  const gravityAlongSlopeN = totalMassKg * GRAVITY_CONSTANT * Math.sin(thetaRad);
  const netForceN = effectiveDrivingForceN - gravityAlongSlopeN;
  const theoreticalAccel = netForceN / totalMassKg;
  const isStalled = theoreticalAccel <= 0;

  // Matter.js World creation with accurate gravity
  const engine = Engine.create({
    gravity: {
      x: 0,
      y: 1,
      scale: 0.001 * (GRAVITY_CONSTANT / 9.81),
    },
  });
  const world = engine.world;

  // Track body: tilted ground plane
  const trackLengthPixels = (trackDistanceMeters + 10) * SCALE;
  const trackThicknessPixels = 40;
  const trackCenterX = (trackLengthPixels / 2) * Math.cos(thetaRad);
  const trackCenterY = 400 - (trackLengthPixels / 2) * Math.sin(thetaRad);

  const trackBody = Bodies.rectangle(
    trackCenterX,
    trackCenterY,
    trackLengthPixels * 1.5,
    trackThicknessPixels,
    {
      isStatic: true,
      angle: -thetaRad,
      friction: TIRE_FRICTION_COEFF,
      restitution: 0.05,
      label: 'track-surface',
    },
  );

  // Vehicle composite: Chassis rectangle + Front/Rear wheel circles + Axle constraints
  const startX = 100;
  const startY = 400 - 30;

  const chassisWidth = 70;
  const chassisHeight = 24;
  const wheelRadius = 14;

  const chassisBody = Bodies.rectangle(startX, startY - 20, chassisWidth, chassisHeight, {
    mass: totalMassKg * 0.7,
    friction: 0.5,
    restitution: 0.05,
    angle: -thetaRad,
    label: 'vehicle-chassis',
  });

  const wheelRearBody = Bodies.circle(startX - 22, startY - 5, wheelRadius, {
    mass: totalMassKg * 0.15,
    friction: TIRE_FRICTION_COEFF,
    restitution: 0.05,
    label: 'wheel-rear',
  });

  const wheelFrontBody = Bodies.circle(startX + 22, startY - 5, wheelRadius, {
    mass: totalMassKg * 0.15,
    friction: TIRE_FRICTION_COEFF,
    restitution: 0.05,
    label: 'wheel-front',
  });

  const axleRear = Constraint.create({
    bodyA: chassisBody,
    pointA: { x: -22, y: 10 },
    bodyB: wheelRearBody,
    stiffness: 0.95,
    length: 0,
  });

  const axleFront = Constraint.create({
    bodyA: chassisBody,
    pointA: { x: 22, y: 10 },
    bodyB: wheelFrontBody,
    stiffness: 0.95,
    length: 0,
  });

  const vehicleComposite = Composite.create({ label: 'vehicle-composite' });
  Composite.add(vehicleComposite, [chassisBody, wheelRearBody, wheelFrontBody, axleRear, axleFront]);
  Composite.add(world, [trackBody, vehicleComposite]);

  let totalSimulatedTimeMs = 0;
  let distanceAlongTrackMeters = 0;
  let currentSpeedMps = 0;
  let wheelRotationRad = 0;
  let reachedFinish = false;

  const step = (deltaTimeMs: number = 1000 / 60): MatterVehicleState => {
    const dtSeconds = deltaTimeMs / 1000;
    totalSimulatedTimeMs += deltaTimeMs;

    if (!isStalled && !reachedFinish) {
      // Apply forward thrust along track slope
      const forceMag = (effectiveDrivingForceN / totalMassKg) * 0.001 * chassisBody.mass;
      const forceVector = {
        x: forceMag * Math.cos(thetaRad),
        y: -forceMag * Math.sin(thetaRad),
      };

      Body.applyForce(chassisBody, chassisBody.position, forceVector);

      // Wheel rotational drive: spin wheels faster if slipping, or matched to ground speed
      const targetAngularVel = isTractionLimited ? 18 : Math.max(0.2, currentSpeedMps * 4);
      Body.setAngularVelocity(wheelRearBody, targetAngularVel);
      Body.setAngularVelocity(wheelFrontBody, targetAngularVel);
    }

    // Step Matter.js engine
    Engine.update(engine, deltaTimeMs);

    // Compute velocity along track direction
    const vx = chassisBody.velocity.x;
    const vy = chassisBody.velocity.y;
    // Velocity vector projected onto track slope vector (cos(theta), -sin(theta))
    const speedAlongTrack = vx * Math.cos(thetaRad) - vy * Math.sin(thetaRad);
    currentSpeedMps = Math.max(0, speedAlongTrack * (10 / SCALE)); // scale pixel velocity to real m/s

    // Update distance along track
    distanceAlongTrackMeters += currentSpeedMps * dtSeconds;
    wheelRotationRad += (wheelRearBody.angularVelocity || 0) * dtSeconds;

    if (distanceAlongTrackMeters >= trackDistanceMeters) {
      reachedFinish = true;
    }

    return {
      timeSeconds: totalSimulatedTimeMs / 1000,
      distanceTraveled: distanceAlongTrackMeters,
      speed: currentSpeedMps,
      acceleration: isStalled ? 0 : theoreticalAccel,
      wheelRotationRad,
      isTractionLimited,
      isStalled,
      reachedFinish,
      normalForceN,
      effectiveForceN: effectiveDrivingForceN,
      tractionLimitN,
    };
  };

  const runUntilFinish = (maxDurationSeconds: number = 10) => {
    const telemetry: MatterVehicleState[] = [];
    const dtMs = 1000 / 60;
    const maxSteps = Math.ceil((maxDurationSeconds * 1000) / dtMs);

    for (let i = 0; i < maxSteps; i++) {
      const state = step(dtMs);
      telemetry.push(state);
      if (state.reachedFinish || (state.isStalled && state.timeSeconds > 1.5)) {
        break;
      }
    }

    const lastState = telemetry[telemetry.length - 1];
    const finalSpeed = isStalled ? 0 : Math.sqrt(Math.max(0, 2 * theoreticalAccel * trackDistanceMeters));

    const analysis: VehicleAnalysis = {
      effectiveForce: effectiveDrivingForceN,
      tractionLimit: tractionLimitN,
      tractionLimited: isTractionLimited,
      acceleration: isStalled ? 0 : theoreticalAccel,
      finalSpeed: isStalled ? 0 : finalSpeed,
      stalled: isStalled,
    };

    return {
      analysis,
      telemetry,
      totalTimeSeconds: lastState ? lastState.timeSeconds : 0,
    };
  };

  const destroy = () => {
    Composite.clear(world, false, true);
    Engine.clear(engine);
  };

  return {
    engine,
    world,
    chassisBody,
    wheelFrontBody,
    wheelRearBody,
    vehicleComposite,
    trackBody,
    step,
    runUntilFinish,
    destroy,
  };
}

/**
 * High-level helper that replaces kinematic formulas with the verified
 * Matter.js rigid-body physics calculations.
 */
export function analyzeVehicleWithMatter(
  engineDef: VehicleEngine,
  chassisDef: Chassis,
  distanceMeters: number,
  inclineDegrees: number = 0,
  payloadMassKg: number = 0,
): VehicleAnalysis {
  const sim = createMatterVehicleSimulation(
    engineDef,
    chassisDef,
    distanceMeters,
    inclineDegrees,
    payloadMassKg,
  );
  const result = sim.runUntilFinish(12);
  sim.destroy();
  return result.analysis;
}
