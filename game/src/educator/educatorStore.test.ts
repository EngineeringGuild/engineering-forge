import { describe, expect, it, beforeEach } from 'vitest';
import { useEducatorStore } from './educatorStore';
import {
  encodeTrackToUrlHash,
  decodeTrackFromUrlHash,
  exportToClassPackage,
  importFromClassPackage,
} from './educatorPackaging';
import type { EducatorTrack } from './educatorTypes';

describe('Educator Packaging & Deep Linking', () => {
  const sampleTrack: EducatorTrack = {
    id: 'test-track-1',
    title: 'Trilha Teste de Cinemática',
    teacherName: 'Prof. Ana Silva',
    institution: 'Colégio Alpha',
    createdAt: '2026-11-11T00:00:00.000Z',
    updatedAt: '2026-11-11T00:00:00.000Z',
    discipline: 'machines',
    gradeLevel: 'high-school',
    curriculumTags: ['EM13CNT101'],
    isPublished: true,
    levels: [
      {
        id: 'test-lvl-1',
        schemaVersion: 'forge-educator/1.0',
        title: 'Arrancada com Atrito Limite',
        discipline: 'machines',
        description: 'Acelere o chassi sem patinar os pneus.',
        learningObjectives: ['Compreender F=ma'],
        curriculumCodes: ['EM13CNT101'],
        difficultyGrade: 'high-school',
        inventory: {
          allowedMaterials: ['engine_small', 'chassis_light'],
          budgetLimit: 100,
        },
        rubric: {
          safetyFactorMinimum: 1.2,
          targetEfficiencyPercent: 80,
          revealHintAfterAttempts: 2,
          pedagogicalHint: 'Verifique o peso sobre os eixos.',
        },
        geometry: {
          spanWidthMeters: 50,
          fixedAnchorsCount: 0,
          rollerAnchorsCount: 0,
        },
      },
    ],
  };

  it('encodes and decodes track to URL hash symmetrically', () => {
    const hash = encodeTrackToUrlHash(sampleTrack);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(20);

    const decoded = decodeTrackFromUrlHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(sampleTrack.id);
    expect(decoded?.title).toBe(sampleTrack.title);
    expect(decoded?.levels.length).toBe(1);
    expect(decoded?.levels[0].id).toBe('test-lvl-1');
  });

  it('exports to ForgeClassPackage and imports cleanly', () => {
    const pkg = exportToClassPackage(sampleTrack);
    expect(pkg.format).toBe('forge-class/1.0');
    expect(pkg.track.id).toBe(sampleTrack.id);

    const jsonStr = JSON.stringify(pkg);
    const imported = importFromClassPackage(jsonStr);
    expect(imported).not.toBeNull();
    expect(imported?.id).toBe(sampleTrack.id);
    expect(imported?.teacherName).toBe('Prof. Ana Silva');
  });

  it('returns null on corrupted or invalid packaging payload', () => {
    expect(decodeTrackFromUrlHash('invalid-base64-payload!!!')).toBeNull();
    expect(importFromClassPackage('{"not": "a-valid-track"}')).toBeNull();
    expect(importFromClassPackage('')).toBeNull();
  });
});

describe('useEducatorStore', () => {
  beforeEach(() => {
    useEducatorStore.getState().resetToDefaults();
  });

  it('initializes with preset curricular tracks', () => {
    const tracks = useEducatorStore.getState().tracks;
    expect(tracks.length).toBeGreaterThanOrEqual(2);
    expect(tracks[0].discipline).toBe('structures');
    expect(tracks[1].discipline).toBe('circuits');
  });

  it('adds, updates, and deletes an educator track', () => {
    const store = useEducatorStore.getState();
    const newTrack: EducatorTrack = {
      id: 'custom-track-99',
      title: 'Mecatrônica Avançada',
      teacherName: 'Prof. Roberto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      discipline: 'mechatronics',
      gradeLevel: 'undergraduate',
      curriculumTags: ['ABET-OUTCOME-1'],
      isPublished: false,
      levels: [],
    };

    store.addTrack(newTrack);
    expect(useEducatorStore.getState().tracks.find((t) => t.id === 'custom-track-99')).toBeDefined();

    store.updateTrack('custom-track-99', { title: 'Mecatrônica e Portas Lógicas' });
    expect(
      useEducatorStore.getState().tracks.find((t) => t.id === 'custom-track-99')?.title
    ).toBe('Mecatrônica e Portas Lógicas');

    store.deleteTrack('custom-track-99');
    expect(useEducatorStore.getState().tracks.find((t) => t.id === 'custom-track-99')).toBeUndefined();
  });

  it('imports a track from deep link hash avoiding ID collision', () => {
    const store = useEducatorStore.getState();
    const baseTrack = store.tracks[0];
    const hash = encodeTrackToUrlHash(baseTrack);

    const result = store.importTrack(hash);
    expect(result.success).toBe(true);
    expect(result.track).toBeDefined();
    // Since ID was already present, it generates a collision-free copy
    expect(result.track?.id).toContain('-copy-');
  });
});
