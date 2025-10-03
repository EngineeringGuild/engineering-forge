// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/AchievementService.ts

import { Achievement, AchievementCategory } from "../entities/Achievement";
import { AchievementFactory } from "../factories/AchievementFactory";

export interface GameEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  requirements: {
    type: string;
    currentValue: number;
    targetValue: number;
    description: string;
  };
}

export class AchievementService {
  private achievements: Achievement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  public getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getAchievementsByCategory(
    category: AchievementCategory
  ): Achievement[] {
    return this.achievements.filter(
      (achievement) => achievement.category === category
    );
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((achievement) => achievement.isUnlocked);
  }

  public getLockedAchievements(): Achievement[] {
    return this.achievements.filter((achievement) => !achievement.isUnlocked);
  }

  public getAchievementProgress(
    achievementId: string
  ): AchievementProgress | null {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement) return null;

    return {
      achievementId: achievement.id,
      progress: achievement.progress,
      requirements: {
        type: achievement.requirements.type,
        currentValue: achievement.progress,
        targetValue: achievement.requirements.target,
        description: achievement.requirements.description,
      },
    };
  }

  public updateAchievementProgress(
    achievementId: string,
    progress: number
  ): Achievement | null {
    const achievementIndex = this.achievements.findIndex(
      (a) => a.id === achievementId
    );
    if (achievementIndex === -1) return null;

    const achievement = this.achievements[achievementIndex];
    const updatedAchievement = achievement.updateProgress(progress);
    this.achievements[achievementIndex] = updatedAchievement;

    return updatedAchievement;
  }

  public unlockAchievement(achievementId: string): Achievement | null {
    const achievementIndex = this.achievements.findIndex(
      (a) => a.id === achievementId
    );
    if (achievementIndex === -1) return null;

    const achievement = this.achievements[achievementIndex];
    const unlockedAchievement = achievement.unlock();
    this.achievements[achievementIndex] = unlockedAchievement;

    return unlockedAchievement;
  }

  public processGameEvent(event: GameEvent): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (let i = 0; i < this.achievements.length; i++) {
      const achievement = this.achievements[i];

      if (achievement.isUnlocked) continue;

      const newProgress = this.calculateProgressForEvent(achievement, event);
      if (newProgress > achievement.progress) {
        const updatedAchievement = achievement.updateProgress(newProgress);
        this.achievements[i] = updatedAchievement;

        if (updatedAchievement.isUnlocked) {
          unlockedAchievements.push(updatedAchievement);
        }
      }
    }

    return unlockedAchievements;
  }

  private calculateProgressForEvent(
    achievement: Achievement,
    event: GameEvent
  ): number {
    const { requirements } = achievement;
    let progress = achievement.progress;

    switch (requirements.type) {
      case "component_count":
        if (event.type === "component_added") {
          const currentCount = event.data.totalComponents || 0;
          progress = Math.min((currentCount / requirements.target) * 100, 100);
        }
        break;

      case "performance_score":
        if (event.type === "simulation_completed") {
          const score = event.data.score || 0;
          if (score >= requirements.target) {
            progress = 100;
          } else {
            progress = Math.min((score / requirements.target) * 100, 100);
          }
        }
        break;

      case "test_count":
        if (event.type === "test_completed") {
          const testCount = event.data.totalTests || 0;
          progress = Math.min((testCount / requirements.target) * 100, 100);
        }
        break;

      case "level":
        if (event.type === "level_up") {
          const level = event.data.level || 0;
          if (level >= requirements.target) {
            progress = 100;
          } else {
            progress = Math.min((level / requirements.target) * 100, 100);
          }
        }
        break;

      case "custom":
        // Handle custom requirements based on conditions
        if (this.checkCustomRequirement(achievement, event)) {
          progress = 100;
        }
        break;
    }

    return Math.max(progress, achievement.progress);
  }

  private checkCustomRequirement(
    achievement: Achievement,
    event: GameEvent
  ): boolean {
    const { conditions } = achievement.requirements;
    if (!conditions) return false;

    switch (achievement.id) {
      case "first_car":
        return (
          event.type === "simulation_completed" &&
          event.data.hasChassis &&
          event.data.hasEngine &&
          event.data.hasWheels
        );

      case "speed_demon":
        return (
          event.type === "simulation_completed" && event.data.maxSpeed >= 200
        );

      case "perfect_score":
        return event.type === "simulation_completed" && event.data.score >= 100;

      default:
        return false;
    }
  }

  private initializeAchievements(): void {
    // Create all default achievements using the factory
    this.achievements = AchievementFactory.createAllDefaultAchievements();
  }

  public getAchievementById(id: string): Achievement | null {
    return this.achievements.find((a) => a.id === id) || null;
  }

  public getAchievementsByRarity(rarity: string): Achievement[] {
    return this.achievements.filter(
      (achievement) => achievement.rarity === rarity
    );
  }

  public getAchievementStatistics(): {
    total: number;
    unlocked: number;
    locked: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const byRarity: Record<string, number> = {};
    let unlocked = 0;
    let locked = 0;

    this.achievements.forEach((achievement) => {
      // Count by category
      byCategory[achievement.category] =
        (byCategory[achievement.category] || 0) + 1;

      // Count by rarity
      byRarity[achievement.rarity] = (byRarity[achievement.rarity] || 0) + 1;

      // Count unlocked/locked
      if (achievement.isUnlocked) {
        unlocked++;
      } else {
        locked++;
      }
    });

    return {
      total: this.achievements.length,
      unlocked,
      locked,
      byCategory,
      byRarity,
    };
  }

  public resetAllAchievements(): void {
    this.achievements = AchievementFactory.createAllDefaultAchievements();
  }

  public exportAchievements(): string {
    return JSON.stringify(this.achievements.map((a) => a.toJSON()));
  }

  public importAchievements(data: string): void {
    try {
      const achievementsData = JSON.parse(data);
      this.achievements = achievementsData.map((props: any) =>
        Achievement.fromJSON(props)
      );
    } catch (error) {
      console.error("Failed to import achievements:", error);
    }
  }
}
