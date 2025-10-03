import { useMemo } from "react";
import { useGameSounds, useUISounds } from "../../../../hooks/useAudio";
import { GameState } from "../../domain/value-objects/GameState";
import {
  GameActions,
  GameActionsUseCase,
} from "../use-cases/GameActionsUseCase";

export function useGameActions(gameState: GameState): GameActions {
  const { playTestComplete, playAchievement } = useGameSounds();
  const { playTabSwitch, playSave } = useUISounds();

  const audioService = useMemo(
    () => ({
      playTabSwitch,
      playTestComplete,
      playAchievement,
      playSave,
    }),
    [playTabSwitch, playTestComplete, playAchievement, playSave]
  );

  // Mock implementation - in real app, this would use a state management solution
  const updateState = (updater: (state: GameState) => GameState) => {
    console.log("State update requested:", updater);
    // TODO: Implement actual state update
  };

  return useMemo(
    () => new GameActionsUseCase(updateState, audioService),
    [gameState, audioService]
  );
}
