// @ts-nocheck
/**
 * 🌐 PLATFORM SERVICE - Search Route
 * 
 * GET /search - Search across all services
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../databases/platformDB.js';

interface SearchQuery {
  q?: string;
}

export async function GET({ log, db, query, fetchBlogService }: HandlerProps<unknown, unknown, SearchQuery>) {
  const platformDB = db as PlatformDB;
  const searchTerm = query.q?.toLowerCase();
  
  if (!searchTerm) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'MISSING_QUERY',
          message: 'Search term is required. Use: /search?q=term',
        }} />
      </Response>
    );
  }
  
  // Search in local index
  const indexResults = platformDB.search.query(searchTerm);
  
  // Search categories
  const categories = platformDB.categories.findMany()
    .filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm)
    );
  
  // Search tags
  const tags = platformDB.tags.findMany()
    .filter(t => t.name.toLowerCase().includes(searchTerm));
  
  // Try to get post details from Blog Service
  let posts: Array<{ id: string; title: string }> = [];
  if (indexResults.length > 0 && typeof fetchBlogService === 'function') {
    try {
      const result = await fetchBlogService<{ data: Array<{ id: string; title: string; slug: string }> }>('/posts');
      if (result.success && result.data?.data) {
        posts = result.data.data.filter(p => indexResults.includes(p.id));
      }
    } catch (e) {
      // Blog service might not be available
      posts = indexResults.map(id => ({ id, title: 'Unknown (Blog Service unavailable)' }));
    }
  }
  
  // Track search analytics
  platformDB.analytics.track('search', { query: searchTerm, results: indexResults.length }, 'platform');
  
  log.info({ query: searchTerm, postResults: posts.length, categoryResults: categories.length, tagResults: tags.length }, '🔍 Search performed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        query: searchTerm,
        results: {
          posts: posts.map(p => ({
            ...p,
            type: 'post',
            url: `http://localhost:3002/posts/${p.id}`,
          })),
          categories: categories.map(c => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            type: 'category',
            url: `/categories/${c.slug}`,
          })),
          tags: tags.map(t => ({
            id: t.id,
            name: t.name,
            type: 'tag',
            color: t.color,
          })),
        },
        totalResults: posts.length + categories.length + tags.length,
      }} />
    </Response>
  );
}

