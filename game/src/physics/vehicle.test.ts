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

  it('is unaffected by inclineDegrees defaulting to 0 (flat, same as omitting it)', () => {
    const withDefault = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100);
    const explicitFlat = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0);
    expect(explicitFlat).toEqual(withDefault);
  });

  it('shrinks the traction limit and adds a gravity penalty on a grade', () => {
    const flat = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-light'], 80, 0);
    const graded = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-light'], 80, 15);
    const theta = (15 * Math.PI) / 180;
    expect(graded.tractionLimit).toBeCloseTo(flat.tractionLimit * Math.cos(theta), 6);
    expect(graded.acceleration).toBeLessThan(flat.acceleration);
    expect(graded.stalled).toBe(false);
  });

  it('stalls (acceleration <= 0, finalSpeed 0) when gravity along the slope beats the driving force', () => {
    // Small engine (1500N) on a 15° grade: gravity component alone is
    // 800*9.8*sin(15°) ≈ 1976N, already more than the engine can deliver.
    const result = analyzeVehicle(ENGINES['engine-small'], CHASSIS['chassis-light'], 80, 15);
    expect(result.stalled).toBe(true);
    expect(result.acceleration).toBeLessThanOrEqual(0);
    expect(result.finalSpeed).toBe(0);
  });

  it('generalizes "light chassis never loses" to a grade: whichever chassis the engine saturates gives the best (or tied) acceleration', () => {
    // Turbo (8000N) saturates the light chassis' shrunk traction limit at 15°
    // but not the heavy one's — same theorem as flat ground, just scaled by
    // cos/sin(theta): a chassis at its traction ceiling can never be beaten
    // by one that hasn't reached its own ceiling yet.
    const light = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-light'], 80, 15);
    const heavy = analyzeVehicle(ENGINES['engine-turbo'], CHASSIS['chassis-heavy'], 80, 15);
    expect(light.tractionLimited).toBe(true);
    expect(heavy.tractionLimited).toBe(false);
    expect(light.finalSpeed).toBeGreaterThan(heavy.finalSpeed);
  });

  it('is unaffected by payloadMass defaulting to 0 (same as omitting it)', () => {
    const withDefault = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0);
    const explicitZero = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0, 0);
    expect(explicitZero).toEqual(withDefault);
  });

  it('adds payload mass onto the chassis for both the traction limit and F=ma', () => {
    const unloaded = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0, 0);
    const loaded = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0, 400);
    const expectedTotalMass = CHASSIS['chassis-light'].mass + 400;
    expect(loaded.tractionLimit).toBeCloseTo(0.8 * expectedTotalMass * 9.8, 6);
    expect(loaded.acceleration).toBeCloseTo(ENGINES['engine-large'].force / expectedTotalMass, 6);
    // Same engine, same chassis, but the extra mass drags the final speed down.
    expect(loaded.finalSpeed).toBeLessThan(unloaded.finalSpeed);
  });

  it('a 400kg payload turns a comfortable pass into a fail for a combo that easily cleared the same distance unloaded', () => {
    // engine-large + chassis-light reaches ~27.4 m/s over 100m unloaded — well
    // past a 32 m/s target isn't even the point; the point is a 25 m/s target
    // it clears unloaded now fails once the crate is aboard.
    const unloaded = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100);
    const loaded = analyzeVehicle(ENGINES['engine-large'], CHASSIS['chassis-light'], 100, 0, 400);
    expect(unloaded.finalSpeed).toBeGreaterThan(25);
    expect(loaded.finalSpeed).toBeLessThan(25);
  });
});
