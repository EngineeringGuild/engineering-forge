/**
 * User Model - Engineering Forge V1.0
 *
 * This file defines the User schema and model for the user management domain.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

// User interface
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
  };
  statistics: {
    totalXP: number;
    level: number;
    projectsCompleted: number;
    lessonsCompleted: number;
    achievementsUnlocked: number;
    timeSpent: number; // in minutes
  };
  createdAt: Date;
  updatedAt: Date;
}

// User preferences schema
const userPreferencesSchema = new Schema(
  {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'pt', 'es', 'fr']
    },
    theme: {
      type: String,
      default: 'dark',
      enum: ['light', 'dark']
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  { _id: false }
);

// User profile schema
const userProfileSchema = new Schema(
  {
    bio: { type: String, maxlength: 500 },
    location: { type: String, maxlength: 100 },
    website: { type: String },
    github: { type: String },
    linkedin: { type: String }
  },
  { _id: false }
);

// User statistics schema
const userStatisticsSchema = new Schema(
  {
    totalXP: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    projectsCompleted: { type: Number, default: 0, min: 0 },
    lessonsCompleted: { type: Number, default: 0, min: 0 },
    achievementsUnlocked: { type: Number, default: 0, min: 0 },
    timeSpent: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

// User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ]
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({})
    },
    profile: {
      type: userProfileSchema,
      default: () => ({})
    },
    statistics: {
      type: userStatisticsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better performance (email and username already indexed by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'statistics.totalXP': -1 });
userSchema.index({ 'statistics.level': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.username || `${this.firstName} ${this.lastName}`;
});

// Transform output to remove sensitive data
userSchema.set('toJSON', {
  transform: function(_doc: any, ret: any) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// Transform output for public display
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.email;
  delete user.isEmailVerified;
  return user;
};

// Pre-save middleware to update level based on XP
userSchema.pre('save', function(next) {
  if (this.isModified('statistics.totalXP')) {
    // Simple level calculation: 100 XP per level
    this.statistics.level = Math.floor(this.statistics.totalXP / 100) + 1;
  }
  next();
});

// Create and export the model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Export types
export type UserDocument = IUser;
export type CreateUserInput = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;
export type PublicUser = Omit<IUser, 'password' | 'email'>;
