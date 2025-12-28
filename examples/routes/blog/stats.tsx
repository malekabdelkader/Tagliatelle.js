/**
 * 📝 BLOG SERVICE - Stats Route
 * 
 * GET /stats - Blog service statistics
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../databases/blogDB.js';

export async function GET({ log, db }: HandlerProps) {
  const blogDB = db as BlogDB;
  const stats = blogDB.stats();
  
  log.debug('📊 Blog stats requested');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        service: 'blog-service',
        stats,
        timestamp: new Date().toISOString(),
      }} />
    </Response>
  );
}

