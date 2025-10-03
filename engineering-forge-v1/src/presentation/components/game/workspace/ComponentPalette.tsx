// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/workspace/ComponentPalette.tsx

import React, { useCallback, useMemo, useState } from "react";
import {
  COMPONENT_CATEGORIES,
  RARITY_COLORS,
  RARITY_NAMES,
} from "../../../../data/components";
import {
  Component,
  ComponentCategory,
  ComponentRarity,
} from "../../../../domains/gaming/domain/entities/Component";
import { ComponentFilterService } from "../../../../domains/gaming/domain/services/ComponentFilterService";
import { ComponentFilter } from "../../../../domains/gaming/domain/value-objects/ComponentFilter";
import { AnimatedButton } from "../../ui/AnimatedButton";
import { GlassCard } from "../../ui/GlassCard";

interface ComponentPaletteProps {
  components: Component[];
  onComponentSelect: (component: Component) => void;
  selectedCategory: ComponentCategory;
  onCategoryChange: (category: ComponentCategory) => void;
  userLevel: number;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  components,
  onComponentSelect,
  selectedCategory,
  onCategoryChange,
  userLevel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<ComponentRarity | null>(
    null
  );
  const [sortBy, setSortBy] = useState<
    "name" | "rarity" | "level" | "category"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Initialize services
  const [filterService] = useState(() => new ComponentFilterService());

  // Create filter
  const filter = useMemo(
    () =>
      ComponentFilter.create({
        searchQuery,
        category: selectedCategory,
        rarity: selectedRarity,
        userLevel,
        showUnlockedOnly: false,
        sortBy,
        sortOrder,
      }),
    [
      searchQuery,
      selectedCategory,
      selectedRarity,
      userLevel,
      sortBy,
      sortOrder,
    ]
  );

  // Apply filter to components
  const filteredComponents = useMemo(() => {
    return filterService.filterComponents(components, filter);
  }, [components, filter, filterService]);

  // Get available categories and rarities
  const availableCategories = useMemo(() => {
    return filterService.getAvailableCategories(components);
  }, [components, filterService]);

  const availableRarities = useMemo(() => {
    return filterService.getAvailableRarities(components);
  }, [components, filterService]);

  // Get component statistics
  const statistics = useMemo(() => {
    return filterService.getComponentStatistics(components);
  }, [components, filterService]);

  const handleComponentClick = useCallback(
    (component: Component) => {
      onComponentSelect(component);
    },
    [onComponentSelect]
  );

  const getRarityColor = (rarity: ComponentRarity): string => {
    return RARITY_COLORS[rarity];
  };

  const getRarityName = (rarity: ComponentRarity): string => {
    return RARITY_NAMES[rarity];
  };

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedRarity(null);
    setSortBy("name");
    setSortOrder("asc");
  }, []);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Components
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rarity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rarity
              </label>
              <select
                value={selectedRarity || ""}
                onChange={(e) =>
                  setSelectedRarity((e.target.value as ComponentRarity) || null)
                }
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Rarities</option>
                {availableRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {getRarityName(rarity as ComponentRarity)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="rarity">Rarity</option>
                <option value="level">Level</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* Sort Order and Clear */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={sortOrder === "asc"}
                  onChange={() => setSortOrder("asc")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Ascending</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={sortOrder === "desc"}
                  onChange={() => setSortOrder("desc")}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Descending</span>
              </label>
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Statistics */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">
              {statistics.total}
            </div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {statistics.unlocked}
            </div>
            <div className="text-sm text-gray-400">Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredComponents.length}
            </div>
            <div className="text-sm text-gray-400">Filtered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {availableCategories.length}
            </div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
        </div>
      </GlassCard>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {availableCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category as ComponentCategory)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {(COMPONENT_CATEGORIES as any)[category as ComponentCategory]
              ?.name || category}
          </button>
        ))}
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredComponents.map((component) => (
          <AnimatedButton
            key={component.id}
            onClick={() => handleComponentClick(component)}
            className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-all duration-200"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{component.icon}</div>
              <div className="font-medium text-white mb-1">
                {component.name}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {component.description}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-1 rounded text-white`}
                  style={{ backgroundColor: getRarityColor(component.rarity) }}
                >
                  {getRarityName(component.rarity)}
                </span>
                <span className="text-gray-400">Lv.{component.level}</span>
              </div>
            </div>
          </AnimatedButton>
        ))}
      </div>

      {/* No Results */}
      {filteredComponents.length === 0 && (
        <GlassCard className="p-8 text-center">
          <div className="text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-medium mb-2">No components found</div>
            <div className="text-sm">Try adjusting your search or filters</div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
