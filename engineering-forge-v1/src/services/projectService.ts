/**
 * Project Service - Engineering Forge V1.0
 *
 * This file contains the project service with all project-related business logic.
 */

import {
  CreateProjectRequest,
  Project,
  ProjectPerformance,
  UpdateProjectRequest
} from '../types/api.types';

// Mock Project model (in real implementation, this would be a Mongoose model)
interface IProject {
  _id: string;
  name: string;
  description: string;
  type: 'car' | 'truck' | 'motorcycle' | 'boat' | 'airplane';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  components: string[]; // Component IDs
  performance: ProjectPerformance;
  author: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export class ProjectService {
  private projects: Map<string, IProject> = new Map();

  /**
   * Create a new project
   */
  async createProject(userId: string, projectData: CreateProjectRequest): Promise<Project> {
    const projectId = this.generateId();
    const now = new Date();

    const project: IProject = {
      _id: projectId,
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      difficulty: projectData.difficulty,
      status: 'draft',
      components: [],
      performance: this.calculateInitialPerformance(),
      author: userId,
      isPublic: projectData.isPublic || false,
      tags: projectData.tags || [],
      createdAt: now,
      updatedAt: now
    };

    this.projects.set(projectId, project);
    return this.mapToProject(project);
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }
    return this.mapToProject(project);
  }

  /**
   * Get projects by user
   */
  async getProjectsByUser(
    userId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      isPublic?: boolean;
    }
  ): Promise<{ projects: Project[]; total: number }> {
    const allProjects = Array.from(this.projects.values());
    let filteredProjects = allProjects.filter(p => p.author === userId);

    if (options.status) {
      filteredProjects = filteredProjects.filter(p => p.status === options.status);
    }

    if (options.isPublic !== undefined) {
      filteredProjects = filteredProjects.filter(p => p.isPublic === options.isPublic);
    }

    const total = filteredProjects.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return {
      projects: paginatedProjects.map(p => this.mapToProject(p)),
      total
    };
  }

  /**
   * Get public projects
   */
  async getPublicProjects(options: {
    page: number;
    limit: number;
    type?: string;
    difficulty?: string;
    search?: string;
  }): Promise<{ projects: Project[]; total: number }> {
    const allProjects = Array.from(this.projects.values());
    let filteredProjects = allProjects.filter(p => p.isPublic);

    if (options.type) {
      filteredProjects = filteredProjects.filter(p => p.type === options.type);
    }

    if (options.difficulty) {
      filteredProjects = filteredProjects.filter(p => p.difficulty === options.difficulty);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    const total = filteredProjects.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    return {
      projects: paginatedProjects.map(p => this.mapToProject(p)),
      total
    };
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: string,
    userId: string,
    updateData: UpdateProjectRequest
  ): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    // Check if user owns the project
    if (project.author !== userId) {
      throw new Error('Unauthorized: You can only update your own projects');
    }

    // Update fields
    if (updateData.name !== undefined) project.name = updateData.name;
    if (updateData.description !== undefined) project.description = updateData.description;
    if (updateData.type !== undefined) project.type = updateData.type;
    if (updateData.difficulty !== undefined) project.difficulty = updateData.difficulty;
    if (updateData.status !== undefined) {
      project.status = updateData.status;
      if (updateData.status === 'completed' && project.status !== 'completed') {
        project.completedAt = new Date();
      }
    }
    if (updateData.isPublic !== undefined) project.isPublic = updateData.isPublic;
    if (updateData.tags !== undefined) project.tags = updateData.tags;

    project.updatedAt = new Date();
    this.projects.set(projectId, project);

    return this.mapToProject(project);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project) {
      return false;
    }

    // Check if user owns the project
    if (project.author !== userId) {
      throw new Error('Unauthorized: You can only delete your own projects');
    }

    return this.projects.delete(projectId);
  }

  /**
   * Add component to project
   */
  async addComponentToProject(
    projectId: string,
    userId: string,
    componentId: string
  ): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    // Check if user owns the project
    if (project.author !== userId) {
      throw new Error('Unauthorized: You can only modify your own projects');
    }

    // Check if component is already in project
    if (project.components.includes(componentId)) {
      throw new Error('Component is already in the project');
    }

    // Add component
    project.components.push(componentId);
    project.updatedAt = new Date();

    // Recalculate performance
    project.performance = await this.calculateProjectPerformance(project.components);

    this.projects.set(projectId, project);
    return this.mapToProject(project);
  }

  /**
   * Remove component from project
   */
  async removeComponentFromProject(
    projectId: string,
    userId: string,
    componentId: string
  ): Promise<Project | null> {
    const project = this.projects.get(projectId);
    if (!project) {
      return null;
    }

    // Check if user owns the project
    if (project.author !== userId) {
      throw new Error('Unauthorized: You can only modify your own projects');
    }

    // Remove component
    project.components = project.components.filter(id => id !== componentId);
    project.updatedAt = new Date();

    // Recalculate performance
    project.performance = await this.calculateProjectPerformance(project.components);

    this.projects.set(projectId, project);
    return this.mapToProject(project);
  }

  /**
   * Calculate project performance based on components
   */
  private async calculateProjectPerformance(componentIds: string[]): Promise<ProjectPerformance> {
    // In a real implementation, this would fetch components from database
    // and calculate performance based on their properties

    // Mock calculation for now
    // Mock base performance for future use
    // const _basePerformance: ProjectPerformance = {
    //   acceleration: 0,
    //   topSpeed: 0,
    //   handling: 0,
    //   efficiency: 0,
    //   weight: 0,
    //   power: 0,
    //   score: 0
    // };

    // Simple calculation based on number of components
    const componentCount = componentIds.length;
    // const multiplier = Math.min(componentCount * 0.1, 1); // TODO: Use in future implementation

    return {
      acceleration: 10 - componentCount * 0.5,
      topSpeed: 100 + componentCount * 5,
      handling: 50 + componentCount * 3,
      efficiency: 60 + componentCount * 2,
      weight: 1000 + componentCount * 50,
      power: 100 + componentCount * 10,
      score: Math.min(100, 20 + componentCount * 8)
    };
  }

  /**
   * Calculate initial performance for new project
   */
  private calculateInitialPerformance(): ProjectPerformance {
    return {
      acceleration: 0,
      topSpeed: 0,
      handling: 0,
      efficiency: 0,
      weight: 0,
      power: 0,
      score: 0
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Map internal project to API project
   */
  private mapToProject(project: IProject): Project {
    return {
      _id: project._id,
      name: project.name,
      description: project.description,
      type: project.type,
      difficulty: project.difficulty,
      status: project.status,
      components: [], // In real implementation, this would fetch actual component objects
      performance: project.performance,
      author: project.author,
      isPublic: project.isPublic,
      tags: project.tags,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      completedAt: project.completedAt
    };
  }

  /**
   * Get project statistics
   */
  async getProjectStatistics(): Promise<{
    totalProjects: number;
    publicProjects: number;
    completedProjects: number;
    averageScore: number;
    popularTypes: Record<string, number>;
  }> {
    const allProjects = Array.from(this.projects.values());

    const totalProjects = allProjects.length;
    const publicProjects = allProjects.filter(p => p.isPublic).length;
    const completedProjects = allProjects.filter(p => p.status === 'completed').length;

    const totalScore = allProjects.reduce((sum, p) => sum + p.performance.score, 0);
    const averageScore = totalProjects > 0 ? totalScore / totalProjects : 0;

    const popularTypes: Record<string, number> = {};
    allProjects.forEach(p => {
      popularTypes[p.type] = (popularTypes[p.type] || 0) + 1;
    });

    return {
      totalProjects,
      publicProjects,
      completedProjects,
      averageScore,
      popularTypes
    };
  }
}
