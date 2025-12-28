/**
 * 📝 BLOG SERVICE - Comments Route
 * 
 * GET /posts/:id/comments - Get comments for a post
 * POST /posts/:id/comments - Add a comment
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../../databases/blogDB.js';

interface CommentParams {
  id: string; // Post ID
}

export async function GET({ params, log, db }: HandlerProps<CommentParams>) {
  const blogDB = db as BlogDB;
  const postId = params.id;
  
  // Verify post exists
  const post = blogDB.posts.findById(postId);
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post with ID '${postId}' not found`,
        }} />
      </Response>
    );
  }
  
  const comments = blogDB.comments.findByPostId(postId);
  
  log.debug({ postId, commentCount: comments.length }, '💬 Comments fetched');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        postId,
        postTitle: post.title,
        data: comments.map(c => ({
          ...c,
          _note: 'Fetch author details from Auth Service: GET /auth/users/' + c.authorId,
        })),
        total: comments.length,
      }} />
    </Response>
  );
}

interface CreateCommentBody {
  content: string;
}

export async function POST({ params, body, log, db, isAuthenticated, user }: HandlerProps<CommentParams, CreateCommentBody>) {
  const blogDB = db as BlogDB;
  const postId = params.id;
  
  if (!isAuthenticated || !user) {
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
  
  const currentUser = user as { id: string; name: string };
  
  // Verify post exists
  const post = blogDB.posts.findById(postId);
  if (!post) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `Post with ID '${postId}' not found`,
        }} />
      </Response>
    );
  }
  
  // Validate content
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
  
  const comment = blogDB.comments.create({
    postId,
    authorId: currentUser.id,
    content: body.content,
  });
  
  log.info({ commentId: comment.id, postId, author: currentUser.name }, '💬 Comment added');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Comment added',
        data: {
          ...comment,
          authorName: currentUser.name,
        },
      }} />
    </Response>
  );
}

