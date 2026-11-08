import { describe, expect, it } from 'vitest';
import { soundFx } from './soundFx';

describe('SoundEngine', () => {
  it('initializes safely without crashing in test environment', () => {
    expect(soundFx).toBeDefined();
    expect(typeof soundFx.getMuted()).toBe('boolean');
  });

  it('toggles mute correctly', () => {
    const initial = soundFx.getMuted();
    const toggled = soundFx.toggleMute();
    expect(toggled).toBe(!initial);
    expect(soundFx.getMuted()).toBe(!initial);
    // restore
    soundFx.toggleMute();
    expect(soundFx.getMuted()).toBe(initial);
  });

  it('sets and gets master volume clamped between 0 and 1', () => {
    soundFx.setVolume(0.5);
    expect(soundFx.getVolume()).toBe(0.5);

    soundFx.setVolume(1.5);
    expect(soundFx.getVolume()).toBe(1);

    soundFx.setVolume(-0.2);
    expect(soundFx.getVolume()).toBe(0);

    // restore
    soundFx.setVolume(0.8);
    expect(soundFx.getVolume()).toBe(0.8);
  });

  it('calling audio methods does not throw errors when WebAudio is unavailable in Node', () => {
    expect(() => soundFx.playSnapNode()).not.toThrow();
    expect(() => soundFx.playStressCreak(0.9)).not.toThrow();
    expect(() => soundFx.playBreak()).not.toThrow();
    expect(() => soundFx.playElectricHum()).not.toThrow();
    expect(() => soundFx.playSpark()).not.toThrow();
    expect(() => soundFx.playEngineRev(0.8)).not.toThrow();
    expect(() => soundFx.playTireScreech()).not.toThrow();
    expect(() => soundFx.playVictory(3)).not.toThrow();
    expect(() => soundFx.playFail()).not.toThrow();
  });
});
