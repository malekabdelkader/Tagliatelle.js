/**
 * 🔐 AUTHENTICATION MIDDLEWARE
 * 
 * Provides authentication for the application.
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

export type UserRole = 'admin' | 'editor' | 'user' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

// Token store with properly typed users
const TOKENS = new Map<string, AuthUser>([
  ['token_admin_123', { id: 'user_1', name: 'System Admin', role: 'admin', email: 'admin@company.io' }],
  ['token_editor_456', { id: 'user_2', name: 'Content Editor', role: 'editor', email: 'editor@company.io' }],
  ['token_reader_789', { id: 'user_3', name: 'Regular Reader', role: 'user', email: 'reader@company.io' }],
]);

const GUEST_USER: AuthUser = { id: 'guest', name: 'Guest', role: 'guest', email: '' };

/**
 * Optional Auth Middleware
 * 
 * Checks for auth token but doesn't block if missing.
 * Use this for routes where auth is optional (viewing posts).
 */
export const authMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: GUEST_USER, isAuthenticated: false };
  }
  
  const token = authHeader.substring(7);
  const user = TOKENS.get(token);
  
  if (!user) {
    return { user: GUEST_USER, isAuthenticated: false };
  }
  
  props.log.debug({ userId: user.id, role: user.role }, `🔓 Authenticated: ${user.name}`);
  
  return { user, isAuthenticated: true };
};

/**
 * Required Auth Middleware
 * 
 * Blocks request if not authenticated.
 * Use this for routes that require login.
 */
export const requireAuth = async (
  props: HandlerProps,
  request: FastifyRequest,
  _reply: FastifyReply
) => {
  const authHeader = request.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Use: Authorization: Bearer <token>',
          hint: 'Valid tokens: token_admin_123, token_editor_456, token_reader_789',
        }} />
      </Response>
    );
  }
  
  const token = authHeader.substring(7);
  const user = TOKENS.get(token);
  
  if (!user) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Token not recognized',
          hint: 'Valid tokens: token_admin_123, token_editor_456, token_reader_789',
        }} />
      </Response>
    );
  }
  
  props.log.info({ userId: user.id, role: user.role }, `🔓 Authenticated: ${user.name}`);
  
  return { user, isAuthenticated: true };
};

/**
 * Role-based Access Control Middleware Factory
 * 
 * Creates middleware that checks for specific roles.
 * Must be used AFTER authMiddleware or requireAuth.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return async (
    props: HandlerProps,
    _request: FastifyRequest,
    _reply: FastifyReply
  ) => {
    const user = props.user as AuthUser | undefined;
    
    if (!user || user.role === 'guest') {
      return (
        <Response>
          <Status code={401} />
          <Body data={{
            success: false,
            error: 'NOT_AUTHENTICATED',
            message: 'Authentication required before role check',
          }} />
        </Response>
      );
    }
    
    if (!allowedRoles.includes(user.role)) {
      return (
        <Response>
          <Status code={403} />
          <Body data={{
            success: false,
            error: 'FORBIDDEN',
            message: `Role '${user.role}' not allowed. Required: ${allowedRoles.join(' or ')}`,
          }} />
        </Response>
      );
    }
    
    props.log.debug({ userId: user.id, role: user.role, allowedRoles }, '✅ Role check passed');
    return;
  };
};

/**
 * Validate token helper (for auth routes)
 */
export const validateToken = (token: string): { valid: boolean; user?: AuthUser } => {
  const user = TOKENS.get(token);
  return user ? { valid: true, user } : { valid: false };
};
