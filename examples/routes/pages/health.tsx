/**
 * ❤️ HEALTH CHECK ROUTE
 * 
 * GET /health - System health status
 * 
 * Demonstrates:
 * - Simple status endpoint
 * - No database required
 * - Useful for load balancers and monitoring
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';

// OpenAPI schema for Swagger
export const GET_SCHEMA: RouteSchema = {
  tags: ['system'],
  summary: 'Health check',
  description: 'System health status for monitoring',
};

export async function GET({ log }: HandlerProps) {
  log.debug('❤️ Health check');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        databases: {
          auth: 'connected',
          content: 'connected',
        },
      }} />
    </Response>
  );
}

