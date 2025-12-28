/**
 * 📰 PUBLIC FEED ROUTE
 * 
 * GET /public/feed - Public content feed
 * 
 * Returns recent posts for anonymous users
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';

export async function GET({ log, db }: HandlerProps) {
  const database = db as MockDB;
  
  const posts = database.posts.findMany()
    .sort((a, b) => (b?.views || 0) - (a?.views || 0)) // Sort by popularity
    .slice(0, 5); // Top 5
  
  log.debug({ postCount: posts.length }, '📰 Public feed requested');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'Cache-Control': 'public, max-age=300',
        'ETag': `"feed-${Date.now()}"`,
      }} />
      <Body data={{
        success: true,
        feed: posts.map(p => ({
          id: p?.id,
          title: p?.title,
          excerpt: p?.content?.substring(0, 100) + '...',
          views: p?.views,
          url: `/posts/${p?.id}`,
        })),
        meta: {
          generated: new Date().toISOString(),
          ttl: 300,
        },
      }} />
    </Response>
  );
}
