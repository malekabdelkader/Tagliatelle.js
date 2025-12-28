/**
 * 📁 SINGLE CATEGORY ROUTE
 * 
 * GET /categories/:slug - Get category by slug with its posts
 * 
 * Demonstrates:
 * - Slug-based routing (not just IDs)
 * - Related data fetching
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';

interface CategoryParams {
  slug: string;
}

export async function GET({ params, log, db }: HandlerProps<CategoryParams>) {
  const database = db as ContentDB;
  const category = database.categories.findBySlug(params.slug);
  
  if (!category) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Category '${params.slug}' not found`,
        }} />
      </Response>
    );
  }
  
  // Get posts in this category
  const posts = database.posts.findMany({ 
    status: 'published', 
    categoryId: category.id 
  });
  
  log.info({ category: category.name, posts: posts.length }, '📁 Viewed category');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: {
          ...category,
          postCount: posts.length,
          posts: posts.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
          })),
        },
      }} />
    </Response>
  );
}
