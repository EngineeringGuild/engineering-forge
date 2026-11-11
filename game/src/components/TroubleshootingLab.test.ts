import { describe, it, expect } from 'vitest';
import { analyzeTruss } from '../physics/truss';
import { toTrussModel } from '../game/build';
import type { LevelDef } from '../content/types';

describe('Troubleshooting Diagnostics & Reverse Engineering Suite', () => {
  const diagnosticLevel: LevelDef = {
    id: 'troubleshoot-truss-test',
    order: 1,
    name: 'Diagnostic Truss',
    tagline: 'Test diagnose',
    hint: 'Test hint',
    fixedNodes: [
      { id: 'left', x: 0, y: 0, support: 'pin', isDeck: true },
      { id: 'mid', x: 5, y: 0, support: 'none', isDeck: true },
      { id: 'right', x: 10, y: 0, support: 'roller', isDeck: true },
    ],
    deckMembers: [
      { id: 'deck-1', nodeA: 'left', nodeB: 'mid' },
      { id: 'deck-2', nodeA: 'mid', nodeB: 'right' },
    ],
    loads: [{ nodeId: 'apex', force: 40_000 }],
    budget: 500,
    unlockedMaterials: ['wood', 'steel', 'cable', 'strut'],
    buildArea: { minX: 0, maxX: 10, minY: -4, maxY: 4 },
    gridSize: 1,
  };

  it('fails when cable is mistakenly installed under compression', () => {
    // Apex node with diagonal cable to left and right banks
    const nodes = [{ id: 'apex', x: 5, y: -3 }];
    const members = [
      { id: 'm1', nodeA: 'left', nodeB: 'apex', materialId: 'cable' },
      { id: 'm2', nodeA: 'apex', nodeB: 'right', materialId: 'cable' },
      { id: 'm3', nodeA: 'apex', nodeB: 'mid', materialId: 'steel' },
    ];

    const model = toTrussModel(diagnosticLevel, nodes, members);
    const analysis = analyzeTruss(model);

    // Cable in compression goes slack / fails immediately
    expect(analysis.status === 'analyzed' || analysis.status === 'unstable').toBe(true);
    if (analysis.status === 'analyzed') {
      const cableMembers = analysis.members.filter((m) => m.memberId === 'm1' || m.memberId === 'm2');
      expect(cableMembers.some((m) => m.failed || m.wentSlack)).toBe(true);
      expect(analysis.anyFailed).toBe(true);
    }
  });

  it('passes when compressive members are replaced with rigid steel', () => {
    const nodes = [{ id: 'apex', x: 5, y: -3 }];
    const members = [
      { id: 'm1', nodeA: 'left', nodeB: 'apex', materialId: 'steel' },
      { id: 'm2', nodeA: 'apex', nodeB: 'right', materialId: 'steel' },
      { id: 'm3', nodeA: 'apex', nodeB: 'mid', materialId: 'steel' },
    ];

    const model = toTrussModel(diagnosticLevel, nodes, members);
    const analysis = analyzeTruss(model);

    expect(analysis.status).toBe('analyzed');
    if (analysis.status === 'analyzed') {
      expect(analysis.anyFailed).toBe(false);
    }
  });
});
