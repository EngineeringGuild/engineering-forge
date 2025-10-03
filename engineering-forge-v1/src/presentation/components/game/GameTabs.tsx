import React from 'react';
import { GameActions } from '../../../domains/gaming/application/use-cases/GameActionsUseCase';
import { GameState } from '../../../domains/gaming/domain/value-objects/GameState';
import { AchievementsTab } from './tabs/AchievementsTab';
import { BuildTab } from './tabs/BuildTab';
import { PerformanceTab } from './tabs/PerformanceTab';
import { TestTab } from './tabs/TestTab';

interface GameTabsProps {
  activeTab: 'build' | 'test' | 'performance' | 'achievements' | 'simulation';
  gameState: GameState;
  gameActions: GameActions;
}

export const GameTabs: React.FC<GameTabsProps> = ({ activeTab, gameState, gameActions }) => {
  const commonProps = {
    gameState,
    gameActions
  };

  switch (activeTab) {
    case 'build':
      return <BuildTab {...commonProps} />;

    case 'test':
      return <TestTab {...commonProps} />;

    case 'performance':
      return <PerformanceTab {...commonProps} />;

    case 'achievements':
      return <AchievementsTab {...commonProps} />;

    default:
      return <BuildTab {...commonProps} />;
  }
};
