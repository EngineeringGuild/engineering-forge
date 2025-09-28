/**
 * User Components Index - Engineering Forge V1.0
 *
 * This file exports all user-related components for easy importing.
 */

export { default as AvatarUpload } from './AvatarUpload';
export { default as UserPreferences } from './UserPreferences';
export { default as UserProfile } from './UserProfile';
export { default as UserProfileForm } from './UserProfileForm';
export { default as UserStatistics } from './UserStatistics';

// Re-export types
export type {
  FavoriteComponent,
  PreferencesFormData,
  ProfileFormData,
  UpdatePreferencesRequest,
  UpdateProfileRequest,
  UserAchievement,
  UserPreferences as UserPreferencesType,
  UserProfile as UserProfileType,
  UserStatistics as UserStatisticsType
} from '../../types/user.types';
