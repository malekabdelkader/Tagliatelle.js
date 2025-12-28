/**
 * 🍝 GraphQL Plugin Example
 * 
 * This shows how to integrate GraphQL with Tagliatelle using createPlugin.
 * 
 * Usage:
 *   <GraphQL schema={schema} graphiql={true} />
 * 
 * Requires:
 *   npm install mercurius graphql
 */

import { createPlugin } from 'tagliatelle';

// ═══════════════════════════════════════════════════════════════════════════
// 📊 GRAPHQL PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GraphQLProps {
  /** GraphQL schema (from 'graphql' package) */
  schema: unknown;
  /** Enable GraphiQL IDE (default: true in dev) */
  graphiql?: boolean;
  /** GraphQL endpoint path (default: "/graphql") */
  path?: string;
  /** Context function */
  context?: (request: unknown) => unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 GRAPHQL PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GraphQL plugin using Mercurius (Fastify's GraphQL adapter)
 */
export const GraphQL = createPlugin<GraphQLProps>(
  'GraphQL',
  async (fastify, props) => {
    // Dynamic import - package is optional
    const mercurius = await import('mercurius');
    
    await fastify.register(mercurius.default, {
      schema: props.schema,
      graphiql: props.graphiql ?? process.env.NODE_ENV !== 'production',
      path: props.path ?? '/graphql',
      context: props.context
    });
  }
);

export default GraphQL;
