/**
 * Test Setup - Engineering Forge V1.0
 *
 * Global test setup and configuration
 */

import mongoose from 'mongoose';

// Test database connection string
const TEST_MONGODB_URI =
  'mongodb+srv://caioasc_db_user:CFABOqryHJjtNln1@engineeringforge.hmqats3.mongodb.net/engineering_forge_test?retryWrites=true&w=majority&appName=engineeringforge';

// Setup before all tests
/*
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(TEST_MONGODB_URI);
});
*/

// Cleanup after all tests
/*
afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();
});
*/

// Setup before each test
/*
beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});
*/
