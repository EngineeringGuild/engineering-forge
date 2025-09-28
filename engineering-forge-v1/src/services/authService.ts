/**
 * Authentication Service - Engineering Forge V1.0
 *
 * This file contains the authentication service with all authentication logic.
 */

import bcrypt from 'bcryptjs';
import { IUser, User } from '../models/User';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  PublicUser,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest
} from '../types/auth.types';
import { blacklistToken, generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthenticationService {
  private readonly SALT_ROUNDS = 12;

  /**
   * Register a new user
   */
  async registerUser(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email.toLowerCase() }, { username: userData.username }]
      });

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          return {
            success: false,
            message: 'Email already registered'
          };
        } else {
          return {
            success: false,
            message: 'Username already taken'
          };
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      // Create user
      const newUser = new User({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'student',
        isActive: true,
        isEmailVerified: false,
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: {
            email: true,
            push: true,
            inApp: true
          }
        },
        profile: {},
        statistics: {
          totalXP: 0,
          level: 1,
          projectsCompleted: 0,
          lessonsCompleted: 0,
          achievementsUnlocked: 0,
          timeSpent: 0
        }
      });

      await newUser.save();

      // Generate tokens
      const tokens = generateTokens(newUser._id, newUser.email, newUser.role);

      // Update last login
      newUser.lastLoginAt = new Date();
      await newUser.save();

      // Convert to public user
      const publicUser = this.toPublicUser(newUser);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: publicUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({
        email: loginData.email.toLowerCase(),
        isActive: true
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens
      const tokens = generateTokens(user._id, user.email, user.role);

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Convert to public user
      const publicUser = this.toPublicUser(user);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: publicUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Generate new tokens
      const tokens = generateTokens(user._id, user.email, user.role);

      // Convert to public user
      const publicUser = this.toPublicUser(user);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: publicUser,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed'
      };
    }
  }

  /**
   * Logout user (blacklist token)
   */
  async logoutUser(accessToken: string): Promise<AuthResponse> {
    try {
      // Blacklist the token
      blacklistToken(accessToken);

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed'
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, passwordData: ChangePasswordRequest): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordData.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, this.SALT_ROUNDS);

      // Update password
      user.password = hashedNewPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Password change failed'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<PublicUser | null> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }
      return this.toPublicUser(user);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(verifyData: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      // In a real implementation, you would verify the token
      // For now, we'll just mark the email as verified
      const user = await User.findOne({ email: verifyData.token }); // This is a placeholder

      if (!user) {
        return {
          success: false,
          message: 'Invalid verification token'
        };
      }

      user.isEmailVerified = true;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed'
      };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: forgotData.email.toLowerCase() });

      if (!user) {
        // Don't reveal if email exists or not
        return {
          success: true,
          message: 'If the email exists, a reset link has been sent'
        };
      }

      // In a real implementation, you would:
      // 1. Generate a secure reset token
      // 2. Store it in the database with expiration
      // 3. Send an email with the reset link

      return {
        success: true,
        message: 'If the email exists, a reset link has been sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Password reset request failed'
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(_resetData: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      // In a real implementation, you would verify the reset token
      // For now, this is a placeholder
      return {
        success: false,
        message: 'Password reset not implemented yet'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed'
      };
    }
  }

  /**
   * Convert user to public user (remove sensitive data)
   */
  private toPublicUser(user: IUser): PublicUser {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      preferences: user.preferences,
      profile: user.profile,
      statistics: user.statistics,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate username format
   */
  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
