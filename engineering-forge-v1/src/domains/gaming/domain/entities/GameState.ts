import { PerformanceMetrics } from '../value-objects/PerformanceMetrics';
import { Achievement } from './Achievement';
import { Component } from './Component';
import { TestResult } from './TestResult';

export interface GameState {
  // Core game state
  isPlaying: boolean;
  score: number;
  level: number;

  // Workspace state
  workspaceComponents: Component[];
  selectedComponentId: string | null;
  gridSize: number;
  snapToGrid: boolean;

  // Performance state
  currentPerformance: PerformanceMetrics | null;
  testResults: TestResult[];
  isLowPerformance: boolean;

  // Progress state
  userId: string;
  achievements: Achievement[];
  newlyUnlockedAchievements: Achievement[];

  // Save/load state
  lastSaved: Date | null;
  isAutoSaving: boolean;
  autoSaveError: boolean;

  // UI state
  showSettings: boolean;
  showProgressPanel: boolean;
  showSaveLoadPanel: boolean;
  showAchievementNotification: boolean;
  activeTab: 'build' | 'test' | 'performance' | 'achievements';
}

export class GameStateEntity implements GameState {
  isPlaying: boolean = false;
  score: number = 0;
  level: number = 1;
  workspaceComponents: Component[] = [];
  selectedComponentId: string | null = null;
  gridSize: number = 20;
  snapToGrid: boolean = true;
  currentPerformance: PerformanceMetrics | null = null;
  testResults: TestResult[] = [];
  isLowPerformance: boolean = false;
  userId: string = 'user-001';
  achievements: Achievement[] = [];
  newlyUnlockedAchievements: Achievement[] = [];
  lastSaved: Date | null = null;
  isAutoSaving: boolean = false;
  autoSaveError: boolean = false;
  showSettings: boolean = false;
  showProgressPanel: boolean = false;
  showSaveLoadPanel: boolean = false;
  showAchievementNotification: boolean = false;
  activeTab: 'build' | 'test' | 'performance' | 'achievements' = 'build';

  constructor(initialState?: Partial<GameState>) {
    if (initialState) {
      Object.assign(this, initialState);
    }
  }

  update(newState: Partial<GameState>): GameStateEntity {
    return new GameStateEntity({ ...this, ...newState });
  }

  reset(): GameStateEntity {
    return new GameStateEntity({
      userId: this.userId,
      gridSize: this.gridSize,
      snapToGrid: this.snapToGrid
    });
  }
}
