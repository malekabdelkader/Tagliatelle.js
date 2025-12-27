/**
 * 🍝 Comments Sub-Route Config
 * 
 * Tests deep nesting: routes → posts → comments
 * This config overrides rateLimit (stricter for comments)
 * but inherits middleware from parent posts config
 * 
 * Note: No Group needed - directory structure already creates /posts/comments path
 */

import { RateLimiter } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <RateLimiter max={10} timeWindow="1 minute">
    {children}
  </RateLimiter>
);

