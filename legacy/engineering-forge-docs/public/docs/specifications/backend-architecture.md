# Backend Architecture

## 🏗️ Overall Architecture

### **Microservices Structure**
```
Engineering Forge Backend
├── User Service (Port 3001)
├── Content Service (Port 3002)
├── Simulation Service (Port 3003)
├── Blockchain Service (Port 3004)
├── Analytics Service (Port 3005)
├── Notification Service (Port 3006)
└── API Gateway (Port 3000)
```

### **Service Communication**
- **Synchronous**: REST APIs for direct requests
- **Asynchronous**: Message queues for background tasks
- **Real-time**: WebSocket connections for live updates
- **Event-driven**: Event bus for service decoupling

## 🔧 Core Services

### **1. User Service**
**Port**: 3001
**Database**: PostgreSQL (users, profiles, sessions)
**Cache**: Redis (sessions, user data)

**Responsibilities**:
- User authentication and authorization
- Profile management
- Session handling
- Wallet integration
- Academic progress tracking

**Key Endpoints**:
```typescript
// Authentication
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh

// User Management
GET /users/profile
PUT /users/profile
POST /users/wallet/connect
GET /users/progress

// Sessions
GET /sessions/active
DELETE /sessions/{sessionId}
```

### **2. Content Service**
**Port**: 3002
**Database**: PostgreSQL (courses, lessons, content)
**Storage**: AWS S3 (media files)

**Responsibilities**:
- Course and lesson management
- Educational content delivery
- Media file handling
- Content versioning
- Learning path management

**Key Endpoints**:
```typescript
// Course Management
GET /courses
GET /courses/{courseId}
POST /courses
PUT /courses/{courseId}
DELETE /courses/{courseId}

// Lesson Management
GET /courses/{courseId}/lessons
GET /lessons/{lessonId}
POST /lessons
PUT /lessons/{lessonId}

// Content Delivery
GET /content/{contentId}
POST /content/upload
GET /content/search
```

### **3. Simulation Service**
**Port**: 3003
**Database**: PostgreSQL (projects, simulations, results)
**Cache**: Redis (simulation state, real-time data)

**Responsibilities**:
- Project creation and management
- Physics simulation engine
- Real-time testing and validation
- Performance metrics calculation
- Simulation state management

**Key Endpoints**:
```typescript
// Project Management
GET /projects
POST /projects
GET /projects/{projectId}
PUT /projects/{projectId}
DELETE /projects/{projectId}

// Simulation
POST /projects/{projectId}/simulate
GET /simulations/{simulationId}/status
GET /simulations/{simulationId}/results

// Testing
POST /projects/{projectId}/test
GET /tests/{testId}/results
```

### **4. Blockchain Service**
**Port**: 3004
**Database**: PostgreSQL (nfts, transactions, wallet data)
**Blockchain**: Solana (NFT minting, transactions)

**Responsibilities**:
- NFT minting and management
- Solana blockchain integration
- Wallet operations
- Transaction tracking
- Metadata management

**Key Endpoints**:
```typescript
// NFT Operations
POST /nfts/mint
GET /nfts/{tokenId}
GET /nfts/user/{userId}
PUT /nfts/{tokenId}/metadata

// Blockchain Operations
POST /blockchain/transfer
GET /blockchain/balance/{walletAddress}
POST /blockchain/verify-signature

// Wallet Management
POST /wallets/connect
GET /wallets/{userId}/nfts
```

### **5. Analytics Service**
**Port**: 3005
**Database**: PostgreSQL (events, metrics, reports)
**Queue**: Redis (event processing)

**Responsibilities**:
- User behavior tracking
- Performance metrics collection
- Learning analytics
- Business intelligence
- Report generation

**Key Endpoints**:
```typescript
// Event Tracking
POST /analytics/events
GET /analytics/events/{userId}

// Metrics
GET /analytics/metrics
GET /analytics/metrics/{metricType}
POST /analytics/metrics/aggregate

// Reports
GET /analytics/reports
GET /analytics/reports/{reportId}
POST /analytics/reports/generate
```

### **6. Notification Service**
**Port**: 3006
**Database**: PostgreSQL (notifications, templates)
**Queue**: Redis (notification queue)

**Responsibilities**:
- Push notifications
- Email notifications
- In-app notifications
- Notification templates
- Delivery tracking

**Key Endpoints**:
```typescript
// Notifications
POST /notifications/send
GET /notifications/{userId}
PUT /notifications/{notificationId}/read
DELETE /notifications/{notificationId}

// Templates
GET /templates
POST /templates
PUT /templates/{templateId}

// Preferences
GET /notifications/preferences/{userId}
PUT /notifications/preferences/{userId}
```

## 🌐 API Gateway

### **Gateway Configuration**
**Port**: 3000
**Load Balancer**: Nginx
**Rate Limiting**: Redis-based
**Authentication**: JWT validation

**Responsibilities**:
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- Error handling and logging
- CORS management

### **Gateway Routes**
```typescript
// User Service Routes
app.use('/api/v1/auth', proxy('http://user-service:3001/auth'));
app.use('/api/v1/users', proxy('http://user-service:3001/users'));

// Content Service Routes
app.use('/api/v1/courses', proxy('http://content-service:3002/courses'));
app.use('/api/v1/lessons', proxy('http://content-service:3002/lessons'));

// Simulation Service Routes
app.use('/api/v1/projects', proxy('http://simulation-service:3003/projects'));
app.use('/api/v1/simulations', proxy('http://simulation-service:3003/simulations'));

// Blockchain Service Routes
app.use('/api/v1/nfts', proxy('http://blockchain-service:3004/nfts'));
app.use('/api/v1/blockchain', proxy('http://blockchain-service:3004/blockchain'));

// Analytics Service Routes
app.use('/api/v1/analytics', proxy('http://analytics-service:3005/analytics'));

// Notification Service Routes
app.use('/api/v1/notifications', proxy('http://notification-service:3006/notifications'));
```

### **Gateway Middleware**
```typescript
// Authentication Middleware
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Rate Limiting Middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS Configuration
const corsOptions = {
  origin: [
    'https://engineeringforge.guildeng.com',
    'https://www.engineeringforge.guildeng.com',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```
