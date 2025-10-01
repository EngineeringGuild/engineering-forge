/**
 * Progress Panel Component - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/presentation/components/Progress/ProgressPanel.tsx
 *
 * Comprehensive progress tracking panel with XP, leveling, and statistics
 */

import React, { useEffect, useState } from 'react';
import { UserProgress } from '../../../domains/gaming/entities/UserProgress';
import { ProgressService, ProgressUpdate } from '../../../domains/gaming/services/ProgressService';

interface ProgressPanelProps {
  userId: string;
  progressService: ProgressService;
  isVisible: boolean;
  onClose: () => void;
}

interface ProgressData {
  level: number;
  experience: number;
  totalExperience: number;
  credits: number;
  levelProgress: number;
  experienceToNext: number;
  statistics: {
    totalPlayTime: number;
    averageSessionTime: number;
    completionRate: number;
    accuracy: number;
    efficiency: number;
    rank: number;
  };
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  userId,
  progressService,
  isVisible,
  onClose
}) => {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'statistics' | 'achievements' | 'leaderboard'
  >('overview');
  const [levelUpNotification, setLevelUpNotification] = useState<ProgressUpdate | null>(null);

  useEffect(() => {
    if (!isVisible) {
return;
}

    // Initialize progress if not exists
    let userProgress = progressService.getUserProgress(userId);
    if (!userProgress) {
      userProgress = progressService.initializeProgress(userId);
    }

    // Load current progress data
    updateProgressData(userProgress);

    // Add progress listener
    const handleProgressUpdate = (update: ProgressUpdate) => {
      const updatedProgress = progressService.getUserProgress(userId);
      if (updatedProgress) {
        updateProgressData(updatedProgress);

        // Show level up notification
        if (update.leveledUp) {
          setLevelUpNotification(update);
          setTimeout(() => setLevelUpNotification(null), 5000);
        }
      }
    };

    progressService.addProgressListener(userId, handleProgressUpdate);

    return () => {
      progressService.removeProgressListener(userId, handleProgressUpdate);
    };
  }, [userId, progressService, isVisible]);

  const updateProgressData = (userProgress: UserProgress) => {
    const analytics = progressService.getProgressAnalytics(userId);
    if (!analytics) {
return;
}

    setProgressData({
      level: userProgress.level,
      experience: userProgress.experience,
      totalExperience: userProgress.totalExperience,
      credits: userProgress.credits,
      levelProgress: analytics.levelProgress,
      experienceToNext: analytics.experienceToNext,
      statistics: {
        totalPlayTime: analytics.totalPlayTime,
        averageSessionTime: analytics.averageSessionTime,
        completionRate: analytics.completionRate,
        accuracy: analytics.accuracy,
        efficiency: analytics.efficiency,
        rank: analytics.rank
      }
    });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  if (!isVisible) {
return null;
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Progress Dashboard</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Level Up Notification */}
        {levelUpNotification && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-center">
            <div className="text-white font-bold text-xl">
              🎉 Level Up! You reached level {levelUpNotification.newLevel}!
            </div>
            {levelUpNotification.rewards && (
              <div className="text-white text-sm mt-1">
                Rewards: {levelUpNotification.rewards.credits} credits
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'statistics', label: 'Statistics', icon: '📈' },
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'achievements' | 'leaderboard')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {progressData && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Level and XP */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Level & Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">
                          Level {progressData.level}
                        </div>
                        <div className="text-gray-400">Current Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {formatNumber(progressData.totalExperience)}
                        </div>
                        <div className="text-gray-400">Total XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {formatNumber(progressData.experienceToNext)}
                        </div>
                        <div className="text-gray-400">XP to Next Level</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Level {progressData.level}</span>
                        <span>{Math.round(progressData.levelProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progressData.levelProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credits and Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Credits</h3>
                      <div className="text-3xl font-bold text-yellow-400">
                        {formatNumber(progressData.credits)}
                      </div>
                      <div className="text-gray-400">Available Credits</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Rank</h3>
                      <div className="text-3xl font-bold text-purple-400">
                        #{progressData.statistics.rank}
                      </div>
                      <div className="text-gray-400">Global Ranking</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Play Time</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Time</span>
                          <span className="text-white font-semibold">
                            {formatTime(progressData.statistics.totalPlayTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Session</span>
                          <span className="text-white font-semibold">
                            {formatTime(progressData.statistics.averageSessionTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Completion Rate</span>
                          <span className="text-white font-semibold">
                            {Math.round(progressData.statistics.completionRate)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Accuracy</span>
                          <span className="text-white font-semibold">
                            {Math.round(progressData.statistics.accuracy)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Efficiency</span>
                          <span className="text-white font-semibold">
                            {Math.round(progressData.statistics.efficiency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">🏆</div>
                    <div>Achievement system will be integrated here</div>
                  </div>
                </div>
              )}

              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Global Leaderboard</h3>
                  <div className="space-y-3">
                    {progressService.getLeaderboardData(10).map((entry, index) => (
                      <div
                        key={entry.userId}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          entry.userId === userId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? 'bg-yellow-500 text-black'
                                : index === 1
                                  ? 'bg-gray-400 text-black'
                                  : index === 2
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-600 text-white'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {entry.userId === userId ? 'You' : `Player ${entry.userId.slice(-4)}`}
                            </div>
                            <div className="text-sm opacity-75">Level {entry.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatNumber(entry.totalExperience)} XP
                          </div>
                          <div className="text-sm opacity-75">
                            {entry.projectsCompleted} projects
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPanel;

