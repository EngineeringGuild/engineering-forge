import { describe, it, expect } from 'vitest';
import {
  evaluateLogicNetwork,
  stepMechatronicSimulation,
  type LogicGate,
  type WinchMotor,
  type BasculeBridgeDeck,
} from './mechatronics';

describe('Mechatronics Engine - Digital Logic Evaluator', () => {
  it('correctly computes AND gate truth table', () => {
    const gates: LogicGate[] = [
      { id: 'g1', type: 'AND', inputA: 'in1', inputB: 'in2', output: 'out1' },
    ];

    expect(evaluateLogicNetwork(gates, { in1: false, in2: false }).out1).toBe(false);
    expect(evaluateLogicNetwork(gates, { in1: true, in2: false }).out1).toBe(false);
    expect(evaluateLogicNetwork(gates, { in1: false, in2: true }).out1).toBe(false);
    expect(evaluateLogicNetwork(gates, { in1: true, in2: true }).out1).toBe(true);
  });

  it('correctly computes chained combinational logic: (A AND (NOT B)) OR C', () => {
    const gates: LogicGate[] = [
      { id: 'not_b', type: 'NOT', inputA: 'b', output: 'not_b_out' },
      { id: 'and_gate', type: 'AND', inputA: 'a', inputB: 'not_b_out', output: 'and_out' },
      { id: 'or_gate', type: 'OR', inputA: 'and_out', inputB: 'c', output: 'final_out' },
    ];

    // Case 1: a=true, b=false, c=false -> not_b=true, and=true, final=true
    const r1 = evaluateLogicNetwork(gates, { a: true, b: false, c: false });
    expect(r1.final_out).toBe(true);

    // Case 2: a=true, b=true, c=false -> not_b=false, and=false, final=false
    const r2 = evaluateLogicNetwork(gates, { a: true, b: true, c: false });
    expect(r2.final_out).toBe(false);

    // Case 3: a=false, b=true, c=true -> not_b=false, and=false, final=true (via c)
    const r3 = evaluateLogicNetwork(gates, { a: false, b: true, c: true });
    expect(r3.final_out).toBe(true);
  });
});

describe('Mechatronics Engine - Bascule Electromechanical Winch System', () => {
  const testDeck: BasculeBridgeDeck = {
    lengthM: 12,
    deckMassKg: 4000,
    counterweightKg: 7500,
    hingeX: 0,
    hingeY: 0,
    targetOpenAngleDeg: 45,
  };

  const testWinch: WinchMotor = {
    id: 'industrial-winch-1',
    name: 'Industrial DC Winch',
    ratedVoltage: 24,
    stallTorqueNm: 250,
    noLoadRpm: 120,
    torqueConstantKt: 1.2,
    drumRadiusM: 0.15,
    gearRatio: 80,
    maxCableTensionKn: 150,
  };

  it('generates lifting angular velocity when relay is closed and powered', () => {
    const state = stepMechatronicSimulation(
      testDeck,
      testWinch,
      0, // starting at 0 degrees
      0, // zero velocity
      24, // 24V supply
      true, // relay coil powered
      50, // limit switch at 50 degrees
      0.1,
    );

    expect(state.motorVoltageV).toBe(24);
    expect(state.relayClosed).toBe(true);
    expect(state.motorCurrentA).toBeGreaterThan(0);
    expect(state.winchTensionKn).toBeGreaterThan(0);
    expect(state.bridgeAngleDeg).toBeGreaterThan(0);
  });

  it('shuts off motor and trips limit switch when deck passes cutoff angle', () => {
    const state = stepMechatronicSimulation(
      testDeck,
      testWinch,
      52, // already at 52 degrees
      0.5,
      24,
      true,
      50, // cutoff at 50 degrees
      0.1,
    );

    expect(state.limitSwitchTripped).toBe(true);
    expect(state.relayClosed).toBe(false);
    expect(state.motorVoltageV).toBe(0);
    expect(state.motorCurrentA).toBe(0);
    expect(state.isTargetAngleReached).toBe(true);
  });
});
