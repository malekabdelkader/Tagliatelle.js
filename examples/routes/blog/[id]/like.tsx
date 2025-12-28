/**
 * 📝 BLOG SERVICE - Like Route
 * 
 * POST /posts/:id/like - Toggle like on a post
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { BlogDB } from '../../../databases/blogDB.js';

interface LikeParams {
  id: string;
}

export async function POST({ params, log, db, isAuthenticated, user }: HandlerProps<LikeParams>) {
  const blogDB = db as BlogDB;
  const postId = params.id;
  
  if (!isAuthenticated || !user) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'You must be logged in to like posts',
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
  
  const result = blogDB.posts.toggleLike(postId, currentUser.id);
  
  log.info({ 
    postId, 
    userId: currentUser.id, 
    liked: result.liked 
  }, result.liked ? '❤️ Post liked' : '💔 Post unliked');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        action: result.liked ? 'liked' : 'unliked',
        totalLikes: result.totalLikes,
      }} />
    </Response>
  );
}

