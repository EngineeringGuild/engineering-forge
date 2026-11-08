import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  blueprintManager,
  type MachinesBlueprintData,
  type StructuresBlueprintData,
  type UniversalBlueprint,
} from './BlueprintManager';

describe('BlueprintManager', () => {
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

    vi.stubGlobal('window', {
      localStorage: fakeLocalStorage,
    });
    vi.stubGlobal('localStorage', fakeLocalStorage);
    blueprintManager.clearLibrary();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockStructureBlueprint: UniversalBlueprint<'structures'> = {
    schemaVersion: 1,
    id: 'bp_struct_001',
    domain: 'structures',
    name: 'Howe Truss Bridge',
    levelId: 'level-1',
    author: 'Apprentice Engineer',
    createdAt: new Date().toISOString(),
    estimatedCost: 140,
    data: {
      nodes: [
        { id: 'n0', x: 2, y: 1 },
        { id: 'n1', x: 4, y: 1 },
      ],
      members: [
        { id: 'm0', nodeA: 'n0', nodeB: 'n1', materialId: 'steel' },
      ],
      nextId: 2,
    },
  };

  it('encodes and decodes a structure blueprint to a compact token', () => {
    const token = blueprintManager.encodeToToken(mockStructureBlueprint);
    expect(token.startsWith('EF-BP1:')).toBe(true);

    const decoded = blueprintManager.decodeFromToken(token);
    expect(decoded.schemaVersion).toBe(1);
    expect(decoded.domain).toBe('structures');
    expect(decoded.name).toBe('Howe Truss Bridge');
    expect(decoded.estimatedCost).toBe(140);
    const data = decoded.data as StructuresBlueprintData;
    expect(data.nodes).toHaveLength(2);
    expect(data.members).toHaveLength(1);
    expect(data.members[0].materialId).toBe('steel');
  });

  it('decodes directly from raw JSON string as fallback', () => {
    const rawJson = JSON.stringify(mockStructureBlueprint);
    const decoded = blueprintManager.decodeFromToken(rawJson);
    expect(decoded.id).toBe('bp_struct_001');
    expect(decoded.name).toBe('Howe Truss Bridge');
  });

  it('rejects corrupt or invalid tokens gracefully', () => {
    expect(() => blueprintManager.decodeFromToken('EF-BP1:NOT_VALID_BASE64!@#$')).toThrow();
    expect(() => blueprintManager.decodeFromToken('{ "schemaVersion": 999 }')).toThrow();
    expect(() => blueprintManager.decodeFromToken('{ "schemaVersion": 1, "domain": "quantum" }')).toThrow();
  });

  it('persists blueprints in the library, lists them, and supports deletion', () => {
    const bp1 = { ...mockStructureBlueprint, id: 'bp_1', name: 'Bridge Alpha' };
    const bp2: UniversalBlueprint<'circuits'> = {
      schemaVersion: 1,
      id: 'bp_2',
      domain: 'circuits',
      name: 'Voltage Divider',
      createdAt: new Date().toISOString(),
      estimatedCost: 45,
      data: {
        nodes: [{ id: 'n0', x: 0, y: 0 }],
        edges: [{ id: 'e0', nodeA: 'n0', nodeB: 't1', componentId: 'resistor-1k' }],
      },
    };

    blueprintManager.saveToLibrary(bp1);
    blueprintManager.saveToLibrary(bp2);

    const all = blueprintManager.listLibrary();
    expect(all).toHaveLength(2);

    const circuitsOnly = blueprintManager.listLibrary('circuits');
    expect(circuitsOnly).toHaveLength(1);
    expect(circuitsOnly[0].id).toBe('bp_2');

    blueprintManager.deleteFromLibrary('bp_1');
    expect(blueprintManager.listLibrary()).toHaveLength(1);
    expect(blueprintManager.listLibrary()[0].id).toBe('bp_2');

    blueprintManager.clearLibrary();
    expect(blueprintManager.listLibrary()).toHaveLength(0);
  });

  it('handles machines domain blueprint serialization', () => {
    const bpMachine: UniversalBlueprint<'machines'> = {
      schemaVersion: 1,
      id: 'bp_mech_01',
      domain: 'machines',
      name: 'Speed Demon Spec',
      createdAt: new Date().toISOString(),
      estimatedCost: 180,
      data: {
        selectedEngine: 'engine-turbo',
        selectedChassis: 'chassis-light',
      },
    };

    const token = blueprintManager.encodeToToken(bpMachine);
    const decoded = blueprintManager.decodeFromToken(token);
    expect(decoded.domain).toBe('machines');
    const data = decoded.data as MachinesBlueprintData;
    expect(data.selectedEngine).toBe('engine-turbo');
    expect(data.selectedChassis).toBe('chassis-light');
  });
});
