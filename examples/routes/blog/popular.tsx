/**
 * 📝 BLOG SERVICE - Popular Posts Route
 * 
 * GET /posts/popular - Get most viewed posts
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../databases/blogDB.js';

interface PopularQuery {
  limit?: string;
}

export async function GET({ log, db, query }: HandlerProps<unknown, unknown, PopularQuery>) {
  const blogDB = db as BlogDB;
  
  const limit = Math.min(20, Math.max(1, parseInt(query.limit || '5', 10)));
  const popular = blogDB.posts.getPopular(limit);
  
  log.debug({ limit, count: popular.length }, '🔥 Popular posts fetched');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: popular.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          views: p.views,
          likes: p.likes,
          publishedAt: p.publishedAt,
        })),
        total: popular.length,
      }} />
    </Response>
  );
}

