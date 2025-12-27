/**
 * 🍝 Comments Route
 * 
 * GET  /posts/comments     - List all comments
 * POST /posts/comments     - Create a comment
 * 
 * Tests:
 * - Inherits Logger from main (info)
 * - Inherits CORS from main (*)
 * - Inherits middleware from posts config (writeAuthMiddleware)
 * - Overrides rateLimit from comments config (max=10)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

// In-memory comments
const comments = [
  { id: '1', postId: '1', text: 'Great post!', author: 'Alice' },
  { id: '2', postId: '1', text: 'Thanks for sharing', author: 'Bob' },
];

/**
 * GET /posts/comments - List all comments
 * 
 * Expected config:
 * - logLevel: info (from main)
 * - cors: * (from main)
 * - rateLimit: max=10 (from comments config - OVERRIDES posts & main)
 * - middleware: [writeAuthMiddleware] (from posts config - ACCUMULATED)
 */
export async function GET({ log }: HandlerProps) {
  log.info('Fetching comments - should have rateLimit=10, inherited middleware');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        _configTest: {
          expectedRateLimit: 'max=10 (overridden by comments config)',
          expectedMiddleware: 'writeAuthMiddleware (inherited from posts)',
          expectedCors: '* (inherited from main)',
          expectedLogLevel: 'info (inherited from main)'
        },
        count: comments.length,
        data: comments
      }} />
    </Response>
  );
}

/**
 * POST /posts/comments - Create a comment
 */
export async function POST({ body, log, user }: HandlerProps<unknown, { postId: string; text: string }>) {
  log.info('Creating comment - middleware should run first');
  
  const newComment = {
    id: String(comments.length + 1),
    postId: body.postId || '1',
    text: body.text || 'Test comment',
    author: (user as { name?: string })?.name || 'Anonymous'
  };
  
  comments.push(newComment);
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Comment created!',
        data: newComment
      }} />
    </Response>
  );
}

