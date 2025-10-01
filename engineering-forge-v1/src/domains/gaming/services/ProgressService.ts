/**
 * Progress Service - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/services/ProgressService.ts
 *
 * Service for managing user progress, XP, leveling, and statistics
 */

import {
  LevelRequirements,
  ProgressStatistics,
  UserProgress,
  UserProgressData
} from '../entities/UserProgress';

export interface ProgressEvent {
  type:
    | 'project_completed'
    | 'test_completed'
    | 'component_unlocked'
    | 'achievement_unlocked'
    | 'session_started';
  data: {
    userId: string;
    score?: number;
    playTime?: number;
    componentId?: string;
    achievementId?: string;
  };
  timestamp: Date;
}

export interface ProgressUpdate {
  userId: string;
  level: number;
  experience: number;
  totalExperience: number;
  credits: number;
  leveledUp: boolean;
  newLevel?: number;
  rewards?: {
    credits: number;
    components: string[];
    achievements: string[];
  };
}

export class ProgressService {
  private progressData: Map<string, UserProgress> = new Map();
  private eventListeners: Map<string, ((update: ProgressUpdate) => void)[]> = new Map();

  // Initialize user progress
  initializeProgress(userId: string, initialData?: Partial<UserProgressData>): UserProgress {
    const defaultData: UserProgressData = {
      userId,
      level: 1,
      experience: 0,
      totalExperience: 0,
      credits: 100,
      playTime: 0,
      projectsCompleted: 0,
      testsCompleted: 0,
      componentsUnlocked: 0,
      achievementsUnlocked: 0,
      highestScore: 0,
      averageScore: 0,
      totalScore: 0,
      sessionsPlayed: 0,
      lastPlayed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...initialData
    };

    const userProgress = new UserProgress(defaultData);
    this.progressData.set(userId, userProgress);

    return userProgress;
  }

  // Get user progress
  getUserProgress(userId: string): UserProgress | null {
    return this.progressData.get(userId) || null;
  }

  // Update progress from game events
  processEvent(event: ProgressEvent): ProgressUpdate | null {
    const userProgress = this.getUserProgress(event.data.userId);
    if (!userProgress) {
return null;
}

    let update: ProgressUpdate | null = null;

    switch (event.type) {
      case 'project_completed':
        if (event.data.score !== undefined && event.data.playTime !== undefined) {
          userProgress.completeProject(event.data.score, event.data.playTime);
          update = this.createProgressUpdate(userProgress);
        }
        break;

      case 'test_completed':
        if (event.data.score !== undefined && event.data.playTime !== undefined) {
          userProgress.completeTest(event.data.score, event.data.playTime);
          update = this.createProgressUpdate(userProgress);
        }
        break;

      case 'component_unlocked':
        userProgress.unlockComponent();
        update = this.createProgressUpdate(userProgress);
        break;

      case 'achievement_unlocked':
        userProgress.unlockAchievement();
        update = this.createProgressUpdate(userProgress);
        break;

      case 'session_started':
        userProgress.startSession();
        update = this.createProgressUpdate(userProgress);
        break;
    }

    if (update) {
      this.notifyListeners(event.data.userId, update);
    }

    return update;
  }

  // Add experience directly
  addExperience(userId: string, amount: number): ProgressUpdate | null {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) {
return null;
}

    const result = userProgress.addExperience(amount);
    const update = this.createProgressUpdate(userProgress, result.leveledUp, result.newLevel);

    this.notifyListeners(userId, update);
    return update;
  }

  // Spend credits
  spendCredits(userId: string, amount: number): boolean {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) {
return false;
}

    const success = userProgress.spendCredits(amount);
    if (success) {
      const update = this.createProgressUpdate(userProgress);
      this.notifyListeners(userId, update);
    }

    return success;
  }

  // Add credits
  addCredits(userId: string, amount: number): ProgressUpdate | null {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) {
return null;
}

    userProgress.addCredits(amount);
    const update = this.createProgressUpdate(userProgress);

    this.notifyListeners(userId, update);
    return update;
  }

  // Get progress statistics
  getProgressStatistics(userId: string): ProgressStatistics | null {
    const userProgress = this.getUserProgress(userId);
    return userProgress ? userProgress.toStatistics() : null;
  }

  // Get level information
  getLevelInfo(userId: string, _level?: number): LevelRequirements | null {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) {
return null;
}

    // const _targetLevel = level || userProgress.level; // TODO: Use in future implementation
    return userProgress.getCurrentLevelInfo();
  }

  // Get next level information
  getNextLevelInfo(userId: string): LevelRequirements | null {
    const userProgress = this.getUserProgress(userId);
    return userProgress ? userProgress.getNextLevelInfo() : null;
  }

  // Get experience to next level
  getExperienceToNextLevel(userId: string): number {
    const userProgress = this.getUserProgress(userId);
    return userProgress ? userProgress.getExperienceToNextLevel() : 0;
  }

  // Get level progress percentage
  getLevelProgress(userId: string): number {
    const userProgress = this.getUserProgress(userId);
    return userProgress ? userProgress.getLevelProgress() : 0;
  }

  // Event listeners
  addProgressListener(userId: string, callback: (update: ProgressUpdate) => void): void {
    if (!this.eventListeners.has(userId)) {
      this.eventListeners.set(userId, []);
    }
    this.eventListeners.get(userId)!.push(callback);
  }

  removeProgressListener(userId: string, callback: (update: ProgressUpdate) => void): void {
    const listeners = this.eventListeners.get(userId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private methods
  private createProgressUpdate(
    userProgress: UserProgress,
    leveledUp: boolean = false,
    newLevel?: number
  ): ProgressUpdate {
    const levelInfo = leveledUp && newLevel ? userProgress.getCurrentLevelInfo() : null;

    return {
      userId: userProgress.userId,
      level: userProgress.level,
      experience: userProgress.experience,
      totalExperience: userProgress.totalExperience,
      credits: userProgress.credits,
      leveledUp,
      newLevel,
      rewards: levelInfo ? levelInfo.rewards : undefined
    };
  }

  private notifyListeners(userId: string, update: ProgressUpdate): void {
    const listeners = this.eventListeners.get(userId);
    if (listeners) {
      listeners.forEach(callback => callback(update));
    }
  }

  // Data persistence
  saveProgress(userId: string): UserProgressData | null {
    const userProgress = this.getUserProgress(userId);
    return userProgress ? userProgress.toData() : null;
  }

  loadProgress(userId: string, data: UserProgressData): UserProgress {
    const userProgress = new UserProgress(data);
    this.progressData.set(userId, userProgress);
    return userProgress;
  }

  // Bulk operations
  getAllProgress(): Map<string, UserProgress> {
    return new Map(this.progressData);
  }

  clearProgress(userId: string): boolean {
    return this.progressData.delete(userId);
  }

  // Leaderboard data
  getLeaderboardData(limit: number = 10): Array<{
    userId: string;
    level: number;
    totalExperience: number;
    highestScore: number;
    projectsCompleted: number;
  }> {
    return Array.from(this.progressData.values())
      .sort((a, b) => b.totalExperience - a.totalExperience)
      .slice(0, limit)
      .map(progress => ({
        userId: progress.userId,
        level: progress.level,
        totalExperience: progress.totalExperience,
        highestScore: progress.highestScore,
        projectsCompleted: progress.projectsCompleted
      }));
  }

  // Progress analytics
  getProgressAnalytics(userId: string): {
    totalPlayTime: number;
    averageSessionTime: number;
    completionRate: number;
    accuracy: number;
    efficiency: number;
    levelProgress: number;
    experienceToNext: number;
    rank: number;
  } | null {
    const userProgress = this.getUserProgress(userId);
    if (!userProgress) {
return null;
}

    const statistics = userProgress.toStatistics();
    const leaderboard = this.getLeaderboardData();
    const rank = leaderboard.findIndex(entry => entry.userId === userId) + 1;

    return {
      totalPlayTime: userProgress.playTime,
      averageSessionTime: statistics.averageSessionTime,
      completionRate: statistics.completionRate,
      accuracy: statistics.accuracy,
      efficiency: statistics.efficiency,
      levelProgress: userProgress.getLevelProgress(),
      experienceToNext: userProgress.getExperienceToNextLevel(),
      rank: rank || leaderboard.length + 1
    };
  }
}

// Types are already exported above as interfaces
