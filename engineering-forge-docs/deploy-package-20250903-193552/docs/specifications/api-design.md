# API Design

## 🔌 REST API Structure

### **Base Configuration**
- **Base URL**: `https://api.engineeringforge.guildeng.com/v1`
- **Content Type**: `application/json`
- **Authentication**: Bearer Token (JWT)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Versioning**: URL path versioning (`/v1/`, `/v2/`)

### **Response Format**
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    timestamp: string;
  };
}
```

## 🔐 Authentication Endpoints

### **User Registration**
```typescript
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "engineer_user",
  "academicLevel": "beginner"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "engineer_user",
      "academicLevel": "beginner",
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### **User Login**
```typescript
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "engineer_user",
      "academicLevel": "beginner",
      "totalXp": 1500
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### **Wallet Connection**
```typescript
POST /auth/wallet/connect
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "walletAddress": "ABC123...",
  "signature": "signed_message",
  "message": "original_message"
}

Response:
{
  "success": true,
  "data": {
    "walletAddress": "ABC123...",
    "verified": true,
    "connectedAt": "2025-01-15T10:30:00Z"
  }
}
```

### **Token Refresh**
```typescript
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "refresh_token_here"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

## 📚 Course Management Endpoints

### **List Courses**
```typescript
GET /courses?discipline=mechanical&difficulty=beginner&page=1&limit=10
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Mechanical Engineering Fundamentals",
      "description": "Learn the basics of mechanical engineering",
      "discipline": "mechanical",
      "difficultyLevel": "beginner",
      "estimatedDuration": 300,
      "enrolledUsers": 1250,
      "completionRate": 78.5,
      "isActive": true
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

### **Get Course Details**
```typescript
GET /courses/{courseId}
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mechanical Engineering Fundamentals",
    "description": "Learn the basics of mechanical engineering through hands-on projects",
    "discipline": "mechanical",
    "difficultyLevel": "beginner",
    "estimatedDuration": 300,
    "prerequisites": [],
    "learningObjectives": {
      "objectives": [
        "Understand basic physics principles",
        "Learn about materials and their properties",
        "Master vehicle design concepts"
      ]
    },
    "contentStructure": {
      "lessons": [
        {
          "id": "lesson_uuid",
          "title": "Introduction to Forces",
          "type": "theory",
          "duration": 15,
          "orderIndex": 1
        }
      ]
    },
    "userProgress": {
      "progressPercentage": 25.5,
      "currentLesson": "lesson_uuid",
      "timeSpent": 45
    }
  }
}
```

### **Enroll in Course**
```typescript
POST /courses/{courseId}/enroll
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "enrolledAt": "2025-01-15T10:30:00Z",
    "progressPercentage": 0,
    "currentLesson": "first_lesson_uuid"
  }
}
```

### **Update Progress**
```typescript
PUT /courses/{courseId}/progress
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "lessonId": "lesson_uuid",
  "completed": true,
  "timeSpent": 15,
  "score": 85
}

Response:
{
  "success": true,
  "data": {
    "progressPercentage": 35.5,
    "completedLessons": ["lesson_uuid"],
    "nextLesson": "next_lesson_uuid",
    "achievements": [
      {
        "id": "achievement_uuid",
        "title": "First Lesson Complete",
        "type": "milestone"
      }
    ]
  }
}
```

## 🚗 Project Management Endpoints

### **List User Projects**
```typescript
GET /projects?type=car&page=1&limit=10
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "High-Performance Electric Car",
      "description": "My first electric vehicle design",
      "projectType": "car",
      "components": {
        "engine": "electric_engine_v2",
        "chassis": "carbon_fiber_chassis",
        "suspension": "independent_suspension"
      },
      "performanceMetrics": {
        "acceleration": 8.5,
        "topSpeed": 180,
        "efficiency": 92
      },
      "nftTokenId": "nft_token_123",
      "isPublic": true,
      "viewCount": 45,
      "likeCount": 12,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### **Create New Project**
```typescript
POST /projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "title": "My First Car Design",
  "description": "Learning mechanical engineering through car design",
  "projectType": "car",
  "courseId": "course_uuid",
  "components": {
    "engine": {
      "id": "gas_engine_v1",
      "type": "engine",
      "properties": {
        "power": 200,
        "weight": 500,
        "efficiency": 75
      }
    },
    "chassis": {
      "id": "steel_chassis",
      "type": "chassis",
      "properties": {
        "weight": 500,
        "durability": 90
      }
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "project_uuid",
    "title": "My First Car Design",
    "projectType": "car",
    "components": { /* component data */ },
    "performanceMetrics": {
      "acceleration": 6.2,
      "topSpeed": 160,
      "efficiency": 70
    },
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

### **Test Project Performance**
```typescript
POST /projects/{projectId}/test
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "testType": "racetrack",
  "parameters": {
    "trackLength": 1000,
    "weather": "dry"
  }
}

Response:
{
  "success": true,
  "data": {
    "testId": "test_uuid",
    "testType": "racetrack",
    "results": {
      "acceleration": 6.2,
      "topSpeed": 160,
      "lapTime": 45.3,
      "efficiency": 70
    },
    "recommendations": [
      "Consider adding a turbocharger for better acceleration",
      "Aerodynamic improvements could increase top speed"
    ],
    "completedAt": "2025-01-15T10:30:00Z"
  }
}
```

### **Mint Project as NFT**
```typescript
POST /projects/{projectId}/mint-nft
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "name": "Engineering Forge Car #123",
  "description": "High-performance electric vehicle design",
  "attributes": [
    {
      "trait_type": "Power",
      "value": "200 hp"
    },
    {
      "trait_type": "Efficiency",
      "value": "85%"
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "nftTokenId": "nft_token_456",
    "transactionHash": "solana_tx_hash",
    "metadata": {
      "name": "Engineering Forge Car #123",
      "description": "High-performance electric vehicle design",
      "image": "ipfs://QmX...",
      "attributes": [/* attributes */]
    },
    "mintedAt": "2025-01-15T10:30:00Z"
  }
}
```

## 🏆 Achievement Endpoints

### **List User Achievements**
```typescript
GET /achievements?type=milestone&page=1&limit=10
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "achievement_uuid",
      "title": "First Project Complete",
      "description": "Successfully completed your first engineering project",
      "achievementType": "milestone",
      "iconUrl": "https://cdn.example.com/achievements/first-project.png",
      "nftTokenId": "nft_token_789",
      "earnedAt": "2025-01-15T10:30:00Z",
      "xpReward": 100
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

### **Mint Achievement as NFT**
```typescript
POST /achievements/{achievementId}/mint-nft
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "nftTokenId": "nft_token_789",
    "transactionHash": "solana_tx_hash",
    "metadata": {
      "name": "First Project Complete",
      "description": "Achievement for completing first project",
      "image": "ipfs://QmY...",
      "attributes": [
        {
          "trait_type": "Type",
          "value": "Milestone"
        },
        {
          "trait_type": "XP Reward",
          "value": 100
        }
      ]
    },
    "mintedAt": "2025-01-15T10:30:00Z"
  }
}
```

## 📊 Analytics Endpoints

### **Track User Event**
```typescript
POST /analytics/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "eventType": "project_created",
  "eventData": {
    "projectId": "project_uuid",
    "projectType": "car",
    "components": 5,
    "courseId": "course_uuid"
  },
  "sessionId": "session_uuid"
}

Response:
{
  "success": true,
  "data": {
    "eventId": "event_uuid",
    "trackedAt": "2025-01-15T10:30:00Z"
  }
}
```

### **Get User Analytics**
```typescript
GET /analytics/user?period=30d
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "userId": "user_uuid",
    "period": "30d",
    "metrics": {
      "totalTimeSpent": 1200, // minutes
      "coursesEnrolled": 3,
      "projectsCreated": 8,
      "achievementsEarned": 12,
      "nftsMinted": 5
    },
    "activity": [
      {
        "date": "2025-01-15",
        "events": 25,
        "timeSpent": 45
      }
    ],
    "topCourses": [
      {
        "courseId": "course_uuid",
        "title": "Mechanical Engineering",
        "progress": 75.5,
        "timeSpent": 300
      }
    ]
  }
}
```

## 🔄 WebSocket Events

### **Connection Setup**
```typescript
// Connect to WebSocket
const socket = io('https://api.engineeringforge.guildeng.com', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('Connected to Engineering Forge');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### **Real-time Project Updates**
```typescript
// Listen for project updates
socket.on('project:updated', (data) => {
  console.log('Project updated:', data);
  // Update UI with new project data
});

// Project collaboration events
socket.on('project:collaboration:joined', (data) => {
  console.log('User joined collaboration:', data);
});

socket.on('project:collaboration:left', (data) => {
  console.log('User left collaboration:', data);
});
```

### **Achievement Notifications**
```typescript
// Listen for achievement events
socket.on('achievement:earned', (data) => {
  console.log('Achievement earned:', data);
  // Show achievement notification
  showAchievementNotification(data);
});

// Real-time progress updates
socket.on('progress:updated', (data) => {
  console.log('Progress updated:', data);
  // Update progress bars and UI
});
```

### **Community Events**
```typescript
// Community challenge events
socket.on('community:challenge:started', (data) => {
  console.log('Community challenge started:', data);
  // Show challenge notification
});

socket.on('community:leaderboard:updated', (data) => {
  console.log('Leaderboard updated:', data);
  // Update leaderboard display
});

// Real-time chat events
socket.on('chat:message:received', (data) => {
  console.log('New chat message:', data);
  // Add message to chat interface
});
```

### **System Notifications**
```typescript
// System maintenance notifications
socket.on('system:maintenance:scheduled', (data) => {
  console.log('Maintenance scheduled:', data);
  // Show maintenance notification
});

// Update notifications
socket.on('system:update:available', (data) => {
  console.log('Update available:', data);
  // Prompt user to update
});
```

## 📝 API Documentation

### **OpenAPI Specification**
```yaml
openapi: 3.0.0
info:
  title: Engineering Forge API
  version: 1.0.0
  description: API for Game University Engineering Forge

servers:
  - url: https://api.engineeringforge.guildeng.com/v1
    description: Production server

paths:
  /auth/register:
    post:
      summary: Register new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

components:
  schemas:
    RegisterRequest:
      type: object
      required:
        - email
        - password
        - username
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        username:
          type: string
          minLength: 3
        academicLevel:
          type: string
          enum: [beginner, intermediate, advanced]

    AuthResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            user:
              $ref: '#/components/schemas/User'
            token:
              type: string
```

### **Error Codes**
```typescript
enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  
  // Validation errors
  INVALID_INPUT = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RES_001',
  RESOURCE_ALREADY_EXISTS = 'RES_002',
  RESOURCE_CONFLICT = 'RES_003',
  
  // Business logic errors
  COURSE_NOT_AVAILABLE = 'BUS_001',
  PROJECT_LIMIT_REACHED = 'BUS_002',
  INSUFFICIENT_XP = 'BUS_003',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  RATE_LIMIT_EXCEEDED = 'SYS_003'
}
```

### **Rate Limiting**
```typescript
// Rate limiting configuration
const rateLimits = {
  // Authentication endpoints
  '/auth/*': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts'
  },
  
  // API endpoints
  '/api/*': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests'
  },
  
  // NFT minting
  '/projects/*/mint-nft': {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 NFT mints per hour
    message: 'NFT minting limit exceeded'
  }
};
```

## 🔧 API Testing

### **Test Environment**
```typescript
// Test configuration
const testConfig = {
  baseUrl: 'https://api-test.engineeringforge.guildeng.com/v1',
  testUser: {
    email: 'test@engineeringforge.com',
    password: 'testPassword123'
  },
  testProject: {
    title: 'Test Car Project',
    projectType: 'car',
    components: {
      engine: 'test_engine',
      chassis: 'test_chassis'
    }
  }
};

// API test examples
describe('Project API', () => {
  it('should create project successfully', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send(testConfig.testProject)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(testConfig.testProject.title);
  });

  it('should validate project components', async () => {
    const invalidProject = {
      title: 'Invalid Project',
      projectType: 'car',
      components: {
        invalidComponent: 'invalid'
      }
    };

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send(invalidProject)
      .expect(422);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VAL_001');
  });
});
```

### **Performance Testing**
```typescript
// Load testing with Artillery
export default {
  config: {
    target: 'https://api.engineeringforge.guildeng.com/v1',
    phases: [
      { duration: 60, arrivalRate: 10 },
      { duration: 120, arrivalRate: 50 },
      { duration: 60, arrivalRate: 100 }
    ]
  },
  scenarios: [
    {
      name: 'API Load Test',
      flow: [
        { get: { url: '/courses' } },
        { post: { url: '/projects', json: { title: 'Test Project' } } },
        { get: { url: '/achievements' } }
      ]
    }
  ]
};
```
