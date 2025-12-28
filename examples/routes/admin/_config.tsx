/**
 * 🔐 ADMIN CONFIG
 * 
 * Demonstrates:
 * - Strict authentication middleware
 * - Role-based access control
 * - Different logger level for admin routes
 */

import { Logger, Middleware } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';
import { authMiddleware, requireRole } from '../../middleware/auth.js';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="info">
    {/* Auth middleware runs first - must have valid token */}
    <Middleware use={authMiddleware}>
      {/* Then check for admin role */}
      <Middleware use={requireRole('admin')}>
        {children}
      </Middleware>
    </Middleware>
  </Logger>
);

