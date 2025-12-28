/**
 * 🔐 AUTH SERVICE - Login Route
 * 
 * POST /auth/login - Authenticate user and create session
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

// OpenAPI schema for Swagger
export const POST_SCHEMA: RouteSchema = {
  tags: ['auth'],
  summary: 'Login',
  description: 'Authenticate user and create session',
};

interface LoginBody {
  email: string;
  password: string;
}

export async function POST({ log, body, db, request }: HandlerProps<unknown, LoginBody>) {
  const authDB = db as AuthDB;
  
  // Validate input
  if (!body.email || !body.password) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        }} />
      </Response>
    );
  }
  
  // Find user by email
  const user = authDB.users.findByEmail(body.email);
  
  if (!user) {
    log.warn({ email: body.email }, '❌ Login failed: user not found');
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }} />
      </Response>
    );
  }
  
  // Verify password (simplified - in production use bcrypt.compare)
  const expectedPassword = user.passwordHash.replace('hashed_', '');
  if (body.password !== expectedPassword) {
    log.warn({ email: body.email }, '❌ Login failed: wrong password');
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }} />
      </Response>
    );
  }
  
  // Create session
  const token = `token_${user.role}_${Date.now().toString(36)}`;
  const session = authDB.sessions.create(user.id, token, {
    ip: request.ip || 'unknown',
    userAgent: request.headers['user-agent'] || 'unknown',
  });
  
  // Update last login
  authDB.users.updateLastLogin(user.id);
  
  log.info({ userId: user.id, sessionId: session.id }, '✅ User logged in');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Login successful',
        data: {
          token: session.token,
          expiresAt: new Date(session.expiresAt).toISOString(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
          },
        },
      }} />
    </Response>
  );
}
