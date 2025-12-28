/**
 * 🔐 ADMIN DASHBOARD ROUTE
 * 
 * GET /admin - Admin dashboard overview
 * 
 * Protected by auth + admin role (from _config.tsx)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';
import type { AuthUser } from '../../middleware/auth.js';

export async function GET({ log, db, user }: HandlerProps) {
  const database = db as MockDB;
  const currentUser = user as AuthUser | undefined;
  
  // Config middleware should handle auth, but fallback if not loaded
  if (!currentUser || currentUser.role === 'guest') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin access required. Use: Authorization: Bearer token_admin_123',
        }} />
      </Response>
    );
  }
  
  if (currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: `Role '${currentUser.role}' is not authorized for admin access`,
        }} />
      </Response>
    );
  }
  
  const stats = database.stats.getCounts();
  
  log.info({ admin: currentUser.name }, '🔐 Admin dashboard accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: `Welcome, ${currentUser.name}!`,
        dashboard: {
          systemStats: stats,
          recentActivity: [
            { action: 'User login', timestamp: new Date().toISOString() },
            { action: 'Post created', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { action: 'Comment added', timestamp: new Date(Date.now() - 7200000).toISOString() },
          ],
          quickLinks: [
            { name: 'Manage Users', path: '/admin/users' },
            { name: 'System Stats', path: '/admin/stats' },
            { name: 'Audit Logs', path: '/admin/logs' },
          ],
        },
      }} />
    </Response>
  );
}
