/**
 * 🌐 PLATFORM SERVICE - Analytics Dashboard Route
 * 
 * GET /analytics - View analytics summary
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

export async function GET({ log, db }: HandlerProps) {
  const platformDB = db as PlatformDB;
  
  const summary = platformDB.analytics.getSummary();
  const recentEvents = platformDB.analytics.getRecent(10);
  
  log.debug('📊 Analytics dashboard viewed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        summary,
        recentEvents,
        timestamp: new Date().toISOString(),
      }} />
    </Response>
  );
}

