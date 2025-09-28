/**
 * User Service - Engineering Forge V1.0
 *
 * This file contains the user service for API calls related to user management.
 */

import {
  ApiResponse,
  FavoriteComponent,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  UserAchievement,
  UserProfile,
  UserStatistics
} from '../types/user.types';

// Base API URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Create headers with auth token
const createHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Handle API response
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

export class UserService {
  /**
   * Get user profile
   */
  static async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: createHeaders()
    });

    const result = await handleResponse<UserProfile>(response);
    return result.data!;
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(profileData)
    });

    const result = await handleResponse<UserProfile>(response);
    return result.data!;
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    const response = await fetch(`${API_BASE_URL}/users/statistics`, {
      method: 'GET',
      headers: createHeaders()
    });

    const result = await handleResponse<UserStatistics>(response);
    return result.data!;
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await fetch(`${API_BASE_URL}/users/achievements`, {
      method: 'GET',
      headers: createHeaders()
    });

    const result = await handleResponse<UserAchievement[]>(response);
    return result.data!;
  }

  /**
   * Get user's favorite components
   */
  static async getFavoriteComponents(): Promise<FavoriteComponent[]> {
    const response = await fetch(`${API_BASE_URL}/users/favorites`, {
      method: 'GET',
      headers: createHeaders()
    });

    const result = await handleResponse<FavoriteComponent[]>(response);
    return result.data!;
  }

  /**
   * Add component to favorites
   */
  static async addToFavorites(componentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/favorites`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ componentId })
    });

    await handleResponse(response);
  }

  /**
   * Remove component from favorites
   */
  static async removeFromFavorites(componentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/favorites/${componentId}`, {
      method: 'DELETE',
      headers: createHeaders()
    });

    await handleResponse(response);
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<UserProfile['preferences']> {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      method: 'GET',
      headers: createHeaders()
    });

    const result = await handleResponse<UserProfile['preferences']>(response);
    return result.data!;
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    preferences: UpdatePreferencesRequest
  ): Promise<UserProfile['preferences']> {
    const response = await fetch(`${API_BASE_URL}/users/preferences`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(preferences)
    });

    const result = await handleResponse<UserProfile['preferences']>(response);
    return result.data!;
  }

  /**
   * Upload avatar
   */
  static async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    const result = await handleResponse<{ avatarUrl: string }>(response);
    return result.data!.avatarUrl;
  }

  /**
   * Delete avatar
   */
  static async deleteAvatar(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'DELETE',
      headers: createHeaders()
    });

    await handleResponse(response);
  }

  /**
   * Validate profile data
   */
  static validateProfileData(data: UpdateProfileRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    if (data.website && !this.isValidUrl(data.website)) {
      errors.push('Please enter a valid website URL');
    }

    if (data.github && !this.isValidGithubUrl(data.github)) {
      errors.push('Please enter a valid GitHub URL or username');
    }

    if (data.linkedin && !this.isValidLinkedinUrl(data.linkedin)) {
      errors.push('Please enter a valid LinkedIn URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate preferences data
   */
  static validatePreferencesData(data: UpdatePreferencesRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.language && !['en', 'pt', 'es', 'fr'].includes(data.language)) {
      errors.push('Invalid language selection');
    }

    if (data.theme && !['light', 'dark'].includes(data.theme)) {
      errors.push('Invalid theme selection');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to validate URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to validate GitHub URL
   */
  private static isValidGithubUrl(github: string): boolean {
    // Accept both full URLs and usernames
    if (github.startsWith('https://github.com/')) {
      return this.isValidUrl(github);
    }

    // Accept just username (alphanumeric, hyphens, underscores)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return usernameRegex.test(github);
  }

  /**
   * Helper method to validate LinkedIn URL
   */
  private static isValidLinkedinUrl(linkedin: string): boolean {
    if (
      linkedin.startsWith('https://linkedin.com/in/') ||
      linkedin.startsWith('https://www.linkedin.com/in/')
    ) {
      return this.isValidUrl(linkedin);
    }

    // Accept just the profile part
    const profileRegex = /^[a-zA-Z0-9_-]+$/;
    return profileRegex.test(linkedin);
  }

  /**
   * Calculate user level from XP
   */
  static calculateUserLevel(totalXP: number): {
    level: number;
    xpCurrent: number;
    xpRequired: number;
    xpProgress: number;
    nextLevelXp: number;
  } {
    const level = Math.floor(totalXP / 100) + 1;
    const xpCurrent = totalXP % 100;
    const xpRequired = 100;
    const xpProgress = (xpCurrent / xpRequired) * 100;
    const nextLevelXp = level * 100;

    return {
      level,
      xpCurrent,
      xpRequired,
      xpProgress,
      nextLevelXp
    };
  }

  /**
   * Format time spent in minutes to human readable
   */
  static formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  /**
   * Get achievement rarity color
   */
  static getAchievementRarityColor(rarity: string): string {
    const colors = {
      common: 'text-gray-500',
      uncommon: 'text-green-500',
      rare: 'text-blue-500',
      epic: 'text-purple-500',
      legendary: 'text-yellow-500'
    };

    return colors[rarity as keyof typeof colors] || colors.common;
  }

  /**
   * Get achievement rarity background
   */
  static getAchievementRarityBackground(rarity: string): string {
    const backgrounds = {
      common: 'bg-gray-100 dark:bg-gray-800',
      uncommon: 'bg-green-100 dark:bg-green-900',
      rare: 'bg-blue-100 dark:bg-blue-900',
      epic: 'bg-purple-100 dark:bg-purple-900',
      legendary: 'bg-yellow-100 dark:bg-yellow-900'
    };

    return backgrounds[rarity as keyof typeof backgrounds] || backgrounds.common;
  }
}
