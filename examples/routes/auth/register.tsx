/**
 * 🔐 AUTH SERVICE - Register Route
 * 
 * POST /auth/register - Create new user account
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps, RouteSchema } from 'tagliatelle';
import type { AuthDB } from '../../databases/authDB.js';

// OpenAPI schema for Swagger
export const POST_SCHEMA: RouteSchema = {
  tags: ['auth'],
  summary: 'Register',
  description: 'Create a new user account',
};

interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export async function POST({ log, body, db }: HandlerProps<unknown, RegisterBody>) {
  const authDB = db as AuthDB;
  
  // Validate input
  if (!body.email || !body.password || !body.name) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required',
        }} />
      </Response>
    );
  }
  
  // Check if email already exists
  const existingUser = authDB.users.findByEmail(body.email);
  if (existingUser) {
    return (
      <Response>
        <Status code={409} />
        <Body data={{
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'An account with this email already exists',
        }} />
      </Response>
    );
  }
  
  // Validate password strength (simplified)
  if (body.password.length < 6) {
    return (
      <Response>
        <Status code={400} />
        <Body data={{
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters',
        }} />
      </Response>
    );
  }
  
  // Create user (in production, hash password with bcrypt)
  const user = authDB.users.create({
    email: body.email,
    name: body.name,
    passwordHash: `hashed_${body.password}`,
    role: 'user',
    permissions: ['read'],
    mfaEnabled: false,
  });
  
  log.info({ userId: user.id, email: user.email }, '✅ New user registered');
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Registration successful',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        nextStep: 'Use POST /auth/login to sign in',
      }} />
    </Response>
  );
}
