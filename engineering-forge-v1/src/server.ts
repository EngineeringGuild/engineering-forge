/**
 * Express Server - Engineering Forge V1.0
 *
 * This file contains the Express server setup for the authentication system.
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { DatabaseConnection } from './config/database';
import { errorHandler, logRequests } from './middleware/auth';
import authRoutes from './routes/auth';
import componentRoutes from './routes/components';
import projectRoutes from './routes/projects';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logRequests);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Engineering Forge V1.0 API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await DatabaseConnection.getInstance().connect();
    console.log('✅ Connected to MongoDB Atlas');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Engineering Forge V1.0 API running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/auth`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
