/**
 * 🔢 API V1 INDEX ROUTE
 * 
 * GET /api/v1 - API v1 information
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log, apiVersion }: HandlerProps) {
  log.debug('API v1 index accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'X-API-Version': apiVersion as string || 'v1',
      }} />
      <Body data={{
        success: true,
        version: apiVersion || 'v1',
        status: 'deprecated',
        deprecationNotice: {
          message: 'API v1 is deprecated and will be sunset on 2025-06-01',
          migrateGuide: 'https://docs.example.com/api/migration-v1-to-v2',
          newEndpoint: '/api/v2',
        },
        endpoints: [
          { method: 'GET', path: '/api/v1/data', description: 'Legacy data endpoint' },
        ],
      }} />
    </Response>
  );
}
