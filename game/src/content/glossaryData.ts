export type ChallengeCategory = 'structures' | 'circuits' | 'vehicles';

export interface GlossaryEntry {
  id: string;
  term: string;
  category: ChallengeCategory;
  standardReference?: string; // ASME, IEEE, ISO, AISC
  shortDefinition: string;
  detailedExplanation: string;
  formula?: string;
  engineeringTip: string;
  tags: string[];
}

export const ENGINEERING_GLOSSARY: GlossaryEntry[] = [
  // --- STRUCTURES & TRUSS MECHANICS ---
  {
    id: 'truss',
    term: 'Truss',
    category: 'structures',
    standardReference: 'AISC 360-16 / Eurocode 3',
    shortDefinition: 'A rigid structural framework composed of straight members connected at pin joints.',
    detailedExplanation:
      'In pure truss analysis, all joints are idealized as frictionless frictionless pins that transmit axial tension or compression without internal bending moments. Triangulation (satisfying 2j - 3 = m in 2D) prevents kinematic mechanism collapse.',
    formula: '2j - R = m',
    engineeringTip:
      'Ensure every node is pinned by at least two non-collinear members to form closed triangles.',
    tags: ['equilibrium', 'statics', 'joints', 'bridge'],
  },
  {
    id: 'euler-buckling',
    term: 'Euler Column Buckling',
    category: 'structures',
    standardReference: 'ASME Section III / AISC 360-16 E3',
    shortDefinition: 'Sudden lateral deflection and structural instability of a slender member under compressive load.',
    detailedExplanation:
      'When axial compression exceeds the Euler critical threshold, the member bows laterally even if the material yield stress has not been reached. The critical capacity depends inversely on the square of the unbraced length.',
    formula: 'P_cr = (π² · E · I) / (K · L)²',
    engineeringTip:
      'Halving the unbraced length by placing an intermediate joint quadruples the buckling capacity.',
    tags: ['stability', 'compression', 'slenderness', 'failure'],
  },
  {
    id: 'modulus-of-elasticity',
    term: "Young's Modulus (E)",
    category: 'structures',
    standardReference: 'ASTM E111 / ISO 527',
    shortDefinition: 'A fundamental mechanical property measuring the stiffness or resistance of a material to elastic deformation.',
    detailedExplanation:
      'Representing the slope of the linear stress-strain curve in the elastic regime (Hooke’s Law). Structural steel possesses E ≈ 200 GPa, whereas structural timber is approximately 11 GPa.',
    formula: 'E = σ / ε',
    engineeringTip:
      'High-modulus materials minimize deflection and provide high resistance to elastic column buckling.',
    tags: ['materials', 'stiffness', 'hooke'],
  },
  {
    id: 'tension-vs-compression',
    term: 'Tension vs. Compression',
    category: 'structures',
    standardReference: 'ASME Section VIII Div 2',
    shortDefinition: 'Axial state of a member: pulling apart (tension) vs. pushing together (compression).',
    detailedExplanation:
      'Tension members stretch and are governed by net cross-sectional yield or ultimate tensile strength. Compression members shorten and are vulnerable to geometric buckling instability. Flexible cables carry tension only; compressive struts carry compression only.',
    formula: 'σ_axial = P / A',
    engineeringTip:
      'Never place flexible cables on load paths subject to compressive reaction forces, or they will slacken.',
    tags: ['mechanics', 'forces', 'stress'],
  },

  // --- CIRCUITS & ELECTRICAL ENGINEERING ---
  {
    id: 'capacitor',
    term: 'Capacitor',
    category: 'circuits',
    standardReference: 'IEEE Std 315 / IEC 60062',
    shortDefinition: 'A passive two-terminal electrical component that stores electrostatic energy in an electric field.',
    detailedExplanation:
      'A capacitor opposes changes in voltage. In transient DC analysis, uncharged capacitors behave as instantaneous short circuits (high inrush current) and steady-state open circuits (zero DC current).',
    formula: 'i(t) = C · (dv / dt),  W = ½ · C · V²',
    engineeringTip:
      'Pair capacitors with series resistors to establish precise RC time constants (τ = R · C).',
    tags: ['electrostatics', 'passive', 'transient', 'energy'],
  },
  {
    id: 'kirchhoffs-laws',
    term: "Kirchhoff's Laws (KCL & KVL)",
    category: 'circuits',
    standardReference: 'IEEE Standard Circuit Analysis',
    shortDefinition: 'Conservation laws governing charge (nodal current) and energy (loop voltage) in electrical networks.',
    detailedExplanation:
      'Kirchhoff’s Current Law (KCL) dictates that the algebraic sum of currents entering any node equals zero. Kirchhoff’s Voltage Law (KVL) dictates that the sum of directed voltages around any closed loop is zero.',
    formula: 'Σ I_in = Σ I_out,  Σ V_loop = 0',
    engineeringTip:
      'Nodal analysis assembles a conductance matrix (Laplacian) directly from KCL at each free circuit node.',
    tags: ['nodal-analysis', 'conservation', 'kcl', 'kvl'],
  },
  {
    id: 'thermal-burnout',
    term: 'Thermal Dissipation & Burnout',
    category: 'circuits',
    standardReference: 'IEC 60115 / MIL-STD-202',
    shortDefinition: 'Component destruction caused by electrical power dissipation exceeding rated thermal dissipation limits.',
    detailedExplanation:
      'Current flowing through a resistive element converts electrical energy directly into thermal heat via Joule heating. When internal temperature exceeds thermal endurance, permanent burnout occurs.',
    formula: 'P = I² · R = V · I = V² / R',
    engineeringTip:
      'Add series ballast resistance to throttle operating current below maximum component dissipation ratings.',
    tags: ['joule-heating', 'power', 'rating', 'protection'],
  },
  {
    id: 'ohms-law',
    term: "Ohm's Law",
    category: 'circuits',
    standardReference: 'IEEE Foundations',
    shortDefinition: 'Linear relationship between voltage, current, and electrical resistance in ohmic materials.',
    detailedExplanation:
      'Current through a conductor between two points is directly proportional to voltage across the two points and inversely proportional to electrical resistance.',
    formula: 'V = I · R',
    engineeringTip:
      'Verify both voltage drop across a load and current draw before connecting unregulated power supplies.',
    tags: ['current', 'voltage', 'resistance'],
  },

  // --- VEHICLES & MECHANICAL POWERTRAIN ---
  {
    id: 'torque',
    term: 'Torque (τ)',
    category: 'vehicles',
    standardReference: 'ISO 80000-4 / SAE J1349',
    shortDefinition: 'Rotational moment or twisting force exerted by an engine shaft about an axis of rotation.',
    detailedExplanation:
      'In vehicle dynamics, engine shaft torque is multiplied through transmission and final drive ratios to generate longitudinal tractive wheel force at the tire contact patch radius.',
    formula: 'F_tractive = (τ_engine · r_gear) / r_wheel',
    engineeringTip:
      'High engine torque is mandatory for climbing steep grades and overcoming gravitational slope resistance.',
    tags: ['powertrain', 'rotational', 'moment', 'grade'],
  },
  {
    id: 'pacejka-magic-formula',
    term: 'Pacejka Magic Formula (Tire Slip)',
    category: 'vehicles',
    standardReference: 'SAE 930830 / Pacejka Tire Dynamics',
    shortDefinition: 'Semi-empirical tire model characterizing longitudinal tractive force as a non-linear function of slip ratio.',
    detailedExplanation:
      'Tires do not grip purely like rigid gears; traction requires a longitudinal slip velocity. Force peaks at optimal slip (typically 8% to 15%) and degrades into skidding wheel spin when over-torqued.',
    formula: 'F_x(κ) = D · sin(C · arctan(B·κ - E·(B·κ - arctan(B·κ))))',
    engineeringTip:
      'Increasing chassis weight increases normal force F_N, raising the available peak tractive grip limit.',
    tags: ['friction', 'tires', 'slip', 'dynamics'],
  },
  {
    id: 'power-to-weight-ratio',
    term: 'Power-to-Weight Ratio',
    category: 'vehicles',
    standardReference: 'SAE J2807',
    shortDefinition: 'Measurement of actual vehicle engine power divided by total operating mass.',
    detailedExplanation:
      'Governs acceleration rate and terminal velocity under Newton’s Second Law (F = m·a). A light vehicle with modest power frequently outperforms a heavy vehicle with high power during acceleration phases.',
    formula: 'a = F_net / m_total',
    engineeringTip:
      'When budget is constrained, shedding chassis mass provides equivalent acceleration gains to purchasing expensive engine upgrades.',
    tags: ['acceleration', 'mass', 'efficiency'],
  },
  {
    id: 'grade-resistance',
    term: 'Grade Resistance',
    category: 'vehicles',
    standardReference: 'AASHTO Geometric Design / ISO 8855',
    shortDefinition: 'Component of gravitational force acting parallel to an inclined driving surface opposing motion.',
    detailedExplanation:
      'On an incline of angle θ, gravity resolves into normal force (m·g·cosθ) pressing into the pavement and retarding slope force (m·g·sinθ) pulling backwards down the incline.',
    formula: 'F_grade = m · g · sin(θ)',
    engineeringTip:
      'Ensure wheel tractive force exceeds m·g·sin(θ) at standstill to prevent immediate vehicle stall on steep slopes.',
    tags: ['gravity', 'incline', 'climb', 'resistance'],
  },
];
