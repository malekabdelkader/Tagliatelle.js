/**
 * 🔍 PUBLIC SEARCH ROUTE
 * 
 * GET /public/search?q=term - Search public content
 * 
 * Demonstrates:
 * - Query parameter usage
 * - Search across multiple entities
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';

interface SearchQuery {
  q?: string;
  type?: 'posts' | 'categories' | 'all';
}

export async function GET({ log, query, db }: HandlerProps<unknown, unknown, SearchQuery>) {
  const database = db as MockDB;
  const searchTerm = query.q?.toLowerCase() || '';
  const searchType = query.type || 'all';
  
  if (!searchTerm) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'MISSING_QUERY',
          message: 'Search term is required. Use: /public/search?q=term',
          usage: {
            example: '/public/search?q=tagliatelle&type=posts',
            types: ['posts', 'categories', 'all'],
          },
        }} />
      </Response>
    );
  }
  
  const results: {
    posts: Array<{ id: string; title: string; match: string }>;
    categories: Array<{ slug: string; name: string; match: string }>;
  } = {
    posts: [],
    categories: [],
  };
  
  // Search posts
  if (searchType === 'all' || searchType === 'posts') {
    const posts = database.posts.findMany();
    results.posts = posts
      .filter(p => 
        p?.title?.toLowerCase().includes(searchTerm) || 
        p?.content?.toLowerCase().includes(searchTerm)
      )
      .map(p => ({
        id: p!.id,
        title: p!.title,
        match: p!.title.toLowerCase().includes(searchTerm) ? 'title' : 'content',
      }));
  }
  
  // Search categories
  if (searchType === 'all' || searchType === 'categories') {
    const categories = database.categories.findMany();
    results.categories = categories
      .filter(c => 
        c?.name?.toLowerCase().includes(searchTerm) || 
        c?.description?.toLowerCase().includes(searchTerm)
      )
      .map(c => ({
        slug: c!.slug,
        name: c!.name,
        match: c!.name.toLowerCase().includes(searchTerm) ? 'name' : 'description',
      }));
  }
  
  const totalResults = results.posts.length + results.categories.length;
  
  log.info({ query: searchTerm, type: searchType, results: totalResults }, '🔍 Search performed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        query: searchTerm,
        type: searchType,
        totalResults,
        results,
      }} />
    </Response>
  );
}
