/**
 * 🍝 Posts Collection Route
 * 
 * GET  /posts     - List all posts
 * POST /posts     - Create a new post
 */

import { Response, Status, Body, Err, Middleware } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import { posts } from './_data.js';
import { authMiddleware } from 'examples/middleware/auth.js';

interface CreatePostBody {
  title: string;
  content: string;
  author?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📚 OpenAPI/Swagger Schemas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schema for GET /posts - appears in Swagger UI
 */
export const GET_SCHEMA = {
  summary: 'List all posts',
  description: 'Returns a list of all blog posts with pagination info',
  tags: ['posts'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        count: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              author: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }
};

/**
 * Schema for POST /posts - appears in Swagger UI
 */
export const POST_SCHEMA = {
  summary: 'Create a new post',
  description: 'Creates a new blog post with the provided data',
  tags: ['posts'],
  body: {
    type: 'object',
    required: ['title', 'content'],
    properties: {
      title: { type: 'string', description: 'Post title' },
      content: { type: 'string', description: 'Post content/body' },
      author: { type: 'string', description: 'Author name (optional)' }
    }
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        details: { type: 'object' }
      }
    }
  }
};

/**
 * GET /posts - List all posts
 */
export async function GET({ log }: HandlerProps) {
  log.info('Fetching all posts');
  
  return (
    <Middleware use={authMiddleware} >
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: posts.length,
        data: posts
      }} />
    </Response>
    </Middleware>
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
