import { describe, expect, it } from 'vitest';
import { analyzeTruss, type TrussModel } from './truss';

/**
 * Reference case: a symmetric A-frame. Pin at A(0,0), roller at B(4,0),
 * apex C(2,-3) (above the deck — screen/model convention has +y downward),
 * a single downward point load P at the apex.
 *
 * Hand solution (statics, independent of material — the truss is determinate):
 *   N_AC = N_BC = -P * sqrt(13) / 6  (compression)
 *   N_AB = P / 3                     (tension)
 * Derivation: symmetry gives equal apex-member forces; vertical equilibrium
 * at C gives their magnitude; horizontal equilibrium at A (with the global
 * reaction Rx = 0, since there is no external horizontal load and the roller
 * carries no horizontal reaction) gives the base-chord tension.
 */
function apexTruss(load: number): TrussModel {
  return {
    nodes: [
      { id: 'A', x: 0, y: 0, support: 'pin' },
      { id: 'B', x: 4, y: 0, support: 'roller' },
      { id: 'C', x: 2, y: -3, support: 'none' },
    ],
    members: [
      { id: 'AB', nodeA: 'A', nodeB: 'B', materialId: 'steel' },
      { id: 'AC', nodeA: 'A', nodeB: 'C', materialId: 'steel' },
      { id: 'BC', nodeA: 'B', nodeB: 'C', materialId: 'steel' },
    ],
    loads: [{ nodeId: 'C', force: load }],
  };
}

describe('analyzeTruss', () => {
  it('matches the hand-calculated solution for a determinate A-frame', () => {
    const P = 1000;
    const result = analyzeTruss(apexTruss(P));
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;

    const byId = Object.fromEntries(result.members.map((m) => [m.memberId, m]));
    const expectedApexForce = -(P * Math.sqrt(13)) / 6;
    const expectedBaseForce = P / 3;

    expect(byId.AC.axialForce).toBeCloseTo(expectedApexForce, 3);
    expect(byId.BC.axialForce).toBeCloseTo(expectedApexForce, 3);
    expect(byId.AB.axialForce).toBeCloseTo(expectedBaseForce, 3);
  });

  it('flags a member that exceeds its material capacity', () => {
    // Steel capacity here is 250MPa * 0.005m² = 1,250,000N. The apex members
    // see load * sqrt(13)/6, so a 3000kN load (~1.8MN per apex member) pushes
    // them well past that.
    const result = analyzeTruss(apexTruss(3_000_000));
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;

    const byId = Object.fromEntries(result.members.map((m) => [m.memberId, m]));
    expect(byId.AC.failed).toBe(true);
    expect(byId.BC.failed).toBe(true);
    expect(result.anyFailed).toBe(true);
  });

  it('reports a mechanism (missing base chord) as unstable', () => {
    const truss = apexTruss(1000);
    truss.members = truss.members.filter((m) => m.id !== 'AB');
    const result = analyzeTruss(truss);
    expect(result.status).toBe('unstable');
  });

  it('keeps a well-designed member safely under capacity', () => {
    const result = analyzeTruss(apexTruss(100));
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    for (const member of result.members) {
      expect(member.failed).toBe(false);
      expect(member.utilization).toBeLessThan(1);
    }
  });

  it('lets a cable stand in for a member that stays in tension', () => {
    // AB carries P/3 in tension in this A-frame — well within a cable's reach.
    const truss = apexTruss(100);
    truss.members = truss.members.map((m) =>
      m.id === 'AB' ? { ...m, materialId: 'cable' } : m,
    );
    const result = analyzeTruss(truss);
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    const ab = result.members.find((m) => m.memberId === 'AB')!;
    expect(ab.axialForce).toBeGreaterThan(0);
    expect(ab.failed).toBe(false);
  });

  it('fails a cable outright if it ends up in compression, regardless of magnitude', () => {
    // AC carries compression in this A-frame. Even at a tiny load — where a
    // rigid member would be nowhere near its capacity — a cable can't take it.
    const truss = apexTruss(1);
    truss.members = truss.members.map((m) =>
      m.id === 'AC' ? { ...m, materialId: 'cable' } : m,
    );
    const result = analyzeTruss(truss);
    expect(result.status).toBe('analyzed');
    if (result.status !== 'analyzed') return;
    const ac = result.members.find((m) => m.memberId === 'AC')!;
    expect(ac.axialForce).toBeLessThan(0);
    expect(ac.utilization).toBeLessThan(0.01);
    expect(ac.failed).toBe(true);
    expect(result.anyFailed).toBe(true);
  });
});
