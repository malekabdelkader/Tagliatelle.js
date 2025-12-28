/**
 * 💬 COMMENTS CONFIG
 * 
 * Demonstrates:
 * - DEEP nested config (3 levels: routes > posts > [id] > comments)
 * - Even more restrictive rate limiting for comment creation
 * - Logger override to trace level for debugging
 */

import { RateLimiter, Logger } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="trace">
    <RateLimiter max={20} timeWindow="1 minute">
      {children}
    </RateLimiter>
  </Logger>
);

