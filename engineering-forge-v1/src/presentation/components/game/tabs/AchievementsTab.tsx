import React from "react";
import { GameActions } from "../../../../domains/gaming/application/use-cases/GameActionsUseCase";
import { GameState } from "../../../../domains/gaming/domain/value-objects/GameState";
import { AchievementPanel } from "../achievements/AchievementPanel";

interface AchievementsTabProps {
  gameState: GameState;
  gameActions: GameActions;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  gameState,
}) => {
  return (
    <div className="h-full">
      <AchievementPanel
        achievements={gameState.achievements}
        onAchievementClick={(achievement) => {
          console.log("Achievement clicked:", achievement.title);
        }}
      />
    </div>
  );
};
