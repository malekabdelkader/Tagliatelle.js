/**
 * 🔐 CURRENT USER ROUTE
 * 
 * GET /auth/me - Get current authenticated user info
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['auth'],
  summary: 'Current user',
  description: 'Get current authenticated user info',
};

export async function GET({ log, db, request }: HandlerProps) {
  const authDB = db as AuthDB;
  
  // Get token from header
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'NO_TOKEN',
          message: 'Authorization header with Bearer token is required',
        }} />
      </Response>
    );
  }
  
  const token = authHeader.substring(7);
  const validation = authDB.sessions.isTokenValid(token);
  
  if (!validation.valid) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'INVALID_TOKEN',
          message: validation.reason || 'Invalid token',
        }} />
      </Response>
    );
  }
  
  const user = validation.user!;
  const activeSessions = authDB.sessions.findByUserId(user.id).filter(s => s.isActive);
  
  log.debug({ userId: user.id }, '👤 User info retrieved');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
        sessions: {
          active: activeSessions.length,
        },
      }} />
    </Response>
  );
}
