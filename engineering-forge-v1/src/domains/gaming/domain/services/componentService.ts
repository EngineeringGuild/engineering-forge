/**
 * Component Service - Engineering Forge V1.0
 *
 * This file contains the component service with all component-related business logic.
 */

import { Component, CreateComponentRequest, UpdateComponentRequest } from '../../../../types/api.types';

// Mock Component model (in real implementation, this would be a Mongoose model)
interface IComponent {
  _id: string;
  name: string;
  type: 'engine' | 'chassis' | 'wheels' | 'suspension' | 'transmission' | 'brakes' | 'aerodynamics';
  category: 'performance' | 'handling' | 'efficiency' | 'durability';
  properties: {
    power: number;
    weight: number;
    efficiency: number;
    durability: number;
    handling: number;
    acceleration: number;
    topSpeed: number;
    braking: number;
    aerodynamics: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  unlockLevel: number;
  isUnlocked: boolean;
  imageUrl?: string;
  description: string;
  manufacturer: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ComponentService {
  private components: Map<string, IComponent> = new Map();

  constructor() {
    this.initializeDefaultComponents();
  }

  /**
   * Create a new component
   */
  async createComponent(componentData: CreateComponentRequest): Promise<Component> {
    const componentId = this.generateId();
    const now = new Date();

    const component: IComponent = {
      _id: componentId,
      name: componentData.name,
      type: componentData.type,
      category: componentData.category,
      properties: componentData.properties,
      rarity: componentData.rarity,
      cost: componentData.cost,
      unlockLevel: componentData.unlockLevel,
      isUnlocked: false, // Components start locked
      imageUrl: componentData.imageUrl,
      description: componentData.description,
      manufacturer: componentData.manufacturer,
      createdAt: now,
      updatedAt: now
    };

    this.components.set(componentId, component);
    return this.mapToComponent(component);
  }

  /**
   * Get component by ID
   */
  async getComponentById(componentId: string): Promise<Component | null> {
    const component = this.components.get(componentId);
    if (!component) {
      return null;
    }
    return this.mapToComponent(component);
  }

  /**
   * Get all components with filtering and pagination
   */
  async getComponents(options: {
    page: number;
    limit: number;
    type?: string;
    category?: string;
    rarity?: string;
    unlocked?: boolean;
    search?: string;
  }): Promise<{ components: Component[]; total: number }> {
    const allComponents = Array.from(this.components.values());
    let filteredComponents = allComponents;

    // Apply filters
    if (options.type) {
      filteredComponents = filteredComponents.filter(c => c.type === options.type);
    }

    if (options.category) {
      filteredComponents = filteredComponents.filter(c => c.category === options.category);
    }

    if (options.rarity) {
      filteredComponents = filteredComponents.filter(c => c.rarity === options.rarity);
    }

    if (options.unlocked !== undefined) {
      filteredComponents = filteredComponents.filter(c => c.isUnlocked === options.unlocked);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredComponents = filteredComponents.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          c.manufacturer.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredComponents.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedComponents = filteredComponents.slice(startIndex, endIndex);

    return {
      components: paginatedComponents.map(c => this.mapToComponent(c)),
      total
    };
  }

  /**
   * Update component
   */
  async updateComponent(
    componentId: string,
    updateData: UpdateComponentRequest
  ): Promise<Component | null> {
    const component = this.components.get(componentId);
    if (!component) {
      return null;
    }

    // Update fields
    if (updateData.name !== undefined) {
component.name = updateData.name;
}
    if (updateData.type !== undefined) {
component.type = updateData.type;
}
    if (updateData.category !== undefined) {
component.category = updateData.category;
}
    if (updateData.properties !== undefined) {
      component.properties = { ...component.properties, ...updateData.properties };
    }
    if (updateData.rarity !== undefined) {
component.rarity = updateData.rarity;
}
    if (updateData.cost !== undefined) {
component.cost = updateData.cost;
}
    if (updateData.unlockLevel !== undefined) {
component.unlockLevel = updateData.unlockLevel;
}
    if (updateData.imageUrl !== undefined) {
component.imageUrl = updateData.imageUrl;
}
    if (updateData.description !== undefined) {
component.description = updateData.description;
}
    if (updateData.manufacturer !== undefined) {
component.manufacturer = updateData.manufacturer;
}

    component.updatedAt = new Date();
    this.components.set(componentId, component);

    return this.mapToComponent(component);
  }

  /**
   * Delete component
   */
  async deleteComponent(componentId: string): Promise<boolean> {
    return this.components.delete(componentId);
  }

  /**
   * Unlock component for user
   */
  async unlockComponent(componentId: string, userLevel: number): Promise<Component | null> {
    const component = this.components.get(componentId);
    if (!component) {
      return null;
    }

    if (userLevel >= component.unlockLevel) {
      component.isUnlocked = true;
      component.updatedAt = new Date();
      this.components.set(componentId, component);
    }

    return this.mapToComponent(component);
  }

  /**
   * Get components by type
   */
  async getComponentsByType(type: string): Promise<Component[]> {
    const allComponents = Array.from(this.components.values());
    return allComponents.filter(c => c.type === type).map(c => this.mapToComponent(c));
  }

  /**
   * Get components by rarity
   */
  async getComponentsByRarity(rarity: string): Promise<Component[]> {
    const allComponents = Array.from(this.components.values());
    return allComponents.filter(c => c.rarity === rarity).map(c => this.mapToComponent(c));
  }

  /**
   * Get unlocked components for user
   */
  async getUnlockedComponents(userLevel: number): Promise<Component[]> {
    const allComponents = Array.from(this.components.values());
    return allComponents.filter(c => c.unlockLevel <= userLevel).map(c => this.mapToComponent(c));
  }

  /**
   * Get component statistics
   */
  async getComponentStatistics(): Promise<{
    totalComponents: number;
    componentsByType: Record<string, number>;
    componentsByRarity: Record<string, number>;
    averageCost: number;
    totalUnlocked: number;
  }> {
    const allComponents = Array.from(this.components.values());

    const totalComponents = allComponents.length;
    const totalUnlocked = allComponents.filter(c => c.isUnlocked).length;

    const totalCost = allComponents.reduce((sum, c) => sum + c.cost, 0);
    const averageCost = totalComponents > 0 ? totalCost / totalComponents : 0;

    const componentsByType: Record<string, number> = {};
    const componentsByRarity: Record<string, number> = {};

    allComponents.forEach(c => {
      componentsByType[c.type] = (componentsByType[c.type] || 0) + 1;
      componentsByRarity[c.rarity] = (componentsByRarity[c.rarity] || 0) + 1;
    });

    return {
      totalComponents,
      componentsByType,
      componentsByRarity,
      averageCost,
      totalUnlocked
    };
  }

  /**
   * Initialize default components
   */
  private initializeDefaultComponents(): void {
    const defaultComponents: Omit<IComponent, '_id' | 'createdAt' | 'updatedAt'>[] = [
      // Engines
      {
        name: 'Basic Engine',
        type: 'engine',
        category: 'performance',
        properties: {
          power: 100,
          weight: 200,
          efficiency: 60,
          durability: 80,
          handling: 0,
          acceleration: 70,
          topSpeed: 60,
          braking: 0,
          aerodynamics: 0
        },
        rarity: 'common',
        cost: 1000,
        unlockLevel: 1,
        isUnlocked: true,
        description: 'A basic engine for beginners',
        manufacturer: 'Basic Motors'
      },
      {
        name: 'Turbo Engine',
        type: 'engine',
        category: 'performance',
        properties: {
          power: 200,
          weight: 180,
          efficiency: 50,
          durability: 70,
          handling: 0,
          acceleration: 90,
          topSpeed: 85,
          braking: 0,
          aerodynamics: 0
        },
        rarity: 'uncommon',
        cost: 2500,
        unlockLevel: 3,
        isUnlocked: false,
        description: 'High-performance turbocharged engine',
        manufacturer: 'TurboTech'
      },
      // Chassis
      {
        name: 'Steel Chassis',
        type: 'chassis',
        category: 'durability',
        properties: {
          power: 0,
          weight: 500,
          efficiency: 0,
          durability: 90,
          handling: 40,
          acceleration: 0,
          topSpeed: 0,
          braking: 0,
          aerodynamics: 30
        },
        rarity: 'common',
        cost: 800,
        unlockLevel: 1,
        isUnlocked: true,
        description: 'Strong and durable steel chassis',
        manufacturer: 'SteelWorks'
      },
      // Wheels
      {
        name: 'Standard Wheels',
        type: 'wheels',
        category: 'handling',
        properties: {
          power: 0,
          weight: 50,
          efficiency: 0,
          durability: 70,
          handling: 60,
          acceleration: 0,
          topSpeed: 0,
          braking: 50,
          aerodynamics: 0
        },
        rarity: 'common',
        cost: 300,
        unlockLevel: 1,
        isUnlocked: true,
        description: 'Standard wheels for everyday use',
        manufacturer: 'WheelCorp'
      }
    ];

    defaultComponents.forEach(comp => {
      const componentId = this.generateId();
      const now = new Date();
      const component: IComponent = {
        ...comp,
        _id: componentId,
        createdAt: now,
        updatedAt: now
      };
      this.components.set(componentId, component);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Map internal component to API component
   */
  private mapToComponent(component: IComponent): Component {
    return {
      _id: component._id,
      name: component.name,
      type: component.type,
      category: component.category,
      properties: component.properties,
      rarity: component.rarity,
      cost: component.cost,
      unlockLevel: component.unlockLevel,
      isUnlocked: component.isUnlocked,
      imageUrl: component.imageUrl,
      description: component.description,
      manufacturer: component.manufacturer,
      createdAt: component.createdAt,
      updatedAt: component.updatedAt
    };
  }
}
