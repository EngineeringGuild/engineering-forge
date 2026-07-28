import { describe, expect, it } from 'vitest';
import { runVehicleTest, scoreVehicleAttempt, totalVehicleCost } from './vehicleBuild';
import type { VehicleAnalysis } from '../physics/vehicle';
import type { VehicleLevelDef } from '../content/vehicleTypes';

const level: VehicleLevelDef = {
  id: 'test-level',
  order: 0,
  name: 'Test',
  tagline: '',
  hint: '',
  distance: 100,
  targetSpeed: 20,
  budget: 100,
  unlockedEngines: ['engine-small', 'engine-large'],
  unlockedChassis: ['chassis-light', 'chassis-heavy'],
};

function fakeAnalysis(finalSpeed: number): VehicleAnalysis {
  return {
    effectiveForce: 0,
    tractionLimit: 0,
    tractionLimited: false,
    acceleration: 0,
    finalSpeed,
    stalled: false,
  };
}

describe('totalVehicleCost', () => {
  it('sums the real catalog engine and chassis costs', () => {
    expect(totalVehicleCost('engine-small', 'chassis-light')).toBe(800 + 500);
    expect(totalVehicleCost('engine-large', 'chassis-heavy')).toBe(1800 + 700);
  });
});

describe('scoreVehicleAttempt', () => {
  it('fails when the speed target is not met, even within budget', () => {
    expect(scoreVehicleAttempt(level, fakeAnalysis(19.9), 50)).toEqual({
      passed: false,
      cost: 50,
      stars: 0,
    });
  });

  it('fails when over budget, even if the speed target is met', () => {
    expect(scoreVehicleAttempt(level, fakeAnalysis(25), 101)).toEqual({
      passed: false,
      cost: 101,
      stars: 0,
    });
  });

  it('awards stars by cost/budget ratio once both the speed and budget requirements pass', () => {
    expect(scoreVehicleAttempt(level, fakeAnalysis(20), 60)).toEqual({
      passed: true,
      cost: 60,
      stars: 3,
    });
    expect(scoreVehicleAttempt(level, fakeAnalysis(20), 61)).toEqual({
      passed: true,
      cost: 61,
      stars: 2,
    });
    expect(scoreVehicleAttempt(level, fakeAnalysis(20), 86)).toEqual({
      passed: true,
      cost: 86,
      stars: 1,
    });
  });

  it('passing the speed target exactly at the threshold counts as a pass', () => {
    expect(scoreVehicleAttempt(level, fakeAnalysis(level.targetSpeed), 50).passed).toBe(true);
  });
});

describe('runVehicleTest', () => {
  it('ties the real solver, cost calculation, and scoring together for a known combo', () => {
    // engine-large (3000N) + chassis-light (800kg) over 100m: a = 3.75 m/s^2,
    // v = sqrt(750) ~= 27.386 m/s — the same hand-verified numbers as the
    // Machines tutorial's winning combo.
    const generousLevel: VehicleLevelDef = { ...level, budget: 2500 };
    const { analysis, cost, score } = runVehicleTest(generousLevel, 'engine-large', 'chassis-light');
    expect(analysis.finalSpeed).toBeCloseTo(Math.sqrt(750), 3);
    expect(cost).toBe(1800 + 500);
    expect(score.passed).toBe(true);
  });

  it('fails via the budget gate when the combo is otherwise fast enough', () => {
    // Same combo as above, but the fixture level's budget (100) is nowhere
    // near its $2300 cost.
    const { score } = runVehicleTest(level, 'engine-large', 'chassis-light');
    expect(score.passed).toBe(false);
    expect(score.stars).toBe(0);
  });

  it('passes inclineDegrees through to the solver and reports a stall as a fail, not a crash', () => {
    // Small engine (1500N) can't beat gravity's pull on an 800kg chassis at
    // 15 degrees (mg sin(theta) ~= 1976N) — the real solver should stall,
    // and that must fail the level cleanly (finalSpeed 0 < any positive target).
    const gradedLevel: VehicleLevelDef = { ...level, inclineDegrees: 15 };
    const { analysis, score } = runVehicleTest(gradedLevel, 'engine-small', 'chassis-light');
    expect(analysis.stalled).toBe(true);
    expect(analysis.finalSpeed).toBe(0);
    expect(score.passed).toBe(false);
  });

  it('passes payloadMass through to the solver, dragging down a combo that would otherwise pass', () => {
    // engine-large + chassis-light clears a 25 m/s target unloaded
    // (~27.4 m/s), but not with a 400kg crate aboard (~22.4 m/s).
    const unloadedLevel: VehicleLevelDef = { ...level, targetSpeed: 25, budget: 2500 };
    const loadedLevel: VehicleLevelDef = { ...unloadedLevel, payloadMass: 400 };
    const unloaded = runVehicleTest(unloadedLevel, 'engine-large', 'chassis-light');
    const loaded = runVehicleTest(loadedLevel, 'engine-large', 'chassis-light');
    expect(unloaded.score.passed).toBe(true);
    expect(loaded.score.passed).toBe(false);
  });
});
