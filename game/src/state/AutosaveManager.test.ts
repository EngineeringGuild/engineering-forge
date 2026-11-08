import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  autosaveManager,
  AUTOSAVE_STORAGE_PREFIX,
} from './AutosaveManager';

describe('AutosaveManager (localStorage Project Persistence)', () => {
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
      key: (index: number) => Object.keys(mockStorage)[index] ?? null,
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    // Attach fake window and localStorage for tests
    vi.stubGlobal('window', {
      localStorage: fakeLocalStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('localStorage', fakeLocalStorage);

    autosaveManager.clearAll();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists and retrieves construction project state with timestamps', () => {
    const structureData = {
      builtNodes: [
        { id: 'n0', x: 2, y: 1 },
        { id: 'n1', x: 4, y: 1 },
      ],
      builtMembers: [
        { id: 'm0', nodeA: 'n0', nodeB: 'n1', materialId: 'steel' },
      ],
      selectedMaterial: 'steel',
      nextId: 2,
    };

    const record = autosaveManager.save('structures', 'tutorial', structureData);
    expect(record).not.toBeNull();
    expect(record?.discipline).toBe('structures');
    expect(record?.levelId).toBe('tutorial');
    expect(record?.timestamp).toBeGreaterThan(0);
    expect(record?.data).toEqual(structureData);

    const loaded = autosaveManager.load<typeof structureData>('structures', 'tutorial');
    expect(loaded).not.toBeNull();
    expect(loaded?.data.builtNodes).toHaveLength(2);
    expect(loaded?.data.builtMembers).toHaveLength(1);
    expect(loaded?.data.builtMembers[0].materialId).toBe('steel');
    expect(loaded?.data.builtNodes[0].x).toBe(2);

    // Verify written to mockStorage
    const key = autosaveManager.getStorageKey('structures', 'tutorial');
    expect(mockStorage[key]).toBeDefined();
  });

  it('correctly tracks and checks existence of autosaves', () => {
    expect(autosaveManager.hasAutosave('circuits', 'level-1')).toBe(false);

    autosaveManager.save('circuits', 'level-1', {
      builtNodes: [{ id: 'cn0', x: 1, y: 1 }],
      builtEdges: [{ id: 'ce0', nodeA: 'src', nodeB: 'cn0', componentId: 'wire' }],
    });

    expect(autosaveManager.hasAutosave('circuits', 'level-1')).toBe(true);
    expect(autosaveManager.getLastSavedTime('circuits', 'level-1')).toBeTypeOf('number');
  });

  it('clears specific autosave without affecting other levels or disciplines', () => {
    autosaveManager.save('structures', 'level-1', { test: 1 });
    autosaveManager.save('structures', 'level-2', { test: 2 });
    autosaveManager.save('vehicles', 'level-1', { engine: 'v8' });

    autosaveManager.clear('structures', 'level-1');

    expect(autosaveManager.hasAutosave('structures', 'level-1')).toBe(false);
    expect(autosaveManager.hasAutosave('structures', 'level-2')).toBe(true);
    expect(autosaveManager.hasAutosave('vehicles', 'level-1')).toBe(true);
  });

  it('clears all autosave records without touching unrelated keys', () => {
    mockStorage['engineering-forge-progress'] = JSON.stringify({ tutorial: { stars: 3 } });

    autosaveManager.save('structures', 'chasm-1', { members: [] });
    autosaveManager.save('circuits', 'spark-1', { edges: [] });

    expect(autosaveManager.hasAutosave('structures', 'chasm-1')).toBe(true);
    expect(autosaveManager.hasAutosave('circuits', 'spark-1')).toBe(true);

    autosaveManager.clearAll();

    expect(autosaveManager.hasAutosave('structures', 'chasm-1')).toBe(false);
    expect(autosaveManager.hasAutosave('circuits', 'spark-1')).toBe(false);

    // Verify unrelated key survived in localStorage
    expect(mockStorage['engineering-forge-progress']).toBeDefined();
  });

  it('defensively handles corrupt or invalid JSON in storage', () => {
    const key = `${AUTOSAVE_STORAGE_PREFIX}structures-corrupt`;
    mockStorage[key] = 'INVALID_JSON{{{';

    // Clear in-memory cache to force read from corrupted storage
    (autosaveManager as unknown as { memoryCache: Map<string, unknown> }).memoryCache.delete(key);

    expect(autosaveManager.load('structures', 'corrupt')).toBeNull();
    expect(autosaveManager.hasAutosave('structures', 'corrupt')).toBe(false);
  });

  it('notifies subscribers when a project is autosaved', () => {
    const listener = vi.fn();
    const unsubscribe = autosaveManager.subscribe(listener);

    autosaveManager.save('vehicles', 'first-drive', {
      selectedEngine: 'engine-turbo',
      selectedChassis: 'chassis-sport',
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        discipline: 'vehicles',
        levelId: 'first-drive',
      })
    );

    unsubscribe();
    autosaveManager.save('vehicles', 'first-drive', { updated: true });
    expect(listener).toHaveBeenCalledTimes(1); // not called again
  });
});
