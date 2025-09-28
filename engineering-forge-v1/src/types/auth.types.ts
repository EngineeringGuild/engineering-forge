/**
 * Authentication Types - Engineering Forge V1.0
 *
 * This file defines all TypeScript types related to authentication.
 */

// User roles
export type UserRole = 'student' | 'instructor' | 'admin';

// Authentication request types
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface PublicUser {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
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
  statistics: {
    totalXP: number;
    level: number;
    projectsCompleted: number;
    lessonsCompleted: number;
    achievementsUnlocked: number;
    timeSpent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// JWT payload types
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

// Request with user (for authenticated routes)
export interface AuthenticatedRequest {
  user: PublicUser;
  userId: string;
}

// Token response
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Password change types
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Email verification types
export interface VerifyEmailRequest {
  token: string;
}

// Password reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Session types
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    platform: string;
  };
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}
