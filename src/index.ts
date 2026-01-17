/**
 * Tagliatelle.js - The Declarative Backend Framework
 *
 * Build APIs with JSX on top of Fastify.
 *
 * @example
 * ```tsx
 * import { render, Server, Get, Response, Status, Body } from 'tagliatelle';
 *
 * const hello = async () => (
 *   <Response>
 *     <Status code={200} />
 *     <Body>{{ message: 'Hello!' }}</Body>
 *   </Response>
 * );
 *
 * const App = () => (
 *   <Server port={3000}>
 *     <Get path="/hello" handler={hello} />
 *   </Server>
 * );
 *
 * render(<App />);
 * ```
 *
 * @packageDocumentation
 */

export {
  // JSX Factory
  h,
  Fragment,
  
  // Core
  render,
  Context,
  
  // Server Components
  Server,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Middleware,
  DB,
  Logger,
  Group,
  Cors,
  RateLimiter,
  Routes,
  
  // Plugin System (Custom Tags)
  createPlugin,
  
  // Response Components
  Response,
  Status,
  Body,
  Headers,
  Err,
  
  // Middleware Components
  Augment,
  Halt,
  
  // Types
  COMPONENT_TYPES,
} from './tagliatelle.js';

export type {
  TagliatelleElement,
  TagliatelleNode,
  TagliatelleComponent,
  ComponentType,
  Handler,
  HandlerProps,
  MiddlewareFunction,
  MiddlewareResult,
  ServerProps,
  RouteProps,
  MiddlewareProps,
  DBProps,
  LoggerProps,
  GroupProps,
  CorsProps,
  RateLimiterProps,
  RoutesProps,
  PluginHandler,
  PluginProps,
  ResponseProps,
  StatusProps,
  BodyProps,
  HeadersProps,
  ErrProps,
  AugmentProps,
  HaltProps,
} from './types.js';

// Router exports
export type { ParsedConfig, RouteModule, RouteSchema, HTTPMethod } from './router.js';

// Security exports
export {
  sanitizeErrorMessage,
  safeErrorResponse,
  safeMerge,
  isNonEmptyString,
  isSafeString,
  isPositiveInt,
  isValidId,
  sanitizeForLog,
  withTimeout,
  AuthFailureTracker,
  authFailureTracker,
} from './security.js';

// Default export
export { default } from './tagliatelle.js';
