/**
 * 🍝 ROOT CONFIG
 * 
 * This config applies to ALL routes.
 * Demonstrates:
 * - Logger level inheritance (debug for development)
 * - Request ID middleware that runs for every route
 */

import { Logger, Middleware } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';
import { requestIdMiddleware } from '../middleware/validation.js';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="debug">
    <Middleware use={requestIdMiddleware}>
      {children}
    </Middleware>
  </Logger>
);

