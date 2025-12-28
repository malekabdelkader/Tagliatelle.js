// @ts-nocheck
/**
 * 📝 BLOG SERVICE MIDDLEWARE
 * 
 * Middleware specific to the Blog Service
 * Includes cross-service token validation via Auth Service
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Auth Service URL for token validation
const AUTH_SERVICE_URL = 'http://localhost:3001';

/**
 * Validates a token against the Auth Service
 * This demonstrates cross-service communication
 */
async function validateTokenWithAuthService(token: string): Promise<{
  valid: boolean;
  user?: { id: string; name: string; role: string };
  error?: string;
}> {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': 'service_key_blog_abc123', // Service-to-service auth
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      return { valid: false, error: 'Auth service unavailable' };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Auth service might not be running - fallback to local validation
    // In production, you'd want to handle this differently
    console.warn('⚠️ Could not reach Auth Service, using fallback validation');
    
    // Fallback: Accept known tokens (for demo purposes)
    const fallbackTokens: Record<string, { id: string; name: string; role: string }> = {
      'token_admin_123': { id: 'user_1', name: 'System Admin', role: 'admin' },
      'token_editor_456': { id: 'user_2', name: 'Content Editor', role: 'editor' },
      'token_reader_789': { id: 'user_3', name: 'Regular Reader', role: 'user' },
    };
    
    const user = fallbackTokens[token];
    if (user) {
      return { valid: true, user };
    }
    
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Blog Service Middleware
 * - Adds service context
 * - Optionally validates auth tokens via Auth Service
 */
export const blogServiceMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Add service identifier
  reply.header('X-Service', 'blog-service');
  reply.header('X-Service-Version', '1.0.0');
  
  // Check for auth token
  const authHeader = request.headers.authorization;
  let user: { id: string; name: string; role: string } | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Validate token against Auth Service
    const validation = await validateTokenWithAuthService(token);
    
    if (validation.valid && validation.user) {
      user = validation.user;
      props.log.info({ userId: user.id, role: user.role }, '✅ Token validated via Auth Service');
    } else {
      props.log.debug({ error: validation.error }, '❌ Token validation failed');
    }
  }
  
  props.log.debug({ service: 'blog', authenticated: !!user }, '📝 Blog Service handling request');
  
  return {
    serviceName: 'blog-service',
    serviceVersion: '1.0.0',
    user, // Will be undefined if not authenticated
    isAuthenticated: !!user,
  };
};

/**
 * Require Authentication Middleware
 * Use this for routes that require a logged-in user
 */
export const requireBlogAuth = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!props.isAuthenticated) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'This endpoint requires authentication. Use: Authorization: Bearer <token>',
          hint: 'Valid tokens: token_admin_123, token_editor_456, token_reader_789',
        }} />
      </Response>
    );
  }
  
  return;
};

/**
 * Require Editor or Admin Role
 */
export const requireEditorRole = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const user = props.user as { role: string } | undefined;
  
  if (!user || !['admin', 'editor'].includes(user.role)) {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'This action requires editor or admin role',
          currentRole: user?.role || 'unauthenticated',
        }} />
      </Response>
    );
  }
  
  return;
};

