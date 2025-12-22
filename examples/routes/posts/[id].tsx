/**
 * 🍝 Single Post Route
 * 
 * GET    /posts/:id  - Get a post
 * PUT    /posts/:id  - Update a post
 * DELETE /posts/:id  - Delete a post
 */

import { Response, Status, Body, Err } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import { posts } from './_data.js';

interface PostParams {
  id: string;
}

interface UpdatePostBody {
  title?: string;
  content?: string;
  author?: string;
}

/**
 * GET /posts/:id - Get a single post
 */
export async function GET({ params, log }: HandlerProps<PostParams>) {
  log.info(`Fetching post ${params.id}`);
  
  const post = posts.find(p => p.id === params.id);
  
  if (!post) {
    return <Err code={404} message="Post not found" />;
  }
  
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
export async function PUT({ params, body, log }: HandlerProps<PostParams, UpdatePostBody>) {
  log.info(`Updating post ${params.id}`);
  
  const postIndex = posts.findIndex(p => p.id === params.id);
  
  if (postIndex === -1) {
    return <Err code={404} message="Post not found" />;
  }
  
  posts[postIndex] = {
    ...posts[postIndex],
    ...body
  };
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post updated successfully!',
        data: posts[postIndex]
      }} />
    </Response>
  );
}

/**
 * DELETE /posts/:id - Delete a post
 */
export async function DELETE({ params, log }: HandlerProps<PostParams>) {
  log.info(`Deleting post ${params.id}`);
  
  const postIndex = posts.findIndex(p => p.id === params.id);
  
  if (postIndex === -1) {
    return <Err code={404} message="Post not found" />;
  }
  
  const deleted = posts.splice(postIndex, 1)[0];
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post deleted successfully!',
        data: deleted
      }} />
    </Response>
  );
}
