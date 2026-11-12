export interface PhysicsEnvironmentPreset {
  id: 'earth' | 'moon' | 'space';
  label: string;
  name: string;
  gravity: number;
  icon: string;
  description: string;
}

export const PHYSICS_PRESETS: PhysicsEnvironmentPreset[] = [
  {
    id: 'earth',
    label: 'Earth',
    name: 'Terra',
    gravity: 9.81,
    icon: '🌍',
    description: 'Gravidade terrestre padrão (g = 9.81 m/s²)',
  },
  {
    id: 'moon',
    label: 'Moon',
    name: 'Lua',
    gravity: 1.62,
    icon: '🌕',
    description: 'Gravidade lunar (g = 1.62 m/s²)',
  },
  {
    id: 'space',
    label: 'Deep Space',
    name: 'Espaço Profundo',
    gravity: 0.0,
    icon: '🌌',
    description: 'Microgravidade / Gravidade zero (g = 0.00 m/s²)',
  },
];
