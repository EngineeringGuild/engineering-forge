export interface OnboardingStep {
  title: string;
  description: string;
  highlightText: string;
  icon: string;
  tip?: string;
}

export const ONBOARDING_CONFIG: Record<'structures' | 'circuits' | 'vehicles', OnboardingStep[]> = {
  structures: [
    {
      title: 'Welcome to Structural Engineering',
      icon: '🌉',
      highlightText: 'The Chasm & Roadway',
      description:
        'Your goal is to build a bridge across the chasm so the heavy vehicle can cross without collapsing the structure.',
      tip: 'The roadway deck is already laid out, but it has no strength on its own.',
    },
    {
      title: 'Add Joints & Connect Members',
      icon: '📐',
      highlightText: 'Click to Place & Connect',
      description:
        'Click on the empty grid to place new structural joints. Click one joint, then click another to span a member between them.',
      tip: 'Right-click any joint or member to remove it. Red joints indicate selected points.',
    },
    {
      title: 'Triangulation & Physics Testing',
      icon: '⚡',
      highlightText: 'Triangles are Rigid',
      description:
        'Square shapes sway and collapse as mechanisms. Always triangulate between bottom anchors and the roadway.',
      tip: 'Click "Test Bridge" when ready to simulate real truck loads and member stress!',
    },
  ],
  circuits: [
    {
      title: 'Welcome to Electrical Systems',
      icon: '⚡',
      highlightText: 'The Battery & Load',
      description:
        'Your goal is to complete an electric circuit that powers the incandescent lamp without burning it out.',
      tip: 'Current flows from the positive (+) terminal through components back to negative (−).',
    },
    {
      title: 'Route Wires & Resistors',
      icon: '🔌',
      highlightText: 'Click Nodes to Connect',
      description:
        'Click on the grid to create wire junctions, and click pairs of junctions to draw conductors or resistors between them.',
      tip: 'Use the toolbar to select cheap copper wire or resistors to drop voltage.',
    },
    {
      title: 'Ohm’s Law & Safe Power',
      icon: '💡',
      highlightText: 'Watch Component Limits',
      description:
        'Too little voltage leaves the bulb too dim; too much current generates excess Joule heat (P = I²R) and burns it out.',
      tip: 'Click "Test Circuit" to calculate Kirchhoff nodal currents and illuminate the lamp!',
    },
  ],
  vehicles: [
    {
      title: 'Welcome to Powertrain Dynamics',
      icon: '🚗',
      highlightText: 'The Runway & Speed Target',
      description:
        'Configure the optimal powertrain (engine + chassis) to hit the target velocity over a straight-line acceleration run.',
      tip: 'Watch out: exceeding the target speed on ceiling levels will also fail the run.',
    },
    {
      title: 'Power-to-Weight vs. Tire Grip',
      icon: '⚙️',
      highlightText: 'Engine Force vs. Normal Mass',
      description:
        'A bigger engine provides more thrust, but tires can only transmit traction up to Coulomb friction (F ≤ μ·m·g).',
      tip: 'If an engine is too powerful for a featherweight chassis, the tires will spin out!',
    },
    {
      title: 'Runway Launch & Telemetry',
      icon: '🏁',
      highlightText: 'Launch Test Drive',
      description:
        'Pick your components within budget, then hit "Test Drive" to simulate Newton’s Second Law in real time.',
      tip: 'Observe real-time telemetry, tire slip ratios, and velocity curves on the track.',
    },
  ],
};

export const ONBOARDING_STORAGE_PREFIX = 'engineering-forge-onboarding-seen-';

export function isOnboardingEligibleLevel(levelId: string): boolean {
  return (
    levelId === 'tutorial' ||
    levelId === 'tutorial-circuit' ||
    levelId === 'first-spark' ||
    levelId === 'tutorial-vehicle' ||
    levelId === 'first-drive' ||
    levelId === 'level-1'
  );
}
