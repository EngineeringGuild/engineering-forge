// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/Achievement.ts

import { BaseEntity } from '../../../../shared/domain/BaseEntity';

export type AchievementType =
  | 'completion'
  | 'performance'
  | 'speed'
  | 'efficiency'
  | 'innovation'
  | 'collection'
  | 'social';
export type AchievementCategory =
  | 'builder'
  | 'engineer'
  | 'speedster'
  | 'perfectionist'
  | 'explorer'
  | 'collector'
  | 'social';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementRequirement {
  type: string;
  value: number;
  description: string;
  currentValue?: number;
}

export interface AchievementProps {
  title: string;
  description: string;
  type: AchievementType;
  category: AchievementCategory;
  icon: string;
  points: number;
  rarity: AchievementRarity;
  requirements: AchievementRequirement[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  rewards: {
    xp: number;
    credits: number;
    components?: string[];
    title?: string;
  };
}

export class Achievement extends BaseEntity<string> {
  private _title: string;
  private _description: string;
  private _type: AchievementType;
  private _category: AchievementCategory;
  private _icon: string;
  private _points: number;
  private _rarity: AchievementRarity;
  private _requirements: AchievementRequirement[];
  private _isUnlocked: boolean;
  private _unlockedAt?: Date;
  private _progress: number;
  private _rewards: AchievementProps['rewards'];

  constructor(id: string, props: AchievementProps) {
    super(id);
    this._title = props.title;
    this._description = props.description;
    this._type = props.type;
    this._category = props.category;
    this._icon = props.icon;
    this._points = props.points;
    this._rarity = props.rarity;
    this._requirements = [...props.requirements];
    this._isUnlocked = props.isUnlocked;
    this._unlockedAt = props.unlockedAt;
    this._progress = props.progress;
    this._rewards = props.rewards;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get type(): AchievementType {
    return this._type;
  }

  get category(): AchievementCategory {
    return this._category;
  }

  get icon(): string {
    return this._icon;
  }

  get points(): number {
    return this._points;
  }

  get rarity(): AchievementRarity {
    return this._rarity;
  }

  get requirements(): AchievementRequirement[] {
    return [...this._requirements];
  }

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  get unlockedAt(): Date | undefined {
    return this._unlockedAt;
  }

  get progress(): number {
    return this._progress;
  }

  get rewards(): AchievementProps['rewards'] {
    return this._rewards;
  }

  public unlock(): void {
    if (this._isUnlocked) {
      throw new Error('Achievement is already unlocked');
    }

    this._isUnlocked = true;
    this._unlockedAt = new Date();
    this._progress = 100;
    this.updateTimestamp();
  }

  public updateProgress(progress: number): void {
    if (this._isUnlocked) {
      return; // Don't update progress for unlocked achievements
    }

    this._progress = Math.max(0, Math.min(100, progress));
    this.updateTimestamp();
  }

  public updateRequirementProgress(requirementIndex: number, currentValue: number): void {
    if (this._isUnlocked) {
      return; // Don't update requirements for unlocked achievements
    }

    if (requirementIndex < 0 || requirementIndex >= this._requirements.length) {
      throw new Error('Invalid requirement index');
    }

    this._requirements[requirementIndex].currentValue = currentValue;
    this.calculateProgress();
    this.updateTimestamp();
  }

  private calculateProgress(): void {
    if (this._requirements.length === 0) {
      this._progress = 0;
      return;
    }

    let totalProgress = 0;
    for (const requirement of this._requirements) {
      const currentValue = requirement.currentValue || 0;
      const progress = Math.min(100, (currentValue / requirement.value) * 100);
      totalProgress += progress;
    }

    this._progress = totalProgress / this._requirements.length;
  }

  public canBeUnlocked(): boolean {
    if (this._isUnlocked) {
      return false;
    }

    for (const requirement of this._requirements) {
      const currentValue = requirement.currentValue || 0;
      if (currentValue < requirement.value) {
        return false;
      }
    }

    return true;
  }

  public getProgressText(): string {
    if (this._isUnlocked) {
      return 'Unlocked';
    }

    const completedRequirements = this._requirements.filter(
      req => (req.currentValue || 0) >= req.value
    ).length;

    return `${completedRequirements}/${this._requirements.length} requirements met`;
  }

  public getRarityColor(): string {
    switch (this._rarity) {
      case 'common':
        return '#9CA3AF'; // Gray
      case 'rare':
        return '#3B82F6'; // Blue
      case 'epic':
        return '#8B5CF6'; // Purple
      case 'legendary':
        return '#F59E0B'; // Gold
      default:
        return '#9CA3AF';
    }
  }

  public getRarityName(): string {
    switch (this._rarity) {
      case 'common':
        return 'Common';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
      default:
        return 'Unknown';
    }
  }
}
