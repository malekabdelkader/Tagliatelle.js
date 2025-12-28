/**
 * 🚀 API V2 STATS ROUTE
 * 
 * GET /api/v2/stats - Aggregated statistics
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../../plugins/mockDB.js';

export async function GET({ log, db, apiVersion, getElapsedMs }: HandlerProps) {
  const database = db as MockDB;
  
  const posts = database.posts.findMany();
  const users = database.users.findMany();
  const categories = database.categories.findMany();
  const tags = database.tags.findMany();
  
  // Calculate stats
  const totalViews = posts.reduce((sum, p) => sum + (p?.views || 0), 0);
  const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
  const mostViewed = posts.sort((a, b) => (b?.views || 0) - (a?.views || 0))[0];
  
  const processingTime = typeof getElapsedMs === 'function' ? getElapsedMs() : null;
  
  log.debug('API v2 stats requested');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'X-API-Version': apiVersion as string || 'v2',
        'X-Processing-Time': processingTime ? `${processingTime.toFixed(2)}ms` : 'unknown',
      }} />
      <Body data={{
        success: true,
        data: {
          content: {
            posts: {
              total: posts.length,
              totalViews,
              averageViews: avgViews,
              mostPopular: mostViewed ? {
                id: mostViewed.id,
                title: mostViewed.title,
                views: mostViewed.views,
              } : null,
            },
            categories: {
              total: categories.length,
            },
            tags: {
              total: tags.length,
            },
          },
          users: {
            total: users.length,
            byRole: {
              admin: users.filter(u => u?.role === 'admin').length,
              editor: users.filter(u => u?.role === 'editor').length,
              user: users.filter(u => u?.role === 'user').length,
            },
          },
        },
        meta: {
          generatedAt: new Date().toISOString(),
          processingTimeMs: processingTime,
          apiVersion: apiVersion || 'v2',
        },
      }} />
    </Response>
  );
}
