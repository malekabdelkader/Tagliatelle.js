/**
 * 🔐 AUTH SERVICE - Stats Route
 * 
 * GET /auth/stats - Service statistics (public)
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

export async function GET({ log, db }: HandlerProps) {
  const authDB = db as AuthDB;
  const stats = authDB.stats();
  
  log.debug('📊 Auth stats requested');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        service: 'auth-service',
        stats,
        timestamp: new Date().toISOString(),
      }} />
    </Response>
  );
}

