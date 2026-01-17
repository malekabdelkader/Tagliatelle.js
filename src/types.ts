/**
 * 🍝 <Tag>liatelle.js - Type Definitions
 */

import type { FastifyRequest, FastifyReply, FastifySchema, FastifyInstance } from 'fastify';

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
  PLUGIN: Symbol('Plugin'),
  // Router internal components
  ROUTE_FILE: Symbol('RouteFile'),
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

export type ComponentType = (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES];

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
  TQuery = Record<string, string>,
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
  TResponse = unknown,
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

/**
 * Scoped middleware - captures the FULL config at definition time
 * This ensures visual hierarchy is respected for ALL context:
 *
 * <DB provider={db1}>
 *   <Logger level="debug">
 *     <Middleware use={mw1} />  ← mw1 sees db1, logLevel="debug"
 *   </Logger>
 *   <DB provider={db2}>
 *     <Logger level="info">
 *       <Middleware use={mw2} />  ← mw2 sees db2, logLevel="info"
 *     </Logger>
 *   </DB>
 * </DB>
 */
export interface ScopedMiddleware {
  fn: MiddlewareFunction;
  /** Full config snapshot captured at the point where this middleware was defined */
  capturedConfig: RouteConfig;
}

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

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 UNIFIED ROUTE CONFIG (shared between main app and file-based routes)
// ═══════════════════════════════════════════════════════════════════════════

export interface RouteConfig {
  // Config properties (inherited & overridable)
  /**
   * Scoped middlewares - each middleware captures its config at definition time
   * This ensures visual hierarchy is respected in the JSX tree
   */
  middleware: ScopedMiddleware[];
  prefix: string;
  rateLimit?: { max: number; timeWindow: string };
  cors?: CorsConfig;
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';

  // Services (shared, can be overridden by _config with DB)
  db?: unknown;

  // Internal
  [key: string]: unknown;
}

/**
 * Keys that should never be copied (prototype pollution prevention)
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Clone a RouteConfig and override with new values
 * Includes prototype pollution prevention for defense in depth
 */
export function cloneConfig(
  config: RouteConfig,
  overrides: Partial<RouteConfig> = {}
): RouteConfig {
  // Filter out dangerous keys from overrides (defense in depth)
  const safeOverrides: Partial<RouteConfig> = {};
  for (const key of Object.keys(overrides)) {
    if (!DANGEROUS_KEYS.includes(key)) {
      safeOverrides[key] = overrides[key];
    }
  }

  return {
    ...config,
    // Deep copy middleware array to prevent mutation
    middleware: safeOverrides.middleware ? [...safeOverrides.middleware] : [...config.middleware],
    ...safeOverrides,
  };
}

/**
 * Create a scoped middleware that captures the FULL current config
 * This creates a snapshot of all context at definition time
 */
export function createScopedMiddleware(
  fn: MiddlewareFunction,
  config: RouteConfig
): ScopedMiddleware {
  // Deep clone the config to capture a snapshot
  // We exclude the middleware array to avoid circular references
  const { middleware, ...configSnapshot } = config;

  return {
    fn,
    capturedConfig: {
      ...configSnapshot,
      middleware: [], // Don't include middleware array (would be circular)
      prefix: config.prefix,
    } as RouteConfig,
  };
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
  TResponse = unknown,
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
  children?: TagliatelleNode;
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
// 🔌 PLUGIN SYSTEM (Custom Tags)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Plugin handler function - receives Fastify instance and props
 * Use this to create custom tags like <Swagger>, <GraphQL>, <Metrics>, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PluginHandler<TProps = any> = (
  fastify: FastifyInstance,
  props: TProps,
  config: RouteConfig
) => void | Promise<void>;

/**
 * Plugin component props - includes the handler and user props
 */
export interface PluginProps {
  /** The plugin handler function */
  __handler: PluginHandler;
  /** Plugin name for logging */
  __name: string;
  /** User-provided props */
  [key: string]: unknown;
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
