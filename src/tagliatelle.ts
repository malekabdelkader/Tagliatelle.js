/**
 * 🍝 <Tag>liatelle.js - The Declarative Backend Framework
 * 
 * This is the secret sauce that makes JSX work for backend routing.
 * It transforms your beautiful component tree into a blazing-fast Fastify server.
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, HTTPMethods } from 'fastify';
import { safeMerge, sanitizeErrorMessage, withTimeout } from './security.js';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 CONSOLE COLORS
// ═══════════════════════════════════════════════════════════════════════════

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
};

// Method colors
const methodColor = (method: string): string => {
  switch (method) {
    case 'GET': return c.brightGreen;
    case 'POST': return c.brightYellow;
    case 'PUT': return c.brightBlue;
    case 'PATCH': return c.brightCyan;
    case 'DELETE': return c.brightRed;
    default: return c.white;
  }
};

// Status code color
const statusColor = (code: number): string => {
  if (code < 200) return c.gray;
  if (code < 300) return c.green;
  if (code < 400) return c.cyan;
  if (code < 500) return c.yellow;
  return c.red;
};
import {
  TagliatelleElement,
  TagliatelleNode,
  TagliatelleComponent,
  COMPONENT_TYPES,
  Handler,
  MiddlewareFunction,
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
  HandlerProps,
  ResponseProps,
  StatusProps,
  BodyProps,
  HeadersProps,
  ErrProps,
  RouteConfig,
  cloneConfig,
} from './types.js';
import { registerRoutes } from './router.js';

// Re-export types
export * from './types.js';

// ═══════════════════════════════════════════════════════════════════════════
// 🍝 JSX FACTORY (Classic Runtime)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * JSX factory function - creates virtual elements from JSX
 * This is called by TypeScript when it transforms JSX
 */
export function h(
  type: string | Function,
  props: Record<string, unknown> | null,
  ...children: TagliatelleNode[]
): TagliatelleElement {
  return {
    type,
    props: props || {},
    children: children.flat().filter(Boolean)
  };
}

/**
 * Fragment support for grouping elements without a wrapper
 */
export function Fragment({ children }: { children?: TagliatelleNode[] }): TagliatelleNode[] {
  return children || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// 🥣 CONTEXT SYSTEM (Dependency Injection)
// ═══════════════════════════════════════════════════════════════════════════

export class Context {
  private values: Map<string, unknown> = new Map();

  set<T>(key: string, value: T): void {
    this.values.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  clone(): Context {
    const newContext = new Context();
    this.values.forEach((value, key) => {
      newContext.set(key, value);
    });
    return newContext;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🍽️ BUILT-IN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export function Server({ port, host, children }: ServerProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.SERVER,
    port: port ?? 3000,
    host: host ?? '0.0.0.0',
    children: children ? [children].flat() : []
  };
}

export function Get<TParams, TBody, TQuery, TResponse>(
  props: RouteProps<TParams, TBody, TQuery, TResponse>
): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.GET,
    method: 'GET',
    path: props.path,
    handler: props.handler,
    schema: props.schema
  };
}

export function Post<TParams, TBody, TQuery, TResponse>(
  props: RouteProps<TParams, TBody, TQuery, TResponse>
): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.POST,
    method: 'POST',
    path: props.path,
    handler: props.handler,
    schema: props.schema
  };
}

export function Put<TParams, TBody, TQuery, TResponse>(
  props: RouteProps<TParams, TBody, TQuery, TResponse>
): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.PUT,
    method: 'PUT',
    path: props.path,
    handler: props.handler,
    schema: props.schema
  };
}

export function Delete<TParams, TBody, TQuery, TResponse>(
  props: RouteProps<TParams, TBody, TQuery, TResponse>
): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.DELETE,
    method: 'DELETE',
    path: props.path,
    handler: props.handler,
    schema: props.schema
  };
}

export function Patch<TParams, TBody, TQuery, TResponse>(
  props: RouteProps<TParams, TBody, TQuery, TResponse>
): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.PATCH,
    method: 'PATCH',
    path: props.path,
    handler: props.handler,
    schema: props.schema
  };
}

export function Middleware({ use, children }: MiddlewareProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.MIDDLEWARE,
    use,
    children: children ? [children].flat() : []
  };
}

export function DB({ provider, children }: DBProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.DB,
    provider,
    children: children ? [children].flat() : []
  };
}

export function Logger({ level, children }: LoggerProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.LOGGER,
    level: level ?? 'info',
    children: children ? [children].flat() : []
  };
}

export function Group({ prefix, children }: GroupProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.GROUP,
    prefix: prefix ?? '',
    children: children ? [children].flat() : []
  };
}

export function Cors({ origin, methods, children }: CorsProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.CORS,
    origin: origin ?? '*',
    methods: methods ?? ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    children: children ? [children].flat() : []
  };
}

export function RateLimiter({ max, timeWindow, children }: RateLimiterProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.RATE_LIMITER,
    max: max ?? 100,
    timeWindow: timeWindow ?? '1 minute',
    children: children ? [children].flat() : []
  };
}

/**
 * File-based routing - Next.js style!
 * Usage: <Routes dir="./routes" prefix="/api" />
 */
export function Routes({ dir, prefix }: RoutesProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.ROUTES,
    dir,
    prefix: prefix ?? ''
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 PLUGIN SYSTEM (Custom Tags)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a custom plugin component (Custom Tag)
 * 
 * This allows you to create reusable JSX components that hook into Fastify.
 * Perfect for integrating Swagger, GraphQL, WebSockets, Metrics, etc.
 * 
 * @example
 * ```tsx
 * // Create a custom Swagger plugin
 * import { createPlugin } from 'tagliatelle';
 * import swagger from '@fastify/swagger';
 * import swaggerUi from '@fastify/swagger-ui';
 * 
 * interface SwaggerProps {
 *   title: string;
 *   version: string;
 *   path?: string;
 * }
 * 
 * export const Swagger = createPlugin<SwaggerProps>(
 *   'Swagger',
 *   async (fastify, props) => {
 *     await fastify.register(swagger, {
 *       openapi: { info: { title: props.title, version: props.version } }
 *     });
 *     await fastify.register(swaggerUi, {
 *       routePrefix: props.path ?? '/docs'
 *     });
 *   }
 * );
 * 
 * // Use it!
 * <Server>
 *   <Swagger title="My API" version="1.0.0" />
 *   <Routes dir="./routes" />
 * </Server>
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPlugin<TProps extends Record<string, any> = Record<string, any>>(
  name: string,
  handler: PluginHandler<TProps>
): (props: TProps) => TagliatelleComponent {
  return (props: TProps): TagliatelleComponent => {
    return {
      __tagliatelle: COMPONENT_TYPES.PLUGIN,
      __handler: handler,
      __name: name,
      ...props
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 RESPONSE COMPONENTS (for JSX handlers)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Response wrapper - contains status, headers, and body
 * Usage: <Response><Status code={201} /><Body data={{...}} /></Response>
 */
export function Response({ children }: ResponseProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.RESPONSE,
    children: children ? [children].flat() : []
  };
}

/**
 * Set HTTP status code
 * Usage: <Status code={201} />
 */
export function Status({ code }: StatusProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.STATUS,
    code
  };
}

/**
 * Set response body (JSON)
 * Usage: <Body data={{ success: true, data: [...] }} />
 */
export function Body<T>({ data }: BodyProps<T>): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.BODY,
    data
  };
}

/**
 * Set response headers
 * Usage: <Headers headers={{ 'X-Custom': 'value' }} />
 */
export function Headers({ headers }: HeadersProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.HEADERS,
    headers
  };
}

/**
 * Return an error response
 * Usage: <Err code={404} message="Not found" />
 */
export function Err({ code, message, details }: ErrProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.ERR,
    code: code ?? 500,
    message,
    details
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌶️ MIDDLEWARE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

import type { AugmentProps, HaltProps } from './types.js';

/**
 * Augment handler props with additional data (e.g., user from auth)
 * Usage: <Augment user={{ id: 1, name: "John" }} />
 */
export function Augment(props: AugmentProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.AUGMENT,
    data: props
  };
}

/**
 * Halt the middleware chain (optionally with error)
 * Usage: <Halt /> or <Halt code={401} message="Unauthorized" />
 */
export function Halt({ code, message }: HaltProps): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.HALT,
    code,
    message
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 RESPONSE RESOLVER
// ═══════════════════════════════════════════════════════════════════════════

interface ResolvedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  isError: boolean;
}

/**
 * Resolves a JSX response tree into a response object
 */
function resolveResponse(element: TagliatelleNode): ResolvedResponse {
  const response: ResolvedResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    isError: false
  };

  function processNode(node: TagliatelleNode): void {
    if (!node) return;

    // Handle arrays
    if (Array.isArray(node)) {
      node.forEach(processNode);
      return;
    }

    // Resolve if it's a JSX element
    let resolved: TagliatelleNode | TagliatelleComponent = node;
    if (typeof node === 'object' && node !== null && 'type' in node && typeof (node as TagliatelleElement).type === 'function') {
      const el = node as TagliatelleElement;
      const props = { ...el.props, children: el.children };
      const componentFn = el.type as (props: Record<string, unknown>) => TagliatelleComponent;
      resolved = componentFn(props);
    }

    // Process TagliatelleComponent
    if (typeof resolved === 'object' && '__tagliatelle' in resolved) {
      const component = resolved as TagliatelleComponent;
      
      switch (component.__tagliatelle) {
        case COMPONENT_TYPES.RESPONSE:
          // Process children
          if (component.children) {
            (component.children as TagliatelleNode[]).forEach(processNode);
          }
          break;
          
        case COMPONENT_TYPES.STATUS:
          response.statusCode = component.code as number;
          break;
          
        case COMPONENT_TYPES.BODY:
          response.body = component.data;
          break;
          
        case COMPONENT_TYPES.HEADERS:
          Object.assign(response.headers, component.headers);
          break;
          
        case COMPONENT_TYPES.ERR:
          response.isError = true;
          response.statusCode = component.code as number;
          const errBody: Record<string, unknown> = { error: component.message };
          if (component.details) {
            errBody.details = component.details;
          }
          response.body = errBody;
          break;
      }
    }
  }

  processNode(element);
  return response;
}

/**
 * Check if a value is a JSX response element
 */
function isJSXResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  
  // Check if it's a TagliatelleComponent with response type
  if ('__tagliatelle' in value) {
    const component = value as TagliatelleComponent;
    return [
      COMPONENT_TYPES.RESPONSE,
      COMPONENT_TYPES.STATUS,
      COMPONENT_TYPES.BODY,
      COMPONENT_TYPES.HEADERS,
      COMPONENT_TYPES.ERR
    ].includes(component.__tagliatelle);
  }
  
  // Check if it's a JSX element that resolves to a response
  if ('type' in value && typeof (value as TagliatelleElement).type === 'function') {
    return true; // We'll resolve and check later
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 THE RENDERER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resolves a virtual element into its component output
 * Recursively resolves until we get an actual Tagliatelle component
 */
function resolveElement(element: TagliatelleNode): TagliatelleComponent | TagliatelleNode[] | null {
  if (!element) return null;
  
  // If it's already a resolved component object
  if (typeof element === 'object' && '__tagliatelle' in element) {
    return element as TagliatelleComponent;
  }
  
  // If it's an array, return as-is
  if (Array.isArray(element)) {
    return element;
  }
  
  // If it's a JSX element with a function type (component)
  if (typeof element === 'object' && 'type' in element && typeof element.type === 'function') {
    const el = element as TagliatelleElement;
    const props = { ...el.props, children: el.children };
    const componentFn = el.type as (props: Record<string, unknown>) => TagliatelleNode;
    const result = componentFn(props);
    
    // Recursively resolve if the result is another element
    const resolved = resolveElement(result);
    
    // If the resolved result is a tagliatelle component and we had children in the JSX,
    // pass them through
    if (resolved && !Array.isArray(resolved) && '__tagliatelle' in resolved && el.children.length > 0) {
      resolved.children = el.children;
    }
    
    return resolved;
  }
  
  return null;
}

/**
 * Wraps a user handler to work with Fastify's request/reply system
 */
function wrapHandler(
  handler: Handler,
  middlewares: MiddlewareFunction[],
  config: RouteConfig
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Use pretty logger from config
    const prettyLog = (config.prettyLog as {
      info: (msg: string) => void;
      warn: (msg: string) => void;
      error: (msg: string) => void;
      debug: (msg: string) => void;
    }) || {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
    
    // Build props from request
    const props: HandlerProps = {
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string>,
      body: request.body,
      headers: request.headers as Record<string, string | string[] | undefined>,
      request,
      reply,
      db: config.db,
      log: prettyLog as unknown as FastifyRequest['log'],
    };

    // Middleware timeout (30 seconds max)
    const MIDDLEWARE_TIMEOUT = 30000;
    
    // Execute middleware chain
    for (const mw of middlewares) {
      try {
        // Wrap middleware in timeout to prevent hanging
        const result = await withTimeout(
          async () => mw(props, request, reply),
          MIDDLEWARE_TIMEOUT,
          'Middleware timeout'
        );
        
        if (result === false) {
          return; // Middleware halted the chain
        }
        // Middleware can augment props - use safeMerge to prevent prototype pollution
        if (result && typeof result === 'object') {
          safeMerge(props, result);
        }
      } catch (error) {
        const err = error as Error & { statusCode?: number };
        // Sanitize error message to prevent info leakage
        reply.status(err.statusCode ?? 500).send({
          error: sanitizeErrorMessage(err, 'Middleware error')
        });
        return;
      }
    }

    try {
      // Execute the actual handler
      const result = await handler(props);
      
      // If handler already sent response, don't send again
      if (reply.sent) return;
      
      // Check if result is a JSX response
      if (result !== undefined) {
        if (isJSXResponse(result)) {
          // Resolve JSX response tree
          const response = resolveResponse(result as TagliatelleNode);
          
          // Set headers
          for (const [key, value] of Object.entries(response.headers)) {
            reply.header(key, value);
          }
          
          // Send response with status
          reply.status(response.statusCode).send(response.body);
        } else {
          // Plain object response
          reply.send(result);
        }
      }
    } catch (error) {
      if (!reply.sent) {
        const err = error as Error & { statusCode?: number };
        // Sanitize error to prevent stack trace and info leakage
        reply.status(err.statusCode ?? 500).send({
          error: sanitizeErrorMessage(err, 'Internal server error')
        });
      }
    }
  };
}

/**
 * Processes the virtual DOM tree and configures Fastify
 * Uses unified RouteConfig that gets cloned and overridden
 */
async function processTree(
  element: TagliatelleNode,
  fastify: FastifyInstance,
  config: RouteConfig
): Promise<void> {
  const resolved = resolveElement(element);
  if (!resolved) return;

  // Handle arrays (fragments)
  if (Array.isArray(resolved)) {
    for (const child of resolved) {
      await processTree(child, fastify, config);
    }
    return;
  }

  const component = resolved as TagliatelleComponent;
  const type = component.__tagliatelle;

  switch (type) {
    case COMPONENT_TYPES.LOGGER:
      // Clone config with new logLevel
      fastify.log.level = component.level as string;
      const loggerConfig = cloneConfig(config, { 
        logLevel: component.level as RouteConfig['logLevel'] 
      });
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, loggerConfig);
        }
      }
      break;

    case COMPONENT_TYPES.DB:
      // Clone config with new db
      let dbConfig = config;
      if (component.provider) {
        try {
          const provider = component.provider as () => Promise<unknown>;
          const db = await provider();
          dbConfig = cloneConfig(config, { db });
          console.log(`  ${c.green}✓${c.reset} Database connected`);
        } catch (error) {
          const err = error as Error;
          console.error(`  ${c.red}✗${c.reset} Database failed: ${err.message}`);
          throw error;
        }
      }
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, dbConfig);
        }
      }
      break;

    case COMPONENT_TYPES.CORS:
      // Configure CORS at Fastify level
      try {
        const cors = await import('@fastify/cors');
        await fastify.register(cors.default, {
          origin: component.origin as string | string[] | boolean,
          methods: component.methods as string[]
        });
        console.log(`  ${c.green}✓${c.reset} CORS enabled`);
      } catch {
        console.warn(`  ${c.yellow}⚠${c.reset} CORS skipped (install @fastify/cors)`);
      }
      // Clone config with new cors for children
      const corsConfig = cloneConfig(config, { 
        cors: { 
          origin: component.origin as string | string[] | boolean, 
          methods: component.methods as string[] 
        } 
      });
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, corsConfig);
        }
      }
      break;

    case COMPONENT_TYPES.RATE_LIMITER:
      // Clone config with new rateLimit
      const rateLimitConfig = cloneConfig(config, { 
        rateLimit: { 
          max: component.max as number, 
          timeWindow: component.timeWindow as string 
        } 
      });
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, rateLimitConfig);
        }
      }
      break;

    case COMPONENT_TYPES.MIDDLEWARE:
      // Clone config with added middleware
      const middlewareConfig = cloneConfig(config, { 
        middleware: [...config.middleware, component.use as MiddlewareFunction] 
      });
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, middlewareConfig);
        }
      }
      break;

    case COMPONENT_TYPES.GROUP:
      // Clone config with concatenated prefix
      const groupConfig = cloneConfig(config, { 
        prefix: config.prefix + (component.prefix as string ?? '') 
      });
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, groupConfig);
        }
      }
      break;

    case COMPONENT_TYPES.ROUTES:
      // File-based routing - pass the unified config
      const routesDir = component.dir as string;
      const routesPrefix = config.prefix + (component.prefix as string ?? '');
      await registerRoutes(fastify, {
        routesDir,
        prefix: routesPrefix
      }, config);
      break;

    case COMPONENT_TYPES.PLUGIN:
      // Custom plugin (user-defined tag)
      const pluginHandler = component.__handler as PluginHandler;
      const pluginName = component.__name as string;
      
      // Extract user props (exclude internal props)
      const pluginProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(component)) {
        if (!key.startsWith('__') && key !== 'children') {
          pluginProps[key] = value;
        }
      }
      
      try {
        await pluginHandler(fastify, pluginProps, config);
        console.log(`  ${c.green}✓${c.reset} ${pluginName} ${c.dim}loaded${c.reset}`);
      } catch (err) {
        const error = err as Error;
        console.error(`  ${c.red}✗${c.reset} ${pluginName} failed: ${error.message}`);
      }
      
      // Process children if any
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, config);
        }
      }
      break;

    case COMPONENT_TYPES.GET:
    case COMPONENT_TYPES.POST:
    case COMPONENT_TYPES.PUT:
    case COMPONENT_TYPES.DELETE:
    case COMPONENT_TYPES.PATCH:
      // Register route with Fastify
      const fullPath = config.prefix + (component.path as string);
      const method = component.method as HTTPMethods;
      const routeHandler = wrapHandler(component.handler as Handler, config.middleware, config);
      
      if (component.schema) {
        fastify.route({
          method,
          url: fullPath,
          handler: routeHandler,
          schema: component.schema as Record<string, unknown>
        });
      } else {
        fastify.route({
          method,
          url: fullPath,
          handler: routeHandler
        });
      }
      const m = component.method as string;
      console.log(`  ${c.dim}├${c.reset} ${methodColor(m)}${m.padEnd(6)}${c.reset} ${c.white}${fullPath}${c.reset}`);
      break;

    default:
      // Unknown component, try to process children
      if (component.children) {
        for (const child of component.children as TagliatelleNode[]) {
          await processTree(child, fastify, config);
        }
      }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CLI ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════════

interface CLIOptions {
  port?: number;
  host?: string;
  open?: boolean;
  help?: boolean;
}

/**
 * Parse CLI arguments
 * Supports: -p/--port, -H/--host, -o/--open, -h/--help
 */
function parseCliArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Help: -h, --help
    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }
    
    // Open browser: -o, --open
    if (arg === '-o' || arg === '--open') {
      options.open = true;
      continue;
    }
    
    // Port: --port=3001, -p=3001, --port 3001, -p 3001
    if (arg.startsWith('--port=') || arg.startsWith('-p=')) {
      const value = parseInt(arg.split('=')[1], 10);
      if (!isNaN(value) && value > 0 && value <= 65535) {
        options.port = value;
      }
      continue;
    }
    if ((arg === '--port' || arg === '-p') && args[i + 1] && !args[i + 1].startsWith('-')) {
      const value = parseInt(args[i + 1], 10);
      if (!isNaN(value) && value > 0 && value <= 65535) {
        options.port = value;
        i++; // Skip next arg
      }
      continue;
    }
    
    // Host: --host=localhost, -H=localhost, --host localhost, -H localhost
    if (arg.startsWith('--host=') || arg.startsWith('-H=')) {
      options.host = arg.split('=')[1];
      continue;
    }
    if ((arg === '--host' || arg === '-H') && args[i + 1] && !args[i + 1].startsWith('-')) {
      options.host = args[i + 1];
      i++; // Skip next arg
      continue;
    }
  }
  
  return options;
}

/**
 * Print help message and exit
 */
function printHelp(): void {
  console.log(`
${c.yellow}  🍝 <Tag>liatelle.js${c.reset} - The Declarative Backend Framework

${c.bold}Usage:${c.reset}
  npx tsx your-app.tsx [options]
  npm run dev -- [options]

${c.bold}Options:${c.reset}
  ${c.cyan}-p, --port <number>${c.reset}    Port to listen on (default: 3000)
                          Can also use ${c.dim}PORT${c.reset} env variable
  ${c.cyan}-H, --host <string>${c.reset}    Host to bind to (default: 0.0.0.0)
                          Can also use ${c.dim}HOST${c.reset} env variable
  ${c.cyan}-o, --open${c.reset}             Open browser after server starts
  ${c.cyan}-h, --help${c.reset}             Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}# Run on custom port${c.reset}
  npm run dev -- -p 8080

  ${c.dim}# Bind to localhost only${c.reset}
  npm run dev -- -H localhost

  ${c.dim}# Using environment variables${c.reset}
  PORT=8080 HOST=localhost npm run dev

  ${c.dim}# Open browser automatically${c.reset}
  npm run dev -- --open
`);
  process.exit(0);
}

/**
 * Open URL in default browser (cross-platform)
 */
async function openBrowser(url: string): Promise<void> {
  const { exec } = await import('node:child_process');
  const { platform } = await import('node:os');
  
  const command = platform() === 'darwin' 
    ? `open "${url}"` 
    : platform() === 'win32' 
      ? `start "${url}"` 
      : `xdg-open "${url}"`;
  
  exec(command, (error) => {
    if (error) {
      console.log(`  ${c.dim}Could not open browser automatically${c.reset}`);
    }
  });
}

/**
 * Get effective port with priority: CLI args > ENV > default
 */
function getEffectivePort(cliOptions: CLIOptions, defaultPort: number): number {
  // Priority 1: CLI arguments
  if (cliOptions.port !== undefined) {
    return cliOptions.port;
  }
  
  // Priority 2: Environment variable
  const envPort = process.env.PORT;
  if (envPort) {
    const parsed = parseInt(envPort, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 65535) {
      return parsed;
    }
  }
  
  // Priority 3: Default from code
  return defaultPort;
}

/**
 * Get effective host with priority: CLI args > ENV > default
 */
function getEffectiveHost(cliOptions: CLIOptions, defaultHost: string): string {
  // Priority 1: CLI arguments
  if (cliOptions.host !== undefined) {
    return cliOptions.host;
  }
  
  // Priority 2: Environment variable
  const envHost = process.env.HOST;
  if (envHost) {
    return envHost;
  }
  
  // Priority 3: Default from code
  return defaultHost;
}

/**
 * The main render function - turns your JSX tree into a running server
 */
export async function render(element: TagliatelleNode): Promise<FastifyInstance> {
  // Parse CLI arguments first
  const cliOptions = parseCliArgs();
  
  // Handle --help flag
  if (cliOptions.help) {
    printHelp();
  }
  
  const resolved = resolveElement(element);
  
  if (!resolved || Array.isArray(resolved) || resolved.__tagliatelle !== COMPONENT_TYPES.SERVER) {
    throw new Error('<Tag>liatelle: Root element must be a <Server> component!');
  }

  const serverComponent = resolved as TagliatelleComponent;

  console.log(`
${c.yellow}  ╔══════════════════════════════════════════════════════════════╗
  ║  ${c.reset}${c.bold}🍝 <Tag>liatelle.js${c.reset}${c.yellow}                                         ║
  ╚══════════════════════════════════════════════════════════════╝${c.reset}
  `);

  // Create Fastify instance with disabled logger (we do our own)
  const fastify = Fastify({
    logger: false, // Completely disable Fastify's logger
    disableRequestLogging: true // We do our own request logging
  });
  
  // Create our own pretty logger for handlers to use
  const prettyLog = {
    info: (msg: string) => console.log(`  ${c.dim}ℹ${c.reset} ${msg}`),
    warn: (msg: string) => console.log(`  ${c.yellow}⚠${c.reset} ${msg}`),
    error: (msg: string) => console.log(`  ${c.red}✗${c.reset} ${msg}`),
    debug: (msg: string) => console.log(`  ${c.dim}◦${c.reset} ${c.dim}${msg}${c.reset}`),
  };
  
  // Create the initial unified RouteConfig
  const initialConfig: RouteConfig = {
    middleware: [],
    prefix: '',
    prettyLog
  };

  // Custom request logging hook
  fastify.addHook('onResponse', (request, reply, done) => {
    const method = request.method;
    const url = request.url;
    const status = reply.statusCode;
    const time = reply.elapsedTime?.toFixed(0) || '0';
    
    const methodStr = `${methodColor(method)}${method.padEnd(6)}${c.reset}`;
    const urlStr = `${c.white}${url}${c.reset}`;
    const statusStr = `${statusColor(status)}${status}${c.reset}`;
    const timeStr = `${c.dim}${time}ms${c.reset}`;
    
    console.log(`  ${methodStr} ${urlStr} ${c.dim}→${c.reset} ${statusStr} ${timeStr}`);
    done();
  });

  // Process the tree with unified config
  if (serverComponent.children) {
    for (const child of serverComponent.children as TagliatelleNode[]) {
      await processTree(child, fastify, initialConfig);
    }
  }

  // Start the server (with CLI/ENV override support)
  const defaultPort = serverComponent.port as number;
  const defaultHost = serverComponent.host as string;
  const port = getEffectivePort(cliOptions, defaultPort);
  const host = getEffectiveHost(cliOptions, defaultHost);

  try {
    await fastify.listen({ port, host });
    
    // Build the URL (use localhost for display if bound to 0.0.0.0)
    const displayHost = host === '0.0.0.0' ? 'localhost' : host;
    const serverUrl = `http://${displayHost}:${port}`;
    
    console.log(`  ${c.green}✓${c.reset} ${c.bold}Server ready${c.reset} ${c.dim}→${c.reset} ${c.cyan}${serverUrl}${c.reset}
`);
    
    // Open browser if --open flag is set
    if (cliOptions.open) {
      await openBrowser(serverUrl);
    }
  } catch (err) {
    console.error(`  ${c.red}✗${c.reset} ${c.bold}Failed to start:${c.reset}`, err);
    process.exit(1);
  }

  return fastify;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎁 DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const Tagliatelle = {
  h,
  Fragment,
  render
};

export default Tagliatelle;
