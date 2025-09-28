// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/data/components.ts

/**
 * Component Data for Engineering Forge V1.0
 * Contains all available components for the 2D construction interface
 */

import {
  Component,
  ComponentCategory,
  ComponentRarity,
  ComponentType
} from '../domains/gaming/domain/entities/Component';
import { ComponentProperties } from '../domains/gaming/domain/value-objects/ComponentProperties';
import { PositionVO } from '../domains/gaming/domain/value-objects/Position';

// Base component data
export const COMPONENT_DATA: Array<{
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  properties: any; // TODO: Use proper ComponentProperties type
  rarity: ComponentRarity;
  icon: string;
  description: string;
  level: number;
}> = [
  // Engines
  {
    name: 'Basic Engine',
    type: 'engine',
    category: 'mechanical',
    properties: {
      power: 100,
      weight: 150,
      efficiency: 70,
      durability: 80,
      cost: 1000,
      unlockLevel: 1
    },
    rarity: 'common',
    icon: '🔧',
    description: 'A basic internal combustion engine. Good for beginners.',
    level: 1
  },
  {
    name: 'Turbo Engine',
    type: 'engine',
    category: 'mechanical',
    properties: {
      power: 200,
      weight: 180,
      efficiency: 60,
      durability: 70,
      cost: 2500,
      unlockLevel: 3
    },
    rarity: 'rare',
    icon: '⚡',
    description: 'High-performance turbocharged engine with increased power.',
    level: 1
  },
  {
    name: 'Electric Motor',
    type: 'engine',
    category: 'electrical',
    properties: {
      power: 150,
      weight: 120,
      efficiency: 90,
      durability: 85,
      cost: 3000,
      unlockLevel: 5
    },
    rarity: 'epic',
    icon: '🔋',
    description: 'Clean and efficient electric motor with instant torque.',
    level: 1
  },
  {
    name: 'Hybrid Engine',
    type: 'engine',
    category: 'mechanical',
    properties: {
      power: 180,
      weight: 160,
      efficiency: 85,
      durability: 90,
      cost: 4000,
      unlockLevel: 7
    },
    rarity: 'legendary',
    icon: '🌱',
    description: 'Advanced hybrid system combining combustion and electric power.',
    level: 1
  },

  // Chassis
  {
    name: 'Steel Chassis',
    type: 'chassis',
    category: 'structural',
    properties: {
      power: 0,
      weight: 200,
      efficiency: 0,
      durability: 90,
      cost: 800,
      unlockLevel: 1
    },
    rarity: 'common',
    icon: '🏗️',
    description: 'Strong and reliable steel chassis frame.',
    level: 1
  },
  {
    name: 'Aluminum Chassis',
    type: 'chassis',
    category: 'structural',
    properties: {
      power: 0,
      weight: 150,
      efficiency: 0,
      durability: 80,
      cost: 1500,
      unlockLevel: 2
    },
    rarity: 'rare',
    icon: '🪶',
    description: 'Lightweight aluminum chassis for better performance.',
    level: 1
  },
  {
    name: 'Carbon Fiber Chassis',
    type: 'chassis',
    category: 'structural',
    properties: {
      power: 0,
      weight: 100,
      efficiency: 0,
      durability: 95,
      cost: 3500,
      unlockLevel: 6
    },
    rarity: 'epic',
    icon: '💎',
    description: 'Ultra-lightweight carbon fiber chassis with exceptional strength.',
    level: 1
  },

  // Wheels
  {
    name: 'Standard Wheels',
    type: 'wheels',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 40,
      efficiency: 0,
      durability: 75,
      cost: 200,
      unlockLevel: 1
    },
    rarity: 'common',
    icon: '⚫',
    description: 'Standard rubber wheels for everyday use.',
    level: 1
  },
  {
    name: 'Sport Wheels',
    type: 'wheels',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 35,
      efficiency: 0,
      durability: 85,
      cost: 500,
      unlockLevel: 3
    },
    rarity: 'rare',
    icon: '🏎️',
    description: 'High-performance sport wheels with better grip.',
    level: 1
  },
  {
    name: 'Racing Wheels',
    type: 'wheels',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 30,
      efficiency: 0,
      durability: 90,
      cost: 1000,
      unlockLevel: 5
    },
    rarity: 'epic',
    icon: '🏁',
    description: 'Professional racing wheels for maximum performance.',
    level: 1
  },

  // Suspension
  {
    name: 'Basic Suspension',
    type: 'suspension',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 60,
      efficiency: 0,
      durability: 70,
      cost: 400,
      unlockLevel: 1
    },
    rarity: 'common',
    icon: '🔩',
    description: 'Basic suspension system for smooth rides.',
    level: 1
  },
  {
    name: 'Sport Suspension',
    type: 'suspension',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 50,
      efficiency: 0,
      durability: 80,
      cost: 800,
      unlockLevel: 4
    },
    rarity: 'rare',
    icon: '🎯',
    description: 'Sport-tuned suspension for better handling.',
    level: 1
  },
  {
    name: 'Adaptive Suspension',
    type: 'suspension',
    category: 'electrical',
    properties: {
      power: 0,
      weight: 45,
      efficiency: 0,
      durability: 85,
      cost: 1500,
      unlockLevel: 6
    },
    rarity: 'epic',
    icon: '🧠',
    description: 'Smart adaptive suspension that adjusts automatically.',
    level: 1
  },

  // Brakes
  {
    name: 'Standard Brakes',
    type: 'brakes',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 25,
      efficiency: 0,
      durability: 80,
      cost: 300,
      unlockLevel: 1
    },
    rarity: 'common',
    icon: '🛑',
    description: 'Standard disc brakes for reliable stopping power.',
    level: 1
  },
  {
    name: 'Performance Brakes',
    type: 'brakes',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 20,
      efficiency: 0,
      durability: 90,
      cost: 600,
      unlockLevel: 3
    },
    rarity: 'rare',
    icon: '⚡',
    description: 'High-performance brakes for better stopping power.',
    level: 1
  },
  {
    name: 'Carbon Ceramic Brakes',
    type: 'brakes',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 15,
      efficiency: 0,
      durability: 95,
      cost: 1200,
      unlockLevel: 5
    },
    rarity: 'epic',
    icon: '💎',
    description: 'Lightweight carbon ceramic brakes for racing applications.',
    level: 1
  },

  // Transmission
  {
    name: 'Manual Transmission',
    type: 'transmission',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 80,
      efficiency: 85,
      durability: 85,
      cost: 600,
      unlockLevel: 2
    },
    rarity: 'common',
    icon: '⚙️',
    description: 'Traditional manual transmission for driver control.',
    level: 1
  },
  {
    name: 'Automatic Transmission',
    type: 'transmission',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 90,
      efficiency: 75,
      durability: 80,
      cost: 800,
      unlockLevel: 2
    },
    rarity: 'common',
    icon: '🤖',
    description: 'Automatic transmission for ease of use.',
    level: 1
  },
  {
    name: 'CVT Transmission',
    type: 'transmission',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 70,
      efficiency: 90,
      durability: 75,
      cost: 1000,
      unlockLevel: 4
    },
    rarity: 'rare',
    icon: '🔄',
    description: 'Continuously variable transmission for optimal efficiency.',
    level: 1
  },
  {
    name: 'Dual Clutch Transmission',
    type: 'transmission',
    category: 'mechanical',
    properties: {
      power: 0,
      weight: 85,
      efficiency: 80,
      durability: 90,
      cost: 1500,
      unlockLevel: 6
    },
    rarity: 'epic',
    icon: '⚡',
    description: 'High-performance dual clutch transmission for racing.',
    level: 1
  }
];

// Component categories
export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  'mechanical',
  'electrical',
  'structural',
  'aerodynamic'
];

// Component types by category
export const COMPONENT_TYPES_BY_CATEGORY: Record<ComponentCategory, ComponentType[]> = {
  mechanical: ['engine', 'wheels', 'suspension', 'brakes', 'transmission'],
  electrical: ['engine'], // Electric motors
  structural: ['chassis'],
  aerodynamic: [] // Future components
};

// Rarity colors
export const RARITY_COLORS: Record<ComponentRarity, string> = {
  common: '#9CA3AF', // Gray
  rare: '#3B82F6', // Blue
  epic: '#8B5CF6', // Purple
  legendary: '#F59E0B' // Gold
};

// Rarity names
export const RARITY_NAMES: Record<ComponentRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};

// Helper function to create component with default values
export function createComponent(
  baseComponent: {
    name: string;
    type: ComponentType;
    category: ComponentCategory;
    properties: any;
    rarity: ComponentRarity;
    icon: string;
    description: string;
    level: number;
  },
  id?: string
): Component {
  return new Component(id || `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, {
    name: baseComponent.name,
    type: baseComponent.type,
    category: baseComponent.category,
    properties: baseComponent.properties as ComponentProperties,
    position: new PositionVO(0, 0),
    size: DEFAULT_COMPONENT_SIZES[baseComponent.type],
    rotation: 0,
    isUnlocked: baseComponent.properties.unlockLevel <= 1,
    rarity: baseComponent.rarity,
    icon: baseComponent.icon,
    description: baseComponent.description,
    level: baseComponent.level
  });
}

// Helper function to get components by type
export function getComponentsByType(type: ComponentType): Component[] {
  return COMPONENT_DATA.filter(component => component.type === type).map(component =>
    createComponent(component)
  );
}

// Helper function to get components by category
export function getComponentsByCategory(category: ComponentCategory): Component[] {
  return COMPONENT_DATA.filter(component => component.category === category).map(component =>
    createComponent(component)
  );
}

// Helper function to get components by rarity
export function getComponentsByRarity(rarity: ComponentRarity): Component[] {
  return COMPONENT_DATA.filter(component => component.rarity === rarity).map(component =>
    createComponent(component)
  );
}

// Helper function to get unlocked components for a user level
export function getUnlockedComponents(userLevel: number): Component[] {
  return COMPONENT_DATA.filter(component => component.properties.unlockLevel <= userLevel).map(
    component => createComponent(component)
  );
}

// Helper function to search components
export function searchComponents(query: string, userLevel: number = 1): Component[] {
  const searchTerm = query.toLowerCase();
  return COMPONENT_DATA.filter(
    component =>
      component.name.toLowerCase().includes(searchTerm) ||
      component.description.toLowerCase().includes(searchTerm) ||
      component.type.toLowerCase().includes(searchTerm)
  )
    .filter(component => component.properties.unlockLevel <= userLevel)
    .map(component => createComponent(component));
}

// Default component sizes by type
export const DEFAULT_COMPONENT_SIZES: Record<ComponentType, { width: number; height: number }> = {
  engine: { width: 100, height: 80 },
  chassis: { width: 200, height: 100 },
  wheels: { width: 60, height: 60 },
  suspension: { width: 80, height: 40 },
  brakes: { width: 50, height: 50 },
  transmission: { width: 90, height: 60 }
};
