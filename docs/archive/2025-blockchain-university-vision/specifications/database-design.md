# Database Design

## 🗄️ Core Database Schema

### **Users Table**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    wallet_address VARCHAR(44),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    academic_level VARCHAR(20) DEFAULT 'beginner',
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    wallet_verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### **Courses Table**
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discipline VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    estimated_duration INTEGER, -- in minutes
    prerequisites JSONB,
    learning_objectives JSONB,
    content_structure JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_courses_discipline ON courses(discipline);
CREATE INDEX idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_courses_created_at ON courses(created_at);
```

### **Lessons Table**
```sql
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    lesson_type VARCHAR(50) NOT NULL, -- 'theory', 'interactive', 'project'
    order_index INTEGER NOT NULL,
    estimated_duration INTEGER, -- in minutes
    prerequisites JSONB,
    learning_outcomes JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX idx_lessons_active ON lessons(is_active);
```

### **User Progress Table**
```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completed_lessons JSONB DEFAULT '[]',
    current_lesson_id UUID REFERENCES lessons(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    time_spent INTEGER DEFAULT 0, -- in minutes
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_course ON user_progress(course_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed_at);
CREATE INDEX idx_user_progress_last_accessed ON user_progress(last_accessed_at);
```

### **Projects Table**
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL,
    components JSONB NOT NULL,
    performance_metrics JSONB,
    nft_token_id VARCHAR(44),
    nft_metadata JSONB,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_nft ON projects(nft_token_id);
CREATE INDEX idx_projects_public ON projects(is_public);
CREATE INDEX idx_projects_featured ON projects(is_featured);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

### **Achievements Table**
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    nft_token_id VARCHAR(44),
    earned_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_nft ON achievements(nft_token_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at);
```

### **Achievement Definitions Table**
```sql
CREATE TABLE achievement_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_type VARCHAR(50) NOT NULL,
    criteria JSONB NOT NULL,
    icon_url TEXT,
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_achievement_definitions_type ON achievement_definitions(achievement_type);
CREATE INDEX idx_achievement_definitions_active ON achievement_definitions(is_active);
```

### **User Sessions Table**
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### **Analytics Events Table**
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
```

## 🔗 Database Relationships

### **Entity Relationship Diagram**
```
Users (1) ── (N) UserProgress
Users (1) ── (N) Projects
Users (1) ── (N) Achievements
Users (1) ── (N) UserSessions
Users (1) ── (N) AnalyticsEvents

Courses (1) ── (N) Lessons
Courses (1) ── (N) UserProgress
Courses (1) ── (N) Projects

Lessons (1) ── (N) UserProgress (current_lesson_id)

AchievementDefinitions (1) ── (N) Achievements
```

### **Foreign Key Constraints**
```sql
-- User Progress constraints
ALTER TABLE user_progress 
ADD CONSTRAINT fk_user_progress_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
ADD CONSTRAINT fk_user_progress_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
ADD CONSTRAINT fk_user_progress_lesson 
FOREIGN KEY (current_lesson_id) REFERENCES lessons(id) ON DELETE SET NULL;

-- Projects constraints
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE projects 
ADD CONSTRAINT fk_projects_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Achievements constraints
ALTER TABLE achievements 
ADD CONSTRAINT fk_achievements_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Lessons constraints
ALTER TABLE lessons 
ADD CONSTRAINT fk_lessons_course 
FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- User Sessions constraints
ALTER TABLE user_sessions 
ADD CONSTRAINT fk_user_sessions_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Analytics Events constraints
ALTER TABLE analytics_events 
ADD CONSTRAINT fk_analytics_events_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

## 📊 Data Types and Constraints

### **JSONB Schema Definitions**

#### **User Preferences Schema**
```json
{
  "theme": "light" | "dark" | "auto",
  "notifications": {
    "email": boolean,
    "push": boolean,
    "achievements": boolean,
    "community": boolean
  },
  "accessibility": {
    "fontSize": "small" | "medium" | "large",
    "highContrast": boolean,
    "screenReader": boolean
  },
  "privacy": {
    "profileVisibility": "public" | "private" | "friends",
    "showProgress": boolean,
    "showAchievements": boolean
  }
}
```

#### **Project Components Schema**
```json
{
  "components": [
    {
      "id": "string",
      "type": "engine" | "chassis" | "suspension" | "tires" | "optional",
      "name": "string",
      "properties": {
        "power": "number",
        "weight": "number",
        "efficiency": "number",
        "durability": "number"
      },
      "position": {
        "x": "number",
        "y": "number",
        "z": "number"
      }
    }
  ],
  "metadata": {
    "totalPower": "number",
    "totalWeight": "number",
    "efficiency": "number",
    "cost": "number"
  }
}
```

#### **Performance Metrics Schema**
```json
{
  "acceleration": "number",
  "topSpeed": "number",
  "handling": "number",
  "efficiency": "number",
  "safety": "number",
  "overall": "number",
  "tests": [
    {
      "testType": "racetrack" | "windTunnel" | "offRoad" | "dyno",
      "results": {
        "score": "number",
        "details": "object"
      },
      "timestamp": "string"
    }
  ]
}
```

#### **NFT Metadata Schema**
```json
{
  "name": "string",
  "description": "string",
  "image": "string",
  "attributes": [
    {
      "trait_type": "string",
      "value": "string | number",
      "display_type": "string"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "string",
        "type": "string"
      }
    ],
    "category": "string",
    "project_id": "string",
    "user_id": "string"
  }
}
```

## 🔄 Data Migration Strategy

### **Migration Tools**
- **Prisma Migrate**: Primary migration tool
- **Manual SQL**: Complex migrations
- **Data Seeding**: Initial data population
- **Rollback Strategy**: Migration reversal

### **Migration Process**
```bash
# Create new migration
npx prisma migrate dev --name add_user_preferences

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### **Migration Examples**

#### **Adding User Preferences**
```sql
-- Migration: add_user_preferences
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
```

#### **Adding Project Analytics**
```sql
-- Migration: add_project_analytics
ALTER TABLE projects ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN like_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT false;

CREATE INDEX idx_projects_views ON projects(view_count DESC);
CREATE INDEX idx_projects_likes ON projects(like_count DESC);
```

### **Data Seeding**
```typescript
// seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default courses
  const mechanicalCourse = await prisma.course.create({
    data: {
      title: 'Mechanical Engineering Fundamentals',
      description: 'Learn the basics of mechanical engineering through car design',
      discipline: 'mechanical',
      difficulty_level: 'beginner',
      estimated_duration: 300,
      learning_objectives: {
        objectives: [
          'Understand basic physics principles',
          'Learn about materials and their properties',
          'Master vehicle design concepts'
        ]
      }
    }
  });

  // Create achievement definitions
  await prisma.achievementDefinition.create({
    data: {
      title: 'First Project',
      description: 'Complete your first engineering project',
      achievement_type: 'milestone',
      criteria: {
        condition: 'projects_created',
        value: 1
      },
      xp_reward: 100
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 📈 Performance Optimization

### **Indexing Strategy**
```sql
-- Composite indexes for common queries
CREATE INDEX idx_user_progress_composite ON user_progress(user_id, course_id, progress_percentage);
CREATE INDEX idx_projects_user_type ON projects(user_id, project_type, created_at DESC);
CREATE INDEX idx_analytics_events_user_type_time ON analytics_events(user_id, event_type, created_at DESC);

-- Partial indexes for active records
CREATE INDEX idx_courses_active_discipline ON courses(discipline, difficulty_level) WHERE is_active = true;
CREATE INDEX idx_lessons_active_course ON lessons(course_id, order_index) WHERE is_active = true;

-- GIN indexes for JSONB columns
CREATE INDEX idx_users_preferences_gin ON users USING GIN (preferences);
CREATE INDEX idx_projects_components_gin ON projects USING GIN (components);
CREATE INDEX idx_analytics_events_data_gin ON analytics_events USING GIN (event_data);
```

### **Query Optimization**
```sql
-- Optimized user progress query
SELECT 
  up.progress_percentage,
  c.title as course_title,
  l.title as current_lesson_title
FROM user_progress up
JOIN courses c ON up.course_id = c.id
LEFT JOIN lessons l ON up.current_lesson_id = l.id
WHERE up.user_id = $1
  AND c.is_active = true
ORDER BY up.last_accessed_at DESC;

-- Optimized project listing query
SELECT 
  p.*,
  u.username,
  c.title as course_title
FROM projects p
JOIN users u ON p.user_id = u.id
JOIN courses c ON p.course_id = c.id
WHERE p.is_public = true
  AND c.is_active = true
ORDER BY p.created_at DESC
LIMIT 20;
```

### **Connection Pooling**
```typescript
// Database connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling
  __internal: {
    engine: {
      connectionLimit: 10,
      pool: {
        min: 2,
        max: 10,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
      },
    },
  },
});
```

## 🔒 Data Security

### **Encryption**
```sql
-- Column-level encryption for sensitive data
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Encrypt sensitive user data
ALTER TABLE users ADD COLUMN encrypted_ssn BYTEA;
UPDATE users SET encrypted_ssn = pgp_sym_encrypt(ssn, 'encryption_key');

-- Encrypt wallet private keys (if stored)
ALTER TABLE users ADD COLUMN encrypted_private_key BYTEA;
```

### **Access Control**
```sql
-- Row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY user_own_data ON users
  FOR ALL USING (auth.uid() = id);

-- Users can only access their own projects or public projects
CREATE POLICY project_access ON projects
  FOR ALL USING (
    auth.uid() = user_id OR 
    is_public = true
  );
```

### **Data Backup Strategy**
```bash
# Automated daily backups
pg_dump -h localhost -U username -d engineering_forge > backup_$(date +%Y%m%d).sql

# Point-in-time recovery
pg_basebackup -h localhost -D /backup/$(date +%Y%m%d) -Ft -z -P

# Backup verification
pg_restore --list backup_20250115.sql
```

## 📊 Analytics and Reporting

### **Analytics Views**
```sql
-- User engagement view
CREATE VIEW user_engagement AS
SELECT 
  u.id,
  u.username,
  COUNT(DISTINCT up.course_id) as courses_enrolled,
  COUNT(DISTINCT p.id) as projects_created,
  COUNT(DISTINCT a.id) as achievements_earned,
  SUM(up.time_spent) as total_time_spent,
  MAX(up.last_accessed_at) as last_activity
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN achievements a ON u.id = a.user_id
GROUP BY u.id, u.username;

-- Course performance view
CREATE VIEW course_performance AS
SELECT 
  c.id,
  c.title,
  c.discipline,
  COUNT(DISTINCT up.user_id) as enrolled_users,
  COUNT(DISTINCT CASE WHEN up.completed_at IS NOT NULL THEN up.user_id END) as completed_users,
  AVG(up.progress_percentage) as avg_progress,
  AVG(up.time_spent) as avg_time_spent
FROM courses c
LEFT JOIN user_progress up ON c.id = up.course_id
WHERE c.is_active = true
GROUP BY c.id, c.title, c.discipline;
```

### **Reporting Queries**
```sql
-- Monthly user growth
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as total_users
FROM users
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Project completion rates
SELECT 
  project_type,
  COUNT(*) as total_projects,
  COUNT(CASE WHEN nft_token_id IS NOT NULL THEN 1 END) as nft_minted,
  ROUND(
    COUNT(CASE WHEN nft_token_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as completion_rate
FROM projects
GROUP BY project_type
ORDER BY completion_rate DESC;
```
