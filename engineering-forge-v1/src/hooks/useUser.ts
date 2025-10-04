/**
 * useUser Hook - Engineering Forge V1.0
 *
 * This file contains custom hooks for user management.
 */

import { useCallback, useEffect, useState } from "react";

// Mock types for now - these should be imported from proper types
interface UserProfile {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  statistics: {
    totalXP: number;
    level: number;
    projectsCompleted: number;
    lessonsCompleted: number;
    achievementsUnlocked: number;
    timeSpent: number;
  };
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

interface UpdatePreferencesRequest {
  language?: string;
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
}

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  updatePreferences: (data: UpdatePreferencesRequest) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

// Mock UserService for now
const UserService = {
  getUserProfile: async (): Promise<UserProfile> => {
    // Mock implementation
    return {
      _id: "user-001",
      email: "user@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      statistics: {
        totalXP: 1000,
        level: 5,
        projectsCompleted: 3,
        lessonsCompleted: 10,
        achievementsUnlocked: 2,
        timeSpent: 3600000, // 1 hour in ms
      },
      preferences: {
        language: "en",
        theme: "dark",
        notifications: {
          email: true,
          push: false,
          inApp: true,
        },
      },
      profile: {
        bio: "Test user bio",
        location: "Test City",
      },
    };
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    // Mock implementation
    console.log("Updating profile:", data);
    return UserService.getUserProfile();
  },
  updatePreferences: async (
    data: UpdatePreferencesRequest
  ): Promise<UserProfile["preferences"]> => {
    // Mock implementation
    console.log("Updating preferences:", data);
    return UserService.getUserProfile().then((user) => user.preferences);
  },
  uploadAvatar: async (file: File): Promise<string> => {
    // Mock implementation
    console.log("Uploading avatar:", file.name);
    return "https://example.com/avatar.jpg";
  },
  validateProfileData: (_data: UpdateProfileRequest) => ({
    isValid: true,
    errors: [] as string[],
  }),
  validatePreferencesData: (_data: UpdatePreferencesRequest) => ({
    isValid: true,
    errors: [] as string[],
  }),
  calculateUserLevel: (totalXP: number) => ({
    level: Math.floor(totalXP / 200) + 1,
    xpCurrent: totalXP % 200,
    xpProgress: ((totalXP % 200) / 200) * 100,
    nextLevelXp: 200,
  }),
  formatTimeSpent: (timeSpent: number): string => {
    const hours = Math.floor(timeSpent / 3600000);
    const minutes = Math.floor((timeSpent % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  },
  getAchievementRarityBackground: (rarity: string): string => {
    const backgrounds = {
      common: "bg-gray-100",
      uncommon: "bg-green-100",
      rare: "bg-blue-100",
      epic: "bg-purple-100",
      legendary: "bg-yellow-100",
    };
    return backgrounds[rarity as keyof typeof backgrounds] || "bg-gray-100";
  },
  getAchievementRarityColor: (rarity: string): string => {
    const colors = {
      common: "text-gray-700",
      uncommon: "text-green-700",
      rare: "text-blue-700",
      epic: "text-purple-700",
      legendary: "text-yellow-700",
    };
    return colors[rarity as keyof typeof colors] || "text-gray-700";
  },
  getUserStatistics: async () =>
    UserService.getUserProfile().then((user) => user.statistics),
  getUserAchievements: async () => [
    {
      _id: "1",
      name: "First Project",
      description: "Complete your first project",
      icon: "🏆",
      category: "project",
      rarity: "common",
      unlockedAt: new Date(),
      progress: 100,
    },
    {
      _id: "2",
      name: "Speed Demon",
      description: "Build a car that reaches 100 km/h",
      icon: "⚡",
      category: "performance",
      rarity: "uncommon",
      unlockedAt: null,
      progress: 75,
    },
  ],
  getFavoriteComponents: async () => [
    {
      _id: "1",
      name: "Turbo Engine",
      type: "engine",
      category: "performance",
      rarity: "uncommon",
      cost: 2500,
      isUnlocked: true,
    },
    {
      _id: "2",
      name: "Carbon Fiber Chassis",
      type: "chassis",
      category: "performance",
      rarity: "rare",
      cost: 5000,
      isUnlocked: false,
    },
  ],
  deleteAvatar: async () => {
    console.log("Deleting avatar");
  },
};

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
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await UserService.getUserProfile();
      setUser(userData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest): Promise<boolean> => {
      try {
        setError(null);

        // Validate data
        const validation = UserService.validateProfileData(data);
        if (!validation.isValid) {
          setError(validation.errors.join(", "));
          return false;
        }

        const updatedUser = await UserService.updateProfile(data);
        setUser(updatedUser);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update profile"
        );
        return false;
      }
    },
    []
  );

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(
    async (data: UpdatePreferencesRequest): Promise<boolean> => {
      try {
        setError(null);

        // Validate data
        const validation = UserService.validatePreferencesData(data);
        if (!validation.isValid) {
          setError(validation.errors.join(", "));
          return false;
        }

        const updatedPreferences = await UserService.updatePreferences(data);
        setUser((prev) =>
          prev ? { ...prev, preferences: updatedPreferences } : null
        );
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update preferences"
        );
        return false;
      }
    },
    []
  );

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    try {
      setError(null);

      // Validate file
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image file size must be less than 5MB");
        return false;
      }

      const avatarUrl = await UserService.uploadAvatar(file);
      setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      return false;
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
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
    refreshUser,
  };
};

/**
 * Hook for managing user statistics and achievements
 */
export const useUserStatistics = () => {
  const [statistics, setStatistics] = useState<
    UserProfile["statistics"] | null
  >(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [favoriteComponents, setFavoriteComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user statistics
   */
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, achievementsData, favoritesData] = await Promise.all([
        UserService.getUserStatistics(),
        UserService.getUserAchievements(),
        UserService.getFavoriteComponents(),
      ]);

      setStatistics(statsData);
      setAchievements(achievementsData);
      setFavoriteComponents(favoritesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch statistics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh statistics data
   */
  const refreshStatistics = useCallback(async () => {
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
    refreshStatistics,
  };
};

/**
 * Hook for managing user level and progress
 */
export const useUserLevel = (totalXP: number) => {
  const [levelData, setLevelData] = useState(() =>
    UserService.calculateUserLevel(totalXP)
  );

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
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image file size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
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
    setError,
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

    if (rules.required && (!value || value.toString().trim() === "")) {
      fieldErrors.push(`${name} is required`);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      fieldErrors.push(
        `${name} must be at least ${rules.minLength} characters`
      );
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      fieldErrors.push(
        `${name} must be less than ${rules.maxLength} characters`
      );
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

    setErrors((prev) => ({
      ...prev,
      [name]: fieldErrors[0] || "",
    }));

    return fieldErrors.length === 0;
  }, []);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
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
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    hasError,
    clearErrors,
    clearFieldError,
  };
};
