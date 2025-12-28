/**
 * 🏠 ROOT INDEX ROUTE
 * 
 * GET /
 * Returns API information and available routes
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log, db, requestId }: HandlerProps) {
  log.info('Root endpoint accessed');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 
        'X-Powered-By': 'Tagliatelle.js',
        'X-Request-ID': requestId as string || 'unknown'
      }} />
      <Body data={{
        success: true,
        message: '🍝 Welcome to the ULTIMATE Tagliatelle.js API!',
        version: '1.0.0-beta.5',
        framework: 'Tagliatelle.js - JSX for the Backend',
        dbConnected: !!db,
        routes: {
          '/': 'API Info (you are here)',
          '/health': 'Health check',
          '/users': 'User management (CRUD)',
          '/posts': 'Blog posts with nested comments',
          '/posts/[id]': 'Dynamic post routes',
          '/posts/[id]/comments': 'Nested comments',
          '/admin': 'Admin-only routes (auth required)',
          '/admin/stats': 'System statistics',
          '/categories': 'Category listing',
          '/categories/[slug]': 'Dynamic slug routes',
          '/public': 'Public routes with different rate limits',
          '/api/v1': 'Versioned API group',
          '/api/v2': 'Second API version with different config',
        },
        documentation: 'https://github.com/yourusername/tagliatelle',
      }} />
    </Response>
  );
}

