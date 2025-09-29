// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/GameState.ts

import { ValueObject } from '../../../../shared/domain/ValueObject';
import { Achievement } from '../entities/Achievement';
import { Component } from '../entities/Component';
import { TestResult } from '../entities/TestResult';
import { PerformanceMetrics } from './PerformanceMetrics';
import { Position } from './Position';

export interface GameStateProps {
  readonly isPlaying: boolean;
  readonly score: number;
  readonly level: number;
  readonly workspaceComponents: Component[];
  readonly selectedComponentId: string | null;
  readonly gridSize: number;
  readonly snapToGrid: boolean;
  readonly currentPerformance: PerformanceMetrics | null;
  readonly testResults: TestResult[];
  readonly isLowPerformance: boolean;
  readonly userId: string;
  readonly achievements: Achievement[];
  readonly newlyUnlockedAchievements: Achievement[];
  readonly lastSaved: Date | null;
  readonly isAutoSaving: boolean;
  readonly autoSaveError: boolean;
  readonly showSettings: boolean;
  readonly showProgressPanel: boolean;
  readonly showSaveLoadPanel: boolean;
  readonly showAchievementNotification: boolean;
  readonly activeTab: 'build' | 'test' | 'performance' | 'achievements';
}

export class GameState extends ValueObject<GameStateProps> {
  public static create(props: GameStateProps): GameState {
    this.validateGameState(props);
    return new GameState(props);
  }

  public static createDefault(userId: string): GameState {
    return new GameState({
      isPlaying: false,
      score: 0,
      level: 1,
      workspaceComponents: [],
      selectedComponentId: null,
      gridSize: 20,
      snapToGrid: true,
      currentPerformance: null,
      testResults: [],
      isLowPerformance: false,
      userId,
      achievements: [],
      newlyUnlockedAchievements: [],
      lastSaved: null,
      isAutoSaving: false,
      autoSaveError: false,
      showSettings: false,
      showProgressPanel: false,
      showSaveLoadPanel: false,
      showAchievementNotification: false,
      activeTab: 'build'
    });
  }

  private static validateGameState(props: GameStateProps): void {
    if (props.score < 0) {
      throw new Error('Score must be non-negative');
    }

    if (props.level < 1) {
      throw new Error('Level must be at least 1');
    }

    if (props.gridSize <= 0) {
      throw new Error('Grid size must be positive');
    }

    if (!props.userId || props.userId.trim() === '') {
      throw new Error('User ID is required');
    }
  }

  get isPlaying(): boolean {
    return this.props.isPlaying;
  }

  get score(): number {
    return this.props.score;
  }

  get level(): number {
    return this.props.level;
  }

  get workspaceComponents(): Component[] {
    return [...this.props.workspaceComponents];
  }

  get selectedComponentId(): string | null {
    return this.props.selectedComponentId;
  }

  get gridSize(): number {
    return this.props.gridSize;
  }

  get snapToGrid(): boolean {
    return this.props.snapToGrid;
  }

  get currentPerformance(): PerformanceMetrics | null {
    return this.props.currentPerformance;
  }

  get testResults(): TestResult[] {
    return [...this.props.testResults];
  }

  get isLowPerformance(): boolean {
    return this.props.isLowPerformance;
  }

  get userId(): string {
    return this.props.userId;
  }

  get achievements(): Achievement[] {
    return [...this.props.achievements];
  }

  get newlyUnlockedAchievements(): Achievement[] {
    return [...this.props.newlyUnlockedAchievements];
  }

  get lastSaved(): Date | null {
    return this.props.lastSaved;
  }

  get isAutoSaving(): boolean {
    return this.props.isAutoSaving;
  }

  get autoSaveError(): boolean {
    return this.props.autoSaveError;
  }

  get showSettings(): boolean {
    return this.props.showSettings;
  }

  get showProgressPanel(): boolean {
    return this.props.showProgressPanel;
  }

  get showSaveLoadPanel(): boolean {
    return this.props.showSaveLoadPanel;
  }

  get showAchievementNotification(): boolean {
    return this.props.showAchievementNotification;
  }

  get activeTab(): 'build' | 'test' | 'performance' | 'achievements' {
    return this.props.activeTab;
  }

  public updatePlaying(isPlaying: boolean): GameState {
    return new GameState({ ...this.props, isPlaying });
  }

  public togglePlayPause(): GameState {
    return new GameState({ ...this.props, isPlaying: !this.props.isPlaying });
  }

  public updateScore(score: number): GameState {
    return new GameState({ ...this.props, score });
  }

  public updateLevel(level: number): GameState {
    return new GameState({ ...this.props, level });
  }

  public addComponent(component: Component): GameState {
    const newComponents = [...this.props.workspaceComponents, component];
    return new GameState({ ...this.props, workspaceComponents: newComponents });
  }

  public removeComponent(componentId: string): GameState {
    const newComponents = this.props.workspaceComponents.filter(c => c.id !== componentId);
    const newSelectedId =
      this.props.selectedComponentId === componentId ? null : this.props.selectedComponentId;
    return new GameState({
      ...this.props,
      workspaceComponents: newComponents,
      selectedComponentId: newSelectedId
    });
  }

  public selectComponent(componentId: string | null): GameState {
    return new GameState({ ...this.props, selectedComponentId: componentId });
  }

  public moveComponent(componentId: string, position: Position): GameState {
    const newComponents = this.props.workspaceComponents.map(comp => {
      if (comp.id === componentId) {
        comp.moveTo(position);
        return comp;
      }
      return comp;
    });
    return new GameState({ ...this.props, workspaceComponents: newComponents });
  }

  public updateGridSize(gridSize: number): GameState {
    return new GameState({ ...this.props, gridSize });
  }

  public setGridSize(gridSize: number): GameState {
    return new GameState({ ...this.props, gridSize });
  }

  public toggleSnapToGrid(): GameState {
    return new GameState({ ...this.props, snapToGrid: !this.props.snapToGrid });
  }

  public setSnapToGrid(snapToGrid: boolean): GameState {
    return new GameState({ ...this.props, snapToGrid });
  }

  public updatePerformance(performance: PerformanceMetrics | null): GameState {
    return new GameState({ ...this.props, currentPerformance: performance });
  }

  public addTestResult(testResult: TestResult): GameState {
    const newTestResults = [...this.props.testResults, testResult];
    return new GameState({ ...this.props, testResults: newTestResults });
  }

  public clearTestResults(): GameState {
    return new GameState({ ...this.props, testResults: [] });
  }

  public updateLowPerformance(isLowPerformance: boolean): GameState {
    return new GameState({ ...this.props, isLowPerformance });
  }

  public setLowPerformance(isLowPerformance: boolean): GameState {
    return new GameState({ ...this.props, isLowPerformance });
  }

  public addAchievement(achievement: Achievement): GameState {
    const newAchievements = [...this.props.achievements, achievement];
    const newUnlockedAchievements = [...this.props.newlyUnlockedAchievements, achievement];
    return new GameState({
      ...this.props,
      achievements: newAchievements,
      newlyUnlockedAchievements: newUnlockedAchievements
    });
  }

  public clearNewlyUnlockedAchievements(): GameState {
    return new GameState({ ...this.props, newlyUnlockedAchievements: [] });
  }

  public updateLastSaved(lastSaved: Date | null): GameState {
    return new GameState({ ...this.props, lastSaved });
  }

  public updateAutoSaving(isAutoSaving: boolean): GameState {
    return new GameState({ ...this.props, isAutoSaving });
  }

  public updateAutoSaveError(autoSaveError: boolean): GameState {
    return new GameState({ ...this.props, autoSaveError });
  }

  public toggleSettings(): GameState {
    return new GameState({ ...this.props, showSettings: !this.props.showSettings });
  }

  public toggleProgressPanel(): GameState {
    return new GameState({ ...this.props, showProgressPanel: !this.props.showProgressPanel });
  }

  public toggleSaveLoadPanel(): GameState {
    return new GameState({ ...this.props, showSaveLoadPanel: !this.props.showSaveLoadPanel });
  }

  public toggleAchievementNotification(): GameState {
    return new GameState({
      ...this.props,
      showAchievementNotification: !this.props.showAchievementNotification
    });
  }

  public updateActiveTab(activeTab: 'build' | 'test' | 'performance' | 'achievements'): GameState {
    return new GameState({ ...this.props, activeTab });
  }

  public reset(): GameState {
    return new GameState({
      ...this.props,
      isPlaying: false,
      score: 0,
      workspaceComponents: [],
      selectedComponentId: null,
      currentPerformance: null,
      testResults: [],
      isLowPerformance: false,
      newlyUnlockedAchievements: [],
      lastSaved: null,
      isAutoSaving: false,
      autoSaveError: false,
      showSettings: false,
      showProgressPanel: false,
      showSaveLoadPanel: false,
      showAchievementNotification: false,
      activeTab: 'build'
    });
  }

  public getComponentCount(): number {
    return this.props.workspaceComponents.length;
  }

  public getComponentCountByType(type: string): number {
    return this.props.workspaceComponents.filter(c => c.type === type).length;
  }

  public getTotalWeight(): number {
    return this.props.workspaceComponents.reduce(
      (total, component) => total + component.properties.weight,
      0
    );
  }

  public getTotalPower(): number {
    return this.props.workspaceComponents.reduce(
      (total, component) => total + component.properties.power,
      0
    );
  }

  public getTotalCost(): number {
    return this.props.workspaceComponents.reduce(
      (total, component) => total + component.properties.cost,
      0
    );
  }

  public getAchievementCount(): number {
    return this.props.achievements.length;
  }

  public getUnlockedAchievementCount(): number {
    return this.props.achievements.filter(a => a.isUnlocked).length;
  }

  public getNewlyUnlockedAchievementCount(): number {
    return this.props.newlyUnlockedAchievements.length;
  }
}
