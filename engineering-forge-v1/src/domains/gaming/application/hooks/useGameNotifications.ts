import React from 'react';

export function useGameNotifications() {
  const PerformanceWarning = React.createElement(
    'div',
    {
      className:
        'mb-4 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm'
    },
    '⚠️ Low performance detected - Consider reducing visual effects'
  );

  const AchievementNotification = null; // TODO: Implement achievement notifications

  const LevelUpNotification = null; // TODO: Implement level up notifications

  return {
    PerformanceWarning,
    AchievementNotification,
    LevelUpNotification
  };
}
