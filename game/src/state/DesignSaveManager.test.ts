import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DESIGN_STORAGE_KEY,
  designSaveManager,
} from './DesignSaveManager';

describe('DesignSaveManager', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const fakeLocalStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    vi.stubGlobal('window', { localStorage: fakeLocalStorage });
    vi.stubGlobal('localStorage', fakeLocalStorage);
    designSaveManager.clearAll();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and retrieves designs for a specific level', () => {
    const saved = designSaveManager.saveDesign(
      'structures',
      'level-1',
      'Truss Alpha',
      { nodes: [{ id: 'n1', x: 0, y: 0 }], members: [] },
      { partCount: 1, cost: 250 },
    );

    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('Truss Alpha');
    expect(saved.discipline).toBe('structures');
    expect(saved.levelId).toBe('level-1');

    const designs = designSaveManager.getDesignsForLevel('structures', 'level-1');
    expect(designs.length).toBe(1);
    expect(designs[0].id).toBe(saved.id);
    expect(designs[0].data).toEqual({ nodes: [{ id: 'n1', x: 0, y: 0 }], members: [] });
  });

  it('handles multiple saved revisions for the same level sorted by updatedAt', async () => {
    designSaveManager.saveDesign(
      'structures',
      'level-2',
      'Concept 1',
      { members: [1] },
      { partCount: 1, cost: 100 },
    );

    // Short delay to ensure distinct timestamp
    await new Promise((r) => setTimeout(r, 15));

    designSaveManager.saveDesign(
      'structures',
      'level-2',
      'Concept 2',
      { members: [1, 2] },
      { partCount: 2, cost: 200 },
    );

    const list = designSaveManager.getDesignsForLevel('structures', 'level-2');
    expect(list.length).toBe(2);
    expect(list[0].name).toBe('Concept 2');
    expect(list[1].name).toBe('Concept 1');

    const latest = designSaveManager.getLatestDesign('structures', 'level-2');
    expect(latest?.name).toBe('Concept 2');
  });

  it('updates an existing design when existingId is supplied', () => {
    const original = designSaveManager.saveDesign(
      'circuits',
      'c-level-1',
      'Initial Schematic',
      { components: ['resistor'] },
      { partCount: 1, cost: 50 },
    );

    const updated = designSaveManager.saveDesign(
      'circuits',
      'c-level-1',
      'Enhanced Schematic',
      { components: ['resistor', 'capacitor'] },
      { partCount: 2, cost: 95 },
      original.id,
    );

    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe('Enhanced Schematic');
    expect(designSaveManager.getDesignsForLevel('circuits', 'c-level-1').length).toBe(1);
  });

  it('deletes and renames designs correctly', () => {
    const d1 = designSaveManager.saveDesign(
      'machines',
      'v-1',
      'RWD Dragster',
      { engine: 'v8' },
      { partCount: 1, cost: 5000 },
    );

    expect(designSaveManager.renameDesign(d1.id, 'Supercharged RWD')).toBe(true);
    expect(designSaveManager.getDesignById(d1.id)?.name).toBe('Supercharged RWD');

    const deleted = designSaveManager.deleteDesign(d1.id);
    expect(deleted).toBe(true);
    expect(designSaveManager.getDesignById(d1.id)).toBeNull();
    expect(designSaveManager.getDesignsForLevel('machines', 'v-1').length).toBe(0);
  });

  it('syncs correctly with localStorage JSON string serialization', () => {
    designSaveManager.saveDesign(
      'structures',
      'bridge-3',
      'Arch Variant',
      { nodes: [] },
      { partCount: 0, cost: 0 },
    );

    expect(mockStorage[DESIGN_STORAGE_KEY]).toBeDefined();
    const parsed = JSON.parse(mockStorage[DESIGN_STORAGE_KEY]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].name).toBe('Arch Variant');
  });
});
