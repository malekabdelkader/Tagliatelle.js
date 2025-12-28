/**
 * 🔐 AUTH SERVICE - Logout Route
 * 
 * POST /auth/logout - Invalidate current session
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

export async function POST({ log, db, headers }: HandlerProps) {
  const authDB = db as AuthDB;
  
  // Get token from Authorization header
  const authHeader = headers.authorization as string | undefined;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'MISSING_TOKEN',
          message: 'Authorization header with Bearer token is required',
        }} />
      </Response>
    );
  }
  
  const token = authHeader.substring(7);
  const session = authDB.sessions.findByToken(token);
  
  if (!session) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'SESSION_NOT_FOUND',
          message: 'No active session found for this token',
        }} />
      </Response>
    );
  }
  
  // Invalidate the session
  authDB.sessions.invalidate(session.id);
  
  log.info({ sessionId: session.id, userId: session.userId }, '✅ User logged out');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Logged out successfully',
        invalidatedSession: session.id,
      }} />
    </Response>
  );
}

