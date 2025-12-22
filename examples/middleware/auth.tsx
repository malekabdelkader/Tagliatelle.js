/**
 * 🌶️ Auth Middleware - The Spice (JSX Edition)
 * 
 * Authentication middleware using JSX components!
 * Includes security best practices:
 * - No hints about valid key format in error messages
 * - Rate limiting on failed attempts
 * - Safe key comparison
 */

import { Augment, Err, authFailureTracker, isSafeString } from 'tagliatelle';
import type { HandlerProps, MiddlewareFunction } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ═══════════════════════════════════════════════════════════════════════════
// 🔐 AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets client IP safely
 */
function getClientIP(request: FastifyRequest): string {
  // Check for forwarded headers (behind proxy)
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return request.ip || 'unknown';
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do comparison to prevent timing leak on length
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates an API key format without revealing expected format
 */
function isValidApiKeyFormat(key: unknown): key is string {
  if (typeof key !== 'string') return false;
  if (!isSafeString(key)) return false;
  if (key.length < 10 || key.length > 256) return false;
  // Only allow alphanumeric and dashes
  return /^[a-zA-Z0-9-]+$/.test(key);
}

/**
 * Simple API key authentication middleware
 * Returns JSX components for both success and failure cases
 * 
 * Security features:
 * - Rate limiting on failed attempts
 * - Constant-time comparison
 * - No format hints in error messages
 */
export const authMiddleware: MiddlewareFunction = async (
  props: HandlerProps,
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const clientIP = getClientIP(request);
  
  // Check if IP is blocked due to too many failures
  if (authFailureTracker.isBlocked(clientIP)) {
    props.log.warn('Blocked IP attempted access');
    return (
      <Err 
        code={429} 
        message="Too many failed attempts. Please try again later." 
      />
    );
  }
  
  const apiKey = request.headers['x-api-key'];
  
  // Validate format first
  if (!isValidApiKeyFormat(apiKey)) {
    authFailureTracker.recordFailure(clientIP);
    // Generic error - don't reveal expected format
    return (
      <Err 
        code={401} 
        message="Authentication required" 
      />
    );
  }
  
  // Validate key (in real app, check against database)
  // Using constant-time comparison for the prefix check
  const expectedPrefix = 'pasta-';
  const keyPrefix = apiKey.slice(0, expectedPrefix.length);
  
  if (!safeCompare(keyPrefix, expectedPrefix)) {
    authFailureTracker.recordFailure(clientIP);
    // Same error message - don't reveal what's wrong
    return (
      <Err 
        code={401} 
        message="Authentication required" 
      />
    );
  }
  
  // Clear failures on success
  authFailureTracker.clearFailures(clientIP);
  
  props.log.info('User authenticated');
  
  // Return user data to augment props
  // Don't include the actual API key, even partially
  return (
    <Augment 
      user={{
        id: 'user-1',
        name: 'Authenticated Chef',
        authenticatedAt: new Date().toISOString()
      }} 
    />
  );
};

/**
 * Role-based authorization middleware factory
 * 
 * Security: Don't reveal which roles exist in error messages
 */
export function requireRole(role: string): MiddlewareFunction {
  return async (props: HandlerProps, _request: FastifyRequest, _reply: FastifyReply) => {
    const user = props.user as { role?: string } | undefined;
    
    if (!user || user.role !== role) {
      // Generic error - don't reveal which role was required
      return (
        <Err 
          code={403} 
          message="Access denied" 
        />
      );
    }
    
    props.log.info('Role verified');
    return;
  };
}

/**
 * Optional auth - doesn't fail if no auth, just doesn't add user
 * Silently ignores invalid keys (no rate limiting since optional)
 */
export const optionalAuth: MiddlewareFunction = async (
  _props: HandlerProps,
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const apiKey = request.headers['x-api-key'];
  
  // Validate format silently
  if (!isValidApiKeyFormat(apiKey)) {
    return; // No auth, continue
  }
  
  // Validate key
  const expectedPrefix = 'pasta-';
  const keyPrefix = apiKey.slice(0, expectedPrefix.length);
  
  if (!safeCompare(keyPrefix, expectedPrefix)) {
    return; // Invalid, but optional so continue
  }
  
  return (
    <Augment 
      user={{
        id: 'user-1',
        name: 'Authenticated Chef',
        authenticatedAt: new Date().toISOString()
      }} 
    />
  );
};

/**
 * Creates a secure middleware that requires a specific permission
 */
export function requirePermission(permission: string): MiddlewareFunction {
  return async (props: HandlerProps, _request: FastifyRequest, _reply: FastifyReply) => {
    const user = props.user as { permissions?: string[] } | undefined;
    
    if (!user || !user.permissions?.includes(permission)) {
      return (
        <Err 
          code={403} 
          message="Access denied" 
        />
      );
    }
    
    return;
  };
}
