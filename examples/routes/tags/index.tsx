/**
 * 🏷️ TAGS LIST ROUTE
 * 
 * GET /tags - List all tags with usage counts
 * 
 * Demonstrates:
 * - Simple list endpoint
 * - Sorting by popularity
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['tags'],
  summary: 'List all tags',
  description: 'Get all tags with usage counts',
};

export async function GET({ log, db, query }: HandlerProps) {
  const database = db as ContentDB;
  
  const limit = parseInt(query.limit as string) || 10;
  const popular = query.popular === 'true';
  
  const tags = popular 
    ? database.tags.getPopular(limit)
    : database.tags.findMany().map(t => ({ ...t, count: 0 }));
  
  log.info({ count: tags.length, popular }, '🏷️ Listed tags');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: tags.length,
        data: tags,
      }} />
    </Response>
  );
}

