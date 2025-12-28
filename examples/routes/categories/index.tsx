/**
 * 📁 CATEGORIES LIST ROUTE
 * 
 * GET /categories - List all categories with post counts
 * 
 * Demonstrates:
 * - Simple list endpoint
 * - Computed fields (post count)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['categories'],
  summary: 'List all categories',
  description: 'Get all categories with post counts',
};

export async function GET({ log, db }: HandlerProps) {
  const database = db as ContentDB;
  const categories = database.categories.findMany();
  
  // Enrich with post counts
  const enriched = categories.map(cat => ({
    ...cat,
    postCount: database.categories.getPostCount(cat.id),
  }));
  
  log.info({ count: categories.length }, '📁 Listed categories');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: enriched.length,
        data: enriched,
      }} />
    </Response>
  );
}
