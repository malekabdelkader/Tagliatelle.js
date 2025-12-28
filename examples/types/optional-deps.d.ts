/**
 * Type declarations for optional plugin dependencies
 * These packages are optional - install if you want to use the corresponding plugin
 */

// Swagger
declare module '@fastify/swagger' {
  import type { FastifyPluginCallback } from 'fastify';
  const swagger: FastifyPluginCallback<{
    openapi?: {
      info?: { title?: string; version?: string; description?: string };
      tags?: Array<{ name: string; description?: string }>;
    };
  }>;
  export default swagger;
}

declare module '@fastify/swagger-ui' {
  import type { FastifyPluginCallback } from 'fastify';
  const swaggerUi: FastifyPluginCallback<{
    routePrefix?: string;
    uiConfig?: Record<string, unknown>;
  }>;
  export default swaggerUi;
}

// WebSocket
declare module '@fastify/websocket' {
  import type { FastifyPluginCallback } from 'fastify';
  const websocket: FastifyPluginCallback<Record<string, unknown>>;
  export default websocket;
}

// GraphQL
declare module 'mercurius' {
  import type { FastifyPluginCallback } from 'fastify';
  const mercurius: FastifyPluginCallback<{
    schema: unknown;
    graphiql?: boolean;
    path?: string;
    context?: (request: unknown) => unknown;
  }>;
  export default mercurius;
}

// Metrics
declare module 'fastify-metrics' {
  import type { FastifyPluginCallback } from 'fastify';
  const metrics: FastifyPluginCallback<{
    endpoint?: string;
    defaultMetrics?: { enabled?: boolean };
    routeMetrics?: { enabled?: boolean };
  }>;
  export default metrics;
}

// Redis
declare module '@fastify/redis' {
  import type { FastifyPluginCallback } from 'fastify';
  const redis: FastifyPluginCallback<{
    url?: string;
    host?: string;
    port?: number;
    password?: string;
  }>;
  export default redis;
}
