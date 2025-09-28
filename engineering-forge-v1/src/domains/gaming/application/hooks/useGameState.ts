import { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '../../../../hooks/usePerformanceMonitor';
import { GameState, GameStateEntity } from '../../domain/entities/GameState';

export function useGameState(): GameState {
  const [gameState, setGameState] = useState<GameState>(() => new GameStateEntity());

  // Performance monitoring
  const { isLowPerformance } = usePerformanceMonitor({
    enabled: true,
    sampleRate: 1000,
    onPerformanceUpdate: (metrics: any) => {
      if (metrics.fps < 30) {
        console.warn(`Low FPS detected: ${metrics.fps}fps`);
      }
    }
  });

  // Update performance state
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      isLowPerformance
    }));
  }, [isLowPerformance]);

  return gameState;
}
