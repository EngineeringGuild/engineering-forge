/**
 * User Routes - Engineering Forge V1.0
 *
 * This file contains all user-related API routes.
 */

import { Router } from "express";
import {
  addComponentToFavorites,
  getUserAchievements,
  getUserFavoriteComponents,
  getUserPreferences,
  getUserProfile,
  getUserStatistics,
  removeComponentFromFavorites,
  updateUserPreferences,
  updateUserProfile,
} from "../domains/gaming/application/use-cases/userController";
import {
  authenticateToken,
  corsAuth,
  errorHandler,
  logRequests,
  rateLimit,
} from "../middleware/auth";
import { sanitizeInput } from "../middleware/validation";

const router = Router();

// Apply middleware to all user routes
router.use(corsAuth);
router.use(logRequests);
router.use(sanitizeInput);

// All user routes require authentication
router.use(authenticateToken);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get("/profile", getUserProfile);

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put("/profile", rateLimit(15 * 60 * 1000, 10), updateUserProfile);

/**
 * GET /api/users/statistics
 * Get user statistics
 */
router.get("/statistics", getUserStatistics);

/**
 * GET /api/users/achievements
 * Get user achievements
 */
router.get("/achievements", getUserAchievements);

/**
 * GET /api/users/favorites
 * Get user's favorite components
 */
router.get("/favorites", getUserFavoriteComponents);

/**
 * POST /api/users/favorites
 * Add component to favorites
 */
router.post(
  "/favorites",
  rateLimit(15 * 60 * 1000, 20),
  addComponentToFavorites
);

/**
 * DELETE /api/users/favorites/:componentId
 * Remove component from favorites
 */
router.delete(
  "/favorites/:componentId",
  rateLimit(15 * 60 * 1000, 20),
  removeComponentFromFavorites
);

/**
 * GET /api/users/preferences
 * Get user preferences
 */
router.get("/preferences", getUserPreferences);

/**
 * PUT /api/users/preferences
 * Update user preferences
 */
router.put(
  "/preferences",
  rateLimit(15 * 60 * 1000, 10),
  updateUserPreferences
);

// Apply error handling middleware
router.use(errorHandler);

export default router;
