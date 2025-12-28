/**
 * 📝 POSTS CONFIG
 * 
 * Configuration for all routes under /posts/*
 * 
 * Demonstrates:
 * - Using _config.tsx to apply settings to route groups
 * - Logger level customization per route group
 */

import { Logger } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="debug">
    {children}
  </Logger>
);
