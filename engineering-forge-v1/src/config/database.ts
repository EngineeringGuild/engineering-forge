/**
 * Database Configuration - Engineering Forge V1.0
 *
 * This file contains the database configuration and connection setup
 * for MongoDB Atlas integration.
 */

import mongoose from 'mongoose';

// Database configuration interface
export interface DatabaseConfig {
  uri: string;
  dbName: string;
  options: mongoose.ConnectOptions;
}

// MongoDB connection string
const MONGODB_URI =
  'mongodb+srv://caioasc_db_user:CFABOqryHJjtNln1@engineeringforge.hmqats3.mongodb.net/?retryWrites=true&w=majority&appName=engineeringforge';

// Database configuration
export const databaseConfig: DatabaseConfig = {
  uri: MONGODB_URI,
  dbName: 'engineering_forge_v1',
  options: {
    // Connection options for optimal performance
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // bufferMaxEntries: 0, // Deprecated option // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
    // Enable retryable writes
    retryWrites: true,
    // Write concern
    w: 'majority'
  }
};

// Database connection class
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to MongoDB Atlas
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      await mongoose.connect(databaseConfig.uri, databaseConfig.options);

      this.isConnected = true;
      console.log('✅ MongoDB Atlas connected successfully');
      console.log(`📊 Database: ${databaseConfig.dbName}`);
      console.log('🌐 Cluster: engineeringforge');

      // Handle connection events
      mongoose.connection.on('error', error => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB Atlas:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB Atlas
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('Database already disconnected');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB Atlas disconnected successfully');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection info
   */
  public getConnectionInfo(): {
    connected: boolean;
    host: string;
    name: string;
    readyState: number;
  } {
    const connection = mongoose.connection;
    return {
      connected: this.isConnected,
      host: connection.host,
      name: connection.name,
      readyState: connection.readyState
    };
  }
}

// Export singleton instance
export const databaseConnection = DatabaseConnection.getInstance();

// Helper function to initialize database
export const initializeDatabase = async(): Promise<void> => {
  try {
    await databaseConnection.connect();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Helper function to close database
export const closeDatabase = async(): Promise<void> => {
  try {
    await databaseConnection.disconnect();
  } catch (error) {
    console.error('Failed to close database:', error);
    throw error;
  }
};
