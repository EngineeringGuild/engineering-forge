/**
 * API Types - Engineering Forge V1.0
 *
 * This file defines all TypeScript types related to API endpoints.
 */

import { PublicUser } from './auth.types';

// Base API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Pagination information
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Query parameters for listing
export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// Project types
export interface Project {
  _id: string;
  name: string;
  description: string;
  type: 'car' | 'truck' | 'motorcycle' | 'boat' | 'airplane';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  components: Component[];
  performance: ProjectPerformance;
  author: string; // User ID
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  type: 'car' | 'truck' | 'motorcycle' | 'boat' | 'airplane';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  type?: 'car' | 'truck' | 'motorcycle' | 'boat' | 'airplane';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'in-progress' | 'completed' | 'archived';
  isPublic?: boolean;
  tags?: string[];
}

export interface ProjectPerformance {
  acceleration: number; // 0-100 km/h in seconds
  topSpeed: number; // km/h
  handling: number; // 0-100
  efficiency: number; // 0-100
  weight: number; // kg
  power: number; // hp
  score: number; // Overall score 0-100
}

// Component types
export interface Component {
  _id: string;
  name: string;
  type: 'engine' | 'chassis' | 'wheels' | 'suspension' | 'transmission' | 'brakes' | 'aerodynamics';
  category: 'performance' | 'handling' | 'efficiency' | 'durability';
  properties: ComponentProperties;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number; // In-game currency
  unlockLevel: number;
  isUnlocked: boolean;
  imageUrl?: string;
  description: string;
  manufacturer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentProperties {
  power: number; // Horsepower
  weight: number; // kg
  efficiency: number; // 0-100
  durability: number; // 0-100
  handling: number; // 0-100
  acceleration: number; // 0-100
  topSpeed: number; // 0-100
  braking: number; // 0-100
  aerodynamics: number; // 0-100
}

export interface CreateComponentRequest {
  name: string;
  type: 'engine' | 'chassis' | 'wheels' | 'suspension' | 'transmission' | 'brakes' | 'aerodynamics';
  category: 'performance' | 'handling' | 'efficiency' | 'durability';
  properties: ComponentProperties;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  unlockLevel: number;
  imageUrl?: string;
  description: string;
  manufacturer: string;
}

export interface UpdateComponentRequest {
  name?: string;
  type?:
    | 'engine'
    | 'chassis'
    | 'wheels'
    | 'suspension'
    | 'transmission'
    | 'brakes'
    | 'aerodynamics';
  category?: 'performance' | 'handling' | 'efficiency' | 'durability';
  properties?: Partial<ComponentProperties>;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost?: number;
  unlockLevel?: number;
  imageUrl?: string;
  description?: string;
  manufacturer?: string;
}

// User profile types (extending auth types)
export interface UserProfile extends Omit<PublicUser, 'statistics'> {
  projects: Project[];
  favoriteComponents: string[]; // Component IDs
  achievements: Achievement[];
  statistics: UserStatistics;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
  };
}

// Achievement types
export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'project' | 'component' | 'performance' | 'social' | 'learning';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: AchievementRequirement[];
  reward: AchievementReward;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface AchievementRequirement {
  type: 'project_count' | 'component_count' | 'performance_score' | 'time_spent' | 'level';
  value: number;
  operator: 'gte' | 'lte' | 'eq';
}

export interface AchievementReward {
  xp: number;
  currency: number;
  components?: string[]; // Component IDs
  title?: string;
}

// User statistics
export interface UserStatistics {
  totalXP: number;
  level: number;
  projectsCompleted: number;
  componentsUnlocked: number;
  achievementsUnlocked: number;
  timeSpent: number; // in minutes
  averageProjectScore: number;
  bestPerformanceScore: number;
  favoriteComponentType: string;
  joinDate: Date;
  lastActiveAt: Date;
}

// Search and filter types
export interface SearchFilters {
  type?: string;
  category?: string;
  rarity?: string;
  difficulty?: string;
  status?: string;
  isPublic?: boolean;
  author?: string;
  tags?: string[];
  minLevel?: number;
  maxLevel?: number;
  minCost?: number;
  maxCost?: number;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Request context (for authenticated routes)
export interface RequestContext {
  user: PublicUser;
  userId: string;
  userRole: string;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Bulk operations
export interface BulkOperationRequest {
  operation: 'create' | 'update' | 'delete';
  items: any[];
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: ValidationError[];
  results: any[];
}

// Analytics types
export interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalComponents: number;
  activeUsers: number;
  popularComponents: Component[];
  topPerformers: UserProfile[];
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

// Export/Import types
export interface ExportRequest {
  format: 'json' | 'csv' | 'xlsx';
  includeData: string[];
  filters?: SearchFilters;
}

export interface ImportRequest {
  format: 'json' | 'csv' | 'xlsx';
  data: any[];
  options: {
    overwrite: boolean;
    validate: boolean;
    createMissing: boolean;
  };
}
