/**
 * 📊 ADMIN STATS ROUTE
 * 
 * GET /admin/stats - Detailed system statistics
 * 
 * Inherits admin protection from parent _config.tsx
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';
import type { AuthUser } from '../../middleware/auth.js';

export async function GET({ log, db, user, getElapsedMs }: HandlerProps) {
  const database = db as MockDB;
  const currentUser = user as AuthUser | undefined;
  
  // Fallback auth check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin access required',
        }} />
      </Response>
    );
  }
  
  const stats = database.stats.getCounts();
  const posts = database.posts.findMany();
  const users = database.users.findMany();
  
  // Calculate some metrics
  const totalViews = posts.reduce((sum, p) => sum + (p?.views || 0), 0);
  const avgViewsPerPost = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
  const postsPerUser = posts.length > 0 && users.length > 0 
    ? (posts.length / users.length).toFixed(2) 
    : '0';
  
  // Use the timing middleware data
  const processingTime = typeof getElapsedMs === 'function' ? getElapsedMs() : null;
  
  log.info({ 
    admin: currentUser.name, 
    processingMs: processingTime 
  }, '📊 Stats requested');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'Cache-Control': 'no-cache',
        'X-Processing-Time': processingTime ? `${processingTime.toFixed(2)}ms` : 'unknown',
      }} />
      <Body data={{
        success: true,
        requestedBy: currentUser.name,
        generatedAt: new Date().toISOString(),
        statistics: {
          counts: stats,
          performance: {
            totalPostViews: totalViews,
            averageViewsPerPost: avgViewsPerPost,
            postsPerUser,
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform,
          },
        },
      }} />
    </Response>
  );
}
