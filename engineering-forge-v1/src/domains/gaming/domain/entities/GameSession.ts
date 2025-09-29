// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/entities/GameSession.ts

import { BaseEntity } from '../../../../shared/domain/BaseEntity';
import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';
import { Achievement } from './Achievement';
import { Component } from './Component';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type GamePhase = 'planning' | 'building' | 'testing' | 'optimizing';

export interface GameSessionProps {
  userId: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  currentPhase: GamePhase;
  components: Component[];
  performance?: PerformanceMetrics;
  score?: number;
  achievements: Achievement[];
}

export class GameSession extends BaseEntity<string> {
  private _userId: string;
  private _projectId: string;
  private _startTime: Date;
  private _endTime?: Date;
  private _status: SessionStatus;
  private _currentPhase: GamePhase;
  private _components: Component[];
  private _performance?: PerformanceMetrics;
  private _score?: number;
  private _achievements: Achievement[];

  constructor(id: string, props: GameSessionProps) {
    super(id);
    this._userId = props.userId;
    this._projectId = props.projectId;
    this._startTime = props.startTime;
    this._endTime = props.endTime;
    this._status = props.status;
    this._currentPhase = props.currentPhase;
    this._components = [...props.components];
    this._performance = props.performance;
    this._score = props.score;
    this._achievements = [...props.achievements];
  }

  get userId(): string {
    return this._userId;
  }

  get projectId(): string {
    return this._projectId;
  }

  get startTime(): Date {
    return this._startTime;
  }

  get endTime(): Date | undefined {
    return this._endTime;
  }

  get status(): SessionStatus {
    return this._status;
  }

  get currentPhase(): GamePhase {
    return this._currentPhase;
  }

  get components(): Component[] {
    return [...this._components];
  }

  get performance(): PerformanceMetrics | undefined {
    return this._performance;
  }

  get score(): number | undefined {
    return this._score;
  }

  get achievements(): Achievement[] {
    return [...this._achievements];
  }

  public addComponent(component: Component): void {
    this.validateComponentAddition(component);
    this._components.push(component);
    this.updateTimestamp();
  }

  public removeComponent(componentId: string): void {
    const index = this._components.findIndex(c => c.id === componentId);
    if (index === -1) {
      throw new Error(`Component with id ${componentId} not found`);
    }

    this._components.splice(index, 1);
    this.updateTimestamp();
  }

  public updateComponent(component: Component): void {
    const index = this._components.findIndex(c => c.id === component.id);
    if (index === -1) {
      throw new Error(`Component with id ${component.id} not found`);
    }

    this._components[index] = component;
    this.updateTimestamp();
  }

  public getComponent(componentId: string): Component | undefined {
    return this._components.find(c => c.id === componentId);
  }

  public updatePerformance(performance: PerformanceMetrics): void {
    this._performance = performance;
    this.updateTimestamp();
  }

  public updateScore(score: number): void {
    this._score = score;
    this.updateTimestamp();
  }

  public addAchievement(achievement: Achievement): void {
    const existingAchievement = this._achievements.find(a => a.id === achievement.id);
    if (existingAchievement) {
      throw new Error(`Achievement ${achievement.title} already exists in session`);
    }

    this._achievements.push(achievement);
    this.updateTimestamp();
  }

  public updatePhase(phase: GamePhase): void {
    this._currentPhase = phase;
    this.updateTimestamp();
  }

  public pause(): void {
    if (this._status !== 'active') {
      throw new Error('Only active sessions can be paused');
    }

    this._status = 'paused';
    this.updateTimestamp();
  }

  public resume(): void {
    if (this._status !== 'paused') {
      throw new Error('Only paused sessions can be resumed');
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  public complete(): void {
    if (this._status === 'completed') {
      throw new Error('Session is already completed');
    }

    this._status = 'completed';
    this._endTime = new Date();
    this.updateTimestamp();
  }

  public abandon(): void {
    if (this._status === 'abandoned') {
      throw new Error('Session is already abandoned');
    }

    this._status = 'abandoned';
    this._endTime = new Date();
    this.updateTimestamp();
  }

  public getDuration(): number {
    const endTime = this._endTime || new Date();
    return endTime.getTime() - this._startTime.getTime();
  }

  public getDurationInMinutes(): number {
    return Math.floor(this.getDuration() / (1000 * 60));
  }

  public isActive(): boolean {
    return this._status === 'active';
  }

  public isCompleted(): boolean {
    return this._status === 'completed';
  }

  public isAbandoned(): boolean {
    return this._status === 'abandoned';
  }

  public isPaused(): boolean {
    return this._status === 'paused';
  }

  private validateComponentAddition(component: Component): void {
    // Check if component type already exists
    const existingComponent = this._components.find(c => c.type === component.type);
    if (existingComponent) {
      throw new Error(`Component of type ${component.type} already exists in session`);
    }

    // Check if component is unlocked
    if (!component.isUnlocked) {
      throw new Error(`Component ${component.name} is not unlocked`);
    }
  }

  public getTotalWeight(): number {
    return this._components.reduce((total, component) => total + component.properties.weight, 0);
  }

  public getTotalPower(): number {
    return this._components.reduce((total, component) => total + component.properties.power, 0);
  }

  public getTotalCost(): number {
    return this._components.reduce((total, component) => total + component.properties.cost, 0);
  }

  public getComponentCount(): number {
    return this._components.length;
  }

  public getComponentCountByType(type: string): number {
    return this._components.filter(c => c.type === type).length;
  }

  public getAchievementCount(): number {
    return this._achievements.length;
  }

  public getUnlockedAchievementCount(): number {
    return this._achievements.filter(a => a.isUnlocked).length;
  }
}
