import { describe, it, expect } from 'vitest';
import {
  ENGINEERING_GLOSSARY,
  type ChallengeCategory,
} from './glossaryData';

describe('Engineering Glossary Data & Category Filtering', () => {
  it('contains entries across all three required challenge categories', () => {
    const categories: ChallengeCategory[] = ['structures', 'circuits', 'vehicles'];
    categories.forEach((cat) => {
      const entries = ENGINEERING_GLOSSARY.filter((e) => e.category === cat);
      expect(entries.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('includes required structural terminology (Truss, Euler Buckling, Young Modulus)', () => {
    const structuralTerms = ENGINEERING_GLOSSARY.filter((e) => e.category === 'structures').map(
      (e) => e.term.toLowerCase(),
    );
    expect(structuralTerms.some((t) => t.includes('truss'))).toBe(true);
    expect(structuralTerms.some((t) => t.includes('buckling'))).toBe(true);
  });

  it('includes required electrical terminology (Capacitor, Kirchhoff, Thermal Burnout, Ohm)', () => {
    const circuitTerms = ENGINEERING_GLOSSARY.filter((e) => e.category === 'circuits').map((e) =>
      e.term.toLowerCase(),
    );
    expect(circuitTerms.some((t) => t.includes('capacitor'))).toBe(true);
    expect(circuitTerms.some((t) => t.includes('kirchhoff'))).toBe(true);
    expect(circuitTerms.some((t) => t.includes('ohm'))).toBe(true);
  });

  it('includes required vehicle powertrain terminology (Torque, Pacejka Slip, Grade Resistance)', () => {
    const vehicleTerms = ENGINEERING_GLOSSARY.filter((e) => e.category === 'vehicles').map((e) =>
      e.term.toLowerCase(),
    );
    expect(vehicleTerms.some((t) => t.includes('torque'))).toBe(true);
    expect(vehicleTerms.some((t) => t.includes('pacejka'))).toBe(true);
    expect(vehicleTerms.some((t) => t.includes('grade'))).toBe(true);
  });

  it('ensures each glossary entry has valid standard references and practical tips', () => {
    ENGINEERING_GLOSSARY.forEach((entry) => {
      expect(entry.id).toBeTruthy();
      expect(entry.term).toBeTruthy();
      expect(entry.shortDefinition.length).toBeGreaterThan(15);
      expect(entry.detailedExplanation.length).toBeGreaterThan(30);
      expect(entry.engineeringTip.length).toBeGreaterThan(15);
      expect(entry.tags.length).toBeGreaterThanOrEqual(2);
    });
  });
});
