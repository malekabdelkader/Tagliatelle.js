/**
 * 🌐 GLOBAL MIDDLEWARE
 * These middleware functions run on EVERY request
 */

import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Timing Middleware - Tracks request duration
 * Demonstrates augmenting the request with timing data
 */
export const globalTimingMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const startTime = process.hrtime.bigint();
  
  // Augment the props with timing info
  return {
    requestStartTime: startTime,
    getElapsedMs: () => {
      const endTime = process.hrtime.bigint();
      return Number(endTime - startTime) / 1_000_000;
    }
  };
};

/**
 * Request Logger Middleware - Logs every incoming request
 * Demonstrates using the logger in middleware
 */
export const requestLoggerMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { log } = props;
  
  log.info({
    event: 'REQUEST_RECEIVED',
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
  }, `📥 ${request.method} ${request.url}`);
  
  // Return nothing - just log
  return;
};

