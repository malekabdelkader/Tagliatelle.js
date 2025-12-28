/**
 * 🔐 AUTH SERVICE - Users List Route
 * 
 * GET /auth/users - List all users (admin only)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { AuthDB } from '../../../databases/authDB.js';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['auth'],
  summary: 'List users',
  description: 'List all users (admin only)',
};

export async function GET({ log, db, headers }: HandlerProps) {
  const authDB = db as AuthDB;
  
  // Verify admin access
  const authHeader = headers.authorization as string | undefined;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin authentication required',
        }} />
      </Response>
    );
  }
  
  const token = authHeader.substring(7);
  const validation = authDB.sessions.isTokenValid(token);
  
  if (!validation.valid || validation.user?.role !== 'admin') {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'Admin role required to list users',
          currentRole: validation.user?.role || 'unauthenticated',
        }} />
      </Response>
    );
  }
  
  const users = authDB.users.findMany();
  
  log.info({ requestedBy: validation.user.id, count: users.length }, '👥 Admin listing users');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          permissions: u.permissions,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin,
          mfaEnabled: u.mfaEnabled,
        })),
        total: users.length,
      }} />
    </Response>
  );
}

