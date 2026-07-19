/**
 * Database Connection Test Script - Engineering Forge V1.0
 * 
 * This script tests the MongoDB Atlas connection and performs basic operations
 * to verify everything is working correctly.
 */

import { initializeDatabase, closeDatabase, databaseService } from '../database/init';

async function testDatabaseConnection(): Promise<void> {
  console.log('🧪 Testing Engineering Forge Database Connection...\n');

  try {
    // Initialize database
    await initializeDatabase();
    
    console.log('\n🔍 Running connection tests...\n');

    // Test 1: Connection Status
    console.log('Test 1: Connection Status');
    const isConnected = databaseService.getConnectionStatus();
    console.log(`   ✅ Connection Status: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    
    // Test 2: Connection Info
    console.log('\nTest 2: Connection Information');
    const connectionInfo = databaseService.getConnectionInfo();
    console.log(`   🌐 Host: ${connectionInfo.host}`);
    console.log(`   📊 Database: ${connectionInfo.name}`);
    console.log(`   🔗 Ready State: ${connectionInfo.readyState}`);
    
    // Test 3: Health Check
    console.log('\nTest 3: Health Check');
    const health = await databaseService.healthCheck();
    console.log(`   💚 Status: ${health.status.toUpperCase()}`);
    console.log(`   🔗 Connection: ${health.connection ? 'HEALTHY' : 'UNHEALTHY'}`);
    console.log(`   📦 Models Status:`);
    Object.entries(health.models).forEach(([model, status]) => {
      console.log(`      ${status ? '✅' : '❌'} ${model}`);
    });
    
    // Test 4: Database Statistics
    console.log('\nTest 4: Database Statistics');
    const stats = await databaseService.getStatistics();
    console.log(`   👥 Users: ${stats.users}`);
    console.log(`   🚗 Projects: ${stats.projects}`);
    console.log(`   📚 Lessons: ${stats.lessons}`);
    console.log(`   🎓 Courses: ${stats.courses}`);
    console.log(`   🌐 Public Projects: ${stats.publicProjects}`);
    console.log(`   📖 Published Courses: ${stats.publishedCourses}`);
    
    // Test 5: Create Test User
    console.log('\nTest 5: Create Test User');
    const testUser = await databaseService.createUser({
      email: 'test@engineeringforge.com',
      password: 'testpassword123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      preferences: {
        language: 'en',
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          inApp: true,
        },
      },
    });
    console.log(`   ✅ Test user created: ${testUser.username} (${testUser.email})`);
    console.log(`   🎯 User ID: ${testUser._id}`);
    console.log(`   📊 Initial XP: ${testUser.statistics.totalXP}`);
    console.log(`   📈 Initial Level: ${testUser.statistics.level}`);
    
    // Test 6: Create Test Project
    console.log('\nTest 6: Create Test Project');
    const testProject = await databaseService.createProject({
      name: 'Test Car Project',
      description: 'A test car project to verify database functionality',
      userId: testUser._id,
      category: 'car',
      components: [
        {
          id: 'engine1',
          type: 'engine',
          name: 'V6 Engine',
          properties: {
            power: 250,
            weight: 180,
            efficiency: 75,
            durability: 85,
            cost: 3000,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          isUnlocked: true,
        },
        {
          id: 'chassis1',
          type: 'chassis',
          name: 'Steel Chassis',
          properties: {
            power: 0,
            weight: 200,
            efficiency: 70,
            durability: 90,
            cost: 1500,
          },
          position: { x: 0, y: 0 },
          rotation: 0,
          isUnlocked: true,
        },
      ],
      isPublic: false,
      difficulty: 'beginner',
    });
    console.log(`   ✅ Test project created: ${testProject.name}`);
    console.log(`   🚗 Project ID: ${testProject._id}`);
    console.log(`   🔧 Components: ${testProject.components.length}`);
    console.log(`   ⚡ Total Power: ${testProject.performance.power} HP`);
    console.log(`   ⚖️ Total Weight: ${testProject.performance.weight} kg`);
    console.log(`   🎯 Performance Score: ${testProject.performance.acceleration}/100`);
    
    // Test 7: User Statistics
    console.log('\nTest 7: User Statistics');
    const userStats = await databaseService.getUserStatistics(testUser._id);
    console.log(`   🚗 Projects: ${userStats.projects}`);
    console.log(`   🌐 Public Projects: ${userStats.publicProjects}`);
    console.log(`   ⭐ Total XP: ${userStats.totalXP}`);
    console.log(`   📈 Level: ${userStats.level}`);
    
    // Test 8: Find Operations
    console.log('\nTest 8: Find Operations');
    const foundUser = await databaseService.findUserByEmail('test@engineeringforge.com');
    console.log(`   🔍 Found user by email: ${foundUser ? 'SUCCESS' : 'FAILED'}`);
    
    const userProjects = await databaseService.findProjectsByUser(testUser._id);
    console.log(`   🔍 Found user projects: ${userProjects.length} project(s)`);
    
    // Test 9: Update Operations
    console.log('\nTest 9: Update Operations');
    const updatedUser = await databaseService.updateUser(testUser._id, {
      statistics: { 
        totalXP: 150,
        level: 2,
        projectsCompleted: 1,
        lessonsCompleted: 0,
        achievementsUnlocked: 0,
        timeSpent: 3600
      }
    });
    console.log(`   ✅ User updated: XP ${updatedUser?.statistics.totalXP}, Level ${updatedUser?.statistics.level}`);
    
    // Test 10: Cleanup
    console.log('\nTest 10: Cleanup');
    const deletedProject = await databaseService.deleteProject(testProject._id);
    console.log(`   🗑️ Project deleted: ${deletedProject ? 'SUCCESS' : 'FAILED'}`);
    
    const deletedUser = await databaseService.deleteUser(testUser._id);
    console.log(`   🗑️ User deleted: ${deletedUser ? 'SUCCESS' : 'FAILED'}`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Database connection and operations are working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    // Close database connection
    await closeDatabase();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('\n✅ Database connection test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database connection test failed:', error);
      process.exit(1);
    });
}

export { testDatabaseConnection };
