/**
 * 👥 ADMIN USER MANAGEMENT
 * 
 * GET /admin/users - List all users with admin details
 * DELETE /admin/users?id=X - Delete a user (admin only)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';
import type { AuthUser } from '../../middleware/auth.js';

export async function GET({ log, db, user }: HandlerProps) {
  const database = db as MockDB;
  const currentUser = user as AuthUser | undefined;
  
  // Fallback auth check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin access required',
        }} />
      </Response>
    );
  }
  
  const users = database.users.findMany();
  
  log.info({ admin: currentUser.name, userCount: users.length }, '👥 Admin viewing users');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: users.map(u => ({
          ...u,
          _actions: ['edit', 'delete', 'impersonate'],
        })),
        total: users.length,
      }} />
    </Response>
  );
}

interface DeleteQuery {
  id?: string;
}

export async function DELETE({ log, query, db, user }: HandlerProps<unknown, unknown, DeleteQuery>) {
  const database = db as MockDB;
  const currentUser = user as AuthUser | undefined;
  const userId = query.id;
  
  // Fallback auth check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Admin access required',
        }} />
      </Response>
    );
  }
  
  if (!userId) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'MISSING_PARAMETER',
          message: 'User ID is required. Use: DELETE /admin/users?id=X',
        }} />
      </Response>
    );
  }
  
  // Can't delete yourself
  if (userId === currentUser.id) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'SELF_DELETE_FORBIDDEN',
          message: "You can't delete your own account from admin panel",
        }} />
      </Response>
    );
  }
  
  const deleted = database.users.delete(userId);
  
  if (!deleted) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `User with ID '${userId}' not found`,
        }} />
      </Response>
    );
  }
  
  log.warn({ admin: currentUser.name, deletedUserId: userId }, '🗑️ Admin deleted user');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: `User '${userId}' has been deleted`,
        deletedBy: currentUser.name,
      }} />
    </Response>
  );
}
