/**
 * Authentication Middleware - Engineering Forge V1.0
 *
 * This file contains middleware for authentication and authorization.
 */

import { NextFunction, Request, Response } from 'express';
import { AuthenticationService } from '../services/authService';
import { AuthenticatedRequest, UserRole } from '../types/auth.types';
import { extractTokenFromHeader, isTokenBlacklisted, verifyAccessToken } from '../utils/jwt';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = (req as any).headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user from database
    const authService = new AuthenticationService();
    const user = await authService.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = (req as any).headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    if (isTokenBlacklisted(token)) {
      return next();
    }

    const payload = verifyAccessToken(token);
    const authService = new AuthenticationService();
    const user = await authService.getUserById(payload.userId);

    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Authorization middleware - checks user roles
 */
export function requireRole(roles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
}

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Instructor or Admin middleware
 */
export const requireInstructor = requireRole(['instructor', 'admin']);

/**
 * Student or higher middleware
 */
export const requireStudent = requireRole(['student', 'instructor', 'admin']);

/**
 * Email verification middleware
 */
export function requireEmailVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }

  next();
}

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    // const windowStart = now - windowMs; // TODO: Use in future implementation

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }

    // Get or create rate limit entry
    let rateLimitData = rateLimitMap.get(clientId);
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs
      };
      rateLimitMap.set(clientId, rateLimitData);
    }

    // Check if limit exceeded
    if (rateLimitData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
      });
    }

    // Increment counter
    rateLimitData.count++;

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - rateLimitData.count).toString(),
      'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
    });

    next();
  };
}

/**
 * CORS middleware for authentication endpoints
 */
export function corsAuth(req: Request, res: Response, next: NextFunction) {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

/**
 * Request logging middleware
 */
export function logRequests(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', error);

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
