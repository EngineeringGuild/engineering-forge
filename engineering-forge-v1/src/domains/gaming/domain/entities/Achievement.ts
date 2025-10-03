// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/Achievement.ts

export interface AchievementProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly rarity: AchievementRarity;
  readonly requirements: AchievementRequirements;
  readonly rewards: AchievementRewards;
  readonly unlockedAt?: Date;
  readonly progress: number; // 0-100
  readonly isUnlocked: boolean;
  readonly isHidden: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type AchievementCategory =
  | "construction"
  | "performance"
  | "testing"
  | "exploration"
  | "mastery"
  | "special";

export type AchievementRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export interface AchievementRequirements {
  readonly type:
    | "component_count"
    | "performance_score"
    | "test_count"
    | "level"
    | "custom";
  readonly target: number;
  readonly description: string;
  readonly conditions?: Record<string, unknown>;
}

export interface AchievementRewards {
  readonly xp: number;
  readonly credits: number;
  readonly title?: string;
  readonly badge?: string;
  readonly unlockComponent?: string;
  readonly customReward?: string;
}

export class Achievement {
  private readonly props: AchievementProps;

  private constructor(props: AchievementProps) {
    this.props = props;
  }

  public static create(
    props: Omit<AchievementProps, "id" | "createdAt" | "updatedAt">
  ): Achievement {
    this.validateAchievement(props);

    const now = new Date();
    return new Achievement({
      ...props,
      id: `achievement_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(props: AchievementProps): Achievement {
    return new Achievement(props);
  }

  private static validateAchievement(
    props: Omit<AchievementProps, "id" | "createdAt" | "updatedAt">
  ): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Achievement title is required");
    }

    if (props.title.length > 100) {
      throw new Error("Achievement title must be less than 100 characters");
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new Error("Achievement description is required");
    }

    if (props.description.length > 500) {
      throw new Error(
        "Achievement description must be less than 500 characters"
      );
    }

    if (!props.icon || props.icon.trim().length === 0) {
      throw new Error("Achievement icon is required");
    }

    if (
      ![
        "construction",
        "performance",
        "testing",
        "exploration",
        "mastery",
        "special",
      ].includes(props.category)
    ) {
      throw new Error("Invalid achievement category");
    }

    if (
      !["common", "rare", "epic", "legendary", "mythic"].includes(props.rarity)
    ) {
      throw new Error("Invalid achievement rarity");
    }

    if (props.progress < 0 || props.progress > 100) {
      throw new Error("Achievement progress must be between 0 and 100");
    }

    if (props.rewards.xp < 0) {
      throw new Error("Achievement XP reward must be non-negative");
    }

    if (props.rewards.credits < 0) {
      throw new Error("Achievement credits reward must be non-negative");
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get icon(): string {
    return this.props.icon;
  }

  get category(): AchievementCategory {
    return this.props.category;
  }

  get rarity(): AchievementRarity {
    return this.props.rarity;
  }

  get requirements(): AchievementRequirements {
    return { ...this.props.requirements };
  }

  get rewards(): AchievementRewards {
    return { ...this.props.rewards };
  }

  get unlockedAt(): Date | undefined {
    return this.props.unlockedAt;
  }

  get progress(): number {
    return this.props.progress;
  }

  get isUnlocked(): boolean {
    return this.props.isUnlocked;
  }

  get isHidden(): boolean {
    return this.props.isHidden;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Computed properties for UI
  get points(): number {
    return this.props.rewards.xp;
  }

  // Business Methods
  /**
   * Update achievement progress
   */
  updateProgress(progress: number): Achievement {
    if (progress < 0 || progress > 100) {
      throw new Error("Progress must be between 0 and 100");
    }

    const newProgress = Math.min(progress, 100);
    const isUnlocked = newProgress >= 100 && !this.props.isUnlocked;
    const unlockedAt = isUnlocked ? new Date() : this.props.unlockedAt;

    return new Achievement({
      ...this.props,
      progress: newProgress,
      isUnlocked: isUnlocked || this.props.isUnlocked,
      unlockedAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Unlock achievement
   */
  unlock(): Achievement {
    if (this.props.isUnlocked) {
      return this;
    }

    return new Achievement({
      ...this.props,
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Check if achievement can be unlocked
   */
  canBeUnlocked(): boolean {
    return this.props.progress >= 100 && !this.props.isUnlocked;
  }

  /**
   * Get progress percentage for display
   */
  getProgressPercentage(): number {
    return Math.round(this.props.progress);
  }

  /**
   * Get rarity color for UI
   */
  getRarityColor(): string {
    const colors: Record<AchievementRarity, string> = {
      common: "#9CA3AF", // Gray
      rare: "#3B82F6", // Blue
      epic: "#8B5CF6", // Purple
      legendary: "#F59E0B", // Gold
      mythic: "#EF4444", // Red
    };
    return colors[this.props.rarity];
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(): string {
    const names: Record<AchievementCategory, string> = {
      construction: "Construction",
      performance: "Performance",
      testing: "Testing",
      exploration: "Exploration",
      mastery: "Mastery",
      special: "Special",
    };
    return names[this.props.category];
  }

  /**
   * Get rarity display name
   */
  getRarityName(): string {
    const names: Record<AchievementRarity, string> = {
      common: "Common",
      rare: "Rare",
      epic: "Epic",
      legendary: "Legendary",
      mythic: "Mythic",
    };
    return names[this.props.rarity];
  }

  /**
   * Check if achievement is visible to user
   */
  isVisible(): boolean {
    return !this.props.isHidden || this.props.isUnlocked;
  }

  /**
   * Get formatted unlock date
   */
  getFormattedUnlockDate(): string | null {
    if (!this.props.unlockedAt) return null;
    return this.props.unlockedAt.toLocaleDateString();
  }

  /**
   * Get progress text for display
   */
  getProgressText(): string {
    if (this.props.isUnlocked) {
      return "Unlocked";
    }

    const percentage = this.getProgressPercentage();
    return `${percentage}% complete`;
  }

  /**
   * Clone achievement with updated properties
   */
  clone(
    updates: Partial<Omit<AchievementProps, "id" | "createdAt">>
  ): Achievement {
    return new Achievement({
      ...this.props,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Convert to plain object
   */
  toJSON(): AchievementProps {
    return { ...this.props };
  }

  /**
   * Create from plain object
   */
  static fromJSON(props: AchievementProps): Achievement {
    return new Achievement(props);
  }
}
