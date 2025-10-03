// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/factories/AchievementFactory.ts

import {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  AchievementRequirements,
  AchievementRewards,
} from "../entities/Achievement";

export interface AchievementTemplate {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly rarity: AchievementRarity;
  readonly requirements: AchievementRequirements;
  readonly rewards: AchievementRewards;
  readonly isHidden?: boolean;
}

export class AchievementFactory {
  /**
   * Create achievement from template
   */
  public static createFromTemplate(template: AchievementTemplate): Achievement {
    return Achievement.create({
      title: template.title,
      description: template.description,
      icon: template.icon,
      category: template.category,
      rarity: template.rarity,
      requirements: template.requirements,
      rewards: template.rewards,
      progress: 0,
      isUnlocked: false,
      isHidden: template.isHidden || false,
    });
  }

  /**
   * Create construction achievements
   */
  public static createConstructionAchievements(): Achievement[] {
    const templates: AchievementTemplate[] = [
      {
        title: "First Steps",
        description: "Add your first component to the workspace",
        icon: "🔧",
        category: "construction",
        rarity: "common",
        requirements: {
          type: "component_count",
          target: 1,
          description: "Add 1 component to workspace",
        },
        rewards: {
          xp: 100,
          credits: 50,
        },
      },
      {
        title: "Car Builder",
        description: "Complete your first car (chassis + engine + wheels)",
        icon: "🚗",
        category: "construction",
        rarity: "rare",
        requirements: {
          type: "component_count",
          target: 3,
          description: "Add chassis, engine, and wheels to workspace",
        },
        rewards: {
          xp: 500,
          credits: 200,
          title: "Car Builder",
        },
      },
      {
        title: "Master Engineer",
        description: "Build a car with 10 or more components",
        icon: "⚙️",
        category: "construction",
        rarity: "epic",
        requirements: {
          type: "component_count",
          target: 10,
          description: "Add 10 components to workspace",
        },
        rewards: {
          xp: 1000,
          credits: 500,
          title: "Master Engineer",
        },
      },
    ];

    return templates.map((template) => this.createFromTemplate(template));
  }

  /**
   * Create performance achievements
   */
  public static createPerformanceAchievements(): Achievement[] {
    const templates: AchievementTemplate[] = [
      {
        title: "Speed Demon",
        description: "Achieve a top speed of 200 km/h or higher",
        icon: "🏎️",
        category: "performance",
        rarity: "rare",
        requirements: {
          type: "performance_score",
          target: 200,
          description: "Achieve 200+ km/h top speed",
        },
        rewards: {
          xp: 750,
          credits: 300,
        },
      },
      {
        title: "Efficiency Expert",
        description: "Achieve a fuel efficiency score of 90+",
        icon: "⛽",
        category: "performance",
        rarity: "epic",
        requirements: {
          type: "performance_score",
          target: 90,
          description: "Achieve 90+ fuel efficiency",
        },
        rewards: {
          xp: 1200,
          credits: 600,
          title: "Efficiency Expert",
        },
      },
      {
        title: "Perfect Build",
        description: "Achieve a perfect score of 100/100",
        icon: "💯",
        category: "performance",
        rarity: "legendary",
        requirements: {
          type: "performance_score",
          target: 100,
          description: "Achieve perfect 100/100 score",
        },
        rewards: {
          xp: 2000,
          credits: 1000,
          title: "Perfect Builder",
        },
      },
    ];

    return templates.map((template) => this.createFromTemplate(template));
  }

  /**
   * Create testing achievements
   */
  public static createTestingAchievements(): Achievement[] {
    const templates: AchievementTemplate[] = [
      {
        title: "Test Runner",
        description: "Run your first performance test",
        icon: "🧪",
        category: "testing",
        rarity: "common",
        requirements: {
          type: "test_count",
          target: 1,
          description: "Run 1 performance test",
        },
        rewards: {
          xp: 200,
          credits: 100,
        },
      },
      {
        title: "Lab Rat",
        description: "Run 10 performance tests",
        icon: "🔬",
        category: "testing",
        rarity: "rare",
        requirements: {
          type: "test_count",
          target: 10,
          description: "Run 10 performance tests",
        },
        rewards: {
          xp: 800,
          credits: 400,
          title: "Lab Rat",
        },
      },
      {
        title: "Test Master",
        description: "Run 50 performance tests",
        icon: "🎯",
        category: "testing",
        rarity: "epic",
        requirements: {
          type: "test_count",
          target: 50,
          description: "Run 50 performance tests",
        },
        rewards: {
          xp: 1500,
          credits: 750,
          title: "Test Master",
        },
      },
    ];

    return templates.map((template) => this.createFromTemplate(template));
  }

  /**
   * Create exploration achievements
   */
  public static createExplorationAchievements(): Achievement[] {
    const templates: AchievementTemplate[] = [
      {
        title: "Explorer",
        description: "Try all component categories",
        icon: "🗺️",
        category: "exploration",
        rarity: "rare",
        requirements: {
          type: "custom",
          target: 1,
          description: "Use components from all categories",
          conditions: {
            categories: [
              "mechanical",
              "electrical",
              "structural",
              "aerodynamic",
            ],
          },
        },
        rewards: {
          xp: 600,
          credits: 300,
        },
      },
      {
        title: "Collector",
        description: "Unlock all common components",
        icon: "📦",
        category: "exploration",
        rarity: "epic",
        requirements: {
          type: "custom",
          target: 1,
          description: "Unlock all common rarity components",
          conditions: { rarity: "common", unlockAll: true },
        },
        rewards: {
          xp: 1000,
          credits: 500,
          title: "Collector",
        },
      },
    ];

    return templates.map((template) => this.createFromTemplate(template));
  }

  /**
   * Create mastery achievements
   */
  public static createMasteryAchievements(): Achievement[] {
    const templates: AchievementTemplate[] = [
      {
        title: "Rising Star",
        description: "Reach level 10",
        icon: "⭐",
        category: "mastery",
        rarity: "rare",
        requirements: {
          type: "level",
          target: 10,
          description: "Reach level 10",
        },
        rewards: {
          xp: 500,
          credits: 250,
          title: "Rising Star",
        },
      },
      {
        title: "Expert",
        description: "Reach level 25",
        icon: "🌟",
        category: "mastery",
        rarity: "epic",
        requirements: {
          type: "level",
          target: 25,
          description: "Reach level 25",
        },
        rewards: {
          xp: 1500,
          credits: 750,
          title: "Expert",
        },
      },
      {
        title: "Master",
        description: "Reach level 50",
        icon: "👑",
        category: "mastery",
        rarity: "legendary",
        requirements: {
          type: "level",
          target: 50,
          description: "Reach level 50",
        },
        rewards: {
          xp: 3000,
          credits: 1500,
          title: "Master Engineer",
        },
      },
    ];

    return templates.map((template) => this.createFromTemplate(template));
  }

  /**
   * Create all default achievements
   */
  public static createAllDefaultAchievements(): Achievement[] {
    return [
      ...this.createConstructionAchievements(),
      ...this.createPerformanceAchievements(),
      ...this.createTestingAchievements(),
      ...this.createExplorationAchievements(),
      ...this.createMasteryAchievements(),
    ];
  }
}
