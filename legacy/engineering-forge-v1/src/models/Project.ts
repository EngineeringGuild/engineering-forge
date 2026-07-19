/**
 * Project Model - Engineering Forge V1.0
 *
 * This file defines the Project schema and model for the gaming domain.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

// Component interface
export interface IComponent {
  id: string;
  type: 'engine' | 'chassis' | 'wheels' | 'suspension' | 'transmission' | 'brakes';
  name: string;
  properties: {
    power: number; // horsepower
    weight: number; // kg
    efficiency: number; // 0-100
    durability: number; // 0-100
    cost: number; // credits
  };
  position: {
    x: number;
    y: number;
  };
  rotation: number; // degrees
  isUnlocked: boolean;
}

// Performance metrics interface
export interface IPerformance {
  acceleration: number; // 0-100 km/h in seconds
  topSpeed: number; // km/h
  handling: number; // 0-100
  weight: number; // kg
  power: number; // total horsepower
  efficiency: number; // 0-100
  cost: number; // total cost
}

// Project interface
export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  userId: string;
  category: 'car' | 'truck' | 'motorcycle' | 'custom';
  components: IComponent[];
  performance: IPerformance;
  isPublic: boolean;
  isTemplate: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  likes: number;
  views: number;
  downloads: number;
  status: 'draft' | 'completed' | 'published';
  metadata: {
    buildTime: number; // minutes spent building
    lastModified: Date;
    version: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Component schema
const componentSchema = new Schema<IComponent>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['engine', 'chassis', 'wheels', 'suspension', 'transmission', 'brakes']
    },
    name: { type: String, required: true },
    properties: {
      power: { type: Number, required: true, min: 0 },
      weight: { type: Number, required: true, min: 0 },
      efficiency: { type: Number, required: true, min: 0, max: 100 },
      durability: { type: Number, required: true, min: 0, max: 100 },
      cost: { type: Number, required: true, min: 0 }
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    },
    rotation: { type: Number, default: 0, min: 0, max: 360 },
    isUnlocked: { type: Boolean, default: false }
  },
  { _id: false }
);

// Performance schema
const performanceSchema = new Schema<IPerformance>(
  {
    acceleration: { type: Number, default: 0, min: 0 },
    topSpeed: { type: Number, default: 0, min: 0 },
    handling: { type: Number, default: 0, min: 0, max: 100 },
    weight: { type: Number, default: 0, min: 0 },
    power: { type: Number, default: 0, min: 0 },
    efficiency: { type: Number, default: 0, min: 0, max: 100 },
    cost: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

// Project schema
const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    category: {
      type: String,
      required: true,
      enum: ['car', 'truck', 'motorcycle', 'custom']
    },
    components: [componentSchema],
    performance: {
      type: performanceSchema,
      default: () => ({})
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30
      }
    ],
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    downloads: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'completed', 'published'],
      default: 'draft'
    },
    metadata: {
      buildTime: { type: Number, default: 0, min: 0 },
      lastModified: { type: Date, default: Date.now },
      version: { type: String, default: '1.0.0' }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better performance
projectSchema.index({ userId: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ isTemplate: 1 });
projectSchema.index({ difficulty: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'performance.topSpeed': -1 });
projectSchema.index({ 'performance.handling': -1 });
projectSchema.index({ likes: -1 });
projectSchema.index({ views: -1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ updatedAt: -1 });

// Text search index
projectSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for total components count
projectSchema.virtual('componentCount').get(function () {
  return this.components.length;
});

// Virtual for performance score (0-100)
projectSchema.virtual('performanceScore').get(function () {
  const perf = this.performance;
  if (!perf) return 0;

  // Weighted performance calculation
  const accelerationScore = Math.min(perf.acceleration / 10, 1) * 25; // 25% weight
  const speedScore = Math.min(perf.topSpeed / 200, 1) * 25; // 25% weight
  const handlingScore = (perf.handling / 100) * 25; // 25% weight
  const efficiencyScore = (perf.efficiency / 100) * 25; // 25% weight

  return Math.round(accelerationScore + speedScore + handlingScore + efficiencyScore);
});

// Pre-save middleware to update metadata
projectSchema.pre('save', function (next) {
  if (this.isModified('components') || this.isModified('performance')) {
    this.metadata.lastModified = new Date();
    this.metadata.version = (this as any).incrementVersion(this.metadata.version || '1.0.0');
  }
  next();
});

// Method to increment version
projectSchema.methods.incrementVersion = function (currentVersion: string): string {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  return `${major}.${minor}.${(patch || 0) + 1}`;
};

// Method to calculate performance
projectSchema.methods.calculatePerformance = function (): IPerformance {
  const components = this.components;

  // Calculate totals
  const totalPower = components.reduce(
    (sum: number, comp: IComponent) => sum + (comp.properties.power || 0),
    0
  );
  const totalWeight = components.reduce(
    (sum: number, comp: IComponent) => sum + (comp.properties.weight || 0),
    0
  );
  const totalCost = components.reduce(
    (sum: number, comp: IComponent) => sum + (comp.properties.cost || 0),
    0
  );

  // Calculate efficiency (average of all components)
  const avgEfficiency =
    components.length > 0
      ? components.reduce(
          (sum: number, comp: IComponent) => sum + (comp.properties.efficiency || 0),
          0
        ) / components.length
      : 0;

  // Calculate performance metrics
  const acceleration = totalWeight > 0 ? (totalPower * 0.8) / totalWeight : 0;
  const topSpeed = totalPower > 0 ? Math.sqrt(totalPower / 0.3) : 0;
  const handling =
    components.length > 0
      ? components.reduce(
          (sum: number, comp: IComponent) => sum + (comp.properties.efficiency || 0),
          0
        ) / components.length
      : 0;

  return {
    acceleration: Math.round(acceleration * 100) / 100,
    topSpeed: Math.round(topSpeed * 100) / 100,
    handling: Math.round(handling * 100) / 100,
    weight: totalWeight,
    power: totalPower,
    efficiency: Math.round(avgEfficiency * 100) / 100,
    cost: totalCost
  };
};

// Create and export the model
export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

// Export types
export type ProjectDocument = IProject;
export type CreateProjectInput = Omit<IProject, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
export type ComponentInput = IComponent;
export type PerformanceMetrics = IPerformance;
