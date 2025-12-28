/**
 * 📝 BLOG SERVICE - Single Post Route
 * 
 * GET /posts/:id - Get post by ID
 * PUT /posts/:id - Update post
 * DELETE /posts/:id - Delete post
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../databases/blogDB.js';

interface PostParams {
  id: string;
}

export async function GET({ params, log, db }: HandlerProps<PostParams>) {
  const blogDB = db as BlogDB;
  const post = blogDB.posts.findById(params.id);
  
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  // Increment view count
  blogDB.posts.incrementViews(params.id);
  
  // Get comment count
  const commentCount = blogDB.comments.count(params.id);
  
  log.info({ postId: post.id, views: post.views + 1 }, '📄 Post viewed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: {
          ...post,
          views: post.views + 1,
          commentCount,
          _note: 'Fetch author details from Auth Service: GET /auth/users/' + post.authorId,
        },
      }} />
    </Response>
  );
}

interface UpdatePostBody {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'archived';
  categoryIds?: string[];
  tagIds?: string[];
}

export async function PUT({ params, body, log, db, isAuthenticated, user }: HandlerProps<PostParams, UpdatePostBody>) {
  const blogDB = db as BlogDB;
  
  if (!isAuthenticated || !user) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required to update posts',
        }} />
      </Response>
    );
  }
  
  const currentUser = user as { id: string; role: string };
  const post = blogDB.posts.findById(params.id);
  
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  // Check ownership or admin
  if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only edit your own posts',
        }} />
      </Response>
    );
  }
  
  const updated = blogDB.posts.update(params.id, {
    ...body,
    publishedAt: body.status === 'published' && !post.publishedAt 
      ? new Date().toISOString() 
      : post.publishedAt,
  });
  
  log.info({ postId: params.id, updatedBy: currentUser.id }, '✏️ Post updated');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post updated',
        data: updated,
      }} />
    </Response>
  );
}

export async function DELETE({ params, log, db, isAuthenticated, user }: HandlerProps<PostParams>) {
  const blogDB = db as BlogDB;
  
  if (!isAuthenticated || !user) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required to delete posts',
        }} />
      </Response>
    );
  }
  
  const currentUser = user as { id: string; role: string };
  const post = blogDB.posts.findById(params.id);
  
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  // Check ownership or admin
  if (post.authorId !== currentUser.id && currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only delete your own posts',
        }} />
      </Response>
    );
  }
  
  blogDB.posts.delete(params.id);
  
  log.info({ postId: params.id, deletedBy: currentUser.id }, '🗑️ Post deleted');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: `Post '${params.id}' deleted`,
      }} />
    </Response>
  );
}

