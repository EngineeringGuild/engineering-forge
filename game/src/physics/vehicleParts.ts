/**
 * Vehicle component properties. Like materials.ts/components.ts, values are
 * stylized but dimensionally real (N, kg) so Newton's second law and the
 * traction cap stay honest — see docs/02_ARCHITECTURE.md. Forces are kept
 * low relative to a real car's so 0-60-style numbers stay legible at the
 * distances/speeds these levels use; this is a simplification, not a claim
 * about real engine output.
 */

export interface Engine {
  id: string;
  name: string;
  color: string;
  /** Constant thrust the engine delivers, Newtons — a simplification of a
   * real power curve (force isn't actually constant across speed). */
  force: number;
  cost: number;
}

export interface Chassis {
  id: string;
  name: string;
  color: string;
  mass: number; // kg
  cost: number;
}

export const ENGINES: Record<string, Engine> = {
  'engine-small': {
    id: 'engine-small',
    name: 'Small Engine',
    color: '#9AA5B1',
    force: 1500,
    cost: 800,
  },
  'engine-large': {
    id: 'engine-large',
    name: 'Large Engine',
    color: '#FF6A2C',
    force: 3000,
    cost: 1800,
  },
};

export const CHASSIS: Record<string, Chassis> = {
  'chassis-light': {
    id: 'chassis-light',
    name: 'Light Chassis',
    color: '#4FB0C6',
    mass: 800,
    cost: 500,
  },
  'chassis-heavy': {
    id: 'chassis-heavy',
    name: 'Heavy Chassis',
    color: '#B8825A',
    mass: 1200,
    cost: 700,
  },
};
