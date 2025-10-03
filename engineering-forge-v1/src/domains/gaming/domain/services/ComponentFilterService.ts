// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/ComponentFilterService.ts

import { Component } from "../entities/Component";
import { ComponentFilter } from "../value-objects/ComponentFilter";

export class ComponentFilterService {
  /**
   * Filter components based on filter criteria
   */
  filterComponents(
    components: Component[],
    filter: ComponentFilter
  ): Component[] {
    return filter.apply(components);
  }

  /**
   * Get available categories from components
   */
  getAvailableCategories(components: Component[]): string[] {
    const categories = new Set(components.map((c) => c.category));
    return Array.from(categories).sort();
  }

  /**
   * Get available rarities from components
   */
  getAvailableRarities(components: Component[]): string[] {
    const rarities = new Set(components.map((c) => c.rarity));
    return Array.from(rarities).sort();
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(
    components: Component[],
    category: string
  ): Component[] {
    return components.filter((c) => c.category === category);
  }

  /**
   * Get components by rarity
   */
  getComponentsByRarity(components: Component[], rarity: string): Component[] {
    return components.filter((c) => c.rarity === rarity);
  }

  /**
   * Search components by query
   */
  searchComponents(components: Component[], query: string): Component[] {
    if (!query.trim()) return components;

    const searchQuery = query.toLowerCase();
    return components.filter(
      (component) =>
        component.name.toLowerCase().includes(searchQuery) ||
        component.description.toLowerCase().includes(searchQuery) ||
        component.category.toLowerCase().includes(searchQuery) ||
        component.rarity.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Get unlocked components for user level
   */
  getUnlockedComponents(
    components: Component[],
    userLevel: number
  ): Component[] {
    return components.filter((component) =>
      component.canBeUnlockedForLevel(userLevel)
    );
  }

  /**
   * Get component statistics
   */
  getComponentStatistics(components: Component[]): {
    total: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
    unlocked: number;
  } {
    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};
    let unlocked = 0;

    components.forEach((component) => {
      // Count by category
      byCategory[component.category] =
        (byCategory[component.category] || 0) + 1;

      // Count by rarity
      byRarity[component.rarity] = (byRarity[component.rarity] || 0) + 1;

      // Count unlocked (assuming level 1 for now)
      if (component.canBeUnlockedForLevel(1)) {
        unlocked++;
      }
    });

    return {
      total: components.length,
      byCategory,
      byRarity,
      unlocked,
    };
  }
}
