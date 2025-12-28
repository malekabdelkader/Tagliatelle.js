/**
 * 💬 COMMENTS ROUTE
 * 
 * GET /posts/:id/comments - Get comments for a post
 * POST /posts/:id/comments - Add a comment (authenticated users only)
 * 
 * Demonstrates:
 * - Deep nested dynamic routes
 * - Accessing parent route params
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { ContentDB } from '../../../../databases/contentDB.js';
import type { AuthUser } from '../../../../middleware/auth.js';

interface CommentParams {
  id: string; // Post ID from parent route
}

export async function GET({ params, log, db }: HandlerProps<CommentParams>) {
  const database = db as ContentDB;
  const postId = params.id;
  
  // Verify post exists
  const post = database.posts.findById(postId);
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post '${postId}' not found`,
        }} />
      </Response>
    );
  }
  
  const comments = database.comments.findByPostId(postId);
  
  log.debug({ postId, commentCount: comments.length }, '💬 Fetching comments');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        postId,
        postTitle: post.title,
        count: comments.length,
        data: comments,
      }} />
    </Response>
  );
}

interface CreateCommentBody {
  content: string;
}

export async function POST({ params, body, log, db, user, isAuthenticated }: HandlerProps<CommentParams, CreateCommentBody>) {
  const database = db as ContentDB;
  const currentUser = user as AuthUser | undefined;
  const postId = params.id;
  
  // Must be authenticated
  if (!isAuthenticated || !currentUser || currentUser.role === 'guest') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'You must be logged in to comment',
        }} />
      </Response>
    );
  }
  
  // Verify post exists
  const post = database.posts.findById(postId);
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post '${postId}' not found`,
        }} />
      </Response>
    );
  }
  
  if (!body.content || body.content.trim().length === 0) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Comment content is required',
        }} />
      </Response>
    );
  }
  
  const newComment = database.comments.create({
    postId,
    authorId: currentUser.id,
    content: body.content,
  });
  
  log.info({ 
    commentId: newComment.id, 
    postId, 
    author: currentUser.name 
  }, '💬 Created comment');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Comment added',
        data: newComment,
      }} />
    </Response>
  );
}
