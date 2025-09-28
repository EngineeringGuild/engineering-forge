// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/Component.ts

import { BaseEntity } from '../../../../shared/domain/BaseEntity';
import { ComponentProperties } from '../value-objects/ComponentProperties';
import { Position } from '../value-objects/Position';

export type ComponentType =
  | 'engine'
  | 'chassis'
  | 'wheels'
  | 'suspension'
  | 'brakes'
  | 'transmission';
export type ComponentCategory = 'mechanical' | 'electrical' | 'structural' | 'aerodynamic';
export type ComponentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ComponentProps {
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  properties: ComponentProperties;
  position: Position;
  size: { width: number; height: number };
  rotation: number;
  isUnlocked: boolean;
  rarity: ComponentRarity;
  icon: string;
  description: string;
  level: number;
}

export class Component extends BaseEntity<string> {
  private _name: string;
  private _type: ComponentType;
  private _category: ComponentCategory;
  private _properties: ComponentProperties;
  private _position: Position;
  private _size: { width: number; height: number };
  private _rotation: number;
  private _isUnlocked: boolean;
  private _rarity: ComponentRarity;
  private _icon: string;
  private _description: string;
  private _level: number;

  constructor(id: string, props: ComponentProps) {
    super(id);
    this._name = props.name;
    this._type = props.type;
    this._category = props.category;
    this._properties = props.properties;
    this._position = props.position;
    this._size = props.size;
    this._rotation = props.rotation;
    this._isUnlocked = props.isUnlocked;
    this._rarity = props.rarity;
    this._icon = props.icon;
    this._description = props.description;
    this._level = props.level;
  }

  get name(): string {
    return this._name;
  }

  get type(): ComponentType {
    return this._type;
  }

  get category(): ComponentCategory {
    return this._category;
  }

  get properties(): ComponentProperties {
    return this._properties;
  }

  get position(): Position {
    return this._position;
  }

  get size(): { width: number; height: number } {
    return this._size;
  }

  get rotation(): number {
    return this._rotation;
  }

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  get rarity(): ComponentRarity {
    return this._rarity;
  }

  get icon(): string {
    return this._icon;
  }

  get description(): string {
    return this._description;
  }

  get level(): number {
    return this._level;
  }

  public moveTo(position: Position): void {
    this._position = position;
    this.updateTimestamp();
  }

  public rotate(rotation: number): void {
    this._rotation = rotation % 360;
    this.updateTimestamp();
  }

  public resize(size: { width: number; height: number }): void {
    if (size.width <= 0 || size.height <= 0) {
      throw new Error('Size dimensions must be positive');
    }
    this._size = size;
    this.updateTimestamp();
  }

  public unlock(): void {
    this._isUnlocked = true;
    this.updateTimestamp();
  }

  public lock(): void {
    this._isUnlocked = false;
    this.updateTimestamp();
  }

  public canBeUnlockedForLevel(userLevel: number): boolean {
    return this._properties.isUnlockedForLevel(userLevel);
  }

  public getPowerToWeightRatio(): number {
    return this._properties.getPowerToWeightRatio();
  }

  public getEfficiencyScore(): number {
    return this._properties.getEfficiencyScore();
  }

  public isCompatibleWith(other: Component): boolean {
    // Basic compatibility rules
    if (this.type === other.type) {
      return false; // Can't have two components of the same type
    }

    // Engine compatibility with transmission
    if (this.type === 'engine' && other.type === 'transmission') {
      return true;
    }

    // Chassis compatibility with other components
    if (this.type === 'chassis') {
      return ['engine', 'wheels', 'suspension', 'brakes', 'transmission'].includes(other.type);
    }

    // Wheels compatibility
    if (this.type === 'wheels') {
      return ['chassis', 'suspension'].includes(other.type);
    }

    return true; // Default to compatible
  }

  public getBounds(): {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } {
    return {
      left: this._position.x,
      top: this._position.y,
      right: this._position.x + this._size.width,
      bottom: this._position.y + this._size.height
    };
  }

  public intersects(other: Component): boolean {
    const thisBounds = this.getBounds();
    const otherBounds = other.getBounds();

    return !(
      thisBounds.right <= otherBounds.left ||
      thisBounds.left >= otherBounds.right ||
      thisBounds.bottom <= otherBounds.top ||
      thisBounds.top >= otherBounds.bottom
    );
  }
}
