/**
 * 🌐 PLATFORM SERVICE - Track Event Route
 * 
 * POST /analytics/track - Track an analytics event
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

interface TrackBody {
  event: string;
  data?: Record<string, unknown>;
  service?: string;
}

export async function POST({ log, db, body }: HandlerProps<unknown, TrackBody>) {
  const platformDB = db as PlatformDB;
  
  if (!body.event) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Event name is required',
        }} />
      </Response>
    );
  }
  
  platformDB.analytics.track(
    body.event,
    body.data || {},
    body.service || 'external'
  );
  
  log.debug({ event: body.event, service: body.service }, '📊 Event tracked');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Event tracked',
        event: body.event,
      }} />
    </Response>
  );
}

