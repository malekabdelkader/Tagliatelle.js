/**
 * 🍝 GraphQL Plugin - Query Language API
 * 
 * Usage:
 *   <GraphQL schema={schema} graphiql={true} />
 * 
 * Requires:
 *   npm install mercurius graphql
 */

import { createPlugin } from 'tagliatelle';
import type { FastifyInstance } from 'fastify';

export interface GraphQLProps {
  schema: unknown;
  graphiql?: boolean;
  path?: string;
  context?: (request: unknown) => unknown;
}

export const GraphQL = createPlugin<GraphQLProps>(
  'GraphQL',
  async (fastify: FastifyInstance, props: GraphQLProps) => {
    try {
      const mercurius = await import('mercurius');
      
      await fastify.register(mercurius.default, {
        schema: props.schema,
        graphiql: props.graphiql ?? process.env.NODE_ENV !== 'production',
        path: props.path ?? '/graphql',
        context: props.context
      });
      
      console.log(`  📊 GraphQL → ${props.path ?? '/graphql'}`);
    } catch {
      console.log('  ⚠ GraphQL skipped (install mercurius graphql)');
    }
  }
);

export default GraphQL;

