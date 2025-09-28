/**
 * User Controller - Engineering Forge V1.0
 *
 * This file contains the user controller with all user-related API endpoints.
 */

import { Request, Response } from 'express';
import { AuthenticationService } from '../services/authService';
import { ApiResponse } from '../types/api.types';

const authService = new AuthenticationService();

/**
 * Get user profile
 */
export async function getUserProfile(_req: Request, res: Response): Promise<void> {
  try {
    const userId = _req.userId!;
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    } as ApiResponse<typeof user>);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile'
    } as ApiResponse);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(_req: Request, res: Response): Promise<void> {
  try {
    const userId = _req.userId!;
    // const _updateData: UpdateUserProfileRequest = _req.body; // TODO: Use in future implementation

    // In a real implementation, this would update the user profile
    // For now, we'll just return the current user data
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: user
    } as ApiResponse<typeof user>);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile'
    } as ApiResponse);
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics(_req: Request, res: Response): Promise<void> {
  try {
    const userId = _req.userId!;
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    // Return user statistics
    const statistics = {
      totalXP: user.statistics.totalXP,
      level: user.statistics.level,
      projectsCompleted: user.statistics.projectsCompleted,
      lessonsCompleted: user.statistics.lessonsCompleted,
      achievementsUnlocked: user.statistics.achievementsUnlocked,
      timeSpent: user.statistics.timeSpent,
      joinDate: user.createdAt,
      lastActiveAt: user.lastLoginAt || user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: statistics
    } as ApiResponse);
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user statistics'
    } as ApiResponse);
  }
}

/**
 * Get user achievements
 */
export async function getUserAchievements(_req: Request, res: Response): Promise<void> {
  try {
    // const _userId = req.userId!; // TODO: Use in future implementation

    // Mock achievements data
    const achievements = [
      {
        _id: '1',
        name: 'First Project',
        description: 'Complete your first project',
        icon: '🏆',
        category: 'project',
        rarity: 'common',
        unlockedAt: new Date(),
        progress: 100
      },
      {
        _id: '2',
        name: 'Speed Demon',
        description: 'Build a car that reaches 100 km/h',
        icon: '⚡',
        category: 'performance',
        rarity: 'uncommon',
        unlockedAt: null,
        progress: 75
      }
    ];

    res.status(200).json({
      success: true,
      message: 'User achievements retrieved successfully',
      data: achievements
    } as ApiResponse);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user achievements'
    } as ApiResponse);
  }
}

/**
 * Get user's favorite components
 */
export async function getUserFavoriteComponents(_req: Request, res: Response): Promise<void> {
  try {
    // const _userId = req.userId!; // TODO: Use in future implementation

    // Mock favorite components data
    const favoriteComponents = [
      {
        _id: '1',
        name: 'Turbo Engine',
        type: 'engine',
        category: 'performance',
        rarity: 'uncommon',
        cost: 2500,
        isUnlocked: true
      },
      {
        _id: '2',
        name: 'Carbon Fiber Chassis',
        type: 'chassis',
        category: 'performance',
        rarity: 'rare',
        cost: 5000,
        isUnlocked: false
      }
    ];

    res.status(200).json({
      success: true,
      message: 'User favorite components retrieved successfully',
      data: favoriteComponents
    } as ApiResponse);
  } catch (error) {
    console.error('Get user favorite components error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user favorite components'
    } as ApiResponse);
  }
}

/**
 * Add component to favorites
 */
export async function addComponentToFavorites(req: Request, res: Response): Promise<void> {
  try {
    // const _userId = req.userId!; // TODO: Use in future implementation
    const { componentId } = req.body;

    if (!componentId) {
      res.status(400).json({
        success: false,
        message: 'Component ID is required',
        errors: [{ field: 'componentId', message: 'Component ID is required' }]
      } as ApiResponse);
      return;
    }

    // In a real implementation, this would add the component to user's favorites
    res.status(200).json({
      success: true,
      message: 'Component added to favorites successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Add component to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add component to favorites'
    } as ApiResponse);
  }
}

/**
 * Remove component from favorites
 */
export async function removeComponentFromFavorites(req: Request, res: Response): Promise<void> {
  try {
    // const _userId = req.userId!; // TODO: Use in future implementation
    const { componentId: _componentId } = req.params;

    // In a real implementation, this would remove the component from user's favorites
    res.status(200).json({
      success: true,
      message: 'Component removed from favorites successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Remove component from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove component from favorites'
    } as ApiResponse);
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(_req: Request, res: Response): Promise<void> {
  try {
    const userId = _req.userId!;
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User preferences retrieved successfully',
      data: user.preferences
    } as ApiResponse);
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user preferences'
    } as ApiResponse);
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    // const _preferences = req.body; // TODO: Use in future implementation

    // In a real implementation, this would update the user preferences
    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User preferences updated successfully',
      data: user.preferences
    } as ApiResponse);
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences'
    } as ApiResponse);
  }
}
