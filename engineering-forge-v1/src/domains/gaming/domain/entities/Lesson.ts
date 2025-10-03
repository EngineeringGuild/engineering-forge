/**
 * Lesson Model - Engineering Forge V1.0
 *
 * This file defines the Lesson and Course schemas for the education domain.
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

// Lesson content interface
export interface ILessonContent {
  type: 'text' | 'video' | 'interactive' | 'quiz' | 'project';
  title: string;
  content: string | string[];
  metadata?: {
    duration?: number; // in minutes
    difficulty?: 'easy' | 'medium' | 'hard';
    prerequisites?: string[];
  };
}

// Lesson interface
export interface ILesson extends Document {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  content: ILessonContent[];
  objectives: string[];
  prerequisites: string[];
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  tags: string[];
  resources: {
    documents: string[];
    videos: string[];
    links: string[];
  };
  assessment?: {
    questions: Array<{
      id: string;
      type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
      question: string;
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      explanation?: string;
    }>;
    passingScore: number; // percentage
    timeLimit?: number; // in minutes
  };
  createdAt: Date;
  updatedAt: Date;
}

// Course interface
export interface ICourse extends Document {
  _id: string;
  title: string;
  description: string;
  instructorId: string;
  category: 'automotive' | 'mechanical' | 'electrical' | 'civil' | 'aerospace';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // total minutes
  lessons: string[]; // lesson IDs
  prerequisites: string[];
  objectives: string[];
  isPublished: boolean;
  thumbnail?: string;
  tags: string[];
  enrollment: {
    totalEnrolled: number;
    completed: number;
    averageRating: number;
    totalRatings: number;
  };
  pricing: {
    isFree: boolean;
    price?: number;
    currency: string;
  };
  metadata: {
    version: string;
    lastUpdated: Date;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Lesson content schema
const lessonContentSchema = new Schema<ILessonContent>(
  {
    type: {
      type: String,
      required: true,
      enum: ['text', 'video', 'interactive', 'quiz', 'project']
    },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    metadata: {
      duration: { type: Number, min: 0 },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
      prerequisites: [{ type: String }]
    }
  },
  { _id: false }
);

// Assessment question schema
const assessmentQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['multiple-choice', 'true-false', 'fill-blank', 'short-answer']
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    points: { type: Number, required: true, min: 0 },
    explanation: { type: String }
  },
  { _id: false }
);

// Assessment schema
const assessmentSchema = new Schema(
  {
    questions: [assessmentQuestionSchema],
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    timeLimit: { type: Number, min: 0 }
  },
  { _id: false }
);

// Lesson schema
const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    courseId: {
      type: String,
      required: true,
      ref: 'Course'
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    content: [lessonContentSchema],
    objectives: [
      {
        type: String,
        trim: true,
        maxlength: 200
      }
    ],
    prerequisites: [
      {
        type: String,
        ref: 'Lesson'
      }
    ],
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30
      }
    ],
    resources: {
      documents: [{ type: String }],
      videos: [{ type: String }],
      links: [{ type: String }]
    },
    assessment: assessmentSchema
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Course schema
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    instructorId: {
      type: String,
      required: true,
      ref: 'User'
    },
    category: {
      type: String,
      required: true,
      enum: ['automotive', 'mechanical', 'electrical', 'civil', 'aerospace']
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    lessons: [
      {
        type: String,
        ref: 'Lesson'
      }
    ],
    prerequisites: [
      {
        type: String,
        ref: 'Course'
      }
    ],
    objectives: [
      {
        type: String,
        trim: true,
        maxlength: 200
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    },
    thumbnail: {
      type: String
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30
      }
    ],
    enrollment: {
      totalEnrolled: { type: Number, default: 0, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0, min: 0 }
    },
    pricing: {
      isFree: { type: Boolean, default: true },
      price: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' }
    },
    metadata: {
      version: { type: String, default: '1.0.0' },
      lastUpdated: { type: Date, default: Date.now },
      language: { type: String, default: 'en' }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for better performance
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ isPublished: 1 });
lessonSchema.index({ difficulty: 1 });
lessonSchema.index({ tags: 1 });
lessonSchema.index({ title: 'text', description: 'text' });

courseSchema.index({ instructorId: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'enrollment.averageRating': -1 });
courseSchema.index({ 'pricing.isFree': 1 });
courseSchema.index({ title: 'text', description: 'text' });

// Virtual for lesson count in course
courseSchema.virtual('lessonCount').get(function() {
  return this.lessons.length;
});

// Virtual for completion rate
courseSchema.virtual('completionRate').get(function() {
  if (this.enrollment.totalEnrolled === 0) {
return 0;
}
  return Math.round((this.enrollment.completed / this.enrollment.totalEnrolled) * 100);
});

// Pre-save middleware to update metadata
courseSchema.pre('save', function(next) {
  if (this.isModified('lessons') || this.isModified('description')) {
    this.metadata.lastUpdated = new Date();
  }
  next();
});

// Method to calculate course duration from lessons
courseSchema.methods.calculateDuration = function(lessons: ILesson[]): number {
  return lessons.reduce((total, lesson) => total + lesson.estimatedDuration, 0);
};

// Method to update enrollment stats
courseSchema.methods.updateEnrollmentStats = function(enrolled: number, completed: number) {
  this.enrollment.totalEnrolled = enrolled;
  this.enrollment.completed = completed;
  this.save();
};

// Method to update rating
courseSchema.methods.updateRating = function(newRating: number) {
  const totalRatings = this.enrollment.totalRatings + 1;
  const currentTotal = this.enrollment.averageRating * this.enrollment.totalRatings;
  this.enrollment.averageRating = (currentTotal + newRating) / totalRatings;
  this.enrollment.totalRatings = totalRatings;
  this.save();
};

// Create and export the models
export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', lessonSchema);
export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

// Export types
export type LessonDocument = ILesson;
export type CourseDocument = ICourse;
export type CreateLessonInput = Omit<ILesson, '_id' | 'createdAt' | 'updatedAt'>;
export type CreateCourseInput = Omit<ICourse, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateLessonInput = Partial<CreateLessonInput>;
export type UpdateCourseInput = Partial<CreateCourseInput>;
export type LessonContentInput = ILessonContent;
