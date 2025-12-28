/**
 * 📝 BLOG SERVICE - Index Route
 * 
 * GET /posts - List all published posts
 * POST /posts - Create a new post (requires auth)
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../databases/blogDB.js';

export async function GET({ log, db, serviceName }: HandlerProps) {
  const blogDB = db as BlogDB;
  
  // Only return published posts
  const posts = blogDB.posts.findMany({ status: 'published' });
  const stats = blogDB.stats();
  
  log.info({ postCount: posts.length }, '📝 Blog posts listed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 'X-Service': serviceName as string }} />
      <Body data={{
        success: true,
        service: 'Blog Service',
        description: 'Content & Media Management',
        team: 'Content & Media Team',
        version: '1.0.0',
        data: posts.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          authorId: p.authorId, // Client should fetch author from Auth Service
          views: p.views,
          likes: p.likes,
          categoryIds: p.categoryIds, // Client should fetch from Platform Service
          tagIds: p.tagIds,
          publishedAt: p.publishedAt,
        })),
        total: posts.length,
        stats,
        endpoints: [
          { method: 'GET', path: '/', description: 'List published posts' },
          { method: 'POST', path: '/', description: 'Create post (auth required)' },
          { method: 'GET', path: '/:id', description: 'Get post by ID' },
          { method: 'GET', path: '/slug/:slug', description: 'Get post by slug' },
          { method: 'PUT', path: '/:id', description: 'Update post (author/admin)' },
          { method: 'DELETE', path: '/:id', description: 'Delete post (author/admin)' },
          { method: 'POST', path: '/:id/like', description: 'Toggle like (auth required)' },
          { method: 'GET', path: '/:id/comments', description: 'Get post comments' },
          { method: 'POST', path: '/:id/comments', description: 'Add comment (auth required)' },
          { method: 'GET', path: '/popular', description: 'Get popular posts' },
          { method: 'GET', path: '/stats', description: 'Service statistics' },
        ],
      }} />
    </Response>
  );
}

interface CreatePostBody {
  title: string;
  content: string;
  excerpt?: string;
  categoryIds?: string[];
  tagIds?: string[];
  publish?: boolean;
}

export async function POST({ log, db, body, isAuthenticated, user }: HandlerProps<unknown, CreatePostBody>) {
  const blogDB = db as BlogDB;
  
  // Check authentication
  if (!isAuthenticated || !user) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'You must be logged in to create posts',
          hint: 'Use Authorization: Bearer <token>',
        }} />
      </Response>
    );
  }
  
  const currentUser = user as { id: string; name: string; role: string };
  
  // Check role (must be editor or admin)
  if (!['editor', 'admin'].includes(currentUser.role)) {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'Only editors and admins can create posts',
          currentRole: currentUser.role,
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
    .replace(/(^-|-$)/g, '');
  
  // Check if slug exists
  const existingPost = blogDB.posts.findBySlug(slug);
  if (existingPost) {
    return (
      <Response>
        <Status code={409} />
        <Body data={{
          success: false,
          error: 'SLUG_EXISTS',
          message: 'A post with this title already exists',
          existingSlug: slug,
        }} />
      </Response>
    );
  }
  
  const post = blogDB.posts.create({
    authorId: currentUser.id,
    title: body.title,
    slug,
    content: body.content,
    excerpt: body.excerpt || body.content.substring(0, 150) + '...',
    status: body.publish ? 'published' : 'draft',
    categoryIds: body.categoryIds || [],
    tagIds: body.tagIds || [],
    publishedAt: body.publish ? new Date().toISOString() : null,
  });
  
  log.info({ postId: post.id, author: currentUser.name }, '📝 New post created');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: body.publish ? 'Post published!' : 'Draft saved',
        data: post,
      }} />
    </Response>
  );
}
