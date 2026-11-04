import Matter from 'matter-js';
import type { CircuitModel, CircuitAnalysis } from './circuit';
import { analyzeCircuit } from './circuit';

const { Engine, Bodies, Composite, Constraint, Body, Events } = Matter;

export interface ArcSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  size: number;
}

export interface MatterCircuitState {
  timeSeconds: number;
  leverAngleDegrees: number;
  isContactClosed: boolean;
  breakerTripped: boolean;
  circuitAnalysis: CircuitAnalysis;
  arcSparks: ArcSpark[];
}

export interface MatterCircuitSimulation {
  engine: Matter.Engine;
  world: Matter.World;
  leverBody: Matter.Body;
  terminalContactBody: Matter.Body;
  pivotConstraint: Matter.Constraint;
  step: (deltaTimeMs?: number) => MatterCircuitState;
  toggleSwitch: (targetClosed: boolean) => void;
  resetBodies: () => void;
  destroy: () => void;
}

/**
 * Electromechanical physical knife-switch and circuit-breaker simulation powered by Matter.js.
 * Rigid bodies, pin pivot constraints, terminal contact collisions, and electromagnetic
 * breaker trip forces.
 */
export function createMatterCircuitSimulation(
  model: CircuitModel,
  breakerCurrentLimitAmps: number = 20,
): MatterCircuitSimulation {
  const engine = Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
  });
  const world = engine.world;

  // Geometric coordinates for the knife-switch mechanism
  const pivotX = 140;
  const pivotY = 180;
  const leverLength = 90;
  const leverWidth = 12;

  // Lever body (copper knife blade)
  const leverBody = Bodies.rectangle(
    pivotX + leverLength / 2,
    pivotY,
    leverLength,
    leverWidth,
    {
      mass: 0.35,
      friction: 0.4,
      restitution: 0.15,
      label: 'switch-lever',
    },
  );

  // Pivot pin constraint fixing one end of the lever to (pivotX, pivotY)
  const pivotConstraint = Constraint.create({
    pointA: { x: pivotX, y: pivotY },
    bodyB: leverBody,
    pointB: { x: -leverLength / 2 + 6, y: 0 },
    stiffness: 1.0,
    length: 0,
  });

  // Stationary contact jaw / terminal pad body
  const contactX = pivotX + leverLength - 10;
  const contactY = pivotY + 2;
  const terminalContactBody = Bodies.rectangle(contactX, contactY, 18, 16, {
    isStatic: true,
    friction: 0.8,
    restitution: 0.1,
    label: 'terminal-contact',
  });

  // Mechanical stops (open stop and closed stop)
  const stopClosed = Bodies.rectangle(contactX, contactY + 14, 30, 8, {
    isStatic: true,
    label: 'stop-closed',
  });
  const stopOpen = Bodies.rectangle(pivotX + 20, pivotY - 80, 24, 12, {
    isStatic: true,
    label: 'stop-open',
  });

  Composite.add(world, [
    leverBody,
    terminalContactBody,
    stopClosed,
    stopOpen,
    pivotConstraint,
  ]);

  // Initial state: starts open (angled up ~ -45 degrees)
  Body.setPosition(leverBody, {
    x: pivotX + (leverLength / 2) * Math.cos(-Math.PI / 4),
    y: pivotY + (leverLength / 2) * Math.sin(-Math.PI / 4),
  });
  Body.setAngle(leverBody, -Math.PI / 4);

  let isTargetingClosed = true;
  let isContactClosed = false;
  let breakerTripped = false;
  let simulatedTimeMs = 0;
  let arcSparks: ArcSpark[] = [];

  // Collision event listener for physical electromechanical contact closure
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];
      if (labels.includes('switch-lever') && labels.includes('terminal-contact')) {
        isContactClosed = true;

        // Produce initial contact closure spark particles
        for (let i = 0; i < 6; i++) {
          arcSparks.push({
            x: contactX,
            y: contactY,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            life: 1.0,
            size: Math.random() * 3 + 2,
          });
        }
      }
    }
  });

  Events.on(engine, 'collisionEnd', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];
      if (labels.includes('switch-lever') && labels.includes('terminal-contact')) {
        isContactClosed = false;
      }
    }
  });

  const toggleSwitch = (targetClosed: boolean) => {
    isTargetingClosed = targetClosed;
    if (targetClosed) {
      breakerTripped = false;
    }
  };

  const step = (deltaTimeMs: number = 1000 / 60): MatterCircuitState => {
    simulatedTimeMs += deltaTimeMs;

    // Apply mechanical actuator torque to move the switch toward target position
    if (!breakerTripped) {
      if (isTargetingClosed) {
        // Torque closing the knife blade onto the contacts
        Body.applyForce(
          leverBody,
          { x: leverBody.position.x, y: leverBody.position.y },
          { x: 0, y: 0.003 },
        );
      } else {
        // Torque opening the knife blade
        Body.applyForce(
          leverBody,
          { x: leverBody.position.x, y: leverBody.position.y },
          { x: 0, y: -0.004 },
        );
      }
    }

    // Step Matter.js physics engine
    Engine.update(engine, deltaTimeMs);

    // Update arc spark particles
    arcSparks = arcSparks
      .map((s) => ({
        ...s,
        x: s.x + s.vx,
        y: s.y + s.vy,
        vy: s.vy + 0.2, // gravity on sparks
        life: s.life - 0.05,
      }))
      .filter((s) => s.life > 0);

    // Evaluate circuit state based on physical contact closure
    let circuitAnalysis: CircuitAnalysis = { status: 'open' };

    if (isContactClosed && !breakerTripped) {
      circuitAnalysis = analyzeCircuit(model);

      if (circuitAnalysis.status === 'analyzed') {
        // Check for short circuit / excessive current triggering breaker trip
        let maxCurrent = 0;
        for (const edge of circuitAnalysis.edges) {
          const absI = Math.abs(edge.current);
          if (absI > maxCurrent) maxCurrent = absI;
        }

        const hasBurnout = circuitAnalysis.anyBurnedOut || maxCurrent > breakerCurrentLimitAmps;

        if (hasBurnout) {
          // Electromagnetic trip coil fires: violent impulse throwing the breaker open!
          breakerTripped = true;
          isContactClosed = false;
          Body.applyForce(
            leverBody,
            { x: leverBody.position.x + 30, y: leverBody.position.y },
            { x: -0.04, y: -0.08 },
          );

          // Violent arc flash sparks
          for (let i = 0; i < 20; i++) {
            arcSparks.push({
              x: contactX + (Math.random() - 0.5) * 8,
              y: contactY + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 16,
              vy: -Math.random() * 14 - 3,
              life: 1.0,
              size: Math.random() * 5 + 3,
            });
          }
        }
      }
    }

    const leverAngleDegrees = (leverBody.angle * 180) / Math.PI;

    return {
      timeSeconds: simulatedTimeMs / 1000,
      leverAngleDegrees,
      isContactClosed,
      breakerTripped,
      circuitAnalysis,
      arcSparks,
    };
  };

  const initialLeverPos = {
    x: pivotX + (leverLength / 2) * Math.cos(-Math.PI / 4),
    y: pivotY + (leverLength / 2) * Math.sin(-Math.PI / 4),
  };

  const resetBodies = () => {
    // Reset switch lever to initial open angle (-45 deg) and zero velocities
    Body.setPosition(leverBody, initialLeverPos);
    Body.setVelocity(leverBody, { x: 0, y: 0 });
    Body.setAngularVelocity(leverBody, 0);
    Body.setAngle(leverBody, -Math.PI / 4);
    leverBody.force.x = 0;
    leverBody.force.y = 0;

    isTargetingClosed = false;
    isContactClosed = false;
    breakerTripped = false;
    simulatedTimeMs = 0;
    arcSparks = [];
  };

  const destroy = () => {
    Composite.clear(world, false, true);
    Engine.clear(engine);
  };

  return {
    engine,
    world,
    leverBody,
    terminalContactBody,
    pivotConstraint,
    step,
    toggleSwitch,
    resetBodies,
    destroy,
  };
}
