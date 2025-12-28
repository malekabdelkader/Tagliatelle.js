/**
 * 🔐 TOKEN VALIDATION ROUTE
 * 
 * POST /auth/validate - Validate a token and get user info
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

interface ValidateBody {
  token: string;
}

export async function POST({ log, body, db }: HandlerProps<unknown, ValidateBody>) {
  const authDB = db as AuthDB;
  
  if (!body.token) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'MISSING_TOKEN',
          message: 'Token to validate is required',
        }} />
      </Response>
    );
  }
  
  // Validate the token
  const validation = authDB.sessions.isTokenValid(body.token);
  
  if (!validation.valid) {
    log.debug({ reason: validation.reason }, '❌ Token validation failed');
    return (
      <Response>
        <Status code={200} />
        <Body data={{
          valid: false,
          reason: validation.reason,
          user: null,
        }} />
      </Response>
    );
  }
  
  const user = validation.user!;
  
  log.debug({ userId: user.id }, '✅ Token validated');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      }} />
    </Response>
  );
}
