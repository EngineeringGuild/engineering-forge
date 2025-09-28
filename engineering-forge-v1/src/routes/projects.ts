/**
 * Project Routes - Engineering Forge V1.0
 *
 * This file contains all project-related API routes.
 */

import { Router } from 'express';
import {
  addComponentToProject,
  createProject,
  deleteProject,
  getProjectById,
  getProjectStatistics,
  getPublicProjects,
  getUserProjects,
  removeComponentFromProject,
  updateProject
} from '../controllers/projectController';
import {
  authenticateToken,
  corsAuth,
  errorHandler,
  logRequests,
  rateLimit
} from '../middleware/auth';
import { paginate, sanitizeInput, validateProjectData } from '../middleware/validation';

const router = Router();

// Apply middleware to all project routes
router.use(corsAuth);
router.use(logRequests);
router.use(sanitizeInput);

/**
 * GET /api/projects/public
 * Get public projects with filtering and pagination
 */
router.get('/public', paginate, getPublicProjects);

/**
 * GET /api/projects/statistics
 * Get project statistics
 */
router.get('/statistics', getProjectStatistics);

/**
 * GET /api/projects/:id
 * Get project by ID
 */
router.get('/:id', getProjectById);

// All routes below require authentication
router.use(authenticateToken);

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', rateLimit(15 * 60 * 1000, 10), validateProjectData, createProject);

/**
 * GET /api/projects
 * Get user's projects
 */
router.get('/', paginate, getUserProjects);

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', rateLimit(15 * 60 * 1000, 20), validateProjectData, updateProject);

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', rateLimit(15 * 60 * 1000, 5), deleteProject);

/**
 * POST /api/projects/:id/components
 * Add component to project
 */
router.post('/:id/components', rateLimit(15 * 60 * 1000, 30), addComponentToProject);

/**
 * DELETE /api/projects/:id/components/:componentId
 * Remove component from project
 */
router.delete(
  '/:id/components/:componentId',
  rateLimit(15 * 60 * 1000, 30),
  removeComponentFromProject
);

// Apply error handling middleware
router.use(errorHandler);

export default router;
