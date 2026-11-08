import { describe, it, expect } from 'vitest';
import {
  ONBOARDING_CONFIG,
  ONBOARDING_STORAGE_PREFIX,
  isOnboardingEligibleLevel,
} from '../content/onboardingData';

describe('OnboardingOverlay Configurations and Logic', () => {
  it('defines 3 comprehensive onboarding steps for each engineering discipline', () => {
    const disciplines: Array<'structures' | 'circuits' | 'vehicles'> = [
      'structures',
      'circuits',
      'vehicles',
    ];

    for (const d of disciplines) {
      const steps = ONBOARDING_CONFIG[d];
      expect(steps).toBeDefined();
      expect(steps.length).toBe(3);

      for (const step of steps) {
        expect(step.title.length).toBeGreaterThan(5);
        expect(step.description.length).toBeGreaterThan(20);
        expect(step.highlightText.length).toBeGreaterThan(3);
        expect(step.icon.length).toBeGreaterThan(0);
        expect(step.tip).toBeDefined();
        expect(step.tip?.length).toBeGreaterThan(10);
      }
    }
  });

  it('correctly qualifies first/tutorial levels for onboarding display', () => {
    expect(isOnboardingEligibleLevel('tutorial')).toBe(true);
    expect(isOnboardingEligibleLevel('tutorial-circuit')).toBe(true);
    expect(isOnboardingEligibleLevel('first-spark')).toBe(true);
    expect(isOnboardingEligibleLevel('tutorial-vehicle')).toBe(true);
    expect(isOnboardingEligibleLevel('first-drive')).toBe(true);
    expect(isOnboardingEligibleLevel('level-1')).toBe(true);

    // Advanced or later levels should NOT trigger onboarding overlay
    expect(isOnboardingEligibleLevel('cantilever')).toBe(false);
    expect(isOnboardingEligibleLevel('long-chasm')).toBe(false);
    expect(isOnboardingEligibleLevel('voltage-divider')).toBe(false);
    expect(isOnboardingEligibleLevel('steep-hill')).toBe(false);
    expect(isOnboardingEligibleLevel('heavy-haul')).toBe(false);
  });

  it('formats storage keys correctly for persistence isolation', () => {
    expect(`${ONBOARDING_STORAGE_PREFIX}structures`).toBe(
      'engineering-forge-onboarding-seen-structures'
    );
    expect(`${ONBOARDING_STORAGE_PREFIX}circuits`).toBe(
      'engineering-forge-onboarding-seen-circuits'
    );
    expect(`${ONBOARDING_STORAGE_PREFIX}vehicles`).toBe(
      'engineering-forge-onboarding-seen-vehicles'
    );
  });
});
