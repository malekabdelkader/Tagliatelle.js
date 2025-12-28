/**
 * 🔍 SEARCH ROUTE
 * 
 * GET /search?q=term - Search posts by keyword
 * 
 * Demonstrates:
 * - Query parameter handling
 * - Database search operations
 * - Returning enriched results
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['search'],
  summary: 'Search posts',
  description: 'Search posts by keyword',
};

export async function GET({ query, log, db }: HandlerProps) {
  const database = db as ContentDB;
  const searchTerm = query.q as string;
  
  if (!searchTerm || searchTerm.length < 2) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'INVALID_QUERY',
          message: 'Search term must be at least 2 characters',
          usage: '/search?q=your-search-term',
        }} />
      </Response>
    );
  }
  
  log.info({ term: searchTerm }, '🔍 Searching');
  
  // Get matching post IDs from search index
  const postIds = database.search.query(searchTerm);
  
  // Fetch full post data
  const posts = postIds
    .map(id => database.posts.findById(id))
    .filter(post => post && post.status === 'published')
    .map(post => ({
      id: post!.id,
      title: post!.title,
      slug: post!.slug,
      excerpt: post!.excerpt,
      category: database.categories.findById(post!.categoryId),
      views: post!.views,
      likes: post!.likes,
    }));
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        query: searchTerm,
        count: posts.length,
        data: posts,
      }} />
    </Response>
  );
}

