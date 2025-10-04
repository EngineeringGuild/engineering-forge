// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/ComponentFilter.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";
import {
  Component,
  ComponentCategory,
  ComponentRarity,
} from "../entities/Component";

export interface ComponentFilterProps {
  readonly searchQuery: string;
  readonly category: ComponentCategory | null;
  readonly rarity: ComponentRarity | null;
  readonly userLevel: number;
  readonly showUnlockedOnly: boolean;
  readonly sortBy: "name" | "rarity" | "level" | "category";
  readonly sortOrder: "asc" | "desc";
}

export class ComponentFilter extends ValueObject<ComponentFilterProps> {
  public static create(props: ComponentFilterProps): ComponentFilter {
    this.validateFilter(props);
    return new ComponentFilter(props);
  }

  private static validateFilter(props: ComponentFilterProps): void {
    if (props.userLevel < 1) {
      throw new Error("User level must be at least 1");
    }

    if (!["name", "rarity", "level", "category"].includes(props.sortBy)) {
      throw new Error("Invalid sort by option");
    }

    if (!["asc", "desc"].includes(props.sortOrder)) {
      throw new Error("Invalid sort order");
    }
  }

  get searchQuery(): string {
    return this.props.searchQuery;
  }

  get category(): ComponentCategory | null {
    return this.props.category;
  }

  get rarity(): ComponentRarity | null {
    return this.props.rarity;
  }

  get userLevel(): number {
    return this.props.userLevel;
  }

  get showUnlockedOnly(): boolean {
    return this.props.showUnlockedOnly;
  }

  get sortBy(): "name" | "rarity" | "level" | "category" {
    return this.props.sortBy;
  }

  get sortOrder(): "asc" | "desc" {
    return this.props.sortOrder;
  }

  /**
   * Update filter properties
   */
  update(props: Partial<ComponentFilterProps>): ComponentFilter {
    return new ComponentFilter({ ...this.props, ...props });
  }

  /**
   * Clear all filters
   */
  clear(): ComponentFilter {
    return new ComponentFilter({
      searchQuery: "",
      category: null,
      rarity: null,
      userLevel: this.props.userLevel,
      showUnlockedOnly: false,
      sortBy: "name",
      sortOrder: "asc",
    });
  }

  /**
   * Check if component matches filter
   */
  matches(component: Component): boolean {
    // Search query filter
    if (this.props.searchQuery) {
      const query = this.props.searchQuery.toLowerCase();
      const matchesSearch =
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (this.props.category && component.category !== this.props.category) {
      return false;
    }

    // Rarity filter
    if (this.props.rarity && component.rarity !== this.props.rarity) {
      return false;
    }

    // Unlocked filter
    if (
      this.props.showUnlockedOnly &&
      !component.canBeUnlockedForLevel(this.props.userLevel)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Sort components based on filter settings
   */
  sort(components: Component[]): Component[] {
    return [...components].sort((a, b) => {
      let comparison = 0;

      switch (this.props.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "rarity":
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
        case "level":
          comparison = a.level - b.level;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return this.props.sortOrder === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Apply filter to components
   */
  apply(components: Component[]): Component[] {
    const filtered = components.filter((component) => this.matches(component));
    return this.sort(filtered);
  }
}
