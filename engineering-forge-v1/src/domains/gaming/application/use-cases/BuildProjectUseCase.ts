// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/domains/gaming/application/use-cases/BuildProjectUseCase.ts

import { ProjectAggregate } from "../../domain/aggregates/ProjectAggregate";
import { Component } from "../../domain/entities/Component";
import { ProjectRepository } from "../../domain/repositories/ProjectRepository";
import { CarSimulationService } from "../../domain/services/CarSimulationService";
import { PerformanceMetrics } from "../../domain/value-objects/PerformanceMetrics";

export interface BuildProjectRequest {
  projectId: string;
  component: Component;
}

export interface BuildProjectResponse {
  success: boolean;
  project?: ProjectAggregate;
  performance?: PerformanceMetrics;
  error?: string;
}

export class BuildProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private physicsService: CarSimulationService
  ) {}

  async execute(request: BuildProjectRequest): Promise<BuildProjectResponse> {
    try {
      // Find the project
      const project = await this.projectRepository.findById(request.projectId);
      if (!project) {
        return {
          success: false,
          error: "Project not found",
        };
      }

      // Add component to project
      project.addComponent(request.component);

      // Calculate new performance using the performance calculator
      const performanceCalculator =
        this.physicsService.getPerformanceCalculator();
      const performance = performanceCalculator.calculateInitialPerformance(
        project.components
      );

      // Save the project
      await this.projectRepository.save(project);

      return {
        success: true,
        project,
        performance,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
