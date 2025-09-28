// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/ComponentPalette.tsx

import React, { useCallback, useState } from 'react';
import { COMPONENT_CATEGORIES, RARITY_COLORS, RARITY_NAMES } from '../../../data/components';
import {
  Component,
  ComponentCategory,
  ComponentRarity
} from '../../../domains/gaming/domain/entities/Component';
import { AnimatedButton } from '../ui/AnimatedButton';
import { GlassCard } from '../ui/GlassCard';

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
  userLevel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<ComponentRarity | null>(null);

  const filteredComponents = components.filter(component => {
    const matchesCategory = component.category === selectedCategory;
    const matchesSearch =
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRarity = !selectedRarity || component.rarity === selectedRarity;
    const isUnlocked = component.canBeUnlockedForLevel(userLevel);

    return matchesCategory && matchesSearch && matchesRarity && isUnlocked;
  });

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

  return (
    <GlassCard variant="default" className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">🧩</span>
          Component Palette
        </h3>

        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          <select
            value={selectedCategory}
            onChange={e => onCategoryChange(e.target.value as ComponentCategory)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
          >
            {COMPONENT_CATEGORIES.map(category => (
              <option key={category} value={category} className="bg-gray-800">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Rarity Filter */}
        <div>
          <select
            value={selectedRarity || ''}
            onChange={e => setSelectedRarity((e.target.value as ComponentRarity) || null)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
          >
            <option value="" className="bg-gray-800">
              All Rarities
            </option>
            {Object.keys(RARITY_NAMES).map(rarity => (
              <option key={rarity} value={rarity} className="bg-gray-800">
                {RARITY_NAMES[rarity as ComponentRarity]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredComponents.map((component, index) => (
            <div
              key={component.id}
              className="p-3 cursor-pointer transform hover:scale-105 transition-all duration-200"
              onClick={() => handleComponentClick(component)}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <GlassCard variant="subtle" hover={true} className="h-full">
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3 drop-shadow-lg">{component.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{component.name}</div>
                    <div className="text-xs text-blue-200/80">{component.type}</div>
                  </div>
                  <div
                    className="text-xs px-3 py-1 rounded-full font-medium shadow-lg"
                    style={{
                      backgroundColor: getRarityColor(component.rarity) + '30',
                      color: getRarityColor(component.rarity),
                      border: `1px solid ${getRarityColor(component.rarity)}50`
                    }}
                  >
                    {getRarityName(component.rarity)}
                  </div>
                </div>

                <div className="text-xs text-gray-300 mb-3 leading-relaxed">
                  {component.description}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Power:</span>
                      <span className="text-yellow-400 font-medium">
                        {component.properties.power} HP
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weight:</span>
                      <span className="text-blue-400 font-medium">
                        {component.properties.weight} kg
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-green-400 font-medium">
                        {component.properties.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-purple-400 font-medium">
                        {component.properties.cost} credits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Component level indicator */}
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Level Required:</span>
                    <span className="text-orange-400 font-medium">{component.level}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <GlassCard variant="subtle" className="p-8">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Components Found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              <AnimatedButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRarity(null);
                }}
              >
                Clear Filters
              </AnimatedButton>
            </GlassCard>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
