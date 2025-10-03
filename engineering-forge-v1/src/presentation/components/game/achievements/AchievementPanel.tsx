// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/AchievementPanel.tsx

import { Search, Trophy, Unlock } from "lucide-react";
import React, { useCallback, useState } from "react";
import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
} from "../../../../domains/gaming/domain/entities/Achievement";

interface AchievementPanelProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  achievements,
  onAchievementClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const [selectedRarity, setSelectedRarity] = useState<
    AchievementRarity | "all"
  >("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories: AchievementCategory[] = [
    "construction",
    "performance",
    "testing",
    "exploration",
    "mastery",
    "special",
  ];
  const rarities: AchievementRarity[] = ["common", "rare", "epic", "legendary"];

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesCategory =
      selectedCategory === "all" || achievement.category === selectedCategory;
    const matchesRarity =
      selectedRarity === "all" || achievement.rarity === selectedRarity;
    const matchesUnlocked = !showUnlockedOnly || achievement.isUnlocked;
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRarity && matchesUnlocked && matchesSearch;
  });

  const getCategoryColor = (category: AchievementCategory): string => {
    switch (category) {
      case "construction":
        return "text-blue-400";
      case "performance":
        return "text-green-400";
      case "testing":
        return "text-yellow-400";
      case "exploration":
        return "text-purple-400";
      case "mastery":
        return "text-orange-400";
      case "special":
        return "text-pink-400";
      default:
        return "text-gray-400";
    }
  };

  const getCategoryIcon = (category: AchievementCategory): string => {
    switch (category) {
      case "construction":
        return "🏗️";
      case "performance":
        return "⚡";
      case "testing":
        return "🧪";
      case "exploration":
        return "🗺️";
      case "mastery":
        return "👑";
      case "special":
        return "⭐";
      default:
        return "🏆";
    }
  };

  // const getRarityColor = (rarity: AchievementRarity): string => {
  //   return achievement.getRarityColor();
  // };

  const handleAchievementClick = useCallback(
    (achievement: Achievement) => {
      if (onAchievementClick) {
        onAchievementClick(achievement);
      }
    },
    [onAchievementClick]
  );

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage =
    totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full h-full bg-gray-800 border border-gray-600 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Achievements
          </h3>
          <div className="text-sm text-gray-400">
            {unlockedCount}/{totalCount} ({completionPercentage.toFixed(1)}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as AchievementCategory | "all")
            }
            className="px-3 py-2 bg-gray-700 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryIcon(category)}{" "}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedRarity}
            onChange={(e) =>
              setSelectedRarity(e.target.value as AchievementRarity | "all")
            }
            className="px-3 py-2 bg-gray-700 border border-gray-500 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Rarities</option>
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle */}
        <div className="flex items-center mt-3">
          <input
            type="checkbox"
            id="showUnlockedOnly"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showUnlockedOnly" className="text-sm text-gray-300">
            Show unlocked only
          </label>
        </div>
      </div>

      {/* Achievements List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                achievement.isUnlocked
                  ? "bg-gray-700 border-gray-500 hover:bg-gray-600"
                  : "bg-gray-800 border-gray-600 hover:bg-gray-750"
              }`}
              onClick={() => handleAchievementClick(achievement)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">
                    {achievement.isUnlocked ? achievement.icon : "🔒"}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium ${
                        achievement.isUnlocked ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {achievement.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs ${getCategoryColor(
                          achievement.category
                        )}`}
                      >
                        {getCategoryIcon(achievement.category)}{" "}
                        {achievement.category}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: achievement.getRarityColor() + "20",
                          color: achievement.getRarityColor(),
                        }}
                      >
                        {achievement.getRarityName()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-400">
                    {achievement.points} pts
                  </div>
                  {achievement.isUnlocked && (
                    <div className="text-xs text-green-400 flex items-center">
                      <Unlock className="w-3 h-3 mr-1" />
                      Unlocked
                    </div>
                  )}
                </div>
              </div>

              <p
                className={`text-xs mb-3 ${
                  achievement.isUnlocked ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!achievement.isUnlocked && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-gray-400">
                      {achievement.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="text-xs text-gray-400">
                {achievement.getProgressText()}
              </div>

              {/* Rewards */}
              {achievement.isUnlocked && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400">
                    Rewards: {achievement.rewards.xp} XP,{" "}
                    {achievement.rewards.credits} credits
                    {achievement.rewards.title &&
                      `, ${achievement.rewards.title}`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">🔍</div>
            <div>No achievements found</div>
            <div className="text-sm">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
};
