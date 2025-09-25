/**
 * Database Tests - Engineering Forge V1.0
 *
 * This file contains comprehensive tests for the database layer
 * including connection, models, and service operations.
 */

import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Course, Lesson } from '../models/Lesson';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { databaseService } from '../services/databaseService';

// Test database connection string (using the same cluster for testing)
const TEST_MONGODB_URI =
  'mongodb+srv://caioasc_db_user:CFABOqryHJjtNln1@engineeringforge.hmqats3.mongodb.net/engineering_forge_test?retryWrites=true&w=majority&appName=engineeringforge';

describe('Database Layer Tests', () => {
  beforeAll(async () => {
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGODB_URI);
    }
    await databaseService.initialize();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Lesson.deleteMany({});
    await Course.deleteMany({});

    // Close connections
    await databaseService.close();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear test data before each test
    await User.deleteMany({});
    await Project.deleteMany({});
    await Lesson.deleteMany({});
    await Course.deleteMany({});
  });

  describe('Database Connection', () => {
    it('should connect to MongoDB Atlas successfully', async () => {
      const status = databaseService.getConnectionStatus();
      expect(status).toBe(true);
    });

    it('should return connection info', () => {
      const info = databaseService.getConnectionInfo();
      expect(info).toHaveProperty('connected');
      expect(info).toHaveProperty('host');
      expect(info).toHaveProperty('name');
      expect(info.connected).toBe(true);
    });

    it('should perform health check successfully', async () => {
      const health = await databaseService.healthCheck();
      expect(health.status).toBe('healthy');
      expect(health.connection).toBe(true);
      expect(health.models).toHaveProperty('User');
      expect(health.models).toHaveProperty('Project');
      expect(health.models).toHaveProperty('Lesson');
      expect(health.models).toHaveProperty('Course');
    });
  });

  describe('User Model Tests', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'student' as const
      };

      const user = await databaseService.createUser(userData);
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('student');
      expect(user.statistics.totalXP).toBe(0);
      expect(user.statistics.level).toBe(1);
    });

    it('should find user by email', async () => {
      const userData = {
        email: 'find@example.com',
        password: 'password123',
        username: 'finduser',
        firstName: 'Find',
        lastName: 'User'
      };

      await databaseService.createUser(userData);
      const foundUser = await databaseService.findUserByEmail('find@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('find@example.com');
    });

    it('should find user by username', async () => {
      const userData = {
        email: 'username@example.com',
        password: 'password123',
        username: 'usernameuser',
        firstName: 'Username',
        lastName: 'User'
      };

      await databaseService.createUser(userData);
      const foundUser = await databaseService.findUserByUsername('usernameuser');

      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe('usernameuser');
    });

    it('should update user successfully', async () => {
      const userData = {
        email: 'update@example.com',
        password: 'password123',
        username: 'updateuser',
        firstName: 'Update',
        lastName: 'User'
      };

      const user = await databaseService.createUser(userData);
      const updatedUser = await databaseService.updateUser(user._id, {
        firstName: 'Updated',
        statistics: {
          totalXP: 100,
          level: 2,
          projectsCompleted: 0,
          lessonsCompleted: 0,
          achievementsUnlocked: 0,
          timeSpent: 0
        }
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.firstName).toBe('Updated');
      expect(updatedUser?.statistics.totalXP).toBe(100);
      expect(updatedUser?.statistics.level).toBe(2); // Should auto-calculate level
    });

    it('should delete user successfully', async () => {
      const userData = {
        email: 'delete@example.com',
        password: 'password123',
        username: 'deleteuser',
        firstName: 'Delete',
        lastName: 'User'
      };

      const user = await databaseService.createUser(userData);
      const deleted = await databaseService.deleteUser(user._id);

      expect(deleted).toBe(true);

      const foundUser = await databaseService.findUserById(user._id);
      expect(foundUser).toBeNull();
    });
  });

  describe('Project Model Tests', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create test user for projects
      testUser = await databaseService.createUser({
        email: 'projectuser@example.com',
        password: 'password123',
        username: 'projectuser',
        firstName: 'Project',
        lastName: 'User'
      });
    });

    it('should create a new project successfully', async () => {
      const projectData = {
        name: 'Test Car',
        description: 'A test car project',
        userId: testUser._id,
        category: 'car' as const,
        components: [
          {
            id: 'engine1',
            type: 'engine' as const,
            name: 'V8 Engine',
            properties: {
              power: 300,
              weight: 200,
              efficiency: 80,
              durability: 90,
              cost: 5000
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            isUnlocked: true
          }
        ]
      };

      const project = await databaseService.createProject(projectData);
      expect(project).toBeDefined();
      expect(project.name).toBe('Test Car');
      expect(project.components).toHaveLength(1);
      expect(project.performance).toBeDefined();
      expect(project.performance.power).toBe(300);
      expect(project.performance.weight).toBe(200);
    });

    it('should calculate performance automatically', async () => {
      const projectData = {
        name: 'Performance Test Car',
        userId: testUser._id,
        category: 'car' as const,
        components: [
          {
            id: 'engine1',
            type: 'engine' as const,
            name: 'High Power Engine',
            properties: {
              power: 500,
              weight: 300,
              efficiency: 85,
              durability: 95,
              cost: 10000
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            isUnlocked: true
          },
          {
            id: 'chassis1',
            type: 'chassis' as const,
            name: 'Lightweight Chassis',
            properties: {
              power: 0,
              weight: 150,
              efficiency: 90,
              durability: 80,
              cost: 3000
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            isUnlocked: true
          }
        ]
      };

      const project = await databaseService.createProject(projectData);
      expect(project.performance.power).toBe(500);
      expect(project.performance.weight).toBe(450);
      expect(project.performance.efficiency).toBe(87.5); // Average of 85 and 90
    });

    it('should find projects by user', async () => {
      // Create multiple projects
      await databaseService.createProject({
        name: 'Project 1',
        userId: testUser._id,
        category: 'car' as const,
        components: []
      });

      await databaseService.createProject({
        name: 'Project 2',
        userId: testUser._id,
        category: 'car' as const,
        components: []
      });

      const projects = await databaseService.findProjectsByUser(testUser._id);
      expect(projects).toHaveLength(2);
      expect(projects[0].name).toBe('Project 2'); // Should be sorted by updatedAt desc
    });

    it('should find public projects', async () => {
      // Create public and private projects
      await databaseService.createProject({
        name: 'Public Project',
        userId: testUser._id,
        category: 'car' as const,
        isPublic: true,
        components: []
      });

      await databaseService.createProject({
        name: 'Private Project',
        userId: testUser._id,
        category: 'car' as const,
        isPublic: false,
        components: []
      });

      const publicProjects = await databaseService.findPublicProjects();
      expect(publicProjects).toHaveLength(1);
      expect(publicProjects[0].name).toBe('Public Project');
    });
  });

  describe('Lesson and Course Tests', () => {
    let testInstructor: any;

    beforeEach(async () => {
      // Create test instructor
      testInstructor = await databaseService.createUser({
        email: 'instructor@example.com',
        password: 'password123',
        username: 'instructor',
        firstName: 'Test',
        lastName: 'Instructor',
        role: 'instructor' as const
      });
    });

    it('should create a new course successfully', async () => {
      const courseData = {
        title: 'Introduction to Automotive Engineering',
        description: 'Learn the basics of automotive engineering',
        instructorId: testInstructor._id,
        category: 'automotive' as const,
        level: 'beginner' as const,
        duration: 120,
        objectives: ['Understand basic principles', 'Build first project']
      };

      const course = await databaseService.createCourse(courseData);
      expect(course).toBeDefined();
      expect(course.title).toBe('Introduction to Automotive Engineering');
      expect(course.instructorId).toBe(testInstructor._id);
      expect(course.lessons.length).toBe(0);
    });

    it('should create a new lesson successfully', async () => {
      const course = await databaseService.createCourse({
        title: 'Test Course',
        description: 'Test course description',
        instructorId: testInstructor._id,
        category: 'automotive' as const,
        level: 'beginner' as const,
        duration: 60
      });

      const lessonData = {
        title: 'Introduction to Engines',
        description: 'Learn about different types of engines',
        courseId: course._id,
        order: 1,
        content: [
          {
            type: 'text' as const,
            title: 'What is an Engine?',
            content: 'An engine is a machine that converts energy into mechanical work.'
          }
        ],
        objectives: ['Understand engine basics'],
        estimatedDuration: 30,
        difficulty: 'beginner' as const
      };

      const lesson = await databaseService.createLesson(lessonData);
      expect(lesson).toBeDefined();
      expect(lesson.title).toBe('Introduction to Engines');
      expect(lesson.courseId).toBe(course._id);
      expect(lesson.content).toHaveLength(1);
    });
  });

  describe('Statistics Tests', () => {
    it('should get database statistics', async () => {
      // Create some test data
      const user = await databaseService.createUser({
        email: 'stats@example.com',
        password: 'password123',
        username: 'statsuser',
        firstName: 'Stats',
        lastName: 'User'
      });

      await databaseService.createProject({
        name: 'Stats Project',
        userId: user._id,
        category: 'car' as const,
        isPublic: true,
        components: []
      });

      const stats = await databaseService.getStatistics();
      expect(stats.users).toBe(1);
      expect(stats.projects).toBe(1);
      expect(stats.publicProjects).toBe(1);
    });

    it('should get user statistics', async () => {
      const user = await databaseService.createUser({
        email: 'userstats@example.com',
        password: 'password123',
        username: 'userstats',
        firstName: 'User',
        lastName: 'Stats',
        statistics: {
          totalXP: 250,
          level: 3,
          projectsCompleted: 0,
          lessonsCompleted: 0,
          achievementsUnlocked: 0,
          timeSpent: 0
        }
      });

      await databaseService.createProject({
        name: 'User Project 1',
        userId: user._id,
        category: 'car' as const,
        isPublic: true,
        components: []
      });

      await databaseService.createProject({
        name: 'User Project 2',
        userId: user._id,
        category: 'car' as const,
        isPublic: false,
        components: []
      });

      const userStats = await databaseService.getUserStatistics(user._id);
      expect(userStats.projects).toBe(2);
      expect(userStats.publicProjects).toBe(1);
      expect(userStats.totalXP).toBe(250);
      expect(userStats.level).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate email error', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        username: 'user1',
        firstName: 'User',
        lastName: 'One'
      };

      await databaseService.createUser(userData);

      // Try to create another user with same email
      const duplicateUserData = {
        ...userData,
        username: 'user2'
      };

      await expect(databaseService.createUser(duplicateUserData)).rejects.toThrow();
    });

    it('should handle duplicate username error', async () => {
      const userData = {
        email: 'user1@example.com',
        password: 'password123',
        username: 'duplicateuser',
        firstName: 'User',
        lastName: 'One'
      };

      await databaseService.createUser(userData);

      // Try to create another user with same username
      const duplicateUserData = {
        ...userData,
        email: 'user2@example.com'
      };

      await expect(databaseService.createUser(duplicateUserData)).rejects.toThrow();
    });

    it('should handle invalid user ID', async () => {
      const user = await databaseService.findUserById('invalid-id');
      expect(user).toBeNull();
    });
  });
});
