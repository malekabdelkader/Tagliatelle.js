/**
 * 📝 POSTS LIST ROUTE
 * 
 * GET  /posts - List all published posts
 * POST /posts - Create a new post (requires auth)
 * 
 * Demonstrates:
 * - Multiple HTTP methods in one file
 * - Optional vs required authentication
 * - Database operations
 * - JSX responses
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';
import type { AuthUser } from '../../middleware/auth.js';

// OpenAPI schemas for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['posts'],
  summary: 'List all posts',
  description: 'Get all published posts with category info',
};

export const POST_SCHEMA: RouteSchema = {
  tags: ['posts'],
  summary: 'Create a new post',
  description: 'Create a new post (requires authentication)',
};

/**
 * GET /posts
 * 
 * List all published posts with category info.
 * No authentication required.
 */
export async function GET({ log, db, query }: HandlerProps) {
  const database = db as ContentDB;
  
  // Get posts with optional filtering
  const posts = database.posts.findMany({ 
    status: 'published',
    categoryId: query.category as string | undefined,
  });
  
  // Enrich with category data
  const enrichedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: database.categories.findById(post.categoryId),
    tags: post.tagIds.map(id => database.tags.findById(id)).filter(Boolean),
    views: post.views,
    likes: post.likes,
    publishedAt: post.publishedAt,
  }));
  
  log.info({ count: posts.length }, '📚 Listed posts');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: enrichedPosts.length,
        data: enrichedPosts,
      }} />
    </Response>
  );
}

/**
 * POST /posts
 * 
 * Create a new post.
 * Requires authentication (editor or admin role).
 */
interface CreatePostBody {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds?: string[];
  publish?: boolean;
}

export async function POST({ body, log, db, user, isAuthenticated }: HandlerProps<{}, CreatePostBody>) {
  const database = db as ContentDB;
  const currentUser = user as AuthUser;
  
  // Check authentication
  if (!isAuthenticated || currentUser.role === 'guest') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required to create posts',
        }} />
      </Response>
    );
  }
  
  // Check role
  if (!['admin', 'editor'].includes(currentUser.role)) {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'Editor or admin role required to create posts',
        }} />
      </Response>
    );
  }
  
  // Validate input
  if (!body.title || !body.content) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Title and content are required',
        }} />
      </Response>
    );
  }
  
  // Create slug from title
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Create post
  const post = database.posts.create({
    authorId: currentUser.id,
    title: body.title,
    slug,
    content: body.content,
    excerpt: body.excerpt || body.content.substring(0, 150) + '...',
    status: body.publish ? 'published' : 'draft',
    categoryId: body.categoryId || 'cat_1',
    tagIds: body.tagIds || [],
    publishedAt: body.publish ? new Date().toISOString() : null,
  });
  
  log.info({ postId: post.id, author: currentUser.name }, '✨ Created post');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Post created',
        data: post,
      }} />
    </Response>
  );
}
