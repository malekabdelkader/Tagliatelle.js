/**
 * 🍝 Posts Collection Route
 * 
 * GET  /posts     - List all posts
 * POST /posts     - Create a new post
 */

import { h, Response, Status, Body, Err } from '../../tagliatelle.js';
import type { HandlerProps } from '../../types.js';
import { posts } from './_data.js';

void h; // JSX factory

interface CreatePostBody {
  title: string;
  content: string;
  author?: string;
}

/**
 * GET /posts - List all posts
 */
export async function GET({ log }: HandlerProps) {
  log.info('Fetching all posts');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: posts.length,
        data: posts
      }} />
    </Response>
  );
}

/**
 * POST /posts - Create a new post
 */
export async function POST({ body, log, user }: HandlerProps<unknown, CreatePostBody>) {
  log.info('Creating new post');
  
  // Validation
  if (!body.title || !body.content) {
    return (
      <Err 
        code={400} 
        message="Missing required fields" 
        details={{ required: ['title', 'content'] }}
      />
    );
  }
  
  const newPost = {
    id: String(posts.length + 1),
    title: body.title,
    content: body.content,
    author: body.author || (user as { name?: string })?.name || 'Anonymous',
    createdAt: new Date()
  };
  
  posts.push(newPost);
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Post created successfully! 🍝',
        data: newPost
      }} />
    </Response>
  );
}

