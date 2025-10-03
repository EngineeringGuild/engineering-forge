/**
 * Database Service - Engineering Forge V1.0
 *
 * This service provides high-level database operations and connection management
 * for all domains in the Engineering Forge application.
 */

import { Course, ICourse, ILesson, Lesson } from "../../domain/entities/Lesson";
import { IProject, Project } from "../../domain/entities/Project";
import { IUser, User } from "../../domain/entities/User";
import { databaseConnection } from "../../../../config/database";

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  public async initialize(): Promise<void> {
    try {
      await databaseConnection.connect();
      console.log("✅ Database service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database service:", error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      await databaseConnection.disconnect();
      console.log("✅ Database service closed successfully");
    } catch (error) {
      console.error("❌ Failed to close database service:", error);
      throw error;
    }
  }

  /**
   * Get database connection status
   */
  public getConnectionStatus(): boolean {
    return databaseConnection.getConnectionStatus();
  }

  /**
   * Get database info
   */
  public getConnectionInfo() {
    return databaseConnection.getConnectionInfo();
  }

  /**
   * Health check for database
   */
  public async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    connection: boolean;
    models: { [key: string]: boolean };
    timestamp: Date;
  }> {
    const connection = this.getConnectionStatus();
    const models = {
      User: !!User,
      Project: !!Project,
      Lesson: !!Lesson,
      Course: !!Course,
    };

    // Test database operations
    try {
      if (connection) {
        await User.findOne().limit(1);
      }
    } catch (error) {
      console.error("Database health check failed:", error);
    }

    return {
      status: connection ? "healthy" : "unhealthy",
      connection,
      models,
      timestamp: new Date(),
    };
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Create a new user
   */
  public async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      console.log(`✅ User created: ${user.username}`);
      return user;
    } catch (error) {
      console.error("❌ Failed to create user:", error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  public async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      console.error("❌ Failed to find user by email:", error);
      throw error;
    }
  }

  /**
   * Find user by username
   */
  public async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      console.error("❌ Failed to find user by username:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  public async findUserById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error("❌ Failed to find user by ID:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  public async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(id, updateData, { new: true });
      if (user) {
        console.log(`✅ User updated: ${user.username}`);
      }
      return user;
    } catch (error) {
      console.error("❌ Failed to update user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  public async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      if (result) {
        console.log(`✅ User deleted: ${result.username}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      throw error;
    }
  }

  // ==================== PROJECT OPERATIONS ====================

  /**
   * Create a new project
   */
  public async createProject(
    projectData: Partial<IProject>
  ): Promise<IProject> {
    try {
      const project = new Project(projectData);
      // Calculate performance automatically
      project.performance = (project as any).calculatePerformance();
      await project.save();
      console.log(`✅ Project created: ${project.name}`);
      return project;
    } catch (error) {
      console.error("❌ Failed to create project:", error);
      throw error;
    }
  }

  /**
   * Find project by ID
   */
  public async findProjectById(id: string): Promise<IProject | null> {
    try {
      const project = await Project.findById(id);
      return project;
    } catch (error) {
      console.error("❌ Failed to find project by ID:", error);
      throw error;
    }
  }

  /**
   * Find projects by user
   */
  public async findProjectsByUser(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IProject[]> {
    try {
      const projects = await Project.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .skip(skip);
      return projects;
    } catch (error) {
      console.error("❌ Failed to find projects by user:", error);
      throw error;
    }
  }

  /**
   * Find public projects
   */
  public async findPublicProjects(
    limit: number = 10,
    skip: number = 0
  ): Promise<IProject[]> {
    try {
      const projects = await Project.find({ isPublic: true })
        .sort({ likes: -1, views: -1 })
        .limit(limit)
        .skip(skip);
      return projects;
    } catch (error) {
      console.error("❌ Failed to find public projects:", error);
      throw error;
    }
  }

  /**
   * Update project
   */
  public async updateProject(
    id: string,
    updateData: Partial<IProject>
  ): Promise<IProject | null> {
    try {
      const project = await Project.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (project) {
        // Recalculate performance if components changed
        if (updateData.components) {
          project.performance = (project as any).calculatePerformance();
          await project.save();
        }
        console.log(`✅ Project updated: ${project.name}`);
      }
      return project;
    } catch (error) {
      console.error("❌ Failed to update project:", error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  public async deleteProject(id: string): Promise<boolean> {
    try {
      const result = await Project.findByIdAndDelete(id);
      if (result) {
        console.log(`✅ Project deleted: ${result.name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Failed to delete project:", error);
      throw error;
    }
  }

  // ==================== LESSON OPERATIONS ====================

  /**
   * Create a new lesson
   */
  public async createLesson(lessonData: Partial<ILesson>): Promise<ILesson> {
    try {
      const lesson = new Lesson(lessonData);
      await lesson.save();
      console.log(`✅ Lesson created: ${lesson.title}`);
      return lesson;
    } catch (error) {
      console.error("❌ Failed to create lesson:", error);
      throw error;
    }
  }

  /**
   * Find lesson by ID
   */
  public async findLessonById(id: string): Promise<ILesson | null> {
    try {
      const lesson = await Lesson.findById(id);
      return lesson;
    } catch (error) {
      console.error("❌ Failed to find lesson by ID:", error);
      throw error;
    }
  }

  /**
   * Find lessons by course
   */
  public async findLessonsByCourse(courseId: string): Promise<ILesson[]> {
    try {
      const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
      return lessons;
    } catch (error) {
      console.error("❌ Failed to find lessons by course:", error);
      throw error;
    }
  }

  // ==================== COURSE OPERATIONS ====================

  /**
   * Create a new course
   */
  public async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      const course = new Course(courseData);
      await course.save();
      console.log(`✅ Course created: ${course.title}`);
      return course;
    } catch (error) {
      console.error("❌ Failed to create course:", error);
      throw error;
    }
  }

  /**
   * Find course by ID
   */
  public async findCourseById(id: string): Promise<ICourse | null> {
    try {
      const course = await Course.findById(id);
      return course;
    } catch (error) {
      console.error("❌ Failed to find course by ID:", error);
      throw error;
    }
  }

  /**
   * Find published courses
   */
  public async findPublishedCourses(
    limit: number = 10,
    skip: number = 0
  ): Promise<ICourse[]> {
    try {
      const courses = await Course.find({ isPublished: true })
        .sort({
          "enrollment.averageRating": -1,
          "enrollment.totalEnrolled": -1,
        })
        .limit(limit)
        .skip(skip);
      return courses;
    } catch (error) {
      console.error("❌ Failed to find published courses:", error);
      throw error;
    }
  }

  /**
   * Find courses by instructor
   */
  public async findCoursesByInstructor(
    instructorId: string
  ): Promise<ICourse[]> {
    try {
      const courses = await Course.find({ instructorId }).sort({
        createdAt: -1,
      });
      return courses;
    } catch (error) {
      console.error("❌ Failed to find courses by instructor:", error);
      throw error;
    }
  }

  // ==================== STATISTICS OPERATIONS ====================

  /**
   * Get database statistics
   */
  public async getStatistics(): Promise<{
    users: number;
    projects: number;
    lessons: number;
    courses: number;
    publicProjects: number;
    publishedCourses: number;
  }> {
    try {
      const [
        users,
        projects,
        lessons,
        courses,
        publicProjects,
        publishedCourses,
      ] = await Promise.all([
        User.countDocuments(),
        Project.countDocuments(),
        Lesson.countDocuments(),
        Course.countDocuments(),
        Project.countDocuments({ isPublic: true }),
        Course.countDocuments({ isPublished: true }),
      ]);

      return {
        users,
        projects,
        lessons,
        courses,
        publicProjects,
        publishedCourses,
      };
    } catch (error) {
      console.error("❌ Failed to get statistics:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStatistics(userId: string): Promise<{
    projects: number;
    publicProjects: number;
    totalXP: number;
    level: number;
  }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const [projects, publicProjects] = await Promise.all([
        Project.countDocuments({ userId }),
        Project.countDocuments({ userId, isPublic: true }),
      ]);

      return {
        projects,
        publicProjects,
        totalXP: user.statistics.totalXP,
        level: user.statistics.level,
      };
    } catch (error) {
      console.error("❌ Failed to get user statistics:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Export helper functions
export const initializeDatabaseService = async (): Promise<void> => {
  await databaseService.initialize();
};

export const closeDatabaseService = async (): Promise<void> => {
  await databaseService.close();
};
