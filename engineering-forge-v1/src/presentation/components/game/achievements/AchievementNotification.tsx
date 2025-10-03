// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/game/AchievementNotification.tsx

import { Star, Trophy, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Achievement } from "../../../../domains/gaming/domain/entities/Achievement";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const AchievementNotification: React.FC<
  AchievementNotificationProps
> = ({ achievement, onClose, autoCloseDelay = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto close
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, autoCloseDelay);

    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 100 / (autoCloseDelay / 50);
      });
    }, 50);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [onClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getRarityGradient = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "from-gray-500 to-gray-400";
      case "rare":
        return "from-blue-500 to-blue-400";
      case "epic":
        return "from-purple-500 to-purple-400";
      case "legendary":
        return "from-yellow-500 to-yellow-400";
      default:
        return "from-gray-500 to-gray-400";
    }
  };

  const getRarityGlow = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "shadow-gray-500/20";
      case "rare":
        return "shadow-blue-500/30";
      case "epic":
        return "shadow-purple-500/40";
      case "legendary":
        return "shadow-yellow-500/50";
      default:
        return "shadow-gray-500/20";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`bg-gradient-to-r ${getRarityGradient(
          achievement.rarity
        )} rounded-lg p-4 shadow-lg ${getRarityGlow(
          achievement.rarity
        )} border border-white/20 min-w-80 max-w-96`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="text-3xl mr-3 animate-bounce">
              {achievement.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Achievement Unlocked!
              </h3>
              <div className="text-sm text-white/80">
                {achievement.getRarityName()} • {achievement.points} points
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement Details */}
        <div className="mb-3">
          <h4 className="text-xl font-semibold text-white mb-1">
            {achievement.title}
          </h4>
          <p className="text-white/90 text-sm">{achievement.description}</p>
        </div>

        {/* Rewards */}
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <div className="text-sm text-white/80 mb-1">Rewards:</div>
          <div className="flex items-center space-x-4 text-sm text-white">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {achievement.rewards.xp} XP
            </div>
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
              {achievement.rewards.credits} credits
            </div>
            {achievement.rewards.title && (
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
                {achievement.rewards.title}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Auto-close indicator */}
        <div className="text-xs text-white/60 mt-2 text-center">
          Auto-closes in{" "}
          {Math.ceil(
            (autoCloseDelay - progress * (autoCloseDelay / 100)) / 1000
          )}
          s
        </div>
      </div>
    </div>
  );
};
