/**
 * User Routes - Engineering Forge V1.0
 *
 * This file contains all user-related API routes.
 */

import { Router } from "express";
import {
  authenticateToken,
  corsAuth,
  errorHandler,
  logRequests,
  rateLimit,
} from "../middleware/auth";
import { sanitizeInput } from "../middleware/validation";

// Mock user controller functions for now
const addComponentToFavorites = async (_req: any, _res: any) => {
  _res.json({ success: true, message: "Component added to favorites" });
};

const getUserAchievements = async (_req: any, _res: any) => {
  _res.json({ success: true, data: [] });
};

const getUserFavoriteComponents = async (_req: any, _res: any) => {
  _res.json({ success: true, data: [] });
};

const getUserPreferences = async (_req: any, _res: any) => {
  _res.json({ success: true, data: { language: "en", theme: "dark" } });
};

const getUserProfile = async (_req: any, _res: any) => {
  _res.json({ success: true, data: { id: "user-001", name: "Test User" } });
};

const getUserStatistics = async (_req: any, _res: any) => {
  _res.json({ success: true, data: { level: 1, xp: 0 } });
};

const removeComponentFromFavorites = async (_req: any, _res: any) => {
  _res.json({ success: true, message: "Component removed from favorites" });
};

const updateUserPreferences = async (_req: any, _res: any) => {
  _res.json({ success: true, message: "Preferences updated successfully" });
};

const updateUserProfile = async (_req: any, _res: any) => {
  _res.json({ success: true, message: "Profile updated successfully" });
};

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
