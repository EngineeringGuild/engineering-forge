import { Component } from '../../domain/entities/Component';
import { GameState } from '../../domain/entities/GameState';
import { TestResult } from '../../domain/entities/TestResult';
import { Position } from '../../domain/value-objects/Position';

export interface GameActions {
  // Game control
  togglePlayPause: () => void;
  resetGame: () => void;

  // Component management
  addComponent: (component: Component) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, position: Position) => void;
  selectComponent: (componentId: string | null) => void;

  // Settings
  setGridSize: (size: number) => void;
  setSnapToGrid: (enabled: boolean) => void;

  // Testing
  addTestResult: (result: TestResult) => void;
  clearTestResults: () => void;

  // Audio
  playTabSwitch: () => void;
  playTestComplete: () => void;
  playAchievement: () => void;
  playSave: () => void;
}

export class GameActionsService implements GameActions {
  constructor(
    private updateState: (updater: (state: GameState) => GameState) => void,
    private audioService: {
      playTabSwitch: () => void;
      playTestComplete: () => void;
      playAchievement: () => void;
      playSave: () => void;
    }
  ) {}

  togglePlayPause(): void {
    this.updateState(state => ({
      ...state,
      isPlaying: !state.isPlaying
    }));
  }

  resetGame(): void {
    this.updateState(state => ({
      ...state,
      isPlaying: false,
      score: 0,
      level: 1,
      workspaceComponents: [],
      selectedComponentId: null,
      testResults: [],
      achievements: [],
      newlyUnlockedAchievements: [],
      currentPerformance: null
    }));
  }

  addComponent(component: Component): void {
    this.updateState(state => ({
      ...state,
      workspaceComponents: [...state.workspaceComponents, component]
    }));
  }

  removeComponent(componentId: string): void {
    this.updateState(state => ({
      ...state,
      workspaceComponents: state.workspaceComponents.filter(c => c.id !== componentId),
      selectedComponentId:
        state.selectedComponentId === componentId ? null : state.selectedComponentId
    }));
  }

  moveComponent(componentId: string, position: Position): void {
    this.updateState(state => ({
      ...state,
      workspaceComponents: state.workspaceComponents.map(comp => {
        if (comp.id === componentId) {
          comp.moveTo(position);
          return comp;
        }
        return comp;
      })
    }));
  }

  selectComponent(componentId: string | null): void {
    this.updateState(state => ({
      ...state,
      selectedComponentId: componentId
    }));
  }

  setGridSize(size: number): void {
    this.updateState(state => ({
      ...state,
      gridSize: size
    }));
  }

  setSnapToGrid(enabled: boolean): void {
    this.updateState(state => ({
      ...state,
      snapToGrid: enabled
    }));
  }

  addTestResult(result: TestResult): void {
    this.updateState(state => ({
      ...state,
      testResults: [...state.testResults, result],
      score: state.score + (result.passed ? 25 : 0)
    }));
  }

  clearTestResults(): void {
    this.updateState(state => ({
      ...state,
      testResults: []
    }));
  }

  playTabSwitch(): void {
    this.audioService.playTabSwitch();
  }

  playTestComplete(): void {
    this.audioService.playTestComplete();
  }

  playAchievement(): void {
    this.audioService.playAchievement();
  }

  playSave(): void {
    this.audioService.playSave();
  }
}
