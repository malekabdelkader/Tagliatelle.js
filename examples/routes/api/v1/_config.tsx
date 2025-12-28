/**
 * 🔢 API V1 CONFIG
 * 
 * Demonstrates:
 * - API versioning with nested directories
 * - Version-specific rate limits
 * - Deprecation warnings via middleware
 */

import { RateLimiter, Middleware } from 'tagliatelle';
import type { TagliatelleNode, HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Deprecation warning middleware
const deprecationMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Add deprecation header
  reply.header('X-API-Deprecated', 'true');
  reply.header('X-API-Sunset-Date', '2025-06-01');
  reply.header('X-API-Migrate-To', '/api/v2');
  
  props.log.warn('⚠️ API v1 is deprecated. Please migrate to v2.');
  
  return { apiVersion: 'v1' };
};

export default ({ children }: { children: TagliatelleNode[] }) => (
  <RateLimiter max={30} timeWindow="1 minute">
    <Middleware use={deprecationMiddleware}>
      {children}
    </Middleware>
  </RateLimiter>
);

