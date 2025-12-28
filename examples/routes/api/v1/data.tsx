/**
 * 🔢 API V1 DATA ROUTE
 * 
 * GET /api/v1/data - Legacy data endpoint
 * 
 * Returns data in the old v1 format
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../../plugins/mockDB.js';

export async function GET({ log, db, apiVersion }: HandlerProps) {
  const database = db as MockDB;
  const posts = database.posts.findMany();
  
  log.debug('API v1 data requested');
  
  // V1 format: Simpler, flatter structure
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'X-API-Version': apiVersion as string || 'v1',
        'Content-Type': 'application/json; charset=utf-8',
      }} />
      <Body data={{
        // V1 format - flat structure
        status: 'ok',
        count: posts.length,
        items: posts.map(p => ({
          id: p?.id,
          title: p?.title,
          body: p?.content, // V1 used "body" instead of "content"
          hits: p?.views,    // V1 used "hits" instead of "views"
          date: p?.createdAt,
        })),
        _meta: {
          deprecated: true,
          useInstead: '/api/v2/data',
        },
      }} />
    </Response>
  );
}
