/**
 * 🍝 Health Check Route
 * 
 * GET /health
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log }: HandlerProps) {
  log.info('Health check');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        status: 'Al Dente 🍝',
        timestamp: new Date().toISOString()
      }} />
    </Response>
  );
}
