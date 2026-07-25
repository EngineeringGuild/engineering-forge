import { describe, expect, it } from 'vitest';
import { analyzeVehicle } from './vehicle';
import { CHASSIS, ENGINES } from './vehicleParts';

describe('analyzeVehicle', () => {
  it('matches kinematics (v^2 = 2as) for the large engine + light chassis', () => {
    const result = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100);
    const expectedAcceleration = 3000 / 800;
    const expectedSpeed = Math.sqrt(2 * expectedAcceleration * 100);
    expect(result.tractionLimited).toBe(false);
    expect(result.acceleration).toBeCloseTo(expectedAcceleration, 6);
    expect(result.finalSpeed).toBeCloseTo(expectedSpeed, 6);
  });

  it('gives a slower run for the small engine over the same distance', () => {
    const small = analyzeVehicle(ENGINES['engine-small'], CHASSIS['chassis-light'], 100);
    const large = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100);
    expect(small.finalSpeed).toBeLessThan(large.finalSpeed);
  });

  it('caps effective force at the traction limit when the engine outmuscles the tires', () => {
    // A synthetic case: 800kg chassis, grip implies a 0.8*800*9.8 = 6272N
    // ceiling, but a 10,000N engine tries to push past it.
    const overpoweredEngine = { id: 'test', name: 'test', color: '#000', force: 10_000, cost: 0 };
    const result = analyzeVehicle(overpoweredEngine, CHASSIS['chassis-light'], 100);
    expect(result.tractionLimited).toBe(true);
    expect(result.effectiveForce).toBeCloseTo(0.8 * 800 * 9.8, 6);
    expect(result.effectiveForce).toBeLessThan(overpoweredEngine.force);
    // Acceleration reflects the capped force, not the raw engine force.
    expect(result.acceleration).toBeCloseTo(result.effectiveForce / 800, 6);
  });

  it('is not traction-limited when the engine stays under the grip ceiling', () => {
    const result = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-heavy'], 100);
    expect(result.tractionLimited).toBe(false);
    expect(result.effectiveForce).toBe(ENGINES['engine-large'].force);
  });

  it('the turbo engine (real catalog part) gets traction-limited on the light chassis but not the heavy one', () => {
    const onLight = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-light'], 100);
    const onHeavy = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-heavy'], 100);

    expect(onLight.tractionLimited).toBe(true);
    expect(onLight.effectiveForce).toBeCloseTo(0.8 * 800 * 9.8, 6);

    expect(onHeavy.tractionLimited).toBe(false);
    expect(onHeavy.effectiveForce).toBe(ENGINES['engine-turbo'].force);

    // Even capped, the lighter chassis still comes out ahead here: a capped
    // engine divided by less mass beats an uncapped one divided by more.
    expect(onLight.finalSpeed).toBeGreaterThan(onHeavy.finalSpeed);
  });
});
