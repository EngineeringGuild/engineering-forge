import type { MechatronicsLevelDef } from './mechatronicsTypes';
import type { WinchMotor } from '../physics/mechatronics';

export const WINCHES: Record<string, WinchMotor> = {
  'winch-light': {
    id: 'winch-light',
    name: 'Standard Light Winch (12V)',
    ratedVoltage: 12,
    stallTorqueNm: 90,
    noLoadRpm: 180,
    torqueConstantKt: 0.8,
    drumRadiusM: 0.12,
    gearRatio: 40,
    maxCableTensionKn: 60,
  },
  'winch-heavy': {
    id: 'winch-heavy',
    name: 'Industrial High-Torque Winch (24V)',
    ratedVoltage: 24,
    stallTorqueNm: 280,
    noLoadRpm: 120,
    torqueConstantKt: 1.4,
    drumRadiusM: 0.15,
    gearRatio: 85,
    maxCableTensionKn: 160,
  },
  'winch-hydraulic': {
    id: 'winch-hydraulic',
    name: 'Heavy Hydraulic Capstan (48V)',
    ratedVoltage: 48,
    stallTorqueNm: 600,
    noLoadRpm: 90,
    torqueConstantKt: 2.2,
    drumRadiusM: 0.2,
    gearRatio: 120,
    maxCableTensionKn: 300,
  },
};

export const MECHATRONICS_LEVELS: MechatronicsLevelDef[] = [
  {
    id: 'mechatronics-1',
    name: 'The Automated Drawbridge',
    tagline: 'Combine an electric winch, relay coil, and limit switch to lift a 12m canal bascule bridge.',
    discipline: 'mechatronics',
    order: 1,
    brief: {
      problem:
        'A 12-meter bascule bridge spans a shipping canal. An incoming barge requires a minimum clearance angle of 45°. Select an electromechanical winch and configure the limit switch cutoff so the span raises to at least 45° without exceeding the cable tensile breaking limit (120 kN).',
      physicsLesson:
        'Bascule bridges balance structural mass against a counterweight to minimize net gravity torque. The electric winch converts electrical energy (V × I) into mechanical cable tension (T = Kt × I × Ratio / r). Once the desired angle is reached, a limit switch opens the control relay circuit to de-energize the motor before cable tension snaps the cable.',
      constraints: [
        'Span must clear at least 45° to allow barge passage.',
        'Winch cable tension must not exceed 165 kN.',
        'Motor current must not exceed 180 A (thermal trip).',
      ],
    },
    budget: 4500,
    deck: {
      lengthM: 12,
      deckMassKg: 4200,
      counterweightKg: 7800,
      hingeX: 100,
      hingeY: 260,
      targetOpenAngleDeg: 45,
    },
    availableWinches: [WINCHES['winch-light'], WINCHES['winch-heavy']],
    availableGates: ['AND', 'NOT'],
    allowRelay: true,
    allowLimitSwitch: true,
    targetClearanceAngleDeg: 45,
    maxAllowableCurrentA: 180,
    maxAllowableTensionKn: 165,
  },
  {
    id: 'mechatronics-2',
    name: 'The Solar Funicular Ascent',
    tagline: 'Lift a heavy payload along a steep incline using an electromechanical drive with dual speed control.',
    discipline: 'mechatronics',
    order: 2,
    brief: {
      problem:
        'A deep-mine funicular car must be hoisted up a steep 55° embankment to clear the surface threshold. The heavy span and cart require substantial starting torque. Calibrate counterweight assistance and electromechanical gear ratio so the winch raises the arm past 50° without stalling or drawing excessive current.',
      physicsLesson:
        'Hoisting against gravity on steep inclines creates high initial inertial torque. If counterweight balance is inadequate, the DC motor draws near-stall current (I = V / R), generating severe Joulean heat (P = I²R). Optimal mechatronic tuning balances mechanical advantage against motor back-EMF.',
      constraints: [
        'Bridge/hoist arm must reach at least 50°.',
        'Maximum cable tension must remain below 150 kN.',
        'Motor current must stay under 220 A.',
      ],
    },
    budget: 6800,
    deck: {
      lengthM: 14,
      deckMassKg: 5500,
      counterweightKg: 9500,
      hingeX: 100,
      hingeY: 270,
      targetOpenAngleDeg: 50,
    },
    availableWinches: [WINCHES['winch-heavy'], WINCHES['winch-hydraulic']],
    availableGates: ['AND', 'OR', 'NOT'],
    allowRelay: true,
    allowLimitSwitch: true,
    targetClearanceAngleDeg: 50,
    maxAllowableCurrentA: 220,
    maxAllowableTensionKn: 150,
  },
  {
    id: 'mechatronics-3',
    name: 'Fail-Safe Logic Interlock',
    tagline: 'Wire combinational AND and NOT logic to prevent traffic barrier deployment until structural sensors confirm lock.',
    discipline: 'mechatronics',
    order: 3,
    brief: {
      problem:
        'In critical infrastructure, human error is prevented by hardware interlocks. The traffic gate must only allow vehicle crossing (Output = TRUE) when: (1) Deck Locked sensor is TRUE, (2) Ship Clearance sensor is TRUE (no boat under bridge), and (3) Emergency Stop (E-Stop) is NOT pressed (False). Design the combinational logic circuit!',
      physicsLesson:
        'Interlock logic ensures catastrophic states are physically impossible. By combining Boolean logic gates (AND, OR, NOT) with sensory feedback, mechatronic controllers guarantee safe transitions in nuclear plants, aerospace systems, and automated transit bridges.',
      constraints: [
        'Safety Gate opens (Output = TRUE) if and only if: Deck Locked = TRUE, Ship Cleared = TRUE, and E-Stop = FALSE.',
        'Total control logic budget under $3,000.',
      ],
    },
    budget: 3000,
    deck: {
      lengthM: 10,
      deckMassKg: 3000,
      counterweightKg: 5500,
      hingeX: 100,
      hingeY: 260,
      targetOpenAngleDeg: 40,
    },
    availableWinches: [WINCHES['winch-light'], WINCHES['winch-heavy']],
    availableGates: ['AND', 'OR', 'NOT', 'XOR'],
    allowRelay: true,
    allowLimitSwitch: true,
    requiredLogicInterlock: {
      inputs: [
        { id: 'deck_locked', label: 'Deck Locked Sensor', initialValue: true },
        { id: 'ship_cleared', label: 'Ship Cleared Sensor', initialValue: true },
        { id: 'estop_pressed', label: 'Emergency Stop Pressed', initialValue: false },
      ],
      targetOutput: 'traffic_gate_enable',
      expectedState: true,
      description: 'Output must be TRUE only when Deck Locked AND Ship Cleared AND NOT E-Stop.',
    },
    targetClearanceAngleDeg: 40,
    maxAllowableCurrentA: 150,
    maxAllowableTensionKn: 100,
  },
];
