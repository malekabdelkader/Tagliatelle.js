/**
 * 🍝 <Tag>liatelle.js - Type Definitions
 */

import type { FastifyRequest, FastifyReply, FastifySchema } from 'fastify';

// ═══════════════════════════════════════════════════════════════════════════
// 🍝 CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TagliatelleElement {
  type: string | Function;
  props: Record<string, unknown>;
  children: TagliatelleNode[];
}

export type TagliatelleNode = 
  | TagliatelleElement 
  | TagliatelleComponent 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | TagliatelleNode[];

// ═══════════════════════════════════════════════════════════════════════════
// 🥣 COMPONENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const COMPONENT_TYPES = {
  // Server components
  SERVER: Symbol('Server'),
  GET: Symbol('Get'),
  POST: Symbol('Post'),
  PUT: Symbol('Put'),
  DELETE: Symbol('Delete'),
  PATCH: Symbol('Patch'),
  MIDDLEWARE: Symbol('Middleware'),
  DB: Symbol('DB'),
  LOGGER: Symbol('Logger'),
  GROUP: Symbol('Group'),
  CORS: Symbol('Cors'),
  RATE_LIMITER: Symbol('RateLimiter'),
  ROUTES: Symbol('Routes'),
  // Middleware components
  AUGMENT: Symbol('Augment'),
  HALT: Symbol('Halt'),
  // Response components
  RESPONSE: Symbol('Response'),
  STATUS: Symbol('Status'),
  BODY: Symbol('Body'),
  HEADERS: Symbol('Headers'),
  ERR: Symbol('Err'),
} as const;

export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

export interface TagliatelleComponent {
  __tagliatelle: ComponentType;
  children?: TagliatelleNode[];
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🍽️ HANDLER TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface HandlerProps<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string>
> {
  params: TParams;
  query: TQuery;
  body: TBody;
  headers: Record<string, string | string[] | undefined>;
  request: FastifyRequest;
  reply: FastifyReply;
  db: unknown;
  log: FastifyRequest['log'];
  user?: unknown;
  [key: string]: unknown;
}

export type Handler<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string>,
  TResponse = unknown
> = (props: HandlerProps<TParams, TBody, TQuery>) => TResponse | Promise<TResponse>;

// ═══════════════════════════════════════════════════════════════════════════
// 🌶️ MIDDLEWARE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MiddlewareResult = 
  | void 
  | false 
  | Record<string, unknown> 
  | TagliatelleComponent 
  | TagliatelleElement
  | Promise<void | false | Record<string, unknown> | TagliatelleComponent | TagliatelleElement>;

export type MiddlewareFunction = (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => MiddlewareResult;

// ═══════════════════════════════════════════════════════════════════════════
// 📦 COMPONENT PROP TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CorsConfig {
  origin?: string | string[] | boolean | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface ServerProps {
  port?: number;
  host?: string;
  cors?: boolean | CorsConfig;
  children?: TagliatelleNode;
}

export interface RouteProps<
  TParams = Record<string, string>,
  TBody = unknown,
  TQuery = Record<string, string>,
  TResponse = unknown
> {
  path: string;
  handler: Handler<TParams, TBody, TQuery, TResponse>;
  schema?: FastifySchema;
}

export interface MiddlewareProps {
  use: MiddlewareFunction;
  children?: TagliatelleNode;
}

export interface DBProps {
  provider: () => Promise<unknown>;
  children?: TagliatelleNode;
}

export interface LoggerProps {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

export interface GroupProps {
  prefix?: string;
  children?: TagliatelleNode;
}

export interface CorsProps {
  origin?: string | string[] | boolean;
  methods?: string[];
  children?: TagliatelleNode;
}

export interface RateLimiterProps {
  max?: number;
  timeWindow?: string;
  children?: TagliatelleNode;
}

export interface RoutesProps {
  dir: string;
  prefix?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 RESPONSE COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

export interface ResponseProps {
  children?: TagliatelleNode;
}

export interface StatusProps {
  code: number;
}

export interface BodyProps<T = unknown> {
  data: T;
}

export interface HeadersProps {
  headers: Record<string, string>;
}

export interface ErrProps {
  code?: number;
  message: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌶️ MIDDLEWARE COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

export interface AugmentProps {
  [key: string]: unknown;
}

export interface HaltProps {
  code?: number;
  message?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 CONTEXT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ContextValues {
  db?: unknown;
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 JSX INTRINSIC ELEMENTS (for TypeScript JSX support)
// ═══════════════════════════════════════════════════════════════════════════

declare global {
  namespace JSX {
    // Components can return TagliatelleComponent or TagliatelleElement
    type Element = TagliatelleComponent | TagliatelleElement;
    
    interface ElementChildrenAttribute {
      children: {};
    }
    
    // Allow component functions to return our types
    interface ElementClass {
      render(): Element;
    }
    
    interface IntrinsicAttributes {
      key?: string | number;
    }
  }
}

