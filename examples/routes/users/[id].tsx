/**
 * 👤 SINGLE USER ROUTE
 * 
 * GET /users/:id - Get user by ID
 * PUT /users/:id - Update user
 * DELETE /users/:id - Delete user
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import type { MockDB } from '../../plugins/mockDB.js';

interface UserParams {
  id: string;
}

export async function GET({ params, log, db }: HandlerProps<UserParams>) {
  const database = db as MockDB;
  const user = database.users.findById(params.id);
  
  if (!user) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `User with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  log.info({ userId: user.id }, '👤 Fetched user');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        data: user,
      }} />
    </Response>
  );
}

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: string;
}

export async function PUT({ params, body, log, db }: HandlerProps<UserParams, UpdateUserBody>) {
  const database = db as MockDB;
  const updated = database.users.update(params.id, body);
  
  if (!updated) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `User with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  log.info({ userId: params.id }, '✏️ Updated user');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'User updated',
        data: updated,
      }} />
    </Response>
  );
}

export async function DELETE({ params, log, db }: HandlerProps<UserParams>) {
  const database = db as MockDB;
  const deleted = database.users.delete(params.id);
  
  if (!deleted) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{
          success: false,
          error: 'NOT_FOUND',
          message: `User with ID '${params.id}' not found`,
        }} />
      </Response>
    );
  }
  
  log.info({ userId: params.id }, '🗑️ Deleted user');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: `User '${params.id}' deleted`,
      }} />
    </Response>
  );
}

