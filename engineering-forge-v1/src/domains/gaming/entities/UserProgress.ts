/**
 * UserProgress Entity - Engineering Forge V1.0
 * /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/entities/UserProgress.ts
 *
 * User progress tracking entity with XP, leveling, and statistics
 */

export interface UserProgressData {
  userId: string;
  level: number;
  experience: number;
  totalExperience: number;
  credits: number;
  playTime: number;
  projectsCompleted: number;
  testsCompleted: number;
  componentsUnlocked: number;
  achievementsUnlocked: number;
  highestScore: number;
  averageScore: number;
  totalScore: number;
  sessionsPlayed: number;
  lastPlayed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressStatistics {
  averageSessionTime: number;
  completionRate: number;
  favoriteComponentType: string;
  mostPlayedLevel: string;
  streakDays: number;
  longestStreak: number;
  accuracy: number;
  efficiency: number;
}

export interface LevelRequirements {
  level: number;
  experienceRequired: number;
  title: string;
  description: string;
  rewards: {
    credits: number;
    components: string[];
    achievements: string[];
  };
}

export class UserProgress {
  private data: UserProgressData;
  private progressStats: ProgressStatistics;

  constructor(data: UserProgressData, statistics?: ProgressStatistics) {
    this.data = { ...data };
    this.progressStats = statistics || this.calculateStatistics();
  }

  // Getters
  get userId(): string {
    return this.data.userId;
  }
  get level(): number {
    return this.data.level;
  }
  get experience(): number {
    return this.data.experience;
  }
  get totalExperience(): number {
    return this.data.totalExperience;
  }
  get credits(): number {
    return this.data.credits;
  }
  get playTime(): number {
    return this.data.playTime;
  }
  get projectsCompleted(): number {
    return this.data.projectsCompleted;
  }
  get testsCompleted(): number {
    return this.data.testsCompleted;
  }
  get componentsUnlocked(): number {
    return this.data.componentsUnlocked;
  }
  get achievementsUnlocked(): number {
    return this.data.achievementsUnlocked;
  }
  get highestScore(): number {
    return this.data.highestScore;
  }
  get averageScore(): number {
    return this.data.averageScore;
  }
  get totalScore(): number {
    return this.data.totalScore;
  }
  get sessionsPlayed(): number {
    return this.data.sessionsPlayed;
  }
  get lastPlayed(): Date {
    return this.data.lastPlayed;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }
  get statistics(): ProgressStatistics {
    return this.statistics;
  }

  // Experience and Leveling
  addExperience(amount: number): { leveledUp: boolean; newLevel: number } {
    const oldLevel = this.data.level;
    this.data.totalExperience += amount;
    this.data.experience += amount;

    const newLevel = this.calculateLevel(this.data.totalExperience);
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      this.data.level = newLevel;
      // Grant level-up rewards
      this.grantLevelRewards(newLevel);
    }

    this.data.updatedAt = new Date();
    this.progressStats = this.calculateStatistics();

    return { leveledUp, newLevel };
  }

  private calculateLevel(totalExperience: number): number {
    // Level formula: level = floor(sqrt(totalXP / 100))
    return Math.floor(Math.sqrt(totalExperience / 100)) + 1;
  }

  private grantLevelRewards(level: number): void {
    const requirements = this.getLevelRequirements(level);
    if (requirements) {
      this.data.credits += requirements.rewards.credits;
    }
  }

  private getLevelRequirements(level: number): LevelRequirements | null {
    const requirements: LevelRequirements[] = [
      {
        level: 1,
        experienceRequired: 0,
        title: 'Novice Engineer',
        description: 'Just getting started',
        rewards: { credits: 100, components: [], achievements: [] }
      },
      {
        level: 2,
        experienceRequired: 100,
        title: 'Apprentice Engineer',
        description: 'Learning the basics',
        rewards: { credits: 200, components: ['basic-wheel'], achievements: [] }
      },
      {
        level: 3,
        experienceRequired: 400,
        title: 'Junior Engineer',
        description: 'Building confidence',
        rewards: { credits: 300, components: ['advanced-wheel'], achievements: [] }
      },
      {
        level: 4,
        experienceRequired: 900,
        title: 'Engineer',
        description: 'Solid understanding',
        rewards: { credits: 500, components: ['basic-engine'], achievements: [] }
      },
      {
        level: 5,
        experienceRequired: 1600,
        title: 'Senior Engineer',
        description: 'Expert level',
        rewards: { credits: 750, components: ['advanced-engine'], achievements: [] }
      },
      {
        level: 10,
        experienceRequired: 8100,
        title: 'Master Engineer',
        description: 'True mastery',
        rewards: { credits: 1500, components: ['premium-engine'], achievements: ['level-master'] }
      },
      {
        level: 15,
        experienceRequired: 22500,
        title: 'Principal Engineer',
        description: 'Industry leader',
        rewards: {
          credits: 2500,
          components: ['legendary-engine'],
          achievements: ['legendary-engineer']
        }
      },
      {
        level: 20,
        experienceRequired: 40000,
        title: 'Chief Engineer',
        description: 'Engineering legend',
        rewards: {
          credits: 5000,
          components: ['mythical-engine'],
          achievements: ['engineering-legend']
        }
      }
    ];

    return requirements.find(req => req.level === level) || null;
  }

  // Statistics
  private calculateStatistics(): ProgressStatistics {
    const averageSessionTime =
      this.data.sessionsPlayed > 0 ? this.data.playTime / this.data.sessionsPlayed : 0;
    const completionRate =
      this.data.testsCompleted > 0
        ? (this.data.projectsCompleted / this.data.testsCompleted) * 100
        : 0;
    const accuracy = this.data.testsCompleted > 0 ? (this.data.averageScore / 100) * 100 : 0;
    const efficiency =
      this.data.playTime > 0 ? (this.data.totalScore / this.data.playTime) * 1000 : 0; // Score per minute

    return {
      averageSessionTime,
      completionRate,
      favoriteComponentType: 'engine', // TODO: Calculate from actual data
      mostPlayedLevel: 'beginner', // TODO: Calculate from actual data
      streakDays: 0, // TODO: Calculate from session data
      longestStreak: 0, // TODO: Calculate from session data
      accuracy,
      efficiency
    };
  }

  // Game Actions
  completeProject(score: number, playTime: number): void {
    this.data.projectsCompleted++;
    this.data.playTime += playTime;
    this.data.totalScore += score;

    if (score > this.data.highestScore) {
      this.data.highestScore = score;
    }

    this.data.averageScore = this.data.totalScore / this.data.projectsCompleted;
    this.data.updatedAt = new Date();
    this.progressStats = this.calculateStatistics();

    // Grant XP for project completion
    const xpGain = Math.floor(score / 10) + 50; // Base XP + score bonus
    this.addExperience(xpGain);
  }

  completeTest(score: number, playTime: number): void {
    this.data.testsCompleted++;
    this.data.playTime += playTime;
    this.data.totalScore += score;

    if (score > this.data.highestScore) {
      this.data.highestScore = score;
    }

    this.data.averageScore = this.data.totalScore / this.data.testsCompleted;
    this.data.updatedAt = new Date();
    this.progressStats = this.calculateStatistics();

    // Grant XP for test completion
    const xpGain = Math.floor(score / 20) + 25; // Base XP + score bonus
    this.addExperience(xpGain);
  }

  unlockComponent(): void {
    this.data.componentsUnlocked++;
    this.data.updatedAt = new Date();
    this.progressStats = this.calculateStatistics();

    // Grant XP for component unlock
    this.addExperience(10);
  }

  unlockAchievement(): void {
    this.data.achievementsUnlocked++;
    this.data.updatedAt = new Date();
    this.progressStats = this.calculateStatistics();

    // Grant XP for achievement unlock
    this.addExperience(25);
  }

  startSession(): void {
    this.data.sessionsPlayed++;
    this.data.lastPlayed = new Date();
    this.data.updatedAt = new Date();
  }

  spendCredits(amount: number): boolean {
    if (this.data.credits >= amount) {
      this.data.credits -= amount;
      this.data.updatedAt = new Date();
      return true;
    }
    return false;
  }

  addCredits(amount: number): void {
    this.data.credits += amount;
    this.data.updatedAt = new Date();
  }

  // Data export
  toData(): UserProgressData {
    return { ...this.data };
  }

  toStatistics(): ProgressStatistics {
    return { ...this.progressStats };
  }

  // Level information
  getCurrentLevelInfo(): LevelRequirements | null {
    return this.getLevelRequirements(this.data.level);
  }

  getNextLevelInfo(): LevelRequirements | null {
    return this.getLevelRequirements(this.data.level + 1);
  }

  getExperienceToNextLevel(): number {
    const nextLevel = this.getNextLevelInfo();
    if (!nextLevel) return 0;
    return nextLevel.experienceRequired - this.data.totalExperience;
  }

  getLevelProgress(): number {
    const currentLevel = this.getCurrentLevelInfo();
    const nextLevel = this.getNextLevelInfo();

    if (!currentLevel || !nextLevel) return 100;

    const currentXP = this.data.totalExperience - currentLevel.experienceRequired;
    const levelXP = nextLevel.experienceRequired - currentLevel.experienceRequired;

    return (currentXP / levelXP) * 100;
  }
}

// Types are already exported above as interfaces
