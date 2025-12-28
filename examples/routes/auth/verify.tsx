/**
 * 🔐 TOKEN VERIFICATION ROUTE
 * 
 * POST /auth/verify - Verify token validity
 * 
 * Supports optional API key authentication for internal services.
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

interface VerifyBody {
  token: string;
}

export async function POST({ log, body, db, headers }: HandlerProps<unknown, VerifyBody>) {
  const authDB = db as AuthDB;
  
  // Optional: Check for API key (for internal service calls)
  const apiKey = headers['x-api-key'] as string | undefined;
  
  if (apiKey) {
    const keyValidation = authDB.apiKeys.validate(apiKey);
    if (!keyValidation.valid) {
      log.warn('❌ Invalid API key');
      return (
        <Response>
          <Status code={403} />
          <Body data={{
            valid: false,
            error: 'INVALID_API_KEY',
            message: 'The provided API key is not valid',
          }} />
        </Response>
      );
    }
    
    log.debug({ service: keyValidation.serviceName }, '✅ API key authenticated');
  }
  
  // Validate token
  if (!body.token) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          valid: false,
          error: 'MISSING_TOKEN',
          message: 'Token is required in request body',
        }} />
      </Response>
    );
  }
  
  const validation = authDB.sessions.isTokenValid(body.token);
  
  if (!validation.valid) {
    log.debug({ reason: validation.reason }, '❌ Token validation failed');
    return (
      <Response>
        <Status code={200} />
        <Body data={{
          valid: false,
          reason: validation.reason,
        }} />
      </Response>
    );
  }
  
  log.debug({ userId: validation.user?.id }, '✅ Token valid');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        valid: true,
        user: validation.user ? {
          id: validation.user.id,
          name: validation.user.name,
          email: validation.user.email,
          role: validation.user.role,
          permissions: validation.user.permissions,
        } : undefined,
      }} />
    </Response>
  );
}
