/**
 * 🍝 Swagger Plugin Example
 * 
 * This shows how to create custom tags using createPlugin.
 * You can use this pattern for any Fastify plugin: GraphQL, WebSockets, Metrics, etc.
 * 
 * Usage:
 *   <Swagger title="My API" version="1.0.0" path="/docs" />
 * 
 * Requires:
 *   npm install @fastify/swagger @fastify/swagger-ui
 */

import { createPlugin } from 'tagliatelle';

// ═══════════════════════════════════════════════════════════════════════════
// 📚 SWAGGER PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SwaggerProps {
  /** API title shown in Swagger UI */
  title?: string;
  /** API version (e.g., "1.0.0") */
  version?: string;
  /** API description */
  description?: string;
  /** Route path for Swagger UI (default: "/docs") */
  path?: string;
  /** OpenAPI servers configuration */
  servers?: Array<{ url: string; description?: string }>;
  /** Contact information */
  contact?: { name?: string; email?: string; url?: string };
  /** License information */
  license?: { name: string; url?: string };
  /** External documentation link */
  externalDocs?: { url: string; description?: string };
  /** API tags for grouping endpoints */
  tags?: Array<{ name: string; description?: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 SWAGGER PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Swagger/OpenAPI documentation plugin
 * 
 * Creates an interactive API documentation UI at the specified path.
 */
export const Swagger = createPlugin<SwaggerProps>(
  'Swagger',
  async (fastify, props) => {
    // Dynamic imports so the packages are optional
    const swagger = await import('@fastify/swagger');
    const swaggerUi = await import('@fastify/swagger-ui');
    
    // Build OpenAPI info object
    const info: Record<string, unknown> = {
      title: props.title ?? 'API Documentation',
      version: props.version ?? '1.0.0',
      description: props.description ?? ''
    };
    
    if (props.contact) info.contact = props.contact;
    if (props.license) info.license = props.license;
    
    // Build OpenAPI config
    const openapi: Record<string, unknown> = { info };
    
    if (props.servers) openapi.servers = props.servers;
    if (props.externalDocs) openapi.externalDocs = props.externalDocs;
    if (props.tags) openapi.tags = props.tags;
    
    // Register Swagger for OpenAPI spec generation
    await fastify.register(swagger.default, { openapi });
    
    // Register Swagger UI for interactive docs
    await fastify.register(swaggerUi.default, {
      routePrefix: props.path ?? '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
        tryItOutEnabled: true
      },
      staticCSP: true,
      transformStaticCSP: (header: string) => header
    });
  }
);

export default Swagger;

