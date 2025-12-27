/**
 * 🍝 Posts Routes Config
 * 
 * This config applies to all routes in /posts/* passed as children.
 * Config wraps children - components apply their effects to child routes!
 */

import { Logger, Middleware, RateLimiter } from 'tagliatelle';
import type { HandlerProps, TagliatelleNode } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../../middleware/auth.js';

// Conditional auth - only for write operations
const writeAuthMiddleware = async (props: HandlerProps, request: FastifyRequest, reply: FastifyReply) => {
  const method = request.method;
  
  // Skip auth for read-only requests
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }
  
  // Apply auth for write operations
  return authMiddleware(props, request, reply);
};

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="debug">
    <RateLimiter max={100} timeWindow="1 minute">
      <Middleware use={writeAuthMiddleware}>
        {children}
      </Middleware>
    </RateLimiter>
  </Logger>
);
