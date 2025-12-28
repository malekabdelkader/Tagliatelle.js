/**
 * ✅ VALIDATION MIDDLEWARE
 * Demonstrates request validation patterns
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Content-Type Middleware - Ensures JSON for POST/PUT/PATCH
 */
export const requireJsonMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const method = request.method;
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers['content-type'];
    
    if (!contentType?.includes('application/json')) {
      return (
        <Response>
          <Status code={415} />
          <Body data={{
            success: false,
            error: 'UNSUPPORTED_MEDIA_TYPE',
            message: 'Content-Type must be application/json for this endpoint'
          }} />
        </Response>
      );
    }
  }
  
  return;
};

/**
 * Request ID Middleware - Adds unique request ID
 */
export const requestIdMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const requestId = request.headers['x-request-id'] as string || 
                    `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  // Set response header
  reply.header('X-Request-ID', requestId);
  
  return { requestId };
};

/**
 * Pagination Middleware - Parses and validates pagination params
 */
export const paginationMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const query = props.query as Record<string, string>;
  
  let page = parseInt(query.page || '1', 10);
  let limit = parseInt(query.limit || '10', 10);
  
  // Clamp values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(100, limit)); // Max 100 items per page
  
  const offset = (page - 1) * limit;
  
  return {
    pagination: {
      page,
      limit,
      offset
    }
  };
};

