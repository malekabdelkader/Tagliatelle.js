/**
 * 🏷️ PUBLIC TAGS ROUTE
 * 
 * GET /public/tags - All available tags
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';

export async function GET({ log, db }: HandlerProps) {
  const database = db as MockDB;
  const tags = database.tags.findMany();
  
  log.debug({ tagCount: tags.length }, '🏷️ Tags requested');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: tags.map(t => ({
          ...t,
          style: { backgroundColor: t?.color, color: '#fff' },
        })),
      }} />
    </Response>
  );
}
