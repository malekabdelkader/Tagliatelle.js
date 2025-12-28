// @ts-nocheck
/**
 * 🌐 PLATFORM SERVICE - Single Category Route
 * 
 * GET /categories/:slug - Get category by slug
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

interface CategoryParams {
  slug: string;
}

export async function GET({ params, log, db, fetchBlogService }: HandlerProps<CategoryParams>) {
  const platformDB = db as PlatformDB;
  const category = platformDB.categories.findBySlug(params.slug);
  
  if (!category) {
    const allCategories = platformDB.categories.findMany();
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Category '${params.slug}' not found`,
          availableSlugs: allCategories.map(c => c.slug),
        }} />
      </Response>
    );
  }
  
  // Try to fetch related posts from Blog Service
  let relatedPosts = null;
  if (typeof fetchBlogService === 'function') {
    try {
      const result = await fetchBlogService<{ data: Array<{ id: string; title: string }> }>('/posts');
      if (result.success && result.data?.data) {
        relatedPosts = result.data.data.slice(0, 3);
      }
    } catch (e) {
      log.warn('Could not fetch related posts from Blog Service');
    }
  }
  
  log.debug({ slug: params.slug }, '📁 Category fetched');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: {
          ...category,
          relatedPosts: relatedPosts || [],
          _postsFromBlogService: `http://localhost:3002/posts?category=${category.id}`,
        },
      }} />
    </Response>
  );
}

