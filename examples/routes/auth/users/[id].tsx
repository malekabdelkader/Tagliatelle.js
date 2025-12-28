/**
 * 🔐 AUTH SERVICE - Single User Route
 * 
 * GET /auth/users/:id - Get user details
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../../databases/authDB.js';

interface UserParams {
  id: string;
}

export async function GET({ params, log, db, headers }: HandlerProps<UserParams>) {
  const authDB = db as AuthDB;
  
  // Check authentication
  const authHeader = headers.authorization as string | undefined;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        }} />
      </Response>
    );
  }
  
  const token = authHeader.substring(7);
  const validation = authDB.sessions.isTokenValid(token);
  
  if (!validation.valid) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'INVALID_TOKEN',
          message: validation.reason,
        }} />
      </Response>
    );
  }
  
  // Users can only view their own profile unless they're admin
  const requestingUser = validation.user!;
  const isOwnProfile = requestingUser.id === params.id;
  const isAdmin = requestingUser.role === 'admin';
  
  if (!isOwnProfile && !isAdmin) {
    return (
      <Response>
        <Status code={403} />
        <Body data={{
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only view your own profile',
        }} />
      </Response>
    );
  }
  
  const user = authDB.users.findById(params.id);
  
  if (!user) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `User with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  log.info({ requestedBy: requestingUser.id, viewedUser: user.id }, '👤 User profile viewed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          mfaEnabled: user.mfaEnabled,
          // Only show sessions for own profile
          activeSessions: isOwnProfile 
            ? authDB.sessions.findByUserId(user.id).filter(s => s.isActive).length 
            : undefined,
        },
      }} />
    </Response>
  );
}

