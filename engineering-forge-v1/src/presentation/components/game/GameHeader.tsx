import React from 'react';

interface GameHeaderProps {
  score: number;
  level: number;
  workspaceComponentsCount: number;
  achievementsCount: number;
  lastSaved: Date | null;
  isAutoSaving: boolean;
  autoSaveError: boolean;
  onProgressClick: () => void;
  onSaveClick: () => void;
  onSettingsClick: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  level,
  workspaceComponentsCount,
  achievementsCount,
  onProgressClick,
  onSaveClick,
  onSettingsClick
}) => {
  return (
    <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Engineering Forge
            </h1>
            <span className="text-sm text-gray-300">Level {level}</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Score: {score}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{workspaceComponentsCount} components</span>
              <span className="text-sm text-gray-400">{achievementsCount} achievements</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onProgressClick}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              >
                Progress
              </button>
              <button
                onClick={onSaveClick}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={onSettingsClick}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
