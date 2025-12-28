/**
 * 👥 USERS INDEX ROUTE
 * 
 * GET /users - List all users (paginated)
 * POST /users - Create a new user
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';

interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export async function GET({ log, db, pagination }: HandlerProps) {
  const database = db as MockDB;
  // Handle case where pagination middleware isn't loaded
  const pag = (pagination as Pagination | undefined) || { page: 1, limit: 10, offset: 0 };
  const { page, limit, offset } = pag;
  
  const allUsers = database.users.findMany();
  const paginatedUsers = allUsers.slice(offset, offset + limit);
  
  log.info({ page, limit, total: allUsers.length }, '👥 Fetching users');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: allUsers.length,
          totalPages: Math.ceil(allUsers.length / limit),
          hasMore: offset + limit < allUsers.length,
        },
      }} />
    </Response>
  );
}

interface CreateUserBody {
  name: string;
  email: string;
  role?: string;
}

export async function POST({ log, body, db }: HandlerProps<unknown, CreateUserBody>) {
  const database = db as MockDB;
  
  // Validation
  if (!body.name || !body.email) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Name and email are required',
        }} />
      </Response>
    );
  }
  
  const newUser = database.users.create({
    name: body.name,
    email: body.email,
    role: body.role,
  });
  
  log.info({ userId: newUser.id }, '👤 Created new user');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'User created successfully',
        data: newUser,
      }} />
    </Response>
  );
}

