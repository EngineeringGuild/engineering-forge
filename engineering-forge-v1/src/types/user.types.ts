/**
 * User Types - Engineering Forge V1.0
 *
 * This file contains all TypeScript types related to user management.
 */

// User profile interface
export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  profile: UserProfileDetails;
  statistics: UserStatistics;
  createdAt: Date;
  updatedAt: Date;
}

// User preferences interface
export interface UserPreferences {
  language: 'en' | 'pt' | 'es' | 'fr';
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// User profile details interface
export interface UserProfileDetails {
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

// User statistics interface
export interface UserStatistics {
  totalXP: number;
  level: number;
  projectsCompleted: number;
  lessonsCompleted: number;
  achievementsUnlocked: number;
  timeSpent: number; // in minutes
}

// User achievement interface
export interface UserAchievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'project' | 'performance' | 'learning' | 'social';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress: number; // 0-100
}

// Favorite component interface
export interface FavoriteComponent {
  _id: string;
  name: string;
  type: string;
  category: string;
  rarity: string;
  cost: number;
  isUnlocked: boolean;
}

// API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Request interfaces
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface UpdatePreferencesRequest {
  language?: 'en' | 'pt' | 'es' | 'fr';
  theme?: 'light' | 'dark';
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
}

export interface AvatarUploadRequest {
  file: File;
}

// Hook interfaces
export interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  updatePreferences: (data: UpdatePreferencesRequest) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export interface UseUserStatisticsReturn {
  statistics: UserStatistics | null;
  achievements: UserAchievement[];
  favoriteComponents: FavoriteComponent[];
  loading: boolean;
  error: string | null;
  refreshStatistics: () => Promise<void>;
}

// Form interfaces
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
}

export interface PreferencesFormData {
  language: 'en' | 'pt' | 'es' | 'fr';
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Avatar upload interface
export interface AvatarUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  preview: string | null;
}

// User level interface
export interface UserLevel {
  level: number;
  xpRequired: number;
  xpCurrent: number;
  xpProgress: number; // 0-100
  nextLevelXp: number;
}

// Export all types
// Note: Most types are already exported from their interface declarations
