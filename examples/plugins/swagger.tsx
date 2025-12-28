/**
 * 🍝 Swagger Plugin - OpenAPI Documentation
 * 
 * Usage:
 *   <Swagger title="My API" version="1.0.0" path="/docs" />
 * 
 * Requires:
 *   npm install @fastify/swagger @fastify/swagger-ui
 */

import { createPlugin } from 'tagliatelle';
import type { FastifyInstance } from 'fastify';

export interface SwaggerProps {
  title?: string;
  version?: string;
  description?: string;
  path?: string;
  tags?: Array<{ name: string; description?: string }>;
}

export const Swagger = createPlugin<SwaggerProps>(
  'Swagger',
  async (fastify: FastifyInstance, props: SwaggerProps) => {
    try {
      const swagger = await import('@fastify/swagger');
      const swaggerUi = await import('@fastify/swagger-ui');
      
      await fastify.register(swagger.default, {
        openapi: {
          info: {
            title: props.title ?? 'API Documentation',
            version: props.version ?? '1.0.0',
            description: props.description ?? ''
          },
          tags: props.tags
        }
      });
      
      await fastify.register(swaggerUi.default, {
        routePrefix: props.path ?? '/docs',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: true,
          tryItOutEnabled: true
        }
      });
      
      console.log(`  📚 Swagger UI → ${props.path ?? '/docs'}`);
    } catch {
      console.log('  ⚠ Swagger skipped (install @fastify/swagger @fastify/swagger-ui)');
    }
  }
);

export default Swagger;

