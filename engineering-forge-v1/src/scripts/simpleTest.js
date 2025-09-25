/**
 * Simple MongoDB Connection Test - Engineering Forge V1.0
 * 
 * This script tests the MongoDB Atlas connection using CommonJS
 */

import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://caioasc_db_user:CFABOqryHJjtNln1@engineeringforge.hmqats3.mongodb.net/engineering_forge_v1?retryWrites=true&w=majority&appName=engineeringforge';

async function testConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Get connection info
    const connection = mongoose.connection;
    console.log(`📊 Database: ${connection.name}`);
    console.log(`🌐 Host: ${connection.host}`);
    console.log(`🔗 Ready State: ${connection.readyState}`);
    
    // Test basic operations
    console.log('\n🔍 Testing database operations...');
    
    // Create a test collection
    const TestCollection = mongoose.model('Test', new mongoose.Schema({
      name: String,
      value: Number,
      createdAt: { type: Date, default: Date.now }
    }));
    
    // Insert a test document
    const testDoc = new TestCollection({
      name: 'Engineering Forge Test',
      value: 42
    });
    
    await testDoc.save();
    console.log('✅ Document created successfully');
    
    // Find the document
    const foundDoc = await TestCollection.findOne({ name: 'Engineering Forge Test' });
    console.log(`✅ Document found: ${foundDoc.name} (value: ${foundDoc.value})`);
    
    // Update the document
    foundDoc.value = 100;
    await foundDoc.save();
    console.log('✅ Document updated successfully');
    
    // Delete the document
    await TestCollection.deleteOne({ _id: foundDoc._id });
    console.log('✅ Document deleted successfully');
    
    // Get database stats
    const stats = await connection.db.stats();
    console.log('\n📈 Database Statistics:');
    console.log(`   📊 Database: ${stats.db}`);
    console.log(`   📦 Collections: ${stats.collections}`);
    console.log(`   📄 Objects: ${stats.objects}`);
    console.log(`   💾 Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   🗂️ Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ MongoDB Atlas connection is working perfectly!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    throw error;
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testConnection()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
