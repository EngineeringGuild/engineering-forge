import React, { useCallback, useMemo, useState } from "react";
import { useGameActions } from "../../../domains/gaming/application/hooks/useGameActions";
import { useGameNotifications } from "../../../domains/gaming/application/hooks/useGameNotifications";
import { useGameState } from "../../../domains/gaming/application/hooks/useGameState";
import { GameHeader } from "./GameHeader";
import { GameTabs } from "./GameTabs";
import { GameSettings } from "./settings/GameSettings";
import { TabNavigation } from "./TabNavigation";

interface GameContainerProps {
  className?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  className = "",
}) => {
  // Game state management
  const gameState = useGameState();
  const gameActions = useGameActions(gameState);
  const notifications = useGameNotifications();

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(false);
  const [showSaveLoadPanel, setShowSaveLoadPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "build" | "test" | "performance" | "achievements" | "simulation"
  >("build");

  // Memoized handlers
  const handleTabSwitch = useCallback(
    (tab: "build" | "test" | "performance" | "achievements" | "simulation") => {
      setActiveTab(tab);
      gameActions.playTabSwitch();
    },
    [gameActions]
  );

  const headerProps = useMemo(
    () => ({
      score: gameState.score,
      level: gameState.level,
      workspaceComponentsCount: gameState.workspaceComponents.length,
      achievementsCount: gameState.achievements.length,
      lastSaved: gameState.lastSaved,
      isAutoSaving: gameState.isAutoSaving,
      autoSaveError: gameState.autoSaveError,
      onProgressClick: () => setShowProgressPanel(!showProgressPanel),
      onSaveClick: () => setShowSaveLoadPanel(!showSaveLoadPanel),
      onSettingsClick: () => setShowSettings(!showSettings),
    }),
    [gameState, showProgressPanel, showSaveLoadPanel, showSettings]
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 text-white ${className}`}
    >
      {/* Header */}
      <GameHeader {...headerProps} />

      {/* Settings Panel */}
      {showSettings && (
        <GameSettings
          gridSize={gameState.gridSize}
          snapToGrid={gameState.snapToGrid}
          onGridSizeChange={gameActions.setGridSize}
          onSnapToGridChange={gameActions.setSnapToGrid}
          onReset={gameActions.resetGame}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Main Game Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
          {/* Performance Warning */}
          {gameState.isLowPerformance && notifications.PerformanceWarning}

          {/* Tab Navigation */}
          <TabNavigation activeTab={activeTab} onTabSwitch={handleTabSwitch} />

          {/* Tab Content */}
          <GameTabs
            activeTab={activeTab}
            gameState={gameState}
            gameActions={gameActions}
          />
        </div>
      </div>

      {/* Notifications */}
      {notifications.AchievementNotification}
      {notifications.LevelUpNotification}

      {/* Panels */}
      {showProgressPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Progress</h3>
            <p className="text-gray-300">Progress panel content here</p>
            <button
              onClick={() => setShowProgressPanel(false)}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSaveLoadPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Save/Load</h3>
            <p className="text-gray-300">Save/Load panel content here</p>
            <button
              onClick={() => setShowSaveLoadPanel(false)}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
