/**
 * 🌐 PLATFORM SERVICE - Index Route
 * 
 * GET / - Platform service info and aggregated dashboard
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../databases/platformDB.js';

export async function GET({ log, db, serviceName, aggregateData }: HandlerProps) {
  const platformDB = db as PlatformDB;
  const stats = platformDB.aggregatedStats();
  const health = platformDB.health.getAll();
  
  // Try to aggregate data from other services
  let aggregated = null;
  if (typeof aggregateData === 'function') {
    try {
      aggregated = await aggregateData();
    } catch (e) {
      log.warn('Could not aggregate data from other services');
    }
  }
  
  log.info('🌐 Platform dashboard accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 'X-Service': serviceName as string }} />
      <Body data={{
        success: true,
        service: 'Platform Service',
        description: 'Platform & Infrastructure Management',
        team: 'Platform & Infrastructure Team',
        version: '1.0.0',
        dashboard: {
          platformStats: stats,
          serviceHealth: health,
          aggregatedFromServices: aggregated,
        },
        endpoints: [
          { method: 'GET', path: '/', description: 'Platform dashboard' },
          { method: 'GET', path: '/health', description: 'System health check' },
          { method: 'GET', path: '/categories', description: 'List categories' },
          { method: 'GET', path: '/categories/:slug', description: 'Get category' },
          { method: 'GET', path: '/tags', description: 'List tags' },
          { method: 'GET', path: '/tags/popular', description: 'Popular tags' },
          { method: 'GET', path: '/search', description: 'Search across services' },
          { method: 'GET', path: '/analytics', description: 'Analytics dashboard' },
          { method: 'POST', path: '/analytics/track', description: 'Track event' },
        ],
        connectedServices: [
          { name: 'Auth Service', url: 'http://localhost:3001', status: 'connected' },
          { name: 'Blog Service', url: 'http://localhost:3002', status: 'connected' },
        ],
      }} />
    </Response>
  );
}
