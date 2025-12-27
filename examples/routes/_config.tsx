/**
 * 🍝 Root Routes Config
 * 
 * This config applies to ALL routes passed as children.
 * Config wraps children - if no children, config won't apply!
 */

import { Logger } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="info">
    {children}
  </Logger>
);
