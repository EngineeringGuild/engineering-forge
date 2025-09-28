/**
 * Level Up Notification Component - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/Progress/LevelUpNotification.tsx
 *
 * Animated notification for level up events with rewards display
 */

import React, { useEffect, useState } from 'react';
import { ProgressUpdate } from '../../../domains/gaming/services/ProgressService';

interface LevelUpNotificationProps {
  update: ProgressUpdate | null;
  onClose: () => void;
  duration?: number;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  update,
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (update) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [update, duration, onClose]);

  if (!update || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg shadow-2xl p-6 min-w-[320px] transform transition-all duration-300 ${
          isAnimating
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce">🎉</div>
            <div>
              <h3 className="text-xl font-bold text-white">Level Up!</h3>
              <p className="text-yellow-100 text-sm">Congratulations!</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className="text-white hover:text-yellow-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Level Info */}
        <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">Level {update.newLevel}</div>
            <div className="text-yellow-100 text-sm">
              You gained {update.experience} experience points!
            </div>
          </div>
        </div>

        {/* Rewards */}
        {update.rewards && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Rewards Earned:</h4>

            {/* Credits */}
            {update.rewards.credits > 0 && (
              <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-2xl">💰</div>
                <div>
                  <div className="text-white font-semibold">+{update.rewards.credits} Credits</div>
                  <div className="text-yellow-100 text-sm">Use credits to unlock components</div>
                </div>
              </div>
            )}

            {/* Components */}
            {update.rewards.components && update.rewards.components.length > 0 && (
              <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-2xl">🔧</div>
                <div>
                  <div className="text-white font-semibold">New Components Unlocked!</div>
                  <div className="text-yellow-100 text-sm">
                    {update.rewards.components.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {update.rewards.achievements && update.rewards.achievements.length > 0 && (
              <div className="flex items-center space-x-3 bg-white bg-opacity-10 rounded-lg p-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="text-white font-semibold">New Achievements!</div>
                  <div className="text-yellow-100 text-sm">
                    {update.rewards.achievements.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>Level {update.level}</span>
            <span>{update.totalExperience.toLocaleString()} Total XP</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-white to-yellow-200 h-2 rounded-full transition-all duration-1000"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Celebration Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 text-yellow-300 animate-ping">✨</div>
          <div className="absolute top-4 right-8 text-yellow-300 animate-ping animation-delay-200">
            ⭐
          </div>
          <div className="absolute bottom-2 left-8 text-yellow-300 animate-ping animation-delay-400">
            🎊
          </div>
          <div className="absolute bottom-4 right-2 text-yellow-300 animate-ping animation-delay-600">
            🎉
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotification;

