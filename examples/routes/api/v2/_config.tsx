/**
 * 🚀 API V2 CONFIG
 * 
 * Demonstrates:
 * - Current/stable API version
 * - Higher rate limits than v1
 * - API key validation middleware
 */

import { RateLimiter, Middleware, Response, Status, Body } from 'tagliatelle';
import type { TagliatelleNode, HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Valid API keys (in real app, would be in database)
const VALID_API_KEYS = new Set([
  'demo-key-12345',
  'test-key-67890',
  'prod-key-abcdef',
]);

// API key validation middleware
const apiKeyMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const apiKey = request.headers['x-api-key'] as string;
  
  // Check for API key
  if (!apiKey) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'API_KEY_REQUIRED',
          message: 'Please provide an API key via X-API-Key header',
          validKeys: ['demo-key-12345', 'test-key-67890', 'prod-key-abcdef'],
        }} />
      </Response>
    );
  }
  
  if (!VALID_API_KEYS.has(apiKey)) {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'INVALID_API_KEY',
          message: 'The provided API key is not valid',
        }} />
      </Response>
    );
  }
  
  props.log.info({ apiKey: apiKey.substring(0, 8) + '...' }, '🔑 API key validated');
  
  return { 
    apiVersion: 'v2',
    apiKey,
  };
};

export default ({ children }: { children: TagliatelleNode[] }) => (
  <RateLimiter max={60} timeWindow="1 minute">
    <Middleware use={apiKeyMiddleware}>
      {children}
    </Middleware>
  </RateLimiter>
);

