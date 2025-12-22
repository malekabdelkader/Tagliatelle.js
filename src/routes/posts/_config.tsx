/**
 * 🍝 Posts Routes Config
 * 
 * This config applies to all routes in /posts/*
 * Uses JSX components for declarative configuration!
 */

import { h, Fragment, Logger, Middleware, RateLimiter } from '../../tagliatelle.js';
import { authMiddleware } from '../../middleware/auth.js';
import type { HandlerProps } from '../../types.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

void h;

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

export default () => (
  <>
    <Logger level="debug" />
    <RateLimiter max={100} timeWindow="1 minute" />
    <Middleware use={writeAuthMiddleware} />
  </>
);

