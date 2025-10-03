/**
 * Database Initialization - Engineering Forge V1.0
 *
 * This file handles the initialization of the database connection
 * and sets up initial data if needed.
 */

import { Course } from "../domains/gaming/domain/entities/Lesson";
import { User } from "../domains/gaming/domain/entities/User";
import { databaseService } from "../domains/gaming/infrastructure/services/databaseService";

// Initial data setup
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("🚀 Initializing Engineering Forge Database...");

    // Initialize database service
    await databaseService.initialize();

    // Check if we need to seed initial data
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();

    if (userCount === 0 && courseCount === 0) {
      console.log("📦 Seeding initial data...");
      await seedInitialData();
    }

    // Get and log statistics
    const stats = await databaseService.getStatistics();
    console.log("📊 Database Statistics:");
    console.log(`   👥 Users: ${stats.users}`);
    console.log(`   🚗 Projects: ${stats.projects}`);
    console.log(`   📚 Lessons: ${stats.lessons}`);
    console.log(`   🎓 Courses: ${stats.courses}`);
    console.log(`   🌐 Public Projects: ${stats.publicProjects}`);
    console.log(`   📖 Published Courses: ${stats.publishedCourses}`);

    console.log("✅ Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
};

/**
 * Seed initial data for the application
 */
const seedInitialData = async (): Promise<void> => {
  try {
    // Create default admin user
    const adminUser = await databaseService.createUser({
      email: "admin@engineeringforge.com",
      password: "admin123", // In production, this should be hashed
      username: "admin",
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      isEmailVerified: true,
      preferences: {
        language: "en",
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      },
      profile: {
        bio: "System Administrator for Engineering Forge",
      },
      statistics: {
        totalXP: 0,
        level: 1,
        projectsCompleted: 0,
        lessonsCompleted: 0,
        achievementsUnlocked: 0,
        timeSpent: 0,
      },
    });

    // Create sample instructor
    const instructor = await databaseService.createUser({
      email: "instructor@engineeringforge.com",
      password: "instructor123",
      username: "instructor",
      firstName: "John",
      lastName: "Engineer",
      role: "instructor",
      isEmailVerified: true,
      preferences: {
        language: "en",
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      },
      profile: {
        bio: "Senior Automotive Engineer with 10+ years of experience",
        location: "Detroit, MI",
        linkedin: "https://linkedin.com/in/johnengineer",
      },
      statistics: {
        totalXP: 5000,
        level: 51,
        projectsCompleted: 25,
        lessonsCompleted: 50,
        achievementsUnlocked: 15,
        timeSpent: 1200,
      },
    });

    // Create sample courses
    const introCourse = await databaseService.createCourse({
      title: "Introduction to Automotive Engineering",
      description:
        "Learn the fundamental principles of automotive engineering, including engine mechanics, vehicle dynamics, and design principles.",
      instructorId: instructor._id,
      category: "automotive",
      level: "beginner",
      duration: 480, // 8 hours
      objectives: [
        "Understand basic automotive engineering principles",
        "Learn about different types of engines",
        "Master vehicle dynamics concepts",
        "Complete your first car design project",
      ],
      isPublished: true,
      tags: ["automotive", "engineering", "beginner", "cars"],
      enrollment: {
        totalEnrolled: 0,
        completed: 0,
        averageRating: 0,
        totalRatings: 0,
      },
      pricing: {
        isFree: true,
        currency: "USD",
      },
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date(),
        language: "en",
      },
    });

    const advancedCourse = await databaseService.createCourse({
      title: "Advanced Vehicle Performance",
      description:
        "Deep dive into high-performance vehicle design, aerodynamics, and optimization techniques.",
      instructorId: instructor._id,
      category: "automotive",
      level: "advanced",
      duration: 720, // 12 hours
      objectives: [
        "Master advanced aerodynamics principles",
        "Optimize vehicle performance metrics",
        "Design high-performance components",
        "Analyze and improve vehicle efficiency",
      ],
      isPublished: true,
      tags: ["automotive", "performance", "advanced", "aerodynamics"],
      enrollment: {
        totalEnrolled: 0,
        completed: 0,
        averageRating: 0,
        totalRatings: 0,
      },
      pricing: {
        isFree: false,
        price: 99.99,
        currency: "USD",
      },
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date(),
        language: "en",
      },
    });

    console.log("✅ Initial data seeded successfully:");
    console.log(`   👤 Admin user created: ${adminUser.username}`);
    console.log(`   👨‍🏫 Instructor created: ${instructor.username}`);
    console.log(`   📚 Course created: ${introCourse.title}`);
    console.log(`   📚 Course created: ${advancedCourse.title}`);
  } catch (error) {
    console.error("❌ Failed to seed initial data:", error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await databaseService.close();
    console.log("✅ Database connection closed successfully");
  } catch (error) {
    console.error("❌ Failed to close database connection:", error);
    throw error;
  }
};

// Export database service for use in other parts of the application
export * from "../domains/gaming/domain/entities/Lesson";
export * from "../domains/gaming/domain/entities/Project";
export * from "../domains/gaming/domain/entities/User";
export { databaseService } from "../domains/gaming/infrastructure/services/databaseService";
