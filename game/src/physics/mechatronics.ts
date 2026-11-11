/**
 * Engineering Forge - Mechatronics & Multi-Domain Systems Engine
 * 
 * Simulates coupled electromechanical and digital-logic systems:
 * - Logic Gate Networks: AND, OR, NOT, XOR combinational logic.
 * - Electromechanical Relays: Coil voltage thresholding with SPST switching.
 * - Actuators & DC Winches: Torque/tension derivation from electrical current (T = Kt * I).
 * - Bascule/Drawbridge Kinematics: Angular acceleration, counterweights, and cable tension.
 * - Limit Sensors & Position Encoders: Microswitch trip detection.
 */

export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'BUFFER';

export interface LogicGate {
  id: string;
  type: LogicGateType;
  inputA: string; // Node ID or source signal
  inputB?: string; // Optional for 1-input gates like NOT / BUFFER
  output: string;
}

export interface LogicSignalMap {
  [signalId: string]: boolean;
}

/**
 * Evaluates combinational logic gates sequentially or until stable state.
 */
export function evaluateLogicNetwork(
  gates: LogicGate[],
  inputs: LogicSignalMap,
  maxIterations = 10,
): LogicSignalMap {
  const state: LogicSignalMap = { ...inputs };

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (const gate of gates) {
      const a = state[gate.inputA] ?? false;
      const b = gate.inputB ? state[gate.inputB] ?? false : false;
      let out = false;

      switch (gate.type) {
        case 'AND':
          out = a && b;
          break;
        case 'OR':
          out = a || b;
          break;
        case 'NOT':
          out = !a;
          break;
        case 'XOR':
          out = (a && !b) || (!a && b);
          break;
        case 'BUFFER':
          out = a;
          break;
      }

      if (state[gate.output] !== out) {
        state[gate.output] = out;
        changed = true;
      }
    }

    if (!changed) break;
  }

  return state;
}

export interface WinchMotor {
  id: string;
  name: string;
  ratedVoltage: number; // Volts (V)
  stallTorqueNm: number; // Stall torque (N*m)
  noLoadRpm: number; // Free speed RPM
  torqueConstantKt: number; // N*m / A
  drumRadiusM: number; // Winch drum radius in meters
  gearRatio: number; // Reduction gearbox ratio (e.g. 50:1)
  maxCableTensionKn: number; // Maximum cable tensile rating (kN)
}

export interface BasculeBridgeDeck {
  lengthM: number; // Deck span length in meters
  deckMassKg: number; // Structural mass of the span
  counterweightKg: number; // Counterweight balance mass
  hingeX: number;
  hingeY: number;
  targetOpenAngleDeg: number; // Required clearance angle (e.g. 45°)
}

export interface MechatronicSystemState {
  timeSec: number;
  bridgeAngleDeg: number;
  angularVelocityRadPerSec: number;
  motorCurrentA: number;
  motorVoltageV: number;
  winchTensionKn: number;
  relayClosed: boolean;
  limitSwitchTripped: boolean;
  logicSignals: LogicSignalMap;
  isStalled: boolean;
  isCableSnapped: boolean;
  isTargetAngleReached: boolean;
  isBridgeClosedSafely: boolean;
}

/**
 * Kinematic & electromechanical step simulator for drawbridge / winch systems.
 */
export function stepMechatronicSimulation(
  deck: BasculeBridgeDeck,
  winch: WinchMotor,
  currentAngleDeg: number,
  angularVelocity: number,
  appliedVoltageV: number,
  relayCoilActive: boolean,
  limitSwitchCutoffAngleDeg: number,
  dt = 0.05,
): MechatronicSystemState {
  const GRAVITY = 9.81;
  const rad = (currentAngleDeg * Math.PI) / 180;

  // Limit switch logic: trips when angle exceeds cutoff
  const limitSwitchTripped = currentAngleDeg >= limitSwitchCutoffAngleDeg;

  // Relay is closed only if coil is powered AND limit switch hasn't tripped the safety loop
  const relayClosed = relayCoilActive && !limitSwitchTripped;

  // Effective voltage across winch motor
  const effectiveVoltageV = relayClosed ? appliedVoltageV : 0;

  // Mass moment of inertia about the hinge:
  // For a slender rod pinned at one end: I_deck = (1/3) * m * L^2
  // Counterweight assumed at lever arm L/4: I_cw = m_cw * (L/4)^2
  const I_deck = (1 / 3) * deck.deckMassKg * Math.pow(deck.lengthM, 2);
  const I_cw = deck.counterweightKg * Math.pow(deck.lengthM * 0.25, 2);
  const totalInertia = I_deck + I_cw;

  // Gravitational restoring torque:
  // Deck center of mass is at L/2: Tau_deck = -m * g * (L/2) * cos(theta)
  // Counterweight is at -L/4: Tau_cw = +m_cw * g * (L/4) * cos(theta)
  const tauGravityDeck = -deck.deckMassKg * GRAVITY * (deck.lengthM / 2) * Math.cos(rad);
  const tauGravityCw = deck.counterweightKg * GRAVITY * (deck.lengthM * 0.25) * Math.cos(rad);
  const netGravityTorque = tauGravityDeck + tauGravityCw; // Typically negative (wants to close bridge)

  // Motor electrical model:
  // Back-EMF constant Ke ~= Kt (in SI units: V/(rad/s) = N*m/A)
  const motorShaftOmega = angularVelocity * winch.gearRatio;
  const backEmfV = motorShaftOmega * winch.torqueConstantKt;
  const windingResistance = winch.ratedVoltage / (winch.stallTorqueNm / winch.torqueConstantKt);

  let motorCurrentA = 0;
  if (effectiveVoltageV > 0) {
    motorCurrentA = Math.max(0, (effectiveVoltageV - backEmfV) / windingResistance);
  }

  // Motor output torque at gearbox output:
  const motorTorqueNm = motorCurrentA * winch.torqueConstantKt * winch.gearRatio;

  // Cable tension produced by winch: F = Torque / drumRadius
  const winchTensionKn = (motorTorqueNm / winch.drumRadiusM) / 1000;

  // Cable snapping check
  const isCableSnapped = winchTensionKn > winch.maxCableTensionKn;

  // Motor torque applied to deck hinge:
  // Winch cable pulls at end of deck with angle relative to arm
  const winchTorqueOnDeck = isCableSnapped ? 0 : motorTorqueNm;

  // Net angular torque
  const netTorque = netGravityTorque + winchTorqueOnDeck;

  // Angular acceleration: alpha = netTorque / I
  // Add angular damping
  const dampingTorque = -angularVelocity * 1500;
  const angularAcceleration = (netTorque + dampingTorque) / Math.max(1, totalInertia);

  // Integrate kinematics
  let newAngularVelocity = angularVelocity + angularAcceleration * dt;
  let newAngleDeg = currentAngleDeg + (newAngularVelocity * dt * 180) / Math.PI;

  // Mechanical hard stops at 0° (fully closed) and 85° (max open)
  if (newAngleDeg <= 0) {
    newAngleDeg = 0;
    newAngularVelocity = Math.max(0, newAngularVelocity);
  } else if (newAngleDeg >= 85) {
    newAngleDeg = 85;
    newAngularVelocity = Math.min(0, newAngularVelocity);
  }

  const isStalled = effectiveVoltageV > 0 && Math.abs(newAngularVelocity) < 0.001 && newAngleDeg < deck.targetOpenAngleDeg;
  const isTargetAngleReached = newAngleDeg >= deck.targetOpenAngleDeg;
  const isBridgeClosedSafely = newAngleDeg <= 1.0 && !isCableSnapped;

  return {
    timeSec: 0,
    bridgeAngleDeg: newAngleDeg,
    angularVelocityRadPerSec: newAngularVelocity,
    motorCurrentA,
    motorVoltageV: effectiveVoltageV,
    winchTensionKn,
    relayClosed,
    limitSwitchTripped,
    logicSignals: {},
    isStalled,
    isCableSnapped,
    isTargetAngleReached,
    isBridgeClosedSafely,
  };
}
