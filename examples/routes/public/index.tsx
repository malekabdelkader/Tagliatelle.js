/**
 * 🌍 PUBLIC INDEX ROUTE
 * 
 * GET /public - Public API info
 * 
 * No authentication required, high rate limits
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log }: HandlerProps) {
  log.debug('🌍 Public API accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'Cache-Control': 'public, max-age=60',
        'X-Public-API': 'true',
      }} />
      <Body data={{
        success: true,
        message: '🌍 Welcome to the Public API',
        note: 'This route has different config than authenticated routes',
        endpoints: [
          { method: 'GET', path: '/public/feed', description: 'Public content feed' },
          { method: 'GET', path: '/public/tags', description: 'All available tags' },
          { method: 'GET', path: '/public/search?q=term', description: 'Search public content' },
        ],
      }} />
    </Response>
  );
}
