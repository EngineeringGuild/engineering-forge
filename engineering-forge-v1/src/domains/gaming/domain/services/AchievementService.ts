// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/services/AchievementService.ts

import { Achievement, AchievementCategory, AchievementType } from '../entities/Achievement';

export interface GameEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  requirements: Array<{
    type: string;
    currentValue: number;
    targetValue: number;
    description: string;
  }>;
}

export class AchievementService {
  private achievements: Achievement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  public getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(achievement => achievement.category === category);
  }

  public getAchievementsByType(type: AchievementType): Achievement[] {
    return this.achievements.filter(achievement => achievement.type === type);
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(achievement => achievement.isUnlocked);
  }

  public getLockedAchievements(): Achievement[] {
    return this.achievements.filter(achievement => !achievement.isUnlocked);
  }

  public getAchievementProgress(achievementId: string): AchievementProgress | null {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return null;
    }

    return {
      achievementId: achievement.id,
      progress: achievement.progress,
      requirements: achievement.requirements.map(req => ({
        type: req.type,
        currentValue: req.currentValue || 0,
        targetValue: req.value,
        description: req.description
      }))
    };
  }

  public processGameEvent(event: GameEvent): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.isUnlocked) {
        continue; // Skip already unlocked achievements
      }

      const wasUnlocked = this.updateAchievementProgress(achievement, event);
      if (wasUnlocked) {
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  private updateAchievementProgress(achievement: Achievement, event: GameEvent): boolean {
    let progressUpdated = false;

    for (let i = 0; i < achievement.requirements.length; i++) {
      const requirement = achievement.requirements[i];
      const currentValue = requirement.currentValue || 0;
      let newValue = currentValue;

      // Update progress based on event type
      switch (requirement.type) {
        case 'components_added':
          if (event.type === 'component_added') {
            newValue = currentValue + 1;
            progressUpdated = true;
          }
          break;

        case 'projects_completed':
          if (event.type === 'project_completed') {
            newValue = currentValue + 1;
            progressUpdated = true;
          }
          break;

        case 'tests_passed':
          if (event.type === 'test_completed' && event.data.passed) {
            newValue = currentValue + 1;
            progressUpdated = true;
          }
          break;

        case 'high_performance_score':
          if (event.type === 'test_completed' && event.data.score >= requirement.value) {
            newValue = Math.max(currentValue, event.data.score);
            progressUpdated = true;
          }
          break;

        case 'fast_acceleration':
          if (
            event.type === 'test_completed' &&
            event.data.performance?.acceleration <= requirement.value
          ) {
            newValue = Math.min(currentValue || 999, event.data.performance.acceleration);
            progressUpdated = true;
          }
          break;

        case 'high_top_speed':
          if (
            event.type === 'test_completed' &&
            event.data.performance?.topSpeed >= requirement.value
          ) {
            newValue = Math.max(currentValue, event.data.performance.topSpeed);
            progressUpdated = true;
          }
          break;

        case 'perfect_handling':
          if (
            event.type === 'test_completed' &&
            event.data.performance?.handling >= requirement.value
          ) {
            newValue = Math.max(currentValue, event.data.performance.handling);
            progressUpdated = true;
          }
          break;

        case 'efficient_design':
          if (
            event.type === 'test_completed' &&
            event.data.performance?.fuelEfficiency >= requirement.value
          ) {
            newValue = Math.max(currentValue, event.data.performance.fuelEfficiency);
            progressUpdated = true;
          }
          break;

        case 'total_score':
          if (event.type === 'score_updated') {
            newValue = Math.max(currentValue, event.data.totalScore);
            progressUpdated = true;
          }
          break;

        case 'level_reached':
          if (event.type === 'level_up' && event.data.level >= requirement.value) {
            newValue = Math.max(currentValue, event.data.level);
            progressUpdated = true;
          }
          break;

        case 'consecutive_tests':
          if (event.type === 'test_completed' && event.data.passed) {
            newValue = currentValue + 1;
            progressUpdated = true;
          } else if (event.type === 'test_completed' && !event.data.passed) {
            newValue = 0; // Reset consecutive count
            progressUpdated = true;
          }
          break;
      }

      if (progressUpdated && newValue !== currentValue) {
        achievement.updateRequirementProgress(i, newValue);
      }
    }

    // Check if achievement can be unlocked
    if (achievement.canBeUnlocked()) {
      achievement.unlock();
      return true;
    }

    return false;
  }

  private initializeAchievements(): void {
    this.achievements = [
      // Builder Achievements
      new Achievement('first_component', {
        title: 'First Steps',
        description: 'Add your first component to a project',
        type: 'completion',
        category: 'builder',
        icon: '🔧',
        points: 10,
        rarity: 'common',
        requirements: [{ type: 'components_added', value: 1, description: 'Add 1 component' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 25, credits: 50 }
      }),

      new Achievement('component_master', {
        title: 'Component Master',
        description: 'Add 50 components to your projects',
        type: 'completion',
        category: 'builder',
        icon: '🏗️',
        points: 50,
        rarity: 'rare',
        requirements: [{ type: 'components_added', value: 50, description: 'Add 50 components' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 100, credits: 200 }
      }),

      // Engineer Achievements
      new Achievement('first_project', {
        title: 'Project Builder',
        description: 'Complete your first project',
        type: 'completion',
        category: 'engineer',
        icon: '🚗',
        points: 25,
        rarity: 'common',
        requirements: [{ type: 'projects_completed', value: 1, description: 'Complete 1 project' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 50, credits: 100 }
      }),

      new Achievement('project_engineer', {
        title: 'Project Engineer',
        description: 'Complete 10 projects',
        type: 'completion',
        category: 'engineer',
        icon: '⚙️',
        points: 100,
        rarity: 'epic',
        requirements: [
          { type: 'projects_completed', value: 10, description: 'Complete 10 projects' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 200, credits: 500 }
      }),

      // Speedster Achievements
      new Achievement('speed_demon', {
        title: 'Speed Demon',
        description: 'Achieve a top speed of 200 km/h or more',
        type: 'performance',
        category: 'speedster',
        icon: '⚡',
        points: 75,
        rarity: 'rare',
        requirements: [
          { type: 'high_top_speed', value: 200, description: 'Reach 200 km/h top speed' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 150, credits: 300 }
      }),

      new Achievement('lightning_fast', {
        title: 'Lightning Fast',
        description: 'Achieve 0-100 km/h acceleration in under 5 seconds',
        type: 'performance',
        category: 'speedster',
        icon: '🌩️',
        points: 100,
        rarity: 'epic',
        requirements: [
          { type: 'fast_acceleration', value: 5, description: '0-100 km/h in under 5 seconds' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 250, credits: 500 }
      }),

      // Perfectionist Achievements
      new Achievement('perfect_handling', {
        title: 'Perfect Handling',
        description: 'Achieve 90+ handling rating',
        type: 'performance',
        category: 'perfectionist',
        icon: '🎯',
        points: 80,
        rarity: 'rare',
        requirements: [
          { type: 'perfect_handling', value: 90, description: 'Achieve 90+ handling rating' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 160, credits: 320 }
      }),

      new Achievement('efficiency_expert', {
        title: 'Efficiency Expert',
        description: 'Achieve 15+ km/l fuel efficiency',
        type: 'efficiency',
        category: 'perfectionist',
        icon: '🌱',
        points: 60,
        rarity: 'rare',
        requirements: [
          { type: 'efficient_design', value: 15, description: 'Achieve 15+ km/l efficiency' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 120, credits: 240 }
      }),

      // Explorer Achievements
      new Achievement('test_explorer', {
        title: 'Test Explorer',
        description: 'Complete your first test',
        type: 'completion',
        category: 'explorer',
        icon: '🧪',
        points: 15,
        rarity: 'common',
        requirements: [{ type: 'tests_passed', value: 1, description: 'Complete 1 test' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 30, credits: 60 }
      }),

      new Achievement('test_master', {
        title: 'Test Master',
        description: 'Pass 25 tests',
        type: 'completion',
        category: 'explorer',
        icon: '🏆',
        points: 150,
        rarity: 'legendary',
        requirements: [{ type: 'tests_passed', value: 25, description: 'Pass 25 tests' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 300, credits: 750, title: 'Test Master' }
      }),

      // Collector Achievements
      new Achievement('component_collector', {
        title: 'Component Collector',
        description: 'Unlock 20 different components',
        type: 'collection',
        category: 'collector',
        icon: '📦',
        points: 90,
        rarity: 'epic',
        requirements: [
          { type: 'components_unlocked', value: 20, description: 'Unlock 20 components' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 180, credits: 450 }
      }),

      // Social Achievements
      new Achievement('high_scorer', {
        title: 'High Scorer',
        description: 'Reach a total score of 1000 points',
        type: 'performance',
        category: 'social',
        icon: '⭐',
        points: 120,
        rarity: 'epic',
        requirements: [{ type: 'total_score', value: 1000, description: 'Reach 1000 total score' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 240, credits: 600 }
      }),

      new Achievement('level_master', {
        title: 'Level Master',
        description: 'Reach level 10',
        type: 'completion',
        category: 'social',
        icon: '🎖️',
        points: 200,
        rarity: 'legendary',
        requirements: [{ type: 'level_reached', value: 10, description: 'Reach level 10' }],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 400, credits: 1000, title: 'Level Master' }
      }),

      // Special Achievements
      new Achievement('consecutive_success', {
        title: 'Consecutive Success',
        description: 'Pass 5 tests in a row',
        type: 'performance',
        category: 'perfectionist',
        icon: '🔥',
        points: 100,
        rarity: 'epic',
        requirements: [
          { type: 'consecutive_tests', value: 5, description: 'Pass 5 tests in a row' }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 200, credits: 500 }
      }),

      new Achievement('perfect_score', {
        title: 'Perfect Score',
        description: 'Achieve a perfect test score of 100',
        type: 'performance',
        category: 'perfectionist',
        icon: '💯',
        points: 150,
        rarity: 'legendary',
        requirements: [
          {
            type: 'high_performance_score',
            value: 100,
            description: 'Achieve perfect score of 100'
          }
        ],
        isUnlocked: false,
        progress: 0,
        rewards: { xp: 300, credits: 750, title: 'Perfect Engineer' }
      })
    ];
  }
}
