/**
 * 🚀 API V2 DATA ROUTE
 * 
 * GET /api/v2/data - Modern data endpoint
 * 
 * Returns data in the new v2 format with richer metadata
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../../plugins/mockDB.js';

interface DataQuery {
  page?: string;
  limit?: string;
  sortBy?: 'views' | 'date' | 'title';
  order?: 'asc' | 'desc';
}

export async function GET({ log, query, db, apiVersion }: HandlerProps<unknown, unknown, DataQuery>) {
  const database = db as MockDB;
  
  // Parse pagination
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));
  const sortBy = query.sortBy || 'date';
  const order = query.order || 'desc';
  
  let posts = database.posts.findMany();
  
  // Sort
  posts.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'views':
        comparison = (a?.views || 0) - (b?.views || 0);
        break;
      case 'title':
        comparison = (a?.title || '').localeCompare(b?.title || '');
        break;
      case 'date':
      default:
        comparison = (a?.createdAt || '').localeCompare(b?.createdAt || '');
    }
    return order === 'desc' ? -comparison : comparison;
  });
  
  // Paginate
  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedPosts = posts.slice(offset, offset + limit);
  
  log.debug({ page, limit, sortBy, order }, 'API v2 data requested');
  
  // V2 format: Richer, nested structure with metadata
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{
        'X-API-Version': apiVersion as string || 'v2',
        'X-Total-Count': String(total),
        'X-Page': String(page),
        'X-Per-Page': String(limit),
      }} />
      <Body data={{
        success: true,
        data: paginatedPosts.map(p => ({
          id: p?.id,
          attributes: {
            title: p?.title,
            content: p?.content,
            createdAt: p?.createdAt,
          },
          metrics: {
            views: p?.views,
          },
          relationships: {
            author: { id: p?.authorId },
          },
          links: {
            self: `/api/v2/data/${p?.id}`,
            comments: `/posts/${p?.id}/comments`,
          },
        })),
        meta: {
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          sorting: {
            field: sortBy,
            order,
          },
          apiVersion: apiVersion || 'v2',
        },
        links: {
          self: `/api/v2/data?page=${page}&limit=${limit}`,
          first: `/api/v2/data?page=1&limit=${limit}`,
          last: `/api/v2/data?page=${totalPages}&limit=${limit}`,
          next: page < totalPages ? `/api/v2/data?page=${page + 1}&limit=${limit}` : null,
          prev: page > 1 ? `/api/v2/data?page=${page - 1}&limit=${limit}` : null,
        },
      }} />
    </Response>
  );
}
