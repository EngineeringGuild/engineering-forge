/**
 * Validation Middleware - Engineering Forge V1.0
 *
 * This file contains validation middleware for API endpoints.
 */

import { NextFunction, Request, Response } from "express";

// Mock types for now - these should be imported from proper types
interface ApiResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
  data?: any;
}

interface ValidationError {
  field: string;
  message: string;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Username validation
export function validateUsername(username: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!username || username.length < 3) {
    errors.push({
      field: "username",
      message: "Username must be at least 3 characters long",
    });
  }

  if (username && username.length > 30) {
    errors.push({
      field: "username",
      message: "Username must be less than 30 characters",
    });
  }

  if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push({
      field: "username",
      message:
        "Username can only contain letters, numbers, underscores, and hyphens",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Password validation
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!password || password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long",
    });
  }

  if (password && !/[A-Z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (password && !/[a-z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (password && !/\d/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one number",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Project validation
export function validateProject(project: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!project.name || project.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Project name is required",
    });
  }

  if (project.name && project.name.length > 100) {
    errors.push({
      field: "name",
      message: "Project name must be less than 100 characters",
    });
  }

  if (!project.description || project.description.trim().length === 0) {
    errors.push({
      field: "description",
      message: "Project description is required",
    });
  }

  if (project.description && project.description.length > 500) {
    errors.push({
      field: "description",
      message: "Project description must be less than 500 characters",
    });
  }

  const validTypes = ["car", "truck", "motorcycle", "boat", "airplane"];
  if (!project.type || !validTypes.includes(project.type)) {
    errors.push({
      field: "type",
      message: `Project type must be one of: ${validTypes.join(", ")}`,
    });
  }

  const validDifficulties = ["beginner", "intermediate", "advanced"];
  if (!project.difficulty || !validDifficulties.includes(project.difficulty)) {
    errors.push({
      field: "difficulty",
      message: `Project difficulty must be one of: ${validDifficulties.join(
        ", "
      )}`,
    });
  }

  if (project.tags && Array.isArray(project.tags)) {
    if (project.tags.length > 10) {
      errors.push({
        field: "tags",
        message: "Project can have at most 10 tags",
      });
    }

    project.tags.forEach((tag: string, index: number) => {
      if (typeof tag !== "string" || tag.length > 20) {
        errors.push({
          field: `tags[${index}]`,
          message: "Each tag must be a string with maximum 20 characters",
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Component validation
export function validateComponent(component: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!component.name || component.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Component name is required",
    });
  }

  if (component.name && component.name.length > 100) {
    errors.push({
      field: "name",
      message: "Component name must be less than 100 characters",
    });
  }

  const validTypes = [
    "engine",
    "chassis",
    "wheels",
    "suspension",
    "transmission",
    "brakes",
    "aerodynamics",
  ];
  if (!component.type || !validTypes.includes(component.type)) {
    errors.push({
      field: "type",
      message: `Component type must be one of: ${validTypes.join(", ")}`,
    });
  }

  const validCategories = [
    "performance",
    "handling",
    "efficiency",
    "durability",
  ];
  if (!component.category || !validCategories.includes(component.category)) {
    errors.push({
      field: "category",
      message: `Component category must be one of: ${validCategories.join(
        ", "
      )}`,
    });
  }

  const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];
  if (!component.rarity || !validRarities.includes(component.rarity)) {
    errors.push({
      field: "rarity",
      message: `Component rarity must be one of: ${validRarities.join(", ")}`,
    });
  }

  if (typeof component.cost !== "number" || component.cost < 0) {
    errors.push({
      field: "cost",
      message: "Component cost must be a non-negative number",
    });
  }

  if (typeof component.unlockLevel !== "number" || component.unlockLevel < 1) {
    errors.push({
      field: "unlockLevel",
      message: "Component unlock level must be a positive number",
    });
  }

  if (!component.properties || typeof component.properties !== "object") {
    errors.push({
      field: "properties",
      message: "Component properties are required",
    });
  } else {
    const requiredProperties = [
      "power",
      "weight",
      "efficiency",
      "durability",
      "handling",
    ];
    requiredProperties.forEach((prop) => {
      if (
        typeof component.properties[prop] !== "number" ||
        component.properties[prop] < 0
      ) {
        errors.push({
          field: `properties.${prop}`,
          message: `${prop} must be a non-negative number`,
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Query parameters validation
export function validateQueryParams(query: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (query.page && (isNaN(Number(query.page)) || Number(query.page) < 1)) {
    errors.push({
      field: "page",
      message: "Page must be a positive number",
    });
  }

  if (
    query.limit &&
    (isNaN(Number(query.limit)) ||
      Number(query.limit) < 1 ||
      Number(query.limit) > 100)
  ) {
    errors.push({
      field: "limit",
      message: "Limit must be a number between 1 and 100",
    });
  }

  if (query.order && !["asc", "desc"].includes(query.order)) {
    errors.push({
      field: "order",
      message: 'Order must be either "asc" or "desc"',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generic validation middleware factory
export function createValidationMiddleware(
  validator: (data: any) => ValidationResult
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validator(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      } as ApiResponse);
    }

    next();
  };
}

// Specific validation middlewares
export const validateProjectData = createValidationMiddleware(validateProject);
export const validateComponentData =
  createValidationMiddleware(validateComponent);
export const validateQueryParamsData =
  createValidationMiddleware(validateQueryParams);

// Sanitization middleware
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  // Sanitize string inputs
  const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, "");
  };

  // Recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

// File upload validation
export function validateFileUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (!(req as any).file) {
    return next();
  }

  if (!allowedMimeTypes.includes((req as any).file.mimetype)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed",
      errors: [{ field: "file", message: "Invalid file type" }],
    } as ApiResponse);
  }

  if ((req as any).file.size > maxFileSize) {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB",
      errors: [{ field: "file", message: "File too large" }],
    } as ApiResponse);
  }

  next();
}

// Pagination middleware
export function paginate(req: Request, _res: Response, next: NextFunction) {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
}

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}
