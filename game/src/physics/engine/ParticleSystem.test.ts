import { describe, expect, it } from 'vitest';
import { ParticleSystem } from './ParticleSystem';

describe('ParticleSystem', () => {
  it('initializes with zero particles', () => {
    const ps = new ParticleSystem();
    expect(ps.getParticleCount()).toBe(0);
  });

  it('spawns electrical arc sparks correctly', () => {
    const ps = new ParticleSystem();
    ps.emitSparks(100, 150, 20);
    expect(ps.getParticleCount()).toBe(20);

    // Update steps
    ps.update(0.016);
    expect(ps.getParticleCount()).toBe(20);
  });

  it('spawns structural fracture debris along beam coordinate vector', () => {
    const ps = new ParticleSystem();
    ps.emitFracture(10, 10, 80, 50, '#ef4444', 15);
    expect(ps.getParticleCount()).toBe(15);
  });

  it('spawns stress dust and tire smoke', () => {
    const ps = new ParticleSystem();
    ps.emitStressPuff(50, 50, 1.5);
    expect(ps.getParticleCount()).toBeGreaterThan(0);

    ps.emitTireSmoke(20, 20, 0.8);
    expect(ps.getParticleCount()).toBeGreaterThan(5);
  });

  it('decays and cleans up expired particles over time', () => {
    const ps = new ParticleSystem();
    ps.emitSparks(100, 100, 10);

    // Step forward by 2.0 seconds (well past spark lifespan)
    for (let i = 0; i < 60; i++) {
      ps.update(0.05);
    }

    expect(ps.getParticleCount()).toBe(0);
  });

  it('clears all particles when clear() is called', () => {
    const ps = new ParticleSystem();
    ps.emitSparks(50, 50, 25);
    expect(ps.getParticleCount()).toBe(25);
    ps.clear();
    expect(ps.getParticleCount()).toBe(0);
  });
});
