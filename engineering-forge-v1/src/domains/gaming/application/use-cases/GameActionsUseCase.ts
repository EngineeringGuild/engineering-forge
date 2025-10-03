import { Component } from "../../domain/entities/Component";
import { TestResult } from "../../domain/entities/TestResult";
import { GameState } from "../../domain/value-objects/GameState";
import { Position, PositionVO } from "../../domain/value-objects/Position";

export interface GameActionsRequest {
  action:
    | "togglePlayPause"
    | "resetGame"
    | "addComponent"
    | "removeComponent"
    | "moveComponent"
    | "selectComponent"
    | "setGridSize"
    | "setSnapToGrid"
    | "addTestResult"
    | "clearTestResults";
  payload?: any;
}

export interface GameActionsResponse {
  success: boolean;
  gameState?: GameState;
  error?: string;
}

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

export class GameActionsUseCase {
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
    this.updateState((state) => {
      const newState = state.togglePlayPause();
      return newState;
    });
  }

  resetGame(): void {
    this.updateState((state) => {
      const newState = state.reset();
      return newState;
    });
  }

  addComponent(component: Component): void {
    this.updateState((state) => {
      // Check if component type already exists
      const existingComponent = state.workspaceComponents.find(
        (c) => c.type === component.type
      );
      if (existingComponent) {
        console.warn(
          `Component of type ${component.type} already exists in workspace`
        );
        return state; // Don't add if type already exists
      }

      // Create a new component with unique position
      const newComponent = new Component(
        `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        {
          name: component.name,
          type: component.type,
          category: component.category,
          properties: component.properties,
          position: new PositionVO(
            Math.random() * 200 + 50, // Random position between 50-250
            Math.random() * 200 + 50
          ),
          size: component.size,
          rotation: component.rotation,
          isUnlocked: component.isUnlocked,
          rarity: component.rarity,
          icon: component.icon,
          description: component.description,
          level: component.level,
        }
      );

      const newState = state.addComponent(newComponent);
      return newState;
    });
  }

  removeComponent(componentId: string): void {
    this.updateState((state) => {
      const newState = state.removeComponent(componentId);
      return newState;
    });
  }

  moveComponent(componentId: string, position: Position): void {
    this.updateState((state) => {
      const newState = state.moveComponent(componentId, position);
      return newState;
    });
  }

  selectComponent(componentId: string | null): void {
    this.updateState((state) => {
      const newState = state.selectComponent(componentId);
      return newState;
    });
  }

  setGridSize(size: number): void {
    this.updateState((state) => {
      const newState = state.setGridSize(size);
      return newState;
    });
  }

  setSnapToGrid(enabled: boolean): void {
    this.updateState((state) => {
      const newState = state.setSnapToGrid(enabled);
      return newState;
    });
  }

  addTestResult(result: TestResult): void {
    this.updateState((state) => {
      const newState = state.addTestResult(result);
      return newState;
    });
  }

  clearTestResults(): void {
    this.updateState((state) => {
      const newState = state.clearTestResults();
      return newState;
    });
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
