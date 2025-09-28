/**
 * Progress Bar Component - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/Progress/ProgressBar.tsx
 *
 * Compact progress bar for displaying XP and level progress
 */

import React from 'react';

interface ProgressBarProps {
  level: number;
  experience: number;
  totalExperience: number;
  levelProgress: number;
  experienceToNext: number;
  className?: string;
  showDetails?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  level,
  experience,
  totalExperience,
  levelProgress,
  experienceToNext,
  className = '',
  showDetails = false,
  animated = true
}) => {
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={`progress-bar ${className}`}>
      {showDetails && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">Level {level}</span>
            <span className="text-xs text-gray-400">
              {formatNumber(experience)} / {formatNumber(totalExperience)} XP
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {formatNumber(experienceToNext)} to next level
          </div>
        </div>
      )}

      <div className="relative">
        {/* Background */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          {/* Progress Fill */}
          <div
            className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(levelProgress, 100)}%` }}
          />

          {/* Glow Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 blur-sm"
            style={{ width: `${Math.min(levelProgress, 100)}%` }}
          />
        </div>

        {/* Level Badge */}
        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-800">
          {level}
        </div>
      </div>

      {showDetails && (
        <div className="mt-1 text-xs text-gray-400 text-center">
          {Math.round(levelProgress)}% complete
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

