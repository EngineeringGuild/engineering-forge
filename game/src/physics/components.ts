/**
 * Electrical component properties for circuit connections. Like
 * physics/materials.ts, values are stylized but dimensionally real (Ω, W) so
 * Ohm's law stays honest — see docs/02_ARCHITECTURE.md.
 */

export interface ElectricalComponent {
  id: string;
  name: string;
  color: string;
  /** Resistance in Ohms. Fixed per component regardless of drawn length —
   * a simplification (real wire resistance scales with length); cost still
   * scales with length so routing remains a spatial/budget choice. */
  resistance: number;
  /** Power the component can dissipate before it burns out (Watts). */
  maxPower: number;
  costPerMeter: number;
  /** Only set on load components (e.g. a bulb): power below this and the
   * load doesn't do its job, even though nothing burns out. */
  minPower?: number;
}

export const COMPONENTS: Record<string, ElectricalComponent> = {
  wire: {
    id: 'wire',
    name: 'Wire',
    color: '#9AA5B1',
    resistance: 0.5,
    maxPower: 50,
    costPerMeter: 2,
  },
  'resistor-small': {
    id: 'resistor-small',
    name: 'Resistor (5Ω)',
    color: '#D9A441',
    resistance: 5,
    maxPower: 10,
    costPerMeter: 6,
  },
  'resistor-large': {
    id: 'resistor-large',
    name: 'Resistor (15Ω)',
    color: '#C2703D',
    resistance: 15,
    maxPower: 20,
    costPerMeter: 10,
  },
  /** Given, free load every circuit level ships with — never in a level's
   * unlockedMaterials, so the player can't build extra ones. */
  bulb: {
    id: 'bulb',
    name: 'Bulb',
    color: '#FFD166',
    resistance: 3,
    maxPower: 4,
    minPower: 1,
    costPerMeter: 0,
  },
};

export function componentCapacity(component: ElectricalComponent): number {
  return component.maxPower;
}
