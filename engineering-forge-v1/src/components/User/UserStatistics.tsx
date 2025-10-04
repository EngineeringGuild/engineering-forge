/**
 * UserStatistics Component - Engineering Forge V1.0
 *
 * This component displays user statistics, achievements, and progress.
 */

import React from "react";
import { useUserLevel, useUserStatistics } from "../../hooks/useUser";

// Mock UserService for now
const UserService = {
  formatTimeSpent: (timeSpent: number): string => {
    const hours = Math.floor(timeSpent / 3600000);
    const minutes = Math.floor((timeSpent % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  },
  getAchievementRarityBackground: (rarity: string): string => {
    const backgrounds = {
      common: "bg-gray-100",
      uncommon: "bg-green-100",
      rare: "bg-blue-100",
      epic: "bg-purple-100",
      legendary: "bg-yellow-100",
    };
    return backgrounds[rarity as keyof typeof backgrounds] || "bg-gray-100";
  },
  getAchievementRarityColor: (rarity: string): string => {
    const colors = {
      common: "text-gray-700",
      uncommon: "text-green-700",
      rare: "text-blue-700",
      epic: "text-purple-700",
      legendary: "text-yellow-700",
    };
    return colors[rarity as keyof typeof colors] || "text-gray-700";
  },
};

interface UserStatisticsProps {
  className?: string;
}

export const UserStatistics: React.FC<UserStatisticsProps> = ({
  className = "",
}) => {
  const {
    statistics,
    achievements,
    favoriteComponents,
    loading,
    error,
    refreshStatistics,
  } = useUserStatistics();

  const levelData = statistics ? useUserLevel(statistics.totalXP) : null;

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading statistics
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || !levelData) {
    return (
      <div
        className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}
      >
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track your progress and achievements.
        </p>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Level {levelData.level}</h3>
            <p className="text-blue-100">Keep learning to level up!</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{statistics.totalXP}</p>
            <p className="text-blue-100 text-sm">Total XP</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-400 rounded-full h-3 mb-2">
          <div
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${levelData.xpProgress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-blue-100">
          <span>{levelData.xpCurrent} XP</span>
          <span>
            {levelData.nextLevelXp - levelData.xpCurrent} XP to next level
          </span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Completed */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.projectsCompleted}
              </p>
            </div>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lessons</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.lessonsCompleted}
              </p>
            </div>
          </div>
        </div>

        {/* Achievements Unlocked */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Achievements</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.achievementsUnlocked}
              </p>
            </div>
          </div>
        </div>

        {/* Time Spent */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {UserService.formatTimeSpent(statistics.timeSpent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Achievements</h3>
          <span className="text-sm text-gray-500">
            {achievements.filter((a) => a.unlockedAt).length} of{" "}
            {achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement._id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                achievement.unlockedAt
                  ? `${UserService.getAchievementRarityBackground(
                      achievement.rarity
                    )} border-current`
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium ${
                      achievement.unlockedAt
                        ? UserService.getAchievementRarityColor(
                            achievement.rarity
                          )
                        : "text-gray-500"
                    }`}
                  >
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          achievement.unlockedAt
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress}%
                    </p>
                  </div>

                  {achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Unlocked{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Favorite Components Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Favorite Components
          </h3>
          <span className="text-sm text-gray-500">
            {favoriteComponents.filter((c) => c.isUnlocked).length} of{" "}
            {favoriteComponents.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteComponents.map((component) => (
            <div
              key={component._id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                component.isUnlocked
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4
                  className={`text-sm font-medium ${
                    component.isUnlocked ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {component.name}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    component.rarity === "common"
                      ? "bg-gray-100 text-gray-600"
                      : component.rarity === "uncommon"
                      ? "bg-green-100 text-green-600"
                      : component.rarity === "rare"
                      ? "bg-blue-100 text-blue-600"
                      : component.rarity === "epic"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {component.rarity}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{component.type}</span>
                <span>{component.cost} XP</span>
              </div>

              {!component.isUnlocked && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-gray-400 h-1 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Locked</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={refreshStatistics}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default UserStatistics;
