/**
 * Material properties for buildable members. Values are stylized but
 * dimensionally real (Pa, m², N/m) so the solver's statics stay honest —
 * see docs/02_ARCHITECTURE.md for why the numbers were chosen this way.
 */

export interface Material {
  id: string;
  name: string;
  color: string;
  /** Young's modulus (Pa) — stiffness of the material. */
  youngsModulus: number;
  /** Cross-sectional area (m²) — fixed per material for the MVP (no size tiers yet). */
  area: number;
  /** Allowable axial stress in tension and compression (Pa). Buckling of slender
   * compression members is not modeled in the MVP — a known simplification. */
  allowableStress: number;
  /** Cost per meter of built length. */
  costPerMeter: number;
  /** Cables can only pull, never push. A tension-only member that ends up in
   * compression fails outright regardless of magnitude — real cables go
   * slack rather than resist compression. Modeled as a hard fail rather than
   * a nonlinear slack-cable re-solve, the same style of simplification as
   * the unmodeled buckling above. */
  tensionOnly?: boolean;
}

export const MATERIALS: Record<string, Material> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    color: '#B8825A',
    youngsModulus: 11e9,
    area: 0.01,
    allowableStress: 40e6,
    costPerMeter: 5,
  },
  steel: {
    id: 'steel',
    name: 'Steel',
    color: '#9AA5B1',
    youngsModulus: 200e9,
    area: 0.005,
    allowableStress: 250e6,
    costPerMeter: 20,
  },
  cable: {
    id: 'cable',
    name: 'Cable',
    color: '#4FB0C6',
    youngsModulus: 150e9,
    area: 0.002,
    allowableStress: 600e6,
    costPerMeter: 8,
    tensionOnly: true,
  },
};

export function materialCapacity(material: Material): number {
  return material.allowableStress * material.area;
}

export function axialStiffness(material: Material, length: number): number {
  return (material.youngsModulus * material.area) / length;
}
