// @ts-nocheck
/**
 * 🌐 PLATFORM SERVICE - Health Check Route
 * 
 * GET /health - System-wide health check
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../databases/platformDB.js';

export async function GET({ log, db, fetchAuthService, fetchBlogService }: HandlerProps) {
  const platformDB = db as PlatformDB;
  
  // Check other services
  const serviceChecks = await Promise.all([
    // Check Auth Service
    (async () => {
      if (typeof fetchAuthService !== 'function') return { service: 'auth', status: 'unknown' };
      const start = Date.now();
      const result = await fetchAuthService<{ success: boolean }>('/auth/stats');
      const responseTime = Date.now() - start;
      platformDB.health.update('auth', result.success ? 'healthy' : 'unhealthy', responseTime);
      return { service: 'auth', status: result.success ? 'healthy' : 'unhealthy', responseTime };
    })(),
    // Check Blog Service
    (async () => {
      if (typeof fetchBlogService !== 'function') return { service: 'blog', status: 'unknown' };
      const start = Date.now();
      const result = await fetchBlogService<{ success: boolean }>('/stats');
      const responseTime = Date.now() - start;
      platformDB.health.update('blog', result.success ? 'healthy' : 'unhealthy', responseTime);
      return { service: 'blog', status: result.success ? 'healthy' : 'unhealthy', responseTime };
    })(),
  ]);
  
  const allHealthy = platformDB.health.isSystemHealthy();
  const allServices = platformDB.health.getAll();
  
  log.info({ allHealthy, services: serviceChecks.length }, allHealthy ? '✅ System healthy' : '⚠️ System issues');
  
  return (
    <Response>
      <Status code={allHealthy ? 200 : 503} />
      <Headers headers={{
        'X-Health-Status': allHealthy ? 'healthy' : 'degraded',
        'Cache-Control': 'no-cache',
      }} />
      <Body data={{
        success: true,
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: allServices,
        liveChecks: serviceChecks,
        platform: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          },
          nodeVersion: process.version,
        },
      }} />
    </Response>
  );
}

