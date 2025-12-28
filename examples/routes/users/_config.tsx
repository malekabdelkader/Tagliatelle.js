/**
 * 👥 USERS CONFIG
 * 
 * Demonstrates:
 * - Pagination middleware for list endpoints
 * - JSON content-type validation for mutations
 */

import { Middleware } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';
import { paginationMiddleware, requireJsonMiddleware } from '../../middleware/validation.js';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Middleware use={paginationMiddleware}>
    <Middleware use={requireJsonMiddleware}>
      {children}
    </Middleware>
  </Middleware>
);

