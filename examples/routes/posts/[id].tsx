/**
 * 🍝 Single Post Route
 * 
 * GET    /posts/:id  - Get a post
 * PUT    /posts/:id  - Update a post
 * DELETE /posts/:id  - Delete a post
 */

import { Response, Status, Body, Err } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { ContentDB } from '../../databases/contentDB.js';

// OpenAPI schemas for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['posts'],
  summary: 'Get a post by ID',
  description: 'Retrieve a single post by its ID',
};

export const PUT_SCHEMA: RouteSchema = {
  tags: ['posts'],
  summary: 'Update a post',
  description: 'Update an existing post by ID',
};

export const DELETE_SCHEMA: RouteSchema = {
  tags: ['posts'],
  summary: 'Delete a post',
  description: 'Delete a post by ID',
};

interface PostParams {
  id: string;
}

interface UpdatePostBody {
  title?: string;
  content?: string;
}

/**
 * GET /posts/:id - Get a single post
 */
export async function GET({ params, log, db }: HandlerProps<PostParams>) {
  const database = db as ContentDB;
  
  log.info(`Fetching post ${params.id}`);
  
  const post = database.posts.findById(params.id);
  
  if (!post) {
    return <Err code={404} message="Post not found" />;
  }
  
  // Increment views
  database.posts.incrementViews(params.id);
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: post
      }} />
    </Response>
  );
}

/**
 * PUT /posts/:id - Update a post
 */
export async function PUT({ params, body, log, db }: HandlerProps<PostParams, UpdatePostBody>) {
  const database = db as ContentDB;
  
  log.info(`Updating post ${params.id}`);
  
  const post = database.posts.findById(params.id);
  
  if (!post) {
    return <Err code={404} message="Post not found" />;
  }
  
  const updated = database.posts.update(params.id, body);
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post updated successfully!',
        data: updated
      }} />
    </Response>
  );
}

/**
 * DELETE /posts/:id - Delete a post
 */
export async function DELETE({ params, log, db }: HandlerProps<PostParams>) {
  const database = db as ContentDB;
  
  log.info(`Deleting post ${params.id}`);
  
  const post = database.posts.findById(params.id);
  
  if (!post) {
    return <Err code={404} message="Post not found" />;
  }
  
  database.posts.delete(params.id);
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post deleted successfully!',
        data: post
      }} />
    </Response>
  );
}
