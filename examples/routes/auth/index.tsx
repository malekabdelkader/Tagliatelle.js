/**
 * 🔐 AUTH INDEX ROUTE
 * 
 * GET /auth - Auth endpoints info and statistics
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

export async function GET({ log, db }: HandlerProps) {
  const authDB = db as AuthDB;
  const stats = authDB.stats();
  
  log.info('🔐 Auth index accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        name: 'Auth API',
        description: 'User authentication and session management',
        version: '1.0.0',
        endpoints: [
          { method: 'POST', path: '/auth/login', description: 'Authenticate user' },
          { method: 'POST', path: '/auth/register', description: 'Create new user' },
          { method: 'POST', path: '/auth/verify', description: 'Verify token' },
          { method: 'POST', path: '/auth/logout', description: 'Invalidate session' },
          { method: 'GET', path: '/auth/me', description: 'Current user info' },
          { method: 'GET', path: '/auth/users', description: 'List users (admin only)' },
          { method: 'GET', path: '/auth/users/:id', description: 'Get user details' },
          { method: 'GET', path: '/auth/stats', description: 'Statistics' },
        ],
        stats,
        testCredentials: {
          admin: { email: 'admin@company.io', password: 'admin_123' },
          editor: { email: 'editor@company.io', password: 'editor_456' },
          user: { email: 'reader@company.io', password: 'reader_789' },
        },
      }} />
    </Response>
  );
}
