// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/value-objects/DragState.ts

import { ValueObject } from "../../../../shared/domain/ValueObject";
import { Component } from "../entities/Component";
import { Position, PositionVO } from "./Position";

export interface DragStateProps {
  readonly isDragging: boolean;
  readonly draggedComponent: Component | null;
  readonly dragOffset: Position;
  readonly startPosition: Position;
  readonly currentPosition: Position;
  readonly snapToGrid: boolean;
  readonly gridSize: number;
}

export class DragState extends ValueObject<DragStateProps> {
  public static create(props: DragStateProps): DragState {
    this.validateDragState(props);
    return new DragState(props);
  }

  private static validateDragState(props: DragStateProps): void {
    if (props.gridSize <= 0) {
      throw new Error("Grid size must be positive");
    }
  }

  get isDragging(): boolean {
    return this.props.isDragging;
  }

  get draggedComponent(): Component | null {
    return this.props.draggedComponent;
  }

  get dragOffset(): Position {
    return this.props.dragOffset;
  }

  get startPosition(): Position {
    return this.props.startPosition;
  }

  get currentPosition(): Position {
    return this.props.currentPosition;
  }

  get snapToGrid(): boolean {
    return this.props.snapToGrid;
  }

  get gridSize(): number {
    return this.props.gridSize;
  }

  /**
   * Start dragging a component
   */
  startDrag(
    component: Component,
    startPosition: Position,
    dragOffset: Position
  ): DragState {
    return new DragState({
      isDragging: true,
      draggedComponent: component,
      dragOffset,
      startPosition,
      currentPosition: startPosition,
      snapToGrid: this.props.snapToGrid,
      gridSize: this.props.gridSize,
    });
  }

  /**
   * Update drag position
   */
  updatePosition(position: Position): DragState {
    if (!this.props.isDragging) return this;

    const snappedPosition = this.props.snapToGrid
      ? this.snapToGridPosition(position)
      : position;

    return new DragState({
      ...this.props,
      currentPosition: snappedPosition,
    });
  }

  /**
   * Stop dragging
   */
  stopDrag(): DragState {
    return new DragState({
      isDragging: false,
      draggedComponent: null,
      dragOffset: this.props.dragOffset,
      startPosition: this.props.startPosition,
      currentPosition: this.props.currentPosition,
      snapToGrid: this.props.snapToGrid,
      gridSize: this.props.gridSize,
    });
  }

  /**
   * Reset drag state
   */
  reset(): DragState {
    return new DragState({
      isDragging: false,
      draggedComponent: null,
      dragOffset: this.props.dragOffset,
      startPosition: this.props.startPosition,
      currentPosition: this.props.currentPosition,
      snapToGrid: this.props.snapToGrid,
      gridSize: this.props.gridSize,
    });
  }

  /**
   * Update grid settings
   */
  updateGridSettings(snapToGrid: boolean, gridSize: number): DragState {
    return new DragState({
      ...this.props,
      snapToGrid,
      gridSize,
    });
  }

  /**
   * Snap position to grid
   */
  private snapToGridPosition(position: Position): Position {
    const snappedX =
      Math.round(position.x / this.props.gridSize) * this.props.gridSize;
    const snappedY =
      Math.round(position.y / this.props.gridSize) * this.props.gridSize;

    return new PositionVO(snappedX, snappedY);
  }

  /**
   * Get final position for component placement
   */
  getFinalPosition(): Position {
    return this.props.snapToGrid
      ? this.snapToGridPosition(this.props.currentPosition)
      : this.props.currentPosition;
  }

  /**
   * Check if drag has moved significantly
   */
  hasMoved(threshold: number = 5): boolean {
    const deltaX = Math.abs(
      this.props.currentPosition.x - this.props.startPosition.x
    );
    const deltaY = Math.abs(
      this.props.currentPosition.y - this.props.startPosition.y
    );

    return deltaX > threshold || deltaY > threshold;
  }
}
