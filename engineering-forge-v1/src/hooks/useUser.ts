/**
 * useUser Hook - Engineering Forge V1.0
 *
 * This file contains custom hooks for user management.
 */

import { useCallback, useEffect, useState } from 'react';
import { UserService } from '../services/userService';
import {
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  UserProfile,
  UseUserReturn
} from '../types/user.types';

/**
 * Hook for managing user profile data
 */
export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile data
   */
  const fetchUser = useCallback(async() => {
    try {
      setLoading(true);
      setError(null);

      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async(data: UpdateProfileRequest): Promise<boolean> => {
    try {
      setError(null);

      // Validate data
      const validation = UserService.validateProfileData(data);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return false;
      }

      const updatedUser = await UserService.updateProfile(data);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, []);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(
    async(data: UpdatePreferencesRequest): Promise<boolean> => {
      try {
        setError(null);

        // Validate data
        const validation = UserService.validatePreferencesData(data);
        if (!validation.isValid) {
          setError(validation.errors.join(', '));
          return false;
        }

        const updatedPreferences = await UserService.updatePreferences(data);
        setUser(prev => (prev ? { ...prev, preferences: updatedPreferences } : null));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preferences');
        return false;
      }
    },
    []
  );

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async(file: File): Promise<boolean> => {
    try {
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError('Image file size must be less than 5MB');
        return false;
      }

      const avatarUrl = await UserService.uploadAvatar(file);
      setUser(prev => (prev ? { ...prev, avatar: avatarUrl } : null));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      return false;
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async() => {
    await fetchUser();
  }, [fetchUser]);

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    updateProfile,
    updatePreferences,
    uploadAvatar,
    refreshUser
  };
};

/**
 * Hook for managing user statistics and achievements
 */
export const useUserStatistics = () => {
  const [statistics, setStatistics] = useState<UserProfile['statistics'] | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [favoriteComponents, setFavoriteComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user statistics
   */
  const fetchStatistics = useCallback(async() => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, achievementsData, favoritesData] = await Promise.all([
        UserService.getUserStatistics(),
        UserService.getUserAchievements(),
        UserService.getFavoriteComponents()
      ]);

      setStatistics(statsData);
      setAchievements(achievementsData);
      setFavoriteComponents(favoritesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh statistics data
   */
  const refreshStatistics = useCallback(async() => {
    await fetchStatistics();
  }, [fetchStatistics]);

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    achievements,
    favoriteComponents,
    loading,
    error,
    refreshStatistics
  };
};

/**
 * Hook for managing user level and progress
 */
export const useUserLevel = (totalXP: number) => {
  const [levelData, setLevelData] = useState(() => UserService.calculateUserLevel(totalXP));

  useEffect(() => {
    setLevelData(UserService.calculateUserLevel(totalXP));
  }, [totalXP]);

  return levelData;
};

/**
 * Hook for managing avatar upload state
 */
export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError('Image file size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  /**
   * Clear preview
   */
  const clearPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    preview,
    handleFileSelect,
    clearPreview,
    setUploading,
    setProgress,
    setError
  };
};

/**
 * Hook for form validation
 */
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate field
   */
  const validateField = useCallback((name: string, value: any, rules: any) => {
    const fieldErrors: string[] = [];

    if (rules.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${name} is required`);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(`${name} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      fieldErrors.push(`${name} must be less than ${rules.maxLength} characters`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      fieldErrors.push(`${name} format is invalid`);
    }

    if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      fieldErrors.push(`${name} must be a valid email address`);
    }

    if (rules.url && value && !/^https?:\/\/.+/.test(value)) {
      fieldErrors.push(`${name} must be a valid URL`);
    }

    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[0] || ''
    }));

    return fieldErrors.length === 0;
  }, []);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  /**
   * Check if field has error
   */
  const hasError = useCallback(
    (name: string) => {
      return touched[name] && errors[name];
    },
    [touched, errors]
  );

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    hasError,
    clearErrors,
    clearFieldError
  };
};
