# Security Architecture

## 🔐 Authentication System

### **Multi-Factor Authentication (MFA)**
```typescript
// services/auth/mfa-service.ts
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { UserService } from '../user-service';

export class MFAService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Generate MFA secret for user
  async generateMFASecret(userId: string): Promise<MFASetupResult> {
    try {
      const secret = authenticator.generateSecret();
      const user = await this.userService.getUserById(userId);
      
      // Generate QR code
      const otpauth = authenticator.keyuri(
        user.email,
        'Engineering Forge',
        secret
      );
      
      const qrCodeUrl = await QRCode.toDataURL(otpauth);
      
      // Store secret temporarily (encrypted)
      await this.userService.updateUser(userId, {
        mfaSecret: await this.encryptSecret(secret),
        mfaEnabled: false,
        mfaBackupCodes: this.generateBackupCodes()
      });

      return {
        secret,
        qrCodeUrl,
        backupCodes: await this.generateBackupCodes()
      };

    } catch (error) {
      console.error('MFA setup failed:', error);
      throw error;
    }
  }

  // Verify MFA token
  async verifyMFAToken(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.userService.getUserById(userId);
      
      if (!user.mfaSecret) {
        throw new Error('MFA not configured');
      }

      const secret = await this.decryptSecret(user.mfaSecret);
      const isValid = authenticator.verify({ token, secret });

      if (isValid) {
        // Log successful MFA verification
        await this.logMFAAttempt(userId, 'success');
      } else {
        await this.logMFAAttempt(userId, 'failed');
      }

      return isValid;

    } catch (error) {
      console.error('MFA verification failed:', error);
      return false;
    }
  }

  // Verify backup code
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    try {
      const user = await this.userService.getUserById(userId);
      
      if (!user.mfaBackupCodes) {
        return false;
      }

      const backupCodes = JSON.parse(user.mfaBackupCodes);
      const isValid = backupCodes.includes(backupCode);

      if (isValid) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter(code => code !== backupCode);
        await this.userService.updateUser(userId, {
          mfaBackupCodes: JSON.stringify(updatedCodes)
        });

        await this.logMFAAttempt(userId, 'backup_success');
      } else {
        await this.logMFAAttempt(userId, 'backup_failed');
      }

      return isValid;

    } catch (error) {
      console.error('Backup code verification failed:', error);
      return false;
    }
  }

  // Enable MFA for user
  async enableMFA(userId: string): Promise<void> {
    await this.userService.updateUser(userId, {
      mfaEnabled: true,
      mfaEnabledAt: new Date()
    });
  }

  // Disable MFA for user
  async disableMFA(userId: string, password: string): Promise<void> {
    const user = await this.userService.getUserById(userId);
    
    // Verify password before disabling MFA
    const isValidPassword = await this.userService.verifyPassword(userId, password);
    
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    await this.userService.updateUser(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
      mfaDisabledAt: new Date()
    });
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  }

  private async encryptSecret(secret: string): Promise<string> {
    // Use environment variable for encryption key
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted + ':' + cipher.getAuthTag().toString('hex');
  }

  private async decryptSecret(encryptedSecret: string): Promise<string> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    
    const parts = encryptedSecret.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private async logMFAAttempt(userId: string, status: string): Promise<void> {
    await this.userService.logSecurityEvent(userId, {
      eventType: 'mfa_attempt',
      status,
      timestamp: new Date(),
      ipAddress: this.getClientIP()
    });
  }
}

interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}
```

### **JWT Token Management**
```typescript
// services/auth/jwt-service.ts
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

export class JWTService {
  private redis: Redis;
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Generate access token
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'engineering-forge',
      audience: 'engineering-forge-users'
    });
  }

  // Generate refresh token
  generateRefreshToken(payload: TokenPayload): string {
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'engineering-forge',
      audience: 'engineering-forge-users'
    });

    // Store refresh token in Redis with expiry
    this.redis.setex(
      `refresh_token:${payload.userId}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    );

    return refreshToken;
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'engineering-forge',
        audience: 'engineering-forge-users'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  // Verify refresh token
  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'engineering-forge',
        audience: 'engineering-forge-users'
      }) as TokenPayload;

      // Check if token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${decoded.userId}`);
      if (storedToken !== token) {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const payload = await this.verifyRefreshToken(refreshToken);
    
    if (!payload) {
      return null;
    }

    return this.generateAccessToken(payload);
  }

  // Revoke refresh token
  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  // Revoke all user tokens
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
    
    // Add to blacklist for immediate invalidation
    await this.redis.setex(
      `blacklist:${userId}`,
      15 * 60, // 15 minutes (access token expiry)
      'revoked'
    );
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(userId: string): Promise<boolean> {
    const blacklisted = await this.redis.get(`blacklist:${userId}`);
    return blacklisted !== null;
  }

  // Get token payload without verification (for logging)
  getTokenPayload(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  academicLevel: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}
```

## 🛡️ Authorization System

### **Role-Based Access Control (RBAC)**
```typescript
// services/auth/rbac-service.ts
import { UserService } from '../user-service';

export class RBACService {
  private userService: UserService;

  // Role definitions
  private readonly ROLES = {
    STUDENT: 'student',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    DEVELOPER: 'developer'
  };

  // Permission definitions
  private readonly PERMISSIONS = {
    // Course permissions
    COURSE_VIEW: 'course:view',
    COURSE_CREATE: 'course:create',
    COURSE_EDIT: 'course:edit',
    COURSE_DELETE: 'course:delete',
    COURSE_ENROLL: 'course:enroll',
    
    // Project permissions
    PROJECT_CREATE: 'project:create',
    PROJECT_EDIT: 'project:edit',
    PROJECT_DELETE: 'project:delete',
    PROJECT_VIEW: 'project:view',
    PROJECT_SHARE: 'project:share',
    
    // NFT permissions
    NFT_MINT: 'nft:mint',
    NFT_TRANSFER: 'nft:transfer',
    NFT_BURN: 'nft:burn',
    
    // User management
    USER_VIEW: 'user:view',
    USER_EDIT: 'user:edit',
    USER_DELETE: 'user:delete',
    USER_BAN: 'user:ban',
    
    // System permissions
    SYSTEM_CONFIG: 'system:config',
    SYSTEM_LOGS: 'system:logs',
    SYSTEM_BACKUP: 'system:backup'
  };

  // Role-permission mapping
  private readonly ROLE_PERMISSIONS = {
    [this.ROLES.STUDENT]: [
      this.PERMISSIONS.COURSE_VIEW,
      this.PERMISSIONS.COURSE_ENROLL,
      this.PERMISSIONS.PROJECT_CREATE,
      this.PERMISSIONS.PROJECT_EDIT,
      this.PERMISSIONS.PROJECT_VIEW,
      this.PERMISSIONS.PROJECT_SHARE,
      this.PERMISSIONS.NFT_MINT,
      this.PERMISSIONS.NFT_TRANSFER,
      this.PERMISSIONS.USER_VIEW
    ],
    
    [this.ROLES.INSTRUCTOR]: [
      ...this.ROLE_PERMISSIONS[this.ROLES.STUDENT],
      this.PERMISSIONS.COURSE_CREATE,
      this.PERMISSIONS.COURSE_EDIT,
      this.PERMISSIONS.PROJECT_DELETE
    ],
    
    [this.ROLES.MODERATOR]: [
      ...this.ROLE_PERMISSIONS[this.ROLES.INSTRUCTOR],
      this.PERMISSIONS.USER_EDIT,
      this.PERMISSIONS.USER_BAN,
      this.PERMISSIONS.SYSTEM_LOGS
    ],
    
    [this.ROLES.ADMIN]: [
      ...this.ROLE_PERMISSIONS[this.ROLES.MODERATOR],
      this.PERMISSIONS.COURSE_DELETE,
      this.PERMISSIONS.USER_DELETE,
      this.PERMISSIONS.SYSTEM_CONFIG,
      this.PERMISSIONS.SYSTEM_BACKUP
    ],
    
    [this.ROLES.DEVELOPER]: [
      ...this.ROLE_PERMISSIONS[this.ROLES.ADMIN],
      this.PERMISSIONS.NFT_BURN
    ]
  };

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Check if user has permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.userService.getUserById(userId);
      
      if (!user || !user.role) {
        return false;
      }

      const userPermissions = this.ROLE_PERMISSIONS[user.role] || [];
      return userPermissions.includes(permission);

    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // Check if user has any of the permissions
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  // Check if user has all permissions
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (!(await this.hasPermission(userId, permission))) {
        return false;
      }
    }
    return true;
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.userService.getUserById(userId);
      
      if (!user || !user.role) {
        return [];
      }

      return this.ROLE_PERMISSIONS[user.role] || [];

    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  // Assign role to user
  async assignRole(userId: string, role: string): Promise<void> {
    if (!Object.values(this.ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    await this.userService.updateUser(userId, {
      role,
      roleAssignedAt: new Date()
    });

    // Log role assignment
    await this.logRoleAssignment(userId, role);
  }

  // Remove role from user
  async removeRole(userId: string): Promise<void> {
    await this.userService.updateUser(userId, {
      role: null,
      roleRemovedAt: new Date()
    });

    // Log role removal
    await this.logRoleRemoval(userId);
  }

  // Get all roles
  getRoles(): string[] {
    return Object.values(this.ROLES);
  }

  // Get all permissions
  getPermissions(): string[] {
    return Object.values(this.PERMISSIONS);
  }

  // Get permissions for role
  getRolePermissions(role: string): string[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  private async logRoleAssignment(userId: string, role: string): Promise<void> {
    await this.userService.logSecurityEvent(userId, {
      eventType: 'role_assigned',
      details: { role },
      timestamp: new Date(),
      ipAddress: this.getClientIP()
    });
  }

  private async logRoleRemoval(userId: string): Promise<void> {
    await this.userService.logSecurityEvent(userId, {
      eventType: 'role_removed',
      timestamp: new Date(),
      ipAddress: this.getClientIP()
    });
  }
}
```

### **Resource-Based Authorization**
```typescript
// services/auth/resource-auth-service.ts
import { UserService } from '../user-service';
import { RBACService } from './rbac-service';

export class ResourceAuthService {
  private userService: UserService;
  private rbacService: RBACService;

  constructor(userService: UserService, rbacService: RBACService) {
    this.userService = userService;
    this.rbacService = rbacService;
  }

  // Check if user can access project
  async canAccessProject(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        return false;
      }

      // Project owner can always access
      if (project.ownerId === userId) {
        return true;
      }

      // Check if project is public
      if (project.isPublic) {
        return true;
      }

      // Check if user has admin permissions
      if (await this.rbacService.hasPermission(userId, 'project:view')) {
        return true;
      }

      // Check if user is collaborator
      if (project.collaborators && project.collaborators.includes(userId)) {
        return true;
      }

      return false;

    } catch (error) {
      console.error('Project access check failed:', error);
      return false;
    }
  }

  // Check if user can edit project
  async canEditProject(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        return false;
      }

      // Project owner can always edit
      if (project.ownerId === userId) {
        return true;
      }

      // Check if user has edit permissions
      if (await this.rbacService.hasPermission(userId, 'project:edit')) {
        return true;
      }

      // Check if user is collaborator with edit rights
      if (project.collaborators && project.collaborators.includes(userId)) {
        const collaboration = await this.getCollaboration(projectId, userId);
        return collaboration?.canEdit || false;
      }

      return false;

    } catch (error) {
      console.error('Project edit check failed:', error);
      return false;
    }
  }

  // Check if user can delete project
  async canDeleteProject(userId: string, projectId: string): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        return false;
      }

      // Project owner can always delete
      if (project.ownerId === userId) {
        return true;
      }

      // Check if user has delete permissions
      return await this.rbacService.hasPermission(userId, 'project:delete');

    } catch (error) {
      console.error('Project delete check failed:', error);
      return false;
    }
  }

  // Check if user can access course
  async canAccessCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const course = await this.getCourse(courseId);
      
      if (!course) {
        return false;
      }

      // Check if user is enrolled
      const enrollment = await this.getEnrollment(userId, courseId);
      if (enrollment) {
        return true;
      }

      // Check if user has view permissions
      return await this.rbacService.hasPermission(userId, 'course:view');

    } catch (error) {
      console.error('Course access check failed:', error);
      return false;
    }
  }

  // Check if user can edit course
  async canEditCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const course = await this.getCourse(courseId);
      
      if (!course) {
        return false;
      }

      // Course creator can always edit
      if (course.creatorId === userId) {
        return true;
      }

      // Check if user has edit permissions
      return await this.rbacService.hasPermission(userId, 'course:edit');

    } catch (error) {
      console.error('Course edit check failed:', error);
      return false;
    }
  }

  // Check if user can access user profile
  async canAccessUserProfile(requestingUserId: string, targetUserId: string): Promise<boolean> {
    try {
      // Users can always view their own profile
      if (requestingUserId === targetUserId) {
        return true;
      }

      // Check if user has view permissions
      return await this.rbacService.hasPermission(requestingUserId, 'user:view');

    } catch (error) {
      console.error('User profile access check failed:', error);
      return false;
    }
  }

  // Check if user can edit user profile
  async canEditUserProfile(requestingUserId: string, targetUserId: string): Promise<boolean> {
    try {
      // Users can always edit their own profile
      if (requestingUserId === targetUserId) {
        return true;
      }

      // Check if user has edit permissions
      return await this.rbacService.hasPermission(requestingUserId, 'user:edit');

    } catch (error) {
      console.error('User profile edit check failed:', error);
      return false;
    }
  }

  // Check if user can mint NFT
  async canMintNFT(userId: string, projectId: string): Promise<boolean> {
    try {
      // Check if user can access the project
      if (!(await this.canAccessProject(userId, projectId))) {
        return false;
      }

      // Check if user has mint permissions
      return await this.rbacService.hasPermission(userId, 'nft:mint');

    } catch (error) {
      console.error('NFT mint check failed:', error);
      return false;
    }
  }

  // Check if user can transfer NFT
  async canTransferNFT(userId: string, nftId: string): Promise<boolean> {
    try {
      const nft = await this.getNFT(nftId);
      
      if (!nft) {
        return false;
      }

      // NFT owner can always transfer
      if (nft.ownerId === userId) {
        return true;
      }

      // Check if user has transfer permissions
      return await this.rbacService.hasPermission(userId, 'nft:transfer');

    } catch (error) {
      console.error('NFT transfer check failed:', error);
      return false;
    }
  }

  // Helper methods (implement based on your data access layer)
  private async getProject(projectId: string): Promise<any> {
    // Implementation depends on your project service
    return null;
  }

  private async getCourse(courseId: string): Promise<any> {
    // Implementation depends on your course service
    return null;
  }

  private async getEnrollment(userId: string, courseId: string): Promise<any> {
    // Implementation depends on your enrollment service
    return null;
  }

  private async getCollaboration(projectId: string, userId: string): Promise<any> {
    // Implementation depends on your collaboration service
    return null;
  }

  private async getNFT(nftId: string): Promise<any> {
    // Implementation depends on your NFT service
    return null;
  }
}
```

## 🔒 Data Protection

### **Data Encryption Service**
```typescript
// services/security/encryption-service.ts
import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  // Encrypt sensitive data
  encryptData(data: string, key: string): string {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // Derive key from password and salt
      const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha512');
      
      // Create cipher
      const cipher = crypto.createCipher(this.algorithm, derivedKey);
      cipher.setAAD(Buffer.from('engineering-forge', 'utf8'));
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine all components
      return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
      
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt sensitive data
  decryptData(encryptedData: string, key: string): string {
    try {
      const parts = encryptedData.split(':');
      const salt = Buffer.from(parts[0], 'hex');
      const iv = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      const tag = Buffer.from(parts[3], 'hex');
      
      // Derive key from password and salt
      const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, this.keyLength, 'sha512');
      
      // Create decipher
      const decipher = crypto.createDecipher(this.algorithm, derivedKey);
      decipher.setAAD(Buffer.from('engineering-forge', 'utf8'));
      decipher.setAuthTag(tag);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
      
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  // Hash password
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return salt + ':' + hash;
  }

  // Verify password
  verifyPassword(password: string, hashedPassword: string): boolean {
    const parts = hashedPassword.split(':');
    const salt = parts[0];
    const hash = parts[1];
    
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Generate secure random string
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate API key
  generateAPIKey(): string {
    return 'engforge_' + crypto.randomBytes(32).toString('base64url');
  }

  // Hash API key for storage
  hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}
```

### **Input Validation & Sanitization**
```typescript
// services/security/validation-service.ts
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

export class ValidationService {
  // User input validation schemas
  private readonly userSchemas = {
    registration: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }),
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      academicLevel: Joi.string()
        .valid('beginner', 'intermediate', 'advanced')
        .required()
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),

    profileUpdate: Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional(),
      academicLevel: Joi.string()
        .valid('beginner', 'intermediate', 'advanced')
        .optional(),
      bio: Joi.string()
        .max(500)
        .optional(),
      avatarUrl: Joi.string()
        .uri()
        .optional()
    })
  };

  // Project input validation schemas
  private readonly projectSchemas = {
    create: Joi.object({
      title: Joi.string()
        .min(1)
        .max(100)
        .required(),
      description: Joi.string()
        .max(1000)
        .optional(),
      projectType: Joi.string()
        .valid('car', 'circuit', 'bridge', 'software')
        .required(),
      components: Joi.array()
        .items(Joi.object({
          type: Joi.string().required(),
          properties: Joi.object().required()
        }))
        .min(1)
        .required(),
      isPublic: Joi.boolean().default(false)
    }),

    update: Joi.object({
      title: Joi.string()
        .min(1)
        .max(100)
        .optional(),
      description: Joi.string()
        .max(1000)
        .optional(),
      components: Joi.array()
        .items(Joi.object({
          type: Joi.string().required(),
          properties: Joi.object().required()
        }))
        .min(1)
        .optional(),
      isPublic: Joi.boolean().optional()
    })
  };

  // Course input validation schemas
  private readonly courseSchemas = {
    create: Joi.object({
      title: Joi.string()
        .min(1)
        .max(100)
        .required(),
      description: Joi.string()
        .max(1000)
        .required(),
      discipline: Joi.string()
        .valid('mechanical', 'electrical', 'civil', 'software', 'aerospace')
        .required(),
      difficultyLevel: Joi.string()
        .valid('beginner', 'intermediate', 'advanced')
        .required(),
      estimatedDuration: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
    })
  };

  // Validate user input
  validateUserInput(schemaName: string, data: any): ValidationResult {
    try {
      const schema = this.userSchemas[schemaName];
      if (!schema) {
        return {
          isValid: false,
          error: 'Invalid schema name'
        };
      }

      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return {
          isValid: false,
          error: error.details.map(detail => detail.message).join(', ')
        };
      }

      return {
        isValid: true,
        data: value
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Validation failed'
      };
    }
  }

  // Validate project input
  validateProjectInput(schemaName: string, data: any): ValidationResult {
    try {
      const schema = this.projectSchemas[schemaName];
      if (!schema) {
        return {
          isValid: false,
          error: 'Invalid schema name'
        };
      }

      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        return {
          isValid: false,
          error: error.details.map(detail => detail.message).join(', ')
        };
      }

      return {
        isValid: true,
        data: value
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Validation failed'
      };
    }
  }

  // Sanitize HTML content
  sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
  }

  // Sanitize user input
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL format
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate file upload
  validateFileUpload(file: any, allowedTypes: string[], maxSize: number): ValidationResult {
    try {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return {
          isValid: false,
          error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
      }

      // Check file size
      if (file.size > maxSize) {
        return {
          isValid: false,
          error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
        };
      }

      return {
        isValid: true,
        data: file
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'File validation failed'
      };
    }
  }
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: any;
}
```

## 🚨 Security Monitoring

### **Security Event Logging**
```typescript
// services/security/security-logger.ts
import { UserService } from '../user-service';

export class SecurityLogger {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Log security event
  async logSecurityEvent(userId: string, event: SecurityEvent): Promise<void> {
    try {
      const securityEvent = {
        userId,
        eventType: event.eventType,
        details: event.details || {},
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp || new Date(),
        severity: event.severity || 'info',
        sessionId: event.sessionId
      };

      // Store in database
      await this.userService.createSecurityEvent(securityEvent);

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('Security Event:', securityEvent);
      }

      // Send alert for high severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.sendSecurityAlert(securityEvent);
      }

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Log authentication attempt
  async logAuthAttempt(userId: string, success: boolean, details: any): Promise<void> {
    await this.logSecurityEvent(userId, {
      eventType: success ? 'auth_success' : 'auth_failed',
      details,
      severity: success ? 'info' : 'warning',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });
  }

  // Log permission check
  async logPermissionCheck(userId: string, permission: string, granted: boolean): Promise<void> {
    await this.logSecurityEvent(userId, {
      eventType: 'permission_check',
      details: { permission, granted },
      severity: granted ? 'info' : 'warning',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });
  }

  // Log suspicious activity
  async logSuspiciousActivity(userId: string, activity: string, details: any): Promise<void> {
    await this.logSecurityEvent(userId, {
      eventType: 'suspicious_activity',
      details: { activity, ...details },
      severity: 'high',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });
  }

  // Log data access
  async logDataAccess(userId: string, resourceType: string, resourceId: string, action: string): Promise<void> {
    await this.logSecurityEvent(userId, {
      eventType: 'data_access',
      details: { resourceType, resourceId, action },
      severity: 'info',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });
  }

  // Log configuration change
  async logConfigChange(userId: string, configKey: string, oldValue: any, newValue: any): Promise<void> {
    await this.logSecurityEvent(userId, {
      eventType: 'config_change',
      details: { configKey, oldValue, newValue },
      severity: 'high',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });
  }

  // Send security alert
  private async sendSecurityAlert(event: any): Promise<void> {
    try {
      // Send email alert
      await this.sendEmailAlert(event);
      
      // Send Slack notification
      await this.sendSlackAlert(event);
      
      // Log to external security monitoring service
      await this.logToExternalService(event);

    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // Get client IP address
  private getClientIP(): string {
    // Implementation depends on your request context
    return 'unknown';
  }

  // Get user agent
  private getUserAgent(): string {
    // Implementation depends on your request context
    return 'unknown';
  }

  // Send email alert
  private async sendEmailAlert(event: any): Promise<void> {
    // Implementation for sending email alerts
  }

  // Send Slack alert
  private async sendSlackAlert(event: any): Promise<void> {
    // Implementation for sending Slack notifications
  }

  // Log to external service
  private async logToExternalService(event: any): Promise<void> {
    // Implementation for external security monitoring
  }
}

interface SecurityEvent {
  eventType: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  severity?: 'info' | 'warning' | 'high' | 'critical';
  sessionId?: string;
}
```

## 🔍 Rate Limiting & DDoS Protection

### **Rate Limiting Service**
```typescript
// services/security/rate-limiter.ts
import { Redis } from 'ioredis';

export class RateLimiter {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Check rate limit for user
  async checkRateLimit(userId: string, action: string, limit: number, window: number): Promise<RateLimitResult> {
    try {
      const key = `rate_limit:${action}:${userId}`;
      const now = Date.now();
      const windowStart = now - window;

      // Get current requests in window
      const requests = await this.redis.zrangebyscore(key, windowStart, '+inf');
      
      if (requests.length >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + window,
          retryAfter: Math.ceil((windowStart + window - now) / 1000)
        };
      }

      // Add current request
      await this.redis.zadd(key, now, now.toString());
      await this.redis.expire(key, Math.ceil(window / 1000));

      return {
        allowed: true,
        remaining: limit - requests.length - 1,
        resetTime: windowStart + window,
        retryAfter: 0
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: 999,
        resetTime: Date.now() + 60000,
        retryAfter: 0
      };
    }
  }

  // Check IP-based rate limit
  async checkIPRateLimit(ip: string, action: string, limit: number, window: number): Promise<RateLimitResult> {
    return this.checkRateLimit(ip, `ip:${action}`, limit, window);
  }

  // Check global rate limit
  async checkGlobalRateLimit(action: string, limit: number, window: number): Promise<RateLimitResult> {
    return this.checkRateLimit('global', action, limit, window);
  }

  // Reset rate limit for user
  async resetRateLimit(userId: string, action: string): Promise<void> {
    const key = `rate_limit:${action}:${userId}`;
    await this.redis.del(key);
  }

  // Get rate limit info
  async getRateLimitInfo(userId: string, action: string): Promise<RateLimitInfo> {
    try {
      const key = `rate_limit:${action}:${userId}`;
      const now = Date.now();
      const window = 60000; // 1 minute
      const windowStart = now - window;

      const requests = await this.redis.zrangebyscore(key, windowStart, '+inf');
      
      return {
        current: requests.length,
        limit: 100, // Default limit
        window,
        resetTime: windowStart + window
      };

    } catch (error) {
      console.error('Failed to get rate limit info:', error);
      return {
        current: 0,
        limit: 100,
        window: 60000,
        resetTime: Date.now() + 60000
      };
    }
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}

interface RateLimitInfo {
  current: number;
  limit: number;
  window: number;
  resetTime: number;
}
```
