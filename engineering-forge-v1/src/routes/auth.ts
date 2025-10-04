/**
 * Authentication Routes - Engineering Forge V1.0
 *
 * This file contains all authentication-related API routes.
 */

import { Request, Response, Router } from "express";
import { AuthenticationService } from "../domains/gaming/infrastructure/services/authService";
import {
  authenticateToken,
  corsAuth,
  errorHandler,
  logRequests,
  rateLimit,
} from "../middleware/auth";
import {
  ApiResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth.types";

// Create auth service instance
const authService = new AuthenticationService();

const router = Router();

// Apply middleware to all auth routes
router.use(corsAuth);
router.use(logRequests);

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
  "/register",
  rateLimit(15 * 60 * 1000, 5),
  async (req: Request, res: Response) => {
    try {
      const {
        email,
        password,
        username,
        firstName,
        lastName,
      }: RegisterRequest = req.body;

      // Validate required fields
      if (!email || !password || !username || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
          errors: [
            { field: "email", message: "Email is required" },
            { field: "password", message: "Password is required" },
            { field: "username", message: "Username is required" },
            { field: "firstName", message: "First name is required" },
            { field: "lastName", message: "Last name is required" },
          ],
        } as ApiResponse);
      }

      // Validate email format
      if (!authService.validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          errors: [
            { field: "email", message: "Please enter a valid email address" },
          ],
        } as ApiResponse);
      }

      // Validate password strength
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Password does not meet requirements",
          errors: passwordValidation.errors.map((error) => ({
            field: "password",
            message: error,
          })),
        } as ApiResponse);
      }

      // Validate username format
      const usernameValidation = authService.validateUsername(username);
      if (!usernameValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Username does not meet requirements",
          errors: usernameValidation.errors.map((error) => ({
            field: "username",
            message: error,
          })),
        } as ApiResponse);
      }

      // Register user
      const result = await authService.registerUser({
        email,
        password,
        username,
        firstName,
        lastName,
      });

      const statusCode = result.success ? 201 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/login
 * Authenticate user login
 */
router.post(
  "/login",
  rateLimit(15 * 60 * 1000, 10),
  async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
          errors: [
            { field: "email", message: "Email is required" },
            { field: "password", message: "Password is required" },
          ],
        } as ApiResponse);
      }

      // Validate email format
      if (!authService.validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          errors: [
            { field: "email", message: "Please enter a valid email address" },
          ],
        } as ApiResponse);
      }

      // Authenticate user
      const result = await authService.loginUser({ email, password });

      const statusCode = result.success ? 200 : 401;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  rateLimit(15 * 60 * 1000, 20),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
          errors: [
            { field: "refreshToken", message: "Refresh token is required" },
          ],
        } as ApiResponse);
      }

      // Refresh token
      const result = await authService.refreshAccessToken(refreshToken);

      const statusCode = result.success ? 200 : 401;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/logout
 * Logout user (blacklist token)
 */
router.post(
  "/logout",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const authHeader = (req as any).headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        } as ApiResponse);
      }

      // Logout user
      const result = await authService.logoutUser(token);

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * GET /auth/me
 * Get current user profile
 */
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    } as ApiResponse);
  }
});

/**
 * PUT /auth/change-password
 * Change user password
 */
router.put(
  "/change-password",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        } as ApiResponse);
      }

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
          errors: [
            {
              field: "currentPassword",
              message: "Current password is required",
            },
            { field: "newPassword", message: "New password is required" },
          ],
        } as ApiResponse);
      }

      // Validate new password strength
      const passwordValidation = authService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "New password does not meet requirements",
          errors: passwordValidation.errors.map((error) => ({
            field: "newPassword",
            message: error,
          })),
        } as ApiResponse);
      }

      // Change password - Mock implementation
      const result = {
        success: true,
        message: "Password changed successfully",
        data: null,
      };

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/forgot-password
 * Request password reset
 */
router.post(
  "/forgot-password",
  rateLimit(15 * 60 * 1000, 3),
  async (req: Request, res: Response) => {
    try {
      const { email }: ForgotPasswordRequest = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
          errors: [{ field: "email", message: "Email is required" }],
        } as ApiResponse);
      }

      // Validate email format
      if (!authService.validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
          errors: [
            { field: "email", message: "Please enter a valid email address" },
          ],
        } as ApiResponse);
      }

      // Request password reset
      const result = await authService.forgotPassword({ email });

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post(
  "/reset-password",
  rateLimit(15 * 60 * 1000, 3),
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword }: ResetPasswordRequest = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required",
          errors: [
            { field: "token", message: "Reset token is required" },
            { field: "newPassword", message: "New password is required" },
          ],
        } as ApiResponse);
      }

      // Validate new password strength
      const passwordValidation = authService.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "New password does not meet requirements",
          errors: passwordValidation.errors.map((error) => ({
            field: "newPassword",
            message: error,
          })),
        } as ApiResponse);
      }

      // Reset password
      const result = await authService.resetPassword({ token, newPassword });

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

/**
 * POST /auth/verify-email
 * Verify user email
 */
router.post(
  "/verify-email",
  rateLimit(15 * 60 * 1000, 5),
  async (req: Request, res: Response) => {
    try {
      const { token }: VerifyEmailRequest = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
          errors: [
            { field: "token", message: "Verification token is required" },
          ],
        } as ApiResponse);
      }

      // Verify email
      const result = await authService.verifyEmail({ token });

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      } as ApiResponse);
    }
  }
);

// Apply error handling middleware
router.use(errorHandler);

export default router;
