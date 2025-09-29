import { useEffect, useState } from 'react';
import { usePerformanceMonitor } from '../../../../hooks/usePerformanceMonitor';
import { GameState } from '../../domain/value-objects/GameState';

export function useGameState(): GameState {
  const [gameState, setGameState] = useState<GameState>(() => GameState.createDefault('user-001'));

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
    setGameState(prev => {
      const newState = prev.setLowPerformance(isLowPerformance);
      return newState;
    });
  }, [isLowPerformance]);

  return gameState;
}
