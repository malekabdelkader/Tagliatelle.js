/**
 * 🌐 PLATFORM SERVICE - Tags Route
 * 
 * GET /tags - List all tags
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

export async function GET({ log, db }: HandlerProps) {
  const platformDB = db as PlatformDB;
  const tags = platformDB.tags.findMany();
  
  log.debug({ count: tags.length }, '🏷️ Tags listed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: tags.map(t => ({
          ...t,
          style: { backgroundColor: t.color, color: '#fff' },
        })),
        total: tags.length,
      }} />
    </Response>
  );
}

