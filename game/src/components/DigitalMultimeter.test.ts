import { describe, it, expect } from 'vitest';

describe('Digital Multimeter Calculations', () => {
  it('correctly calculates DC voltage delta across two nodes', () => {
    const vRed = 18.0;
    const vBlack = 6.0;
    const deltaV = vRed - vBlack;
    expect(deltaV).toBe(12.0);

    const reversed = vBlack - vRed;
    expect(reversed).toBe(-12.0);
  });

  it('correctly calculates Ohm resistance from V and I', () => {
    const deltaV = 10.0;
    const currentA = 2.0;
    const resistance = deltaV / currentA;
    expect(resistance).toBe(5.0);
  });

  it('identifies short-circuit continuity condition (R < 0.5 ohm)', () => {
    const deltaV = 0.05;
    const currentA = 2.5;
    const r = deltaV / currentA;
    const isShort = r < 0.5;
    expect(isShort).toBe(true);
  });

  it('flags open-circuit overload when no current flows', () => {
    const currentA = 0;
    const isOverload = currentA === 0;
    expect(isOverload).toBe(true);
  });
});
