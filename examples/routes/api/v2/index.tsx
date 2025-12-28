/**
 * 🚀 API V2 INDEX ROUTE
 * 
 * GET /api/v2 - API v2 information
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log, apiVersion, apiKey }: HandlerProps) {
  log.debug('API v2 index accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'X-API-Version': apiVersion as string || 'v2',
      }} />
      <Body data={{
        success: true,
        version: apiVersion || 'v2',
        status: 'stable',
        authenticatedWith: apiKey ? (apiKey as string).substring(0, 8) + '...' : 'unknown',
        endpoints: [
          { method: 'GET', path: '/api/v2/data', description: 'Data endpoint with rich metadata' },
          { method: 'GET', path: '/api/v2/stats', description: 'Aggregated statistics' },
        ],
        features: [
          'Richer response format',
          'Better error messages',
          'Pagination support',
          'Extended metadata',
        ],
      }} />
    </Response>
  );
}
