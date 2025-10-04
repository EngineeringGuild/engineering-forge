// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/domain/aggregates/ProjectAggregate.ts

import { BaseEntity } from "../../../../shared/domain/BaseEntity";
import { Component } from "../entities/Component";
import { ComponentAddedEvent } from "../events/ComponentAddedEvent";
import { ComponentRemovedEvent } from "../events/ComponentRemovedEvent";
import { ProjectCompletedEvent } from "../events/ProjectCompletedEvent";
import { PerformanceMetrics } from "../value-objects/PerformanceMetrics";

export type ProjectType = "car" | "bridge" | "circuit" | "structure";
export type EngineeringCategory =
  | "automotive"
  | "civil"
  | "electrical"
  | "mechanical";
export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface ProjectObjective {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  weight: number;
}

export interface ProjectConstraint {
  id: string;
  type: "budget" | "weight" | "size" | "time";
  value: number;
  description: string;
}

export interface ProjectProps {
  title: string;
  description: string;
  type: ProjectType;
  category: EngineeringCategory;
  difficulty: DifficultyLevel;
  objectives: ProjectObjective[];
  constraints: ProjectConstraint[];
  targetPerformance: PerformanceMetrics;
  timeLimit?: number;
  maxScore: number;
}

export class ProjectAggregate extends BaseEntity<string> {
  private _title: string;
  private _description: string;
  private _type: ProjectType;
  private _category: EngineeringCategory;
  private _difficulty: DifficultyLevel;
  private _objectives: ProjectObjective[];
  private _constraints: ProjectConstraint[];
  private _components: Component[];
  private _targetPerformance: PerformanceMetrics;
  private _timeLimit?: number;
  private _isCompleted: boolean;
  private _completionTime?: number;
  private _finalScore?: number;
  private _maxScore: number;
  private _domainEvents: any[] = [];

  constructor(id: string, props: ProjectProps) {
    super(id);
    this._title = props.title;
    this._description = props.description;
    this._type = props.type;
    this._category = props.category;
    this._difficulty = props.difficulty;
    this._objectives = [...props.objectives];
    this._constraints = [...props.constraints];
    this._components = [];
    this._targetPerformance = props.targetPerformance;
    this._timeLimit = props.timeLimit;
    this._isCompleted = false;
    this._maxScore = props.maxScore;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get type(): ProjectType {
    return this._type;
  }

  get category(): EngineeringCategory {
    return this._category;
  }

  get difficulty(): DifficultyLevel {
    return this._difficulty;
  }

  get objectives(): ProjectObjective[] {
    return [...this._objectives];
  }

  get constraints(): ProjectConstraint[] {
    return [...this._constraints];
  }

  get components(): Component[] {
    return [...this._components];
  }

  get targetPerformance(): PerformanceMetrics {
    return this._targetPerformance;
  }

  get timeLimit(): number | undefined {
    return this._timeLimit;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get completionTime(): number | undefined {
    return this._completionTime;
  }

  get finalScore(): number | undefined {
    return this._finalScore;
  }

  get maxScore(): number {
    return this._maxScore;
  }

  get domainEvents(): any[] {
    return [...this._domainEvents];
  }

  public addComponent(component: Component): void {
    this.validateComponentAddition(component);
    this._components.push(component);
    this.updateTimestamp();

    this._domainEvents.push(new ComponentAddedEvent(this.id, component.id));
  }

  public removeComponent(componentId: string): void {
    const index = this._components.findIndex((c) => c.id === componentId);
    if (index === -1) {
      throw new Error(`Component with id ${componentId} not found`);
    }

    this._components.splice(index, 1);
    this.updateTimestamp();

    this._domainEvents.push(new ComponentRemovedEvent(this.id, componentId));
  }

  public updateComponent(component: Component): void {
    const index = this._components.findIndex((c) => c.id === component.id);
    if (index === -1) {
      throw new Error(`Component with id ${component.id} not found`);
    }

    this._components[index] = component;
    this.updateTimestamp();
  }

  public getComponent(componentId: string): Component | undefined {
    return this._components.find((c) => c.id === componentId);
  }

  public validateComponentAddition(component: Component): void {
    // Check if component type already exists
    const existingComponent = this._components.find(
      (c) => c.type === component.type
    );
    if (existingComponent) {
      throw new Error(
        `Component of type ${component.type} already exists in project`
      );
    }

    // Check constraints
    this.validateConstraints(component);

    // Check compatibility with existing components
    this.validateCompatibility(component);
  }

  private validateConstraints(component: Component): void {
    // Check budget constraint
    const budgetConstraint = this._constraints.find((c) => c.type === "budget");
    if (budgetConstraint) {
      const totalCost = this.getTotalCost() + component.properties.cost;
      if (totalCost > budgetConstraint.value) {
        throw new Error(
          `Adding component would exceed budget constraint of ${budgetConstraint.value}`
        );
      }
    }

    // Check weight constraint
    const weightConstraint = this._constraints.find((c) => c.type === "weight");
    if (weightConstraint) {
      const totalWeight = this.getTotalWeight() + component.properties.weight;
      if (totalWeight > weightConstraint.value) {
        throw new Error(
          `Adding component would exceed weight constraint of ${weightConstraint.value}kg`
        );
      }
    }
  }

  private validateCompatibility(component: Component): void {
    for (const existingComponent of this._components) {
      if (!component.isCompatibleWith(existingComponent)) {
        throw new Error(
          `Component ${component.name} is not compatible with ${existingComponent.name}`
        );
      }
    }
  }

  public getTotalCost(): number {
    return this._components.reduce(
      (total, component) => total + component.properties.cost,
      0
    );
  }

  public getTotalWeight(): number {
    return this._components.reduce(
      (total, component) => total + component.properties.weight,
      0
    );
  }

  public getTotalPower(): number {
    return this._components.reduce(
      (total, component) => total + component.properties.power,
      0
    );
  }

  public calculatePerformance(): PerformanceMetrics {
    // This would be implemented by the CarSimulationService
    // For now, return a basic calculation
    const totalPower = this.getTotalPower();
    const totalWeight = this.getTotalWeight();

    const acceleration = totalWeight > 0 ? (totalPower * 0.8) / totalWeight : 0;
    const topSpeed = Math.sqrt(totalPower / 0.3);
    const handling = Math.min(100, (totalPower / totalWeight) * 10);
    const fuelEfficiency = Math.max(10, 50 - totalWeight / 100);

    const overall = (acceleration + topSpeed + handling + fuelEfficiency) / 4;

    return new PerformanceMetrics({
      acceleration,
      topSpeed,
      handling,
      fuelEfficiency,
      weight: totalWeight,
      power: totalPower,
      torque: totalPower * 0.7,
      overall: Math.min(100, overall),
    });
  }

  public completeProject(completionTime: number): void {
    if (this._isCompleted) {
      throw new Error("Project is already completed");
    }

    this._isCompleted = true;
    this._completionTime = completionTime;
    this._finalScore = this.calculateScore();
    this.updateTimestamp();

    this._domainEvents.push(
      new ProjectCompletedEvent(this.id, this._finalScore, completionTime)
    );
  }

  private calculateScore(): number {
    const performance = this.calculatePerformance();
    const objectiveScore = this.calculateObjectiveScore();
    const constraintScore = this.calculateConstraintScore();

    return Math.round(
      performance.overall * 0.5 + objectiveScore * 0.3 + constraintScore * 0.2
    );
  }

  private calculateObjectiveScore(): number {
    const completedObjectives = this._objectives.filter(
      (obj) => obj.isCompleted
    ).length;
    return (completedObjectives / this._objectives.length) * 100;
  }

  private calculateConstraintScore(): number {
    let score = 100;

    // Penalize for exceeding constraints
    for (const constraint of this._constraints) {
      switch (constraint.type) {
        case "budget":
          const totalCost = this.getTotalCost();
          if (totalCost > constraint.value) {
            score -= ((totalCost - constraint.value) / constraint.value) * 50;
          }
          break;
        case "weight":
          const totalWeight = this.getTotalWeight();
          if (totalWeight > constraint.value) {
            score -= ((totalWeight - constraint.value) / constraint.value) * 50;
          }
          break;
      }
    }

    return Math.max(0, score);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
