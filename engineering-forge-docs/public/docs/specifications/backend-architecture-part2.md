# Backend Architecture - Part 2: Message Queues & Event Bus

## 📨 Message Queue Architecture

### **Redis Queue Configuration**
```typescript
// queue/redis-config.ts
import Redis from 'ioredis';
import Bull from 'bull';

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Queue definitions
export const queues = {
  // User-related queues
  userRegistration: new Bull('user-registration', { redis }),
  emailVerification: new Bull('email-verification', { redis }),
  passwordReset: new Bull('password-reset', { redis }),
  
  // Project-related queues
  projectSimulation: new Bull('project-simulation', { redis }),
  nftMinting: new Bull('nft-minting', { redis }),
  achievementProcessing: new Bull('achievement-processing', { redis }),
  
  // Analytics queues
  eventProcessing: new Bull('event-processing', { redis }),
  reportGeneration: new Bull('report-generation', { redis }),
  
  // Notification queues
  pushNotifications: new Bull('push-notifications', { redis }),
  emailNotifications: new Bull('email-notifications', { redis }),
  inAppNotifications: new Bull('in-app-notifications', { redis }),
};
```

### **Queue Processors**
```typescript
// processors/user-processors.ts
import { queues } from '../queue/redis-config';
import { UserService } from '../services/user-service';
import { EmailService } from '../services/email-service';

// User registration processor
queues.userRegistration.process(async (job) => {
  const { userId, email, username } = job.data;
  
  try {
    // Create user account
    await UserService.createUser({ userId, email, username });
    
    // Send welcome email
    await queues.emailVerification.add({
      userId,
      email,
      verificationToken: generateToken()
    });
    
    // Track analytics event
    await queues.eventProcessing.add({
      eventType: 'user_registered',
      userId,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('User registration failed:', error);
    throw error;
  }
});

// Email verification processor
queues.emailVerification.process(async (job) => {
  const { userId, email, verificationToken } = job.data;
  
  try {
    await EmailService.sendVerificationEmail(email, verificationToken);
  } catch (error) {
    console.error('Email verification failed:', error);
    // Retry with exponential backoff
    throw error;
  }
});

// Password reset processor
queues.passwordReset.process(async (job) => {
  const { userId, email, resetToken } = job.data;
  
  try {
    await EmailService.sendPasswordResetEmail(email, resetToken);
  } catch (error) {
    console.error('Password reset email failed:', error);
    throw error;
  }
});
```

### **Project Simulation Queue**
```typescript
// processors/simulation-processors.ts
import { queues } from '../queue/redis-config';
import { SimulationService } from '../services/simulation-service';
import { NotificationService } from '../services/notification-service';

// Project simulation processor
queues.projectSimulation.process(async (job) => {
  const { projectId, userId, simulationType } = job.data;
  
  try {
    // Run physics simulation
    const results = await SimulationService.runSimulation(projectId, simulationType);
    
    // Update project with results
    await SimulationService.updateProjectResults(projectId, results);
    
    // Check for achievements
    await queues.achievementProcessing.add({
      userId,
      projectId,
      results,
      timestamp: new Date()
    });
    
    // Send notification
    await queues.pushNotifications.add({
      userId,
      title: 'Simulation Complete',
      body: `Your ${simulationType} simulation is ready!`,
      data: { projectId, results }
    });
    
  } catch (error) {
    console.error('Project simulation failed:', error);
    throw error;
  }
});

// NFT minting processor
queues.nftMinting.process(async (job) => {
  const { projectId, userId, metadata } = job.data;
  
  try {
    // Mint NFT on Solana
    const nftResult = await BlockchainService.mintNFT(metadata);
    
    // Update project with NFT info
    await SimulationService.updateProjectNFT(projectId, nftResult);
    
    // Send notification
    await queues.pushNotifications.add({
      userId,
      title: 'NFT Minted Successfully!',
      body: 'Your project is now available as an NFT',
      data: { projectId, nftTokenId: nftResult.tokenId }
    });
    
  } catch (error) {
    console.error('NFT minting failed:', error);
    throw error;
  }
});
```

## 🔄 Event Bus Architecture

### **Event Bus Configuration**
```typescript
// events/event-bus.ts
import { EventEmitter } from 'events';
import { redis } from '../queue/redis-config';

class EventBus extends EventEmitter {
  private redis: Redis;
  
  constructor() {
    super();
    this.redis = redis;
    this.setupRedisSubscriber();
  }
  
  // Publish event to Redis
  async publish(eventName: string, data: any) {
    const event = {
      id: generateEventId(),
      name: eventName,
      data,
      timestamp: new Date().toISOString(),
      source: process.env.SERVICE_NAME || 'unknown'
    };
    
    // Emit locally
    this.emit(eventName, event);
    
    // Publish to Redis for other services
    await this.redis.publish('events', JSON.stringify(event));
  }
  
  // Subscribe to events
  async subscribe(eventName: string, handler: (event: any) => void) {
    this.on(eventName, handler);
  }
  
  // Setup Redis subscriber for cross-service events
  private setupRedisSubscriber() {
    const subscriber = this.redis.duplicate();
    
    subscriber.subscribe('events', (err) => {
      if (err) {
        console.error('Failed to subscribe to events:', err);
      }
    });
    
    subscriber.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message);
        this.emit(event.name, event);
      } catch (error) {
        console.error('Failed to parse event:', error);
      }
    });
  }
}

export const eventBus = new EventBus();
```

### **Event Definitions**
```typescript
// events/event-types.ts
export enum EventTypes {
  // User events
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_PROFILE_UPDATED = 'user.profile.updated',
  WALLET_CONNECTED = 'user.wallet.connected',
  
  // Course events
  COURSE_ENROLLED = 'course.enrolled',
  LESSON_COMPLETED = 'lesson.completed',
  COURSE_COMPLETED = 'course.completed',
  
  // Project events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_DELETED = 'project.deleted',
  SIMULATION_STARTED = 'simulation.started',
  SIMULATION_COMPLETED = 'simulation.completed',
  
  // Achievement events
  ACHIEVEMENT_EARNED = 'achievement.earned',
  LEVEL_UP = 'user.level.up',
  
  // NFT events
  NFT_MINTED = 'nft.minted',
  NFT_TRANSFERRED = 'nft.transferred',
  
  // Analytics events
  EVENT_TRACKED = 'analytics.event.tracked',
  METRIC_UPDATED = 'analytics.metric.updated',
  
  // Notification events
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_READ = 'notification.read'
}

export interface BaseEvent {
  id: string;
  name: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface UserEvent extends BaseEvent {
  name: EventTypes.USER_REGISTERED | EventTypes.USER_LOGIN | EventTypes.USER_LOGOUT;
  data: {
    userId: string;
    email?: string;
    username?: string;
  };
}

export interface ProjectEvent extends BaseEvent {
  name: EventTypes.PROJECT_CREATED | EventTypes.PROJECT_UPDATED | EventTypes.PROJECT_DELETED;
  data: {
    projectId: string;
    userId: string;
    projectType: string;
    title?: string;
  };
}
```

### **Event Handlers**
```typescript
// handlers/event-handlers.ts
import { eventBus } from '../events/event-bus';
import { EventTypes } from '../events/event-types';
import { AnalyticsService } from '../services/analytics-service';
import { NotificationService } from '../services/notification-service';

// User event handlers
eventBus.subscribe(EventTypes.USER_REGISTERED, async (event) => {
  await AnalyticsService.trackEvent('user_registered', {
    userId: event.data.userId,
    timestamp: event.timestamp
  });
  
  await NotificationService.sendWelcomeNotification(event.data.userId);
});

eventBus.subscribe(EventTypes.USER_LOGIN, async (event) => {
  await AnalyticsService.trackEvent('user_login', {
    userId: event.data.userId,
    timestamp: event.timestamp
  });
});

// Project event handlers
eventBus.subscribe(EventTypes.PROJECT_CREATED, async (event) => {
  await AnalyticsService.trackEvent('project_created', {
    userId: event.data.userId,
    projectId: event.data.projectId,
    projectType: event.data.projectType,
    timestamp: event.timestamp
  });
});

eventBus.subscribe(EventTypes.SIMULATION_COMPLETED, async (event) => {
  await AnalyticsService.trackEvent('simulation_completed', {
    userId: event.data.userId,
    projectId: event.data.projectId,
    results: event.data.results,
    timestamp: event.timestamp
  });
  
  // Check for achievements
  await checkForAchievements(event.data.userId, event.data.results);
});

// Achievement event handlers
eventBus.subscribe(EventTypes.ACHIEVEMENT_EARNED, async (event) => {
  await AnalyticsService.trackEvent('achievement_earned', {
    userId: event.data.userId,
    achievementId: event.data.achievementId,
    achievementType: event.data.achievementType,
    timestamp: event.timestamp
  });
  
  await NotificationService.sendAchievementNotification(
    event.data.userId,
    event.data.achievement
  );
});

// NFT event handlers
eventBus.subscribe(EventTypes.NFT_MINTED, async (event) => {
  await AnalyticsService.trackEvent('nft_minted', {
    userId: event.data.userId,
    projectId: event.data.projectId,
    nftTokenId: event.data.nftTokenId,
    timestamp: event.timestamp
  });
  
  await NotificationService.sendNFTMintedNotification(
    event.data.userId,
    event.data.nftTokenId
  );
});
```

## 🔗 Service Communication Patterns

### **Synchronous Communication (REST)**
```typescript
// services/inter-service-communication.ts
import axios from 'axios';

class InterServiceClient {
  private baseURLs = {
    user: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    content: process.env.CONTENT_SERVICE_URL || 'http://content-service:3002',
    simulation: process.env.SIMULATION_SERVICE_URL || 'http://simulation-service:3003',
    blockchain: process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain-service:3004',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3005',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006'
  };
  
  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const response = await axios.get(`${this.baseURLs.user}/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }
  
  // Get course details
  async getCourseDetails(courseId: string) {
    try {
      const response = await axios.get(`${this.baseURLs.content}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get course details:', error);
      throw error;
    }
  }
  
  // Update project with NFT info
  async updateProjectNFT(projectId: string, nftData: any) {
    try {
      const response = await axios.put(`${this.baseURLs.simulation}/projects/${projectId}/nft`, nftData);
      return response.data;
    } catch (error) {
      console.error('Failed to update project NFT:', error);
      throw error;
    }
  }
}

export const interServiceClient = new InterServiceClient();
```

### **Asynchronous Communication (Queues)**
```typescript
// services/queue-service.ts
import { queues } from '../queue/redis-config';

class QueueService {
  // Add user registration job
  async addUserRegistration(userData: any) {
    await queues.userRegistration.add(userData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }
  
  // Add project simulation job
  async addProjectSimulation(projectData: any) {
    await queues.projectSimulation.add(projectData, {
      priority: 1,
      attempts: 2,
      timeout: 300000 // 5 minutes
    });
  }
  
  // Add NFT minting job
  async addNFTMinting(nftData: any) {
    await queues.nftMinting.add(nftData, {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });
  }
  
  // Add notification job
  async addNotification(notificationData: any) {
    await queues.pushNotifications.add(notificationData, {
      attempts: 3,
      delay: 1000 // 1 second delay
    });
  }
}

export const queueService = new QueueService();
```

### **Real-time Communication (WebSocket)**
```typescript
// services/websocket-service.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

class WebSocketService {
  private io: SocketIOServer;
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      }
    });
    
    this.setupAuthentication();
    this.setupEventHandlers();
  }
  
  // Setup JWT authentication
  private setupAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }
  
  // Setup event handlers
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user's room for personal notifications
      socket.join(`user:${socket.userId}`);
      
      // Handle project updates
      socket.on('project:update', (data) => {
        this.handleProjectUpdate(socket, data);
      });
      
      // Handle simulation requests
      socket.on('simulation:start', (data) => {
        this.handleSimulationStart(socket, data);
      });
      
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }
  
  // Send real-time updates
  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
  
  sendToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }
  
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}

export { WebSocketService };
```
