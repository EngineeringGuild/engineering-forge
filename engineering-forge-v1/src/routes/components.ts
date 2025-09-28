/**
 * Component Routes - Engineering Forge V1.0
 *
 * This file contains all component-related API routes.
 */

import { Router } from 'express';
import {
  createComponent,
  deleteComponent,
  getComponentById,
  getComponents,
  getComponentsByRarity,
  getComponentsByType,
  getComponentStatistics,
  getUnlockedComponents,
  unlockComponent,
  updateComponent
} from '../controllers/componentController';
import {
  authenticateToken,
  corsAuth,
  errorHandler,
  logRequests,
  rateLimit,
  requireAdmin
} from '../middleware/auth';
import { paginate, sanitizeInput, validateComponentData } from '../middleware/validation';

const router = Router();

// Apply middleware to all component routes
router.use(corsAuth);
router.use(logRequests);
router.use(sanitizeInput);

/**
 * GET /api/components/statistics
 * Get component statistics
 */
router.get('/statistics', getComponentStatistics);

/**
 * GET /api/components/type/:type
 * Get components by type
 */
router.get('/type/:type', getComponentsByType);

/**
 * GET /api/components/rarity/:rarity
 * Get components by rarity
 */
router.get('/rarity/:rarity', getComponentsByRarity);

/**
 * GET /api/components
 * Get all components with filtering and pagination
 */
router.get('/', paginate, getComponents);

/**
 * GET /api/components/:id
 * Get component by ID
 */
router.get('/:id', getComponentById);

// All routes below require authentication
router.use(authenticateToken);

/**
 * GET /api/components/unlocked
 * Get unlocked components for user
 */
router.get('/unlocked', getUnlockedComponents);

/**
 * POST /api/components/:id/unlock
 * Unlock component for user
 */
router.post('/:id/unlock', rateLimit(15 * 60 * 1000, 20), unlockComponent);

// Admin-only routes
router.use(requireAdmin);

/**
 * POST /api/components
 * Create a new component (Admin only)
 */
router.post('/', rateLimit(15 * 60 * 1000, 5), validateComponentData, createComponent);

/**
 * PUT /api/components/:id
 * Update component (Admin only)
 */
router.put('/:id', rateLimit(15 * 60 * 1000, 10), validateComponentData, updateComponent);

/**
 * DELETE /api/components/:id
 * Delete component (Admin only)
 */
router.delete('/:id', rateLimit(15 * 60 * 1000, 5), deleteComponent);

// Apply error handling middleware
router.use(errorHandler);

export default router;
