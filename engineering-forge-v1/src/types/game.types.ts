// /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/types/game.types.ts

/**
 * Game Types for Engineering Forge V1.0
 * Defines all types related to the 2D construction interface and game mechanics
 */

// Component Types
export type ComponentType = 'engine' | 'chassis' | 'wheels' | 'suspension' | 'brakes' | 'transmission';
export type ComponentCategory = 'mechanical' | 'electrical' | 'structural' | 'aerodynamic';
export type ComponentRarity = 'common' | 'rare' | 'epic' | 'legendary';

// Position and Size
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Component Properties
export interface ComponentProperties {
  power: number;        // Engine power in HP
  weight: number;       // Weight in kg
  efficiency: number;   // Efficiency rating 0-100
  durability: number;   // Durability rating 0-100
  cost: number;         // Cost in credits
  unlockLevel: number;  // Required level to unlock
}

// Component Interface
export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  properties: ComponentProperties;
  position: Position;
  size: Size;
  rotation: number;
  isUnlocked: boolean;
  rarity: ComponentRarity;
  icon: string;
  description: string;
}

// Game Session
export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type GamePhase = 'planning' | 'building' | 'testing' | 'optimizing';

export interface GameSession {
  id: string;
  userId: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  currentPhase: GamePhase;
  components: Component[];
  performance?: PerformanceMetrics;
  score?: number;
  achievements: string[];
}

// Performance Metrics
export interface PerformanceMetrics {
  acceleration: number;    // 0-100 km/h in seconds
  topSpeed: number;        // km/h
  handling: number;        // 0-100 rating
  fuelEfficiency: number;  // km/l
  weight: number;          // kg
  power: number;           // HP
  torque: number;          // Nm
  overall: number;         // Overall rating 0-100
}

// Project Types
export type ProjectType = 'car' | 'bridge' | 'circuit' | 'structure';
export type EngineeringCategory = 'automotive' | 'civil' | 'electrical' | 'mechanical';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ProjectObjective {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  weight: number; // Importance weight for scoring
}

export interface ProjectConstraint {
  id: string;
  type: 'budget' | 'weight' | 'size' | 'time';
  value: number;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  category: EngineeringCategory;
  difficulty: DifficultyLevel;
  objectives: ProjectObjective[];
  constraints: ProjectConstraint[];
  components: Component[];
  targetPerformance: PerformanceMetrics;
  timeLimit?: number; // minutes
  isCompleted: boolean;
  completionTime?: number;
  finalScore?: number;
  maxScore: number;
}

// Drag and Drop Types
export interface DragItem {
  type: 'component';
  component: Component;
  source: 'palette' | 'workspace';
}

export interface DropResult {
  accepted: boolean;
  position: Position;
  component?: Component;
  error?: string;
}

// Workspace Types
export interface WorkspaceGrid {
  cellSize: number;
  width: number;
  height: number;
  snapToGrid: boolean;
}

export interface WorkspaceState {
  components: Component[];
  selectedComponent?: Component;
  hoveredComponent?: Component;
  grid: WorkspaceGrid;
  zoom: number;
  pan: Position;
}

// Component Palette Types
export interface ComponentPalette {
  categories: ComponentCategory[];
  components: Component[];
  selectedCategory: ComponentCategory;
  searchQuery: string;
  filterByRarity?: ComponentRarity;
  filterByUnlocked: boolean;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CompatibilityResult {
  isCompatible: boolean;
  compatibilityScore: number; // 0-100
  issues: string[];
  benefits: string[];
}

// Game Events
export interface GameEvent {
  type: 'component_added' | 'component_removed' | 'component_moved' | 'project_completed' | 'achievement_unlocked';
  timestamp: Date;
  data: any;
}

// Achievement Types
export type AchievementType = 'completion' | 'performance' | 'speed' | 'efficiency' | 'innovation';
export type AchievementCategory = 'builder' | 'engineer' | 'speedster' | 'perfectionist' | 'explorer';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementRequirement {
  type: string;
  value: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  category: AchievementCategory;
  icon: string;
  points: number;
  rarity: AchievementRarity;
  requirements: AchievementRequirement[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
}

// User Progress
export interface UserProgress {
  userId: string;
  level: number;
  experience: number;
  totalScore: number;
  projectsCompleted: number;
  achievementsUnlocked: number;
  playTime: number; // minutes
  lastActive: Date;
}

// Game State
export interface GameState {
  session: GameSession | null;
  project: Project | null;
  workspace: WorkspaceState;
  palette: ComponentPalette;
  performance: PerformanceMetrics | null;
  achievements: Achievement[];
  progress: UserProgress;
  isLoading: boolean;
  error: string | null;
}

// Action Types for State Management
export type GameAction =
  | { type: 'SET_SESSION'; payload: GameSession }
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'ADD_COMPONENT'; payload: Component }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'UPDATE_COMPONENT'; payload: Component }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'SET_WORKSPACE_GRID'; payload: WorkspaceGrid }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: Position }
  | { type: 'SET_PALETTE_CATEGORY'; payload: ComponentCategory }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_PERFORMANCE'; payload: PerformanceMetrics }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

// Physics Calculation Types
export interface PhysicsInputs {
  components: Component[];
  environment: {
    gravity: number;
    airDensity: number;
    temperature: number;
    windSpeed: number;
  };
}

export interface PhysicsOutputs {
  performance: PerformanceMetrics;
  calculations: {
    acceleration: number;
    topSpeed: number;
    handling: number;
    efficiency: number;
  };
  factors: {
    weight: number;
    power: number;
    drag: number;
    friction: number;
  };
}
