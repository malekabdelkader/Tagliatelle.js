/**
 * 🍝 Redis Plugin - Caching & Session Storage
 * 
 * Usage:
 *   <Redis url="redis://localhost:6379" />
 * 
 * Requires:
 *   npm install @fastify/redis
 */

import { createPlugin } from 'tagliatelle';
import type { FastifyInstance } from 'fastify';

export interface RedisProps {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
}

export const Redis = createPlugin<RedisProps>(
  'Redis',
  async (fastify: FastifyInstance, props: RedisProps) => {
    try {
      const redis = await import('@fastify/redis');
      
      await fastify.register(redis.default, {
        url: props.url,
        host: props.host ?? 'localhost',
        port: props.port ?? 6379,
        password: props.password
      });
      
      console.log(`  🗄️ Redis → ${props.url ?? `${props.host ?? 'localhost'}:${props.port ?? 6379}`}`);
    } catch {
      console.log('  ⚠ Redis skipped (install @fastify/redis)');
    }
  }
);

export default Redis;

