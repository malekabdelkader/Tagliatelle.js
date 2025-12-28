/**
 * 🌐 PLATFORM SERVICE - Popular Tags Route
 * 
 * GET /tags/popular - Get most used tags
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

interface PopularQuery {
  limit?: string;
}

export async function GET({ log, db, query }: HandlerProps<unknown, unknown, PopularQuery>) {
  const platformDB = db as PlatformDB;
  
  const limit = Math.min(20, Math.max(1, parseInt(query.limit || '10', 10)));
  const popular = platformDB.tags.getPopular(limit);
  
  log.debug({ limit, count: popular.length }, '🔥 Popular tags fetched');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: popular,
        total: popular.length,
      }} />
    </Response>
  );
}

