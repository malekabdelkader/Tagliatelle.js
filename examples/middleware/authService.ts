/**
 * 🔐 AUTH SERVICE MIDDLEWARE
 * 
 * Middleware specific to the Auth Service
 */

import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Auth Service Identifier Middleware
 * Adds service context to all requests
 */
export const authServiceMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Add service identifier
  reply.header('X-Service', 'auth-service');
  reply.header('X-Service-Version', '1.0.0');
  
  props.log.debug({ service: 'auth' }, '🔐 Auth Service handling request');
  
  return {
    serviceName: 'auth-service',
    serviceVersion: '1.0.0',
  };
};

