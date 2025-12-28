/**
 * Type declarations for optional dependencies
 * These packages are optional and only needed if you use the corresponding plugin
 */

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

// WebSocket
declare module '@fastify/websocket' {
  import type { FastifyPluginCallback } from 'fastify';
  const websocket: FastifyPluginCallback<Record<string, unknown>>;
  export default websocket;
}

// Metrics
declare module 'fastify-metrics' {
  import type { FastifyPluginCallback } from 'fastify';
  const metrics: FastifyPluginCallback<{
    endpoint?: string;
    defaultMetrics?: {
      enabled?: boolean;
      labels?: Record<string, string>;
    };
    routeMetrics?: {
      enabled?: boolean;
    };
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
    namespace?: string;
  }>;
  export default redis;
}

