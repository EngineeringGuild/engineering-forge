/**
 * JWT Utilities - Engineering Forge V1.0
 *
 * This file contains JWT token generation, verification, and management utilities.
 */

import jwt from 'jsonwebtoken';
import { JWTPayload, RefreshTokenPayload, TokenResponse } from '../types/auth.types';

// JWT configuration
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // @ts-ignore
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'engineering-forge',
    audience: 'engineering-forge-users'
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  // @ts-ignore
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'engineering-forge',
    audience: 'engineering-forge-users'
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(userId: string, email: string, role: string): TokenResponse {
  const tokenId = generateTokenId();

  const accessToken = generateAccessToken({
    userId,
    email,
    role: role as any
  });

  const refreshToken = generateRefreshToken({
    userId,
    tokenId
  });

  // Calculate expiration time in seconds
  const expiresIn = 15 * 60; // 15 minutes in seconds

  return {
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'engineering-forge',
      audience: 'engineering-forge-users'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'engineering-forge',
      audience: 'engineering-forge-users'
    }) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Generate unique token ID for refresh tokens
 */
function generateTokenId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Token blacklist management (in production, use Redis or database)
 */
class TokenBlacklist {
  private blacklistedTokens = new Set<string>();

  add(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  remove(token: string): void {
    this.blacklistedTokens.delete(token);
  }

  clear(): void {
    this.blacklistedTokens.clear();
  }
}

export const tokenBlacklist = new TokenBlacklist();

/**
 * Blacklist token (for logout)
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

/**
 * Check if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.isBlacklisted(token);
}
