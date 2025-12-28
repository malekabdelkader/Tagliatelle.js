/**
 * 🍝 Redis Plugin Example
 * 
 * This shows how to add Redis caching to Tagliatelle.
 * 
 * Usage:
 *   <Redis url="redis://localhost:6379" />
 * 
 * Requires:
 *   npm install @fastify/redis
 */

import { createPlugin } from 'tagliatelle';

// ═══════════════════════════════════════════════════════════════════════════
// 🗄️ REDIS PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RedisProps {
  /** Redis connection URL */
  url?: string;
  /** Redis host */
  host?: string;
  /** Redis port */
  port?: number;
  /** Redis password */
  password?: string;
  /** Connection namespace */
  namespace?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 REDIS PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Redis plugin for caching and session storage
 * 
 * After registering, access Redis via `fastify.redis`:
 *   await fastify.redis.set('key', 'value');
 *   const value = await fastify.redis.get('key');
 */
export const Redis = createPlugin<RedisProps>(
  'Redis',
  async (fastify, props) => {
    // Dynamic import - package is optional
    const redis = await import('@fastify/redis');
    
    await fastify.register(redis.default, {
      url: props.url,
      host: props.host ?? 'localhost',
      port: props.port ?? 6379,
      password: props.password,
      namespace: props.namespace
    });
  }
);

export default Redis;
