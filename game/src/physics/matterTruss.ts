import Matter from 'matter-js';
import type { LevelDef } from '../content/types';
import type { TrussModel, MemberResult } from './truss';
import { MATERIALS } from './materials';
import type { DynamicSimulationTrajectory, DynamicTrussFrame } from './trussDynamic';

const { Engine, Bodies, Composite, Constraint, Body } = Matter;

export interface MatterTrussSimulation {
  engine: Matter.Engine;
  world: Matter.World;
  nodeBodies: Map<string, Matter.Body>;
  memberConstraints: Map<string, Matter.Constraint>;
  vehicleComposite: Matter.Composite | null;
  step: (deltaTimeMs?: number) => {
    cartPos: { x: number; y: number };
    nodePositions: Record<string, { x: number; y: number }>;
    memberStresses: Record<string, number>;
    failedMemberId: string | null;
    isCollapsed: boolean;
  };
  resetBodies: () => void;
  destroy: () => void;
}

const SCALE = 100; // 1 meter = 100 pixels in Matter.js space

export function createMatterTrussSimulation(
  level: LevelDef,
  model: TrussModel,
  vehicleLoadN: number = 10000,
): MatterTrussSimulation {
  const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 }, // Realistic gravity
  });
  const world = engine.world;

  const nodeBodies = new Map<string, Matter.Body>();
  const memberConstraints = new Map<string, Matter.Constraint>();

  // 1. Create Ground / Valley / Abutments for realistic collisions
  const valleyWidth = (level.buildArea.maxX - level.buildArea.minX + 8) * SCALE;
  const groundY = (level.buildArea.maxY + 2.5) * SCALE;
  const ground = Bodies.rectangle(
    ((level.buildArea.minX + level.buildArea.maxX) / 2) * SCALE,
    groundY,
    valleyWidth,
    80,
    { isStatic: true, label: 'ground', friction: 0.9, restitution: 0.2 },
  );

  // Left & right cliffs
  const leftCliff = Bodies.rectangle(
    (level.buildArea.minX - 2) * SCALE,
    (level.buildArea.minY + 2) * SCALE,
    3 * SCALE,
    10 * SCALE,
    { isStatic: true, label: 'cliff-left' },
  );
  const rightCliff = Bodies.rectangle(
    (level.buildArea.maxX + 2) * SCALE,
    (level.buildArea.minY + 2) * SCALE,
    3 * SCALE,
    10 * SCALE,
    { isStatic: true, label: 'cliff-right' },
  );

  Composite.add(world, [ground, leftCliff, rightCliff]);

  // 2. Create Node Bodies
  for (const n of model.nodes) {
    const isPinned = n.support === 'pin';
    const isRoller = n.support === 'roller';

    const body = Bodies.circle(n.x * SCALE, n.y * SCALE, 14, {
      isStatic: isPinned,
      mass: 5,
      friction: 0.4,
      restitution: 0.1,
      label: `node-${n.id}`,
      collisionFilter: {
        category: 0x0002,
        mask: 0x0001, // collide with terrain, not other nodes
      },
    });

    if (isRoller) {
      // Roller: restrain in Y, allow horizontal translation
      const rollerConstraint = Constraint.create({
        pointA: { x: n.x * SCALE, y: n.y * SCALE },
        bodyB: body,
        stiffness: 0.99,
        length: 0,
        render: { visible: false },
      });
      Composite.add(world, rollerConstraint);
    }

    nodeBodies.set(n.id, body);
    Composite.add(world, body);
  }

  // 3. Create Member Constraints
  for (const m of model.members) {
    const bodyA = nodeBodies.get(m.nodeA);
    const bodyB = nodeBodies.get(m.nodeB);
    if (!bodyA || !bodyB) continue;

    const material = MATERIALS[m.materialId] || MATERIALS.wood;
    const restLen = Math.hypot(bodyB.position.x - bodyA.position.x, bodyB.position.y - bodyA.position.y);

    // Map Young's modulus to Matter.js constraint stiffness (0.01 to 1.0)
    const stiffness = Math.min(1.0, Math.max(0.1, material.youngsModulus / 250e9));

    const constraint = Constraint.create({
      bodyA,
      bodyB,
      length: restLen,
      stiffness,
      damping: 0.05,
      label: m.id,
    });

    memberConstraints.set(m.id, constraint);
    Composite.add(world, constraint);
  }

  // 4. Create Vehicle
  const deckNodes = level.fixedNodes
    .filter((n) => n.isDeck)
    .sort((a, b) => a.x - b.x);

  const startDeckNode = deckNodes[0] || { x: level.buildArea.minX, y: 0 };
  const vehicleMassKg = Math.max(10, vehicleLoadN / 98.1); // e.g. 10000 N ~ 100 kg scaled

  const chassis = Bodies.rectangle(
    startDeckNode.x * SCALE,
    (startDeckNode.y - 0.45) * SCALE,
    64,
    26,
    {
      mass: vehicleMassKg * 0.7,
      friction: 0.5,
      restitution: 0.05,
      label: 'vehicle-chassis',
      collisionFilter: { category: 0x0004, mask: 0x0001 | 0x0002 },
    },
  );

  const wheelFront = Bodies.circle(
    (startDeckNode.x + 0.22) * SCALE,
    (startDeckNode.y - 0.12) * SCALE,
    12,
    {
      mass: vehicleMassKg * 0.15,
      friction: 0.85,
      restitution: 0.05,
      label: 'vehicle-wheel-front',
      collisionFilter: { category: 0x0004, mask: 0x0001 | 0x0002 },
    },
  );

  const wheelRear = Bodies.circle(
    (startDeckNode.x - 0.22) * SCALE,
    (startDeckNode.y - 0.12) * SCALE,
    12,
    {
      mass: vehicleMassKg * 0.15,
      friction: 0.85,
      restitution: 0.05,
      label: 'vehicle-wheel-rear',
      collisionFilter: { category: 0x0004, mask: 0x0001 | 0x0002 },
    },
  );

  const axleFront = Constraint.create({
    bodyA: chassis,
    pointA: { x: 22, y: 10 },
    bodyB: wheelFront,
    stiffness: 0.95,
    length: 0,
  });

  const axleRear = Constraint.create({
    bodyA: chassis,
    pointA: { x: -22, y: 10 },
    bodyB: wheelRear,
    stiffness: 0.95,
    length: 0,
  });

  const vehicleComposite = Composite.create({ label: 'vehicle-composite' });
  Composite.add(vehicleComposite, [chassis, wheelFront, wheelRear, axleFront, axleRear]);
  Composite.add(world, vehicleComposite);

  let failedMemberId: string | null = null;
  let isCollapsed = false;

  const step = (deltaTimeMs: number = 1000 / 60) => {
    // Apply forward motor torque to vehicle wheels to drive across the bridge
    if (!isCollapsed) {
      Body.applyForce(chassis, chassis.position, { x: 0.003 * vehicleMassKg, y: 0 });
      Body.setAngularVelocity(wheelFront, 0.2);
      Body.setAngularVelocity(wheelRear, 0.2);
    }

    // Step the Matter.js physics engine
    Engine.update(engine, deltaTimeMs);

    // Compute constraint forces and check for breakage
    const memberStresses: Record<string, number> = {};

    for (const [memberId, constraint] of memberConstraints.entries()) {
      if (!constraint.bodyA || !constraint.bodyB) continue;

      const pA = constraint.bodyA.position;
      const pB = constraint.bodyB.position;
      const currentDist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
      const restLen = constraint.length;
      const elongationMeters = (currentDist - restLen) / SCALE;

      const memberDef = model.members.find((m) => m.id === memberId);
      const material = memberDef ? MATERIALS[memberDef.materialId] : MATERIALS.wood;
      const axialForceN = elongationMeters * (material.youngsModulus * material.area);
      const capacityN = material.allowableStress * material.area;
      const util = Math.abs(axialForceN) / capacityN;
      memberStresses[memberId] = util;

      const cableCompression = Boolean(material.tensionOnly) && elongationMeters < -0.005;
      const strutTension = Boolean(material.compressionOnly) && elongationMeters > 0.005;

      if (!isCollapsed && (util > 1.0 || cableCompression || strutTension)) {
        failedMemberId = memberId;
        isCollapsed = true;

        // Snap the member physically in Matter.js!
        Composite.remove(world, constraint);
        memberConstraints.delete(memberId);
      }
    }

    // Extract current node positions
    const nodePositions: Record<string, { x: number; y: number }> = {};
    for (const [id, body] of nodeBodies.entries()) {
      nodePositions[id] = {
        x: body.position.x / SCALE,
        y: body.position.y / SCALE,
      };
    }

    const cartPos = {
      x: chassis.position.x / SCALE,
      y: chassis.position.y / SCALE,
    };

    return {
      cartPos,
      nodePositions,
      memberStresses,
      failedMemberId,
      isCollapsed,
    };
  };

  const initialNodePositions = new Map<string, { x: number; y: number }>();
  for (const [id, body] of nodeBodies.entries()) {
    initialNodePositions.set(id, { x: body.position.x, y: body.position.y });
  }

  const initialChassisPos = { x: chassis.position.x, y: chassis.position.y };
  const initialWheelFrontPos = { x: wheelFront.position.x, y: wheelFront.position.y };
  const initialWheelRearPos = { x: wheelRear.position.x, y: wheelRear.position.y };
  const allMemberConstraints = new Map(memberConstraints);

  const resetBodies = () => {
    // Reset all node bodies to initial coordinates and zero velocities
    for (const [id, body] of nodeBodies.entries()) {
      const initPos = initialNodePositions.get(id);
      if (initPos) {
        Body.setPosition(body, initPos);
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
        Body.setAngle(body, 0);
        body.force.x = 0;
        body.force.y = 0;
      }
    }

    // Reset vehicle chassis and wheels to initial state
    Body.setPosition(chassis, initialChassisPos);
    Body.setVelocity(chassis, { x: 0, y: 0 });
    Body.setAngularVelocity(chassis, 0);
    Body.setAngle(chassis, 0);
    chassis.force.x = 0;
    chassis.force.y = 0;

    Body.setPosition(wheelFront, initialWheelFrontPos);
    Body.setVelocity(wheelFront, { x: 0, y: 0 });
    Body.setAngularVelocity(wheelFront, 0);
    Body.setAngle(wheelFront, 0);
    wheelFront.force.x = 0;
    wheelFront.force.y = 0;

    Body.setPosition(wheelRear, initialWheelRearPos);
    Body.setVelocity(wheelRear, { x: 0, y: 0 });
    Body.setAngularVelocity(wheelRear, 0);
    Body.setAngle(wheelRear, 0);
    wheelRear.force.x = 0;
    wheelRear.force.y = 0;

    // Restore any removed / snapped member constraints
    for (const [mId, constraint] of allMemberConstraints.entries()) {
      if (!memberConstraints.has(mId)) {
        memberConstraints.set(mId, constraint);
        Composite.add(world, constraint);
      }
    }

    failedMemberId = null;
    isCollapsed = false;
  };

  const destroy = () => {
    Composite.clear(world, false, true);
    Engine.clear(engine);
  };

  return {
    engine,
    world,
    nodeBodies,
    memberConstraints,
    vehicleComposite,
    step,
    resetBodies,
    destroy,
  };
}

/**
 * Precomputes a full dynamic trajectory of the truss under vehicle crossing
 * using the Matter.js physics engine, capturing node displacements, member stresses,
 * and snap collapse events.
 */
export function computeMatterTrussTrajectory(
  level: LevelDef,
  model: TrussModel,
  totalSteps: number = 36,
  vehicleLoadN: number = 10000,
): DynamicSimulationTrajectory {
  const sim = createMatterTrussSimulation(level, model, vehicleLoadN);
  const frames: DynamicTrussFrame[] = [];
  let failureStep: number | null = null;
  let failedMemberId: string | null = null;
  let peakUtilization = 0;
  for (let s = 0; s <= totalSteps; s++) {
    // Substep with 16.66ms physics ticks for stable Matter.js integration
    sim.step(16.66);
    sim.step(16.66);
    const stepState = sim.step(16.66);
    const t = s / totalSteps;

    let stepMaxUtil = 0;
    const memberResults: Record<string, MemberResult> = {};
    for (const [mId, util] of Object.entries(stepState.memberStresses)) {
      if (util > stepMaxUtil) stepMaxUtil = util;
      const memDef = model.members.find((m) => m.id === mId);
      const mat = memDef ? MATERIALS[memDef.materialId] : MATERIALS.wood;
      const capacity = mat.allowableStress * mat.area;
      memberResults[mId] = {
        memberId: mId,
        axialForce: util * capacity,
        capacity,
        utilization: util,
        failed: stepState.failedMemberId === mId,
        wentSlack: false,
        pulledApart: false,
      };
    }

    if (stepMaxUtil > peakUtilization) peakUtilization = stepMaxUtil;

    if (stepState.failedMemberId && failureStep === null) {
      failureStep = s;
      failedMemberId = stepState.failedMemberId;
    }

    const nodeDisplacements: Record<string, { dx: number; dy: number }> = {};
    for (const [nId, pos] of Object.entries(stepState.nodePositions)) {
      const origNode = model.nodes.find((n) => n.id === nId);
      if (origNode) {
        nodeDisplacements[nId] = {
          dx: pos.x - origNode.x,
          dy: pos.y - origNode.y,
        };
      }
    }

    frames.push({
      step: s,
      t,
      cartPos: stepState.cartPos,
      memberResults,
      nodeDisplacements,
      maxUtilization: stepMaxUtil,
      failedMemberId: stepState.failedMemberId,
      isCollapsed: stepState.isCollapsed,
    });
  }

  sim.destroy();

  return {
    frames,
    passed: failureStep === null,
    failureStep,
    failedMemberId,
    failureReason: failedMemberId ? 'overload' : undefined,
    peakUtilization,
    durationSeconds: 3.2,
  };
}

