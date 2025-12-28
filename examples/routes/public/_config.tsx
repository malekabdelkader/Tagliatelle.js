/**
 * 🌍 PUBLIC CONFIG
 * 
 * Demonstrates:
 * - HIGHER rate limit for public/anonymous endpoints
 * - No auth middleware
 * - Aggressive caching hints
 */

import { RateLimiter, Cors } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  // Override with more permissive CORS for public APIs
  <Cors origin={true} methods={['GET', 'HEAD', 'OPTIONS']}>
    {/* Higher rate limit for public read-only endpoints */}
    <RateLimiter max={200} timeWindow="1 minute">
      {children}
    </RateLimiter>
  </Cors>
);

