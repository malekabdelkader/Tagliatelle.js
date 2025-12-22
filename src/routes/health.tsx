/**
 * 🍝 Health Check Route
 * 
 * GET /health
 */

import { h, Response, Status, Body } from '../tagliatelle.js';
import type { HandlerProps } from '../types.js';

void h; // JSX factory

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

