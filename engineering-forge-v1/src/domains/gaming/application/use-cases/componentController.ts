/**
 * Component Controller - Engineering Forge V1.0
 *
 * This file contains the component controller with all component-related API endpoints.
 */

import { Request, Response } from "express";
import {
  ApiResponse,
  CreateComponentRequest,
  UpdateComponentRequest,
} from "../../../../types/api.types";
import { ComponentService } from "../../domain/services/componentService";

const componentService = new ComponentService();

/**
 * Create a new component (Admin only)
 */
export async function createComponent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const componentData: CreateComponentRequest = req.body;

    const component = await componentService.createComponent(componentData);

    res.status(201).json({
      success: true,
      message: "Component created successfully",
      data: component,
    } as ApiResponse<typeof component>);
  } catch (error) {
    console.error("Create component error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create component",
    } as ApiResponse);
  }
}

/**
 * Get component by ID
 */
export async function getComponentById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const component = await componentService.getComponentById(id);

    if (!component) {
      res.status(404).json({
        success: false,
        message: "Component not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component retrieved successfully",
      data: component,
    } as ApiResponse<typeof component>);
  } catch (error) {
    console.error("Get component error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve component",
    } as ApiResponse);
  }
}

/**
 * Get all components with filtering and pagination
 */
export async function getComponents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const rarity = req.query.rarity as string;
    const unlocked =
      req.query.unlocked === "true"
        ? true
        : req.query.unlocked === "false"
        ? false
        : undefined;
    const search = req.query.search as string;

    const result = await componentService.getComponents({
      page,
      limit,
      type,
      category,
      rarity,
      unlocked,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Components retrieved successfully",
      data: result.components,
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
    console.error("Get components error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve components",
    } as ApiResponse);
  }
}

/**
 * Update component (Admin only)
 */
export async function updateComponent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData: UpdateComponentRequest = req.body;

    const component = await componentService.updateComponent(id, updateData);

    if (!component) {
      res.status(404).json({
        success: false,
        message: "Component not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component updated successfully",
      data: component,
    } as ApiResponse<typeof component>);
  } catch (error) {
    console.error("Update component error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update component",
    } as ApiResponse);
  }
}

/**
 * Delete component (Admin only)
 */
export async function deleteComponent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    const deleted = await componentService.deleteComponent(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Component not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete component error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete component",
    } as ApiResponse);
  }
}

/**
 * Unlock component for user
 */
export async function unlockComponent(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const userLevel = req.user?.statistics?.level || 1;

    const component = await componentService.unlockComponent(id, userLevel);

    if (!component) {
      res.status(404).json({
        success: false,
        message: "Component not found",
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Component unlocked successfully",
      data: component,
    } as ApiResponse<typeof component>);
  } catch (error) {
    console.error("Unlock component error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlock component",
    } as ApiResponse);
  }
}

/**
 * Get components by type
 */
export async function getComponentsByType(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { type } = req.params;
    const components = await componentService.getComponentsByType(type);

    res.status(200).json({
      success: true,
      message: "Components by type retrieved successfully",
      data: components,
    } as ApiResponse);
  } catch (error) {
    console.error("Get components by type error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve components by type",
    } as ApiResponse);
  }
}

/**
 * Get components by rarity
 */
export async function getComponentsByRarity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { rarity } = req.params;
    const components = await componentService.getComponentsByRarity(rarity);

    res.status(200).json({
      success: true,
      message: "Components by rarity retrieved successfully",
      data: components,
    } as ApiResponse);
  } catch (error) {
    console.error("Get components by rarity error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve components by rarity",
    } as ApiResponse);
  }
}

/**
 * Get unlocked components for user
 */
export async function getUnlockedComponents(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userLevel = req.user?.statistics?.level || 1;
    const components = await componentService.getUnlockedComponents(userLevel);

    res.status(200).json({
      success: true,
      message: "Unlocked components retrieved successfully",
      data: components,
    } as ApiResponse);
  } catch (error) {
    console.error("Get unlocked components error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve unlocked components",
    } as ApiResponse);
  }
}

/**
 * Get component statistics
 */
export async function getComponentStatistics(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const statistics = await componentService.getComponentStatistics();

    res.status(200).json({
      success: true,
      message: "Component statistics retrieved successfully",
      data: statistics,
    } as ApiResponse);
  } catch (error) {
    console.error("Get component statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve component statistics",
    } as ApiResponse);
  }
}
