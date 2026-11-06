/**
 * Engineering Guild Real Physics Registry & Standards Baseline
 * 
 * Standards Compliance:
 * - ASME BPVC Section VIII Div 1 & 2 (UG-23 Allowable Stress, Design Margins)
 * - ASTM E8/E8M-21 (Tension Testing of Metallic Materials)
 * - ASTM E111-17 (Young's Modulus of Elasticity)
 * - ISO 80000-1:2022 & ISO 80000-4:2019 (Quantities and Units - Mechanics)
 * - IEEE Std 100 / IEC 60027-1 (Electrodynamics and Nodal Systems)
 */

export interface PhysicalConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  standardCitation: string;
}

export const PHYSICAL_CONSTANTS: Record<string, PhysicalConstant> = {
  STANDARD_GRAVITY: {
    symbol: 'g_0',
    name: 'Standard Acceleration of Gravity',
    value: 9.80665,
    unit: 'm/s²',
    standardCitation: 'ISO 80000-3:2019 Clause 3-9.2',
  },
  AIR_DENSITY_SEA_LEVEL: {
    symbol: 'ρ_air',
    name: 'Dry Air Density at 15°C and 101.325 kPa',
    value: 1.225,
    unit: 'kg/m³',
    standardCitation: 'ISO 2533:1975 Standard Atmosphere',
  },
  ELECTRON_CHARGE: {
    symbol: 'e',
    name: 'Elementary Electric Charge',
    value: 1.602176634e-19,
    unit: 'C',
    standardCitation: 'ISO 80000-1:2022 SI Reference',
  },
};

export interface MaterialSpecification {
  id: string;
  name: string;
  category: 'metal' | 'polymer' | 'timber' | 'composite';
  youngsModulusGPa: number;
  yieldStrengthMPa: number;
  ultimateStrengthMPa: number;
  allowableStressMPa: number;
  poissonsRatio: number;
  densityKgM3: number;
  thermalExpansionPpmK: number;
  asmeSafetyFactor: number;
  standardCitation: string;
  basis: 'LOCKED' | 'DERIVADO' | 'ESTIMATE' | 'REFERENCIA';
}

export const CERTIFIED_MATERIALS_REGISTER: Record<string, MaterialSpecification> = {
  structural_steel_a36: {
    id: 'structural_steel_a36',
    name: 'Carbon Structural Steel (ASTM A36)',
    category: 'metal',
    youngsModulusGPa: 200,
    yieldStrengthMPa: 250,
    ultimateStrengthMPa: 400,
    allowableStressMPa: 160,
    poissonsRatio: 0.26,
    densityKgM3: 7850,
    thermalExpansionPpmK: 12.0,
    asmeSafetyFactor: 1.56,
    standardCitation: 'ASTM A36/A36M-19; ASME BPVC Section II-D Table 1A',
    basis: 'REFERENCIA',
  },
  structural_timber_df: {
    id: 'structural_timber_df',
    name: 'Douglas Fir Heavy Timber (Select Structural)',
    category: 'timber',
    youngsModulusGPa: 13.1,
    yieldStrengthMPa: 55,
    ultimateStrengthMPa: 70,
    allowableStressMPa: 13.8,
    poissonsRatio: 0.35,
    densityKgM3: 530,
    thermalExpansionPpmK: 4.5,
    asmeSafetyFactor: 4.0,
    standardCitation: 'NDS for Wood Construction (AWC-2018) / ASTM D2555',
    basis: 'REFERENCIA',
  },
  high_tensile_cable: {
    id: 'high_tensile_cable',
    name: 'Galvanized Structural Wire Rope (ASTM A603)',
    category: 'composite',
    youngsModulusGPa: 160,
    yieldStrengthMPa: 1180,
    ultimateStrengthMPa: 1570,
    allowableStressMPa: 520,
    poissonsRatio: 0.3,
    densityKgM3: 7200,
    thermalExpansionPpmK: 11.5,
    asmeSafetyFactor: 2.27,
    standardCitation: 'ASTM A603-19 Standard Specification for Zinc-Coated Steel Structural Wire Rope',
    basis: 'REFERENCIA',
  },
};

export interface GuildDimensionEntry {
  group: string;
  element: string;
  parameter: string;
  value: number | string;
  unit: string;
  basis: 'LOCKED' | 'DERIVADO' | 'ESTIMATE' | 'REFERENCIA';
  source: string;
  status: 'EM_DIA' | 'SUSPEITO' | 'VENCIDO';
  note: string;
}

/**
 * Generates a formal Guild Dimension Register manifest string
 * matching the authoritative Dim() definition in the Guild repositories.
 */
export function exportToGuildRegister(
  projectName: string,
  variantId: string,
  entries: GuildDimensionEntry[],
): string {
  const timestamp = new Date().toISOString();
  let output = `# Engineering Guild Dimension Register Export\n`;
  output += `# Project: ${projectName}\n`;
  output += `# Variant: ${variantId}\n`;
  output += `# Generated: ${timestamp}\n`;
  output += `# Authority: Caio Castilho (CEO / President), Engineering Guild\n`;
  output += `# Standards: ASME Section III/VIII, ASTM E8, ISO 80000-1\n\n`;

  output += `from collections import namedtuple\n\n`;
  output += `Dim = namedtuple('Dim', ['group', 'element', 'parameter', 'value', 'unit', 'basis', 'source', 'status', 'note'])\n\n`;
  output += `DIMENSION_REGISTER = [\n`;

  for (const entry of entries) {
    const valRepr = typeof entry.value === 'string' ? `'${entry.value}'` : entry.value;
    output += `    Dim('${entry.group}', '${entry.element}', '${entry.parameter}', ${valRepr}, '${entry.unit}', '${entry.basis}', '${entry.source}', '${entry.status}', '${entry.note}'),\n`;
  }

  output += `]\n`;
  return output;
}
