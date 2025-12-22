/**
 * 🍝 Root Route
 * 
 * GET /
 */

import { h, Response, Status, Body } from '../tagliatelle.js';
import type { HandlerProps } from '../types.js';

void h; // JSX factory

export async function GET({ log }: HandlerProps) {
  log.info('API info request');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        name: 'Tagliatelle API',
        version: '1.0.0',
        description: 'File-based routing with JSX responses! 🍝',
        endpoints: {
          health: 'GET /health',
          posts: {
            list: 'GET /posts',
            get: 'GET /posts/:id',
            create: 'POST /posts',
            update: 'PUT /posts/:id',
            delete: 'DELETE /posts/:id'
          }
        }
      }} />
    </Response>
  );
}

