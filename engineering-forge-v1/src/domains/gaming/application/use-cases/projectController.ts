/**
 * Project Controller - Engineering Forge V1.0
 *
 * This file contains the project controller with all project-related API endpoints.
 */

import { Request, Response } from "express";
import {
  ApiResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../../../../types/api.types";
import { ProjectService } from "../../domain/services/projectService";

const projectService = new ProjectService();

/**
 * Create a new project
 */
export async function createProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const projectData: CreateProjectRequest = req.body;

    const project = await projectService.createProject(userId, projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    } as ApiResponse);
  }
}

/**
 * Get project by ID
 */
export async function getProjectById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve project",
    } as ApiResponse);
  }
}

/**
 * Get user's projects
 */
export async function getUserProjects(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const isPublic =
      req.query.isPublic === "true"
        ? true
        : req.query.isPublic === "false"
        ? false
        : undefined;

    const result = await projectService.getProjectsByUser(userId, {
      page,
      limit,
      status,
      isPublic,
    });

    res.status(200).json({
      success: true,
      message: "User projects retrieved successfully",
      data: result.projects,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page * limit < result.total,
        hasPrev: page > 1,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get user projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user projects",
    } as ApiResponse);
  }
}

/**
 * Get public projects
 */
export async function getPublicProjects(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;

    const result = await projectService.getPublicProjects({
      page,
      limit,
      type,
      difficulty,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Public projects retrieved successfully",
      data: result.projects,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNext: page * limit < result.total,
        hasPrev: page > 1,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Get public projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve public projects",
    } as ApiResponse);
  }
}

/**
 * Update project
 */
export async function updateProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const updateData: UpdateProjectRequest = req.body;

    const project = await projectService.updateProject(id, userId, updateData);

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error) {
    console.error("Update project error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({
        success: false,
        message: error.message,
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update project",
    } as ApiResponse);
  }
}

/**
 * Delete project
 */
export async function deleteProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const deleted = await projectService.deleteProject(id, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete project error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({
        success: false,
        message: error.message,
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    } as ApiResponse);
  }
}

/**
 * Add component to project
 */
export async function addComponentToProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { componentId } = req.body;
    const userId = req.userId!;

    if (!componentId) {
      res.status(400).json({
        success: false,
        message: "Component ID is required",
        errors: [{ field: "componentId", message: "Component ID is required" }],
      } as ApiResponse);
      return;
    }

    const project = await projectService.addComponentToProject(
      id,
      userId,
      componentId
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component added to project successfully",
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error) {
    console.error("Add component to project error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        res.status(403).json({
          success: false,
          message: error.message,
        } as ApiResponse);
        return;
      }

      if (error.message.includes("already in the project")) {
        res.status(400).json({
          success: false,
          message: error.message,
        } as ApiResponse);
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to add component to project",
    } as ApiResponse);
  }
}

/**
 * Remove component from project
 */
export async function removeComponentFromProject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id, componentId } = req.params;
    const userId = req.userId!;

    const project = await projectService.removeComponentFromProject(
      id,
      userId,
      componentId
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component removed from project successfully",
      data: project,
    } as ApiResponse<typeof project>);
  } catch (error) {
    console.error("Remove component from project error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      res.status(403).json({
        success: false,
        message: error.message,
      } as ApiResponse);
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to remove component from project",
    } as ApiResponse);
  }
}

/**
 * Get project statistics
 */
export async function getProjectStatistics(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const statistics = await projectService.getProjectStatistics();

    res.status(200).json({
      success: true,
      message: "Project statistics retrieved successfully",
      data: statistics,
    } as ApiResponse);
  } catch (error) {
    console.error("Get project statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve project statistics",
    } as ApiResponse);
  }
}
