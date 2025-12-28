/**
 * 🔐 SESSIONS ROUTE
 * 
 * GET /auth/sessions - List active sessions for current user
 * DELETE /auth/sessions - Logout from current or all sessions
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

export async function GET({ log, db, request }: HandlerProps) {
  const authDB = db as AuthDB;
  
  // Validate token
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'NO_TOKEN',
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
          message: validation.reason || 'Invalid token',
        }} />
      </Response>
    );
  }
  
  const sessions = authDB.sessions.findByUserId(validation.user!.id);
  const activeSessions = sessions.filter(s => s.isActive);
  
  log.debug({ userId: validation.user!.id, sessionCount: activeSessions.length }, '📋 Sessions listed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        sessions: activeSessions.map(s => ({
          id: s.id,
          createdAt: new Date(s.createdAt).toISOString(),
          expiresAt: new Date(s.expiresAt).toISOString(),
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
        })),
        count: activeSessions.length,
      }} />
    </Response>
  );
}

export async function DELETE({ log, db, request, query }: HandlerProps) {
  const authDB = db as AuthDB;
  
  // Validate token
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={401} />
        <Body data={{
          success: false,
          error: 'NO_TOKEN',
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
          message: validation.reason || 'Invalid token',
        }} />
      </Response>
    );
  }
  
  const userId = validation.user!.id;
  
  if (query.all === 'true') {
    // Invalidate all sessions
    const count = authDB.sessions.invalidateAllForUser(userId);
    log.info({ userId, revokedCount: count }, '🚪 All sessions invalidated');
    
    return (
      <Response>
        <Status code={200} />
        <Body data={{
          success: true,
          message: `Logged out from all ${count} session(s)`,
          revokedCount: count,
        }} />
      </Response>
    );
  }
  
  // Invalidate current session only
  const session = authDB.sessions.findByToken(token);
  if (session) {
    authDB.sessions.invalidate(session.id);
  }
  
  log.info({ userId }, '🚪 Session invalidated (logout)');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Logged out successfully',
      }} />
    </Response>
  );
}
