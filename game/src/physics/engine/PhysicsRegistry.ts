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
  category: 'metal' | 'polymer' | 'timber' | 'composite' | 'ceramic_concrete';
  youngsModulusGPa: number; // Modulus of Elasticity (E)
  yieldStrengthMPa: number; // Yield point or compressive strength
  ultimateStrengthMPa: number; // Ultimate tensile/compressive strength
  allowableStressMPa: number; // ASME design basis allowable stress
  poissonsRatio: number; // Poisson's ratio (nu)
  densityKgM3: number; // Mass density (rho)
  thermalExpansionPpmK: number; // Coefficient of Linear Thermal Expansion (alpha in 10^-6 / K)
  specificHeatJkgK?: number; // Specific heat capacity (c_p in J / kg·K)
  electricalResistivityOhmM?: number; // Volume electrical resistivity (rho_e in Ohm·m)
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
    specificHeatJkgK: 490,
    electricalResistivityOhmM: 1.7e-7,
    asmeSafetyFactor: 1.56,
    standardCitation: 'ASTM A36/A36M-19; ASME BPVC Section II-D Table 1A',
    basis: 'REFERENCIA',
  },
  stainless_steel_304: {
    id: 'stainless_steel_304',
    name: 'Austenitic Stainless Steel (AISI 304 / ASTM A240)',
    category: 'metal',
    youngsModulusGPa: 193,
    yieldStrengthMPa: 205,
    ultimateStrengthMPa: 515,
    allowableStressMPa: 138,
    poissonsRatio: 0.29,
    densityKgM3: 8000,
    thermalExpansionPpmK: 17.2,
    specificHeatJkgK: 500,
    electricalResistivityOhmM: 7.2e-7,
    asmeSafetyFactor: 1.48,
    standardCitation: 'ASTM A240 / ASME BPVC Section II-D Table 1A',
    basis: 'REFERENCIA',
  },
  aluminum_6061_t6: {
    id: 'aluminum_6061_t6',
    name: 'Structural Aluminum Alloy (6061-T6 / ASTM B221)',
    category: 'metal',
    youngsModulusGPa: 68.9,
    yieldStrengthMPa: 276,
    ultimateStrengthMPa: 310,
    allowableStressMPa: 110,
    poissonsRatio: 0.33,
    densityKgM3: 2700,
    thermalExpansionPpmK: 23.6,
    specificHeatJkgK: 896,
    electricalResistivityOhmM: 3.99e-8,
    asmeSafetyFactor: 2.5,
    standardCitation: 'ASTM B221-21 / Aluminum Design Manual (ADM-2020)',
    basis: 'REFERENCIA',
  },
  structural_concrete_c30: {
    id: 'structural_concrete_c30',
    name: 'Reinforced Structural Concrete (Class C30/37 / ACI 318)',
    category: 'ceramic_concrete',
    youngsModulusGPa: 32.8,
    yieldStrengthMPa: 30, // Specified 28-day cylinder compressive strength (f'c)
    ultimateStrengthMPa: 38,
    allowableStressMPa: 13.5, // 0.45 * f'c ACI allowable working stress
    poissonsRatio: 0.20,
    densityKgM3: 2400,
    thermalExpansionPpmK: 10.0,
    specificHeatJkgK: 880,
    electricalResistivityOhmM: 1.0e5,
    asmeSafetyFactor: 2.22,
    standardCitation: 'ACI 318-19 Building Code Requirements for Structural Concrete / EN 1992-1-1',
    basis: 'REFERENCIA',
  },
  titanium_ti6al4v: {
    id: 'titanium_ti6al4v',
    name: 'Titanium Grade 5 (Ti-6Al-4V / ASTM B265)',
    category: 'metal',
    youngsModulusGPa: 113.8,
    yieldStrengthMPa: 880,
    ultimateStrengthMPa: 950,
    allowableStressMPa: 450,
    poissonsRatio: 0.34,
    densityKgM3: 4430,
    thermalExpansionPpmK: 8.6,
    specificHeatJkgK: 526,
    electricalResistivityOhmM: 1.78e-6,
    asmeSafetyFactor: 1.95,
    standardCitation: 'ASTM B265 / MIL-HDBK-5J Metallic Materials for Aerospace Vehicles',
    basis: 'REFERENCIA',
  },
  copper_c11000: {
    id: 'copper_c11000',
    name: 'Electrolytic Tough Pitch Copper (ETP C11000 / ASTM B152)',
    category: 'metal',
    youngsModulusGPa: 117,
    yieldStrengthMPa: 69,
    ultimateStrengthMPa: 220,
    allowableStressMPa: 46,
    poissonsRatio: 0.34,
    densityKgM3: 8940,
    thermalExpansionPpmK: 16.5,
    specificHeatJkgK: 385,
    electricalResistivityOhmM: 1.68e-8,
    asmeSafetyFactor: 1.50,
    standardCitation: 'ASTM B152 / CDA Standards Handbook for Copper Alloy C11000',
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
    specificHeatJkgK: 1600,
    electricalResistivityOhmM: 1.0e14,
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
    specificHeatJkgK: 480,
    electricalResistivityOhmM: 2.0e-7,
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
