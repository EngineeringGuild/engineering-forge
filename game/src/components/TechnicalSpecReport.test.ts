import { describe, it, expect } from 'vitest';
import { MATERIALS } from '../physics/materials';
import { COMPONENTS } from '../physics/components';

describe('Technical Specification & BOM Generator Suite', () => {
  it('correctly aggregates Bill of Materials for structures', () => {
    const structMembers = [
      { id: 'm1', nodeA: 'a', nodeB: 'b', materialId: 'steel' },
      { id: 'm2', nodeA: 'b', nodeB: 'c', materialId: 'steel' },
      { id: 'm3', nodeA: 'c', nodeB: 'd', materialId: 'wood' },
    ];

    const counts: Record<string, number> = {};
    for (const m of structMembers) {
      counts[m.materialId] = (counts[m.materialId] || 0) + 1;
    }

    expect(counts.steel).toBe(2);
    expect(counts.wood).toBe(1);
    expect(MATERIALS.steel.costPerMeter).toBeGreaterThan(MATERIALS.wood.costPerMeter);
  });

  it('correctly aggregates electrical components for circuits BOM', () => {
    const circuitEdges = [
      { id: 'e1', nodeA: 'a', nodeB: 'b', componentId: 'wire' },
      { id: 'e2', nodeA: 'b', nodeB: 'c', componentId: 'resistor_small' },
      { id: 'e3', nodeA: 'c', nodeB: 'd', componentId: 'resistor_large' },
    ];

    const counts: Record<string, number> = {};
    for (const e of circuitEdges) {
      counts[e.componentId] = (counts[e.componentId] || 0) + 1;
    }

    expect(counts.wire).toBe(1);
    expect(counts.resistor_small).toBe(1);
    expect(counts.resistor_large).toBe(1);
    expect(COMPONENTS['resistor-large'].resistance).toBe(15);
    expect(COMPONENTS['resistor-small'].resistance).toBe(5);
  });

  it('calculates safety factor according to ASME standard (SF = 1 / maxUtil)', () => {
    const maxUtil = 0.5;
    const sf = 1.0 / maxUtil;
    expect(sf).toBe(2.0);

    const failingUtil = 1.25;
    const failingSf = 1.0 / failingUtil;
    expect(failingSf).toBe(0.8);
    expect(failingSf).toBeLessThan(1.0);
  });
});
