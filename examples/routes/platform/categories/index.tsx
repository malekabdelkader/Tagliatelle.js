/**
 * 🌐 PLATFORM SERVICE - Categories Route
 * 
 * GET /categories - List all categories
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { PlatformDB } from '../../../databases/platformDB.js';

export async function GET({ log, db }: HandlerProps) {
  const platformDB = db as PlatformDB;
  const categories = platformDB.categories.findMany();
  
  log.debug({ count: categories.length }, '📁 Categories listed');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: categories.map(c => ({
          ...c,
          url: `/categories/${c.slug}`,
          _postsUrl: `http://localhost:3002/posts?category=${c.id}`,
        })),
        total: categories.length,
      }} />
    </Response>
  );
}

