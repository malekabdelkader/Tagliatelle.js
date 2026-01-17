/**
 * 🍝 <Tag>liatelle.js - File-Based Router
 *
 * file routing for your API.
 *
 * routes/
 * ├── _config.tsx          → JSX Config for all routes
 * ├── health.tsx           → GET /health
 * ├── posts/
 * │   ├── _config.tsx      → JSX Config for /posts/* (overrides parent)
 * │   ├── index.tsx        → GET/POST /posts
 * │   └── [id].tsx         → GET/PUT/DELETE /posts/:id
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type {
  Handler,
  MiddlewareFunction,
  ScopedMiddleware,
  HandlerProps,
  CorsConfig,
  RouteConfig,
} from './types.js';
import { COMPONENT_TYPES, cloneConfig, createScopedMiddleware } from './types.js';
import type { TagliatelleComponent, TagliatelleNode, TagliatelleElement } from './types.js';
import { safeMerge, sanitizeErrorMessage, withTimeout } from './security.js';
import { Fragment } from './jsx-runtime.js';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 CONSOLE COLORS
// ═══════════════════════════════════════════════════════════════════════════

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  red: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightCyan: '\x1b[96m',
};

const methodColor = (method: string): string => {
  switch (method) {
    case 'GET':
      return c.brightGreen;
    case 'POST':
      return c.brightYellow;
    case 'PUT':
      return c.brightBlue;
    case 'PATCH':
      return c.brightCyan;
    case 'DELETE':
      return c.red;
    default:
      return c.white;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface ParsedConfig {
  middleware: ScopedMiddleware[];
  cors?: boolean | CorsConfig;
  rateLimit?: { max: number; timeWindow: string };
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
  prefix?: string;
}

export interface RouteSchema {
  body?: Record<string, unknown>;
  querystring?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  response?: Record<number | string, Record<string, unknown>>;
  description?: string;
  summary?: string;
  tags?: string[];
  deprecated?: boolean;
  hide?: boolean;
  security?: Array<Record<string, string[]>>;
}

export interface RouteModule {
  GET?: Handler;
  POST?: Handler;
  PUT?: Handler;
  DELETE?: Handler;
  PATCH?: Handler;
  HEAD?: Handler;
  OPTIONS?: Handler;
  middleware?: MiddlewareFunction | MiddlewareFunction[];
  /** OpenAPI schema for GET handler */
  GET_SCHEMA?: RouteSchema;
  /** OpenAPI schema for POST handler */
  POST_SCHEMA?: RouteSchema;
  /** OpenAPI schema for PUT handler */
  PUT_SCHEMA?: RouteSchema;
  /** OpenAPI schema for DELETE handler */
  DELETE_SCHEMA?: RouteSchema;
  /** OpenAPI schema for PATCH handler */
  PATCH_SCHEMA?: RouteSchema;
  /** OpenAPI schema for HEAD handler */
  HEAD_SCHEMA?: RouteSchema;
  /** OpenAPI schema for OPTIONS handler */
  OPTIONS_SCHEMA?: RouteSchema;
}

export interface RouteInfo {
  filePath: string;
  urlPath: string;
  methods: HTTPMethod[];
  config: ParsedConfig;
}

export interface RouterOptions {
  routesDir: string;
  prefix?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 PATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function filePathToUrlPath(filePath: string, routesDir: string): string {
  let relativePath = path.relative(routesDir, filePath);
  relativePath = relativePath.replace(/\.(tsx?|jsx?)$/, '');
  relativePath = relativePath.replace(/\/index$/, '').replace(/^index$/, '');
  relativePath = relativePath.replace(/\[\.\.\.(\w+)\]/g, '*');
  relativePath = relativePath.replace(/\[(\w+)\]/g, ':$1');
  const urlPath = '/' + relativePath;
  return urlPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function isRouteFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return (
    /\.(tsx?|jsx?)$/.test(filePath) &&
    !filePath.includes('.test.') &&
    !filePath.includes('.spec.') &&
    !fileName.startsWith('_')
  );
}

function isConfigFile(fileName: string): boolean {
  return /^_config\.(tsx?|jsx?)$/.test(fileName);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 JSX TREE PROCESSOR (for file-based routing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Process JSX config tree and register routes
 * Uses a single unified RouteConfig that gets cloned and overridden
 */
async function processConfigTree(
  node: TagliatelleNode,
  fastify: FastifyInstance,
  config: RouteConfig,
  basePrefix: string
): Promise<void> {
  if (!node) return;

  // Handle arrays (fragments)
  if (Array.isArray(node)) {
    for (const child of node) {
      await processConfigTree(child, fastify, config, basePrefix);
    }
    return;
  }

  // Check if this is a JSX element
  if (typeof node === 'object' && node !== null && 'type' in node) {
    const el = node as TagliatelleElement;

    // Handle Fragment - just process children
    const elType = el.type as unknown;
    if (
      elType === Fragment ||
      (typeof elType === 'symbol' && String(elType).includes('fragment'))
    ) {
      if (el.children) {
        for (const child of el.children) {
          await processConfigTree(child as TagliatelleNode, fastify, config, basePrefix);
        }
      }
      return;
    }

    // Handle function components - call them to get the resolved value
    if (typeof el.type === 'function') {
      const props = { ...el.props, children: el.children };
      const componentFn = el.type as (props: Record<string, unknown>) => TagliatelleNode;
      const resolved = componentFn(props);
      await processConfigTree(resolved as TagliatelleNode, fastify, config, basePrefix);
      return;
    }
  }

  // Process TagliatelleComponent
  if (typeof node === 'object' && node !== null && '__tagliatelle' in node) {
    const component = node as TagliatelleComponent;

    switch (component.__tagliatelle) {
      case COMPONENT_TYPES.LOGGER:
        // Clone config with new logLevel, process children
        const loggerConfig = cloneConfig(config, {
          logLevel: component.level as RouteConfig['logLevel'],
        });
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, loggerConfig, basePrefix);
          }
        }
        break;

      case COMPONENT_TYPES.MIDDLEWARE:
        // Clone config with added scoped middleware
        // Middleware captures CURRENT config (db, etc.) at definition time
        if (component.use) {
          const scopedMw = createScopedMiddleware(component.use as MiddlewareFunction, config);
          const middlewareConfig = cloneConfig(config, {
            middleware: [...config.middleware, scopedMw],
          });
          if (component.children) {
            for (const child of component.children as TagliatelleNode[]) {
              await processConfigTree(child, fastify, middlewareConfig, basePrefix);
            }
          }
        }
        break;

      case COMPONENT_TYPES.RATE_LIMITER:
        // Clone config with new rateLimit
        const rateLimitConfig = cloneConfig(config, {
          rateLimit: {
            max: component.max as number,
            timeWindow: component.timeWindow as string,
          },
        });
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, rateLimitConfig, basePrefix);
          }
        }
        break;

      case COMPONENT_TYPES.GROUP:
        // Clone config with concatenated prefix
        const groupConfig = cloneConfig(config, {
          prefix: config.prefix + ((component.prefix as string) || ''),
        });
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, groupConfig, basePrefix);
          }
        }
        break;

      case COMPONENT_TYPES.CORS:
        // Clone config with new cors
        const corsConfig = cloneConfig(config, {
          cors: {
            origin: component.origin as CorsConfig['origin'],
            methods: component.methods as CorsConfig['methods'],
          },
        });
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, corsConfig, basePrefix);
          }
        }
        break;

      case COMPONENT_TYPES.DB:
        // Clone config with new db provider
        let dbConfig = config;
        if (component.provider) {
          try {
            const provider = component.provider as () => Promise<unknown>;
            const db = await provider();
            dbConfig = cloneConfig(config, { db });
            console.log(`  ${c.green}✓${c.reset} DB connected (config override)`);
          } catch (_error) {
            console.error(`  ${c.red}✗${c.reset} DB initialization failed in config`);
          }
        }
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, dbConfig, basePrefix);
          }
        }
        break;

      // Handle route file marker - register the actual route
      case COMPONENT_TYPES.ROUTE_FILE:
        await registerRouteFromModule(
          component.module as RouteModule,
          component.filePath as string,
          component.urlPath as string,
          fastify,
          config,
          basePrefix
        );
        break;

      default:
        // Unknown component, just process children
        if (component.children) {
          for (const child of component.children as TagliatelleNode[]) {
            await processConfigTree(child, fastify, config, basePrefix);
          }
        }
    }
  }
}

/**
 * Register a route module with the unified config
 */
async function registerRouteFromModule(
  module: RouteModule,
  filePath: string,
  urlPath: string,
  fastify: FastifyInstance,
  config: RouteConfig,
  basePrefix: string
): Promise<RouteInfo | null> {
  const httpMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const methods: HTTPMethod[] = [];

  // Build final URL path
  const finalUrlPath = basePrefix + config.prefix + urlPath;

  // Collect all middleware (already scoped from config tree)
  const allMiddleware: ScopedMiddleware[] = [...config.middleware];

  // Add route-level middleware (scope it with current config)
  if (module.middleware) {
    const routeMwFns = Array.isArray(module.middleware) ? module.middleware : [module.middleware];
    // Route-level middleware captures the FINAL config (as expected for route files)
    for (const mwFn of routeMwFns) {
      allMiddleware.push(createScopedMiddleware(mwFn, config));
    }
  }

  for (const method of httpMethods) {
    if (typeof module[method] === 'function') {
      methods.push(method);

      // Get schema for this method (e.g., GET_SCHEMA, POST_SCHEMA)
      const schemaKey = `${method}_SCHEMA` as keyof RouteModule;
      const schema = module[schemaKey] as RouteSchema | undefined;

      // Build route options
      const routeOptions: {
        method: HTTPMethod;
        url: string;
        handler: ReturnType<typeof wrapRouteHandler>;
        schema?: RouteSchema;
      } = {
        method,
        url: finalUrlPath,
        handler: wrapRouteHandler(module[method]!, allMiddleware, config),
      };

      // Add schema if provided (for OpenAPI/Swagger)
      if (schema) {
        routeOptions.schema = schema;
      }

      fastify.route(routeOptions);

      console.log(
        `  ${c.dim}├${c.reset} ${methodColor(method)}${method.padEnd(6)}${c.reset} ${c.white}${finalUrlPath}${c.reset}`
      );
    }
  }

  if (methods.length > 0) {
    return {
      filePath,
      urlPath: finalUrlPath,
      methods,
      config: {
        middleware: allMiddleware,
        prefix: config.prefix,
        logLevel: config.logLevel,
        rateLimit: config.rateLimit,
        cors: config.cors,
      },
    };
  }

  return null;
}

/**
 * Create a RouteFile marker component for use in config tree
 */
function RouteFile(module: RouteModule, filePath: string, urlPath: string): TagliatelleComponent {
  return {
    __tagliatelle: COMPONENT_TYPES.ROUTE_FILE,
    module,
    filePath,
    urlPath,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📂 ROUTE & CONFIG SCANNER
// ═══════════════════════════════════════════════════════════════════════════

interface ScanResult {
  routes: string[];
  configs: Map<string, string>;
}

async function scanDirectory(dir: string, routesDir: string): Promise<ScanResult> {
  const result: ScanResult = { routes: [], configs: new Map() };

  // Security: Ensure we're still within the routes directory
  const resolvedDir = path.resolve(dir);
  const resolvedRoutesDir = path.resolve(routesDir);
  if (!resolvedDir.startsWith(resolvedRoutesDir)) {
    console.warn(`  ${c.yellow}⚠${c.reset} Path escape attempt blocked: ${resolvedDir}`);
    return result;
  }

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Security: Skip symlinks to prevent escape via symlink
      if (entry.isSymbolicLink()) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subResult = await scanDirectory(fullPath, routesDir);
        result.routes.push(...subResult.routes);
        subResult.configs.forEach((v, k) => result.configs.set(k, v));
      } else if (entry.isFile()) {
        if (isConfigFile(entry.name)) {
          result.configs.set(dir, fullPath);
        } else if (isRouteFile(entry.name)) {
          result.routes.push(fullPath);
        }
      }
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') throw error;
  }

  return result;
}

async function loadModule<T>(filePath: string): Promise<T> {
  const fileUrl = pathToFileURL(filePath).href;
  return (await import(fileUrl)) as T;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌶️ MIDDLEWARE RESULT RESOLVER
// ═══════════════════════════════════════════════════════════════════════════

interface MiddlewareResolvedResult {
  halt: boolean;
  augment?: Record<string, unknown>;
  error?: { code: number; message: string };
}

function resolveMiddlewareResult(result: unknown): MiddlewareResolvedResult {
  const resolved: MiddlewareResolvedResult = { halt: false };

  // Check if it's a JSX element that needs resolution
  let component = result;
  if (
    typeof result === 'object' &&
    result !== null &&
    'type' in result &&
    typeof (result as TagliatelleElement).type === 'function'
  ) {
    const el = result as TagliatelleElement;
    const props = { ...el.props, children: el.children };
    const componentFn = el.type as (props: Record<string, unknown>) => unknown;
    component = componentFn(props);
  }

  // Check for TagliatelleComponent
  if (typeof component === 'object' && component !== null && '__tagliatelle' in component) {
    const comp = component as TagliatelleComponent;

    switch (comp.__tagliatelle) {
      case COMPONENT_TYPES.AUGMENT:
        resolved.augment = comp.data as Record<string, unknown>;
        break;

      case COMPONENT_TYPES.HALT:
        resolved.halt = true;
        if (comp.code || comp.message) {
          resolved.error = {
            code: (comp.code as number) ?? 500,
            message: (comp.message as string) ?? 'Request halted',
          };
        }
        break;

      case COMPONENT_TYPES.ERR:
        resolved.halt = true;
        resolved.error = {
          code: (comp.code as number) ?? 500,
          message: (comp.message as string) ?? 'Error',
        };
        break;
    }
  } else if (typeof component === 'object' && component !== null) {
    // Plain object - treat as augment data (backward compatible)
    resolved.augment = component as Record<string, unknown>;
  }

  return resolved;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🍝 HANDLER WRAPPER
// ═══════════════════════════════════════════════════════════════════════════

// Pretty log type
interface PrettyLog {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
}

/**
 * Wraps route handler with scoped middleware support
 *
 * Each middleware uses its CAPTURED config (db, etc.) from when it was defined.
 * This ensures visual hierarchy in JSX is respected.
 */
function wrapRouteHandler(
  handler: Handler,
  scopedMiddlewares: ScopedMiddleware[],
  config: RouteConfig
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Use pretty logger from config or default
    const prettyLog = (config.prettyLog as PrettyLog) || {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };

    // Base props - handler gets the FINAL config
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

    // Execute each scoped middleware with its CAPTURED config (from definition time in JSX tree)
    // This ensures visual hierarchy is respected:
    //   <DB provider={db1}>
    //     <Middleware use={mw1} />  ← mw1 sees db1
    //     <DB provider={db2}>
    //       <Middleware use={mw2} />  ← mw2 sees db2
    //     </DB>
    //   </DB>
    for (const scopedMw of scopedMiddlewares) {
      try {
        // Build middleware-specific props using the CAPTURED config (from definition time)
        const capturedConfig = scopedMw.capturedConfig;
        const middlewareProps: HandlerProps = {
          ...props,
          // Use captured db from when this middleware was defined in the tree
          db: capturedConfig.db,
          // Full captured config accessible if middleware needs other context values
          __capturedConfig: capturedConfig,
        };

        // Wrap middleware in timeout to prevent hanging
        const result = await withTimeout(
          async () => scopedMw.fn(middlewareProps, request, reply),
          MIDDLEWARE_TIMEOUT,
          'Middleware timeout'
        );

        if (result === false) return;

        // Handle JSX middleware responses
        if (result && typeof result === 'object') {
          const resolved = resolveMiddlewareResult(result);

          if (resolved.halt) {
            if (resolved.error) {
              // Sanitize error message before sending
              reply.status(resolved.error.code).send({
                error: sanitizeErrorMessage(resolved.error.message, 'Request failed'),
              });
            }
            return;
          }

          if (resolved.augment) {
            // Use safeMerge to prevent prototype pollution
            // Augmentations are passed to subsequent middlewares AND the handler
            safeMerge(props, resolved.augment);
          }
        }
      } catch (error) {
        const err = error as Error & { statusCode?: number };
        // Sanitize error message to prevent info leakage
        reply.status(err.statusCode ?? 500).send({
          error: sanitizeErrorMessage(err, 'Middleware error'),
        });
        return;
      }
    }

    try {
      const result = await handler(props);
      if (reply.sent) return;

      if (result !== undefined) {
        if (isJSXResponse(result)) {
          const response = resolveResponse(result);
          for (const [key, value] of Object.entries(response.headers)) {
            reply.header(key, value);
          }
          reply.status(response.statusCode).send(response.body);
        } else {
          reply.send(result);
        }
      }
    } catch (error) {
      if (!reply.sent) {
        const err = error as Error & { statusCode?: number };
        // Sanitize error to prevent stack trace and info leakage
        reply.status(err.statusCode ?? 500).send({
          error: sanitizeErrorMessage(err, 'Internal server error'),
        });
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 📤 RESPONSE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

interface ResolvedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}

function resolveResponse(element: unknown): ResolvedResponse {
  const response: ResolvedResponse = { statusCode: 200, headers: {}, body: undefined };

  function processNode(node: unknown): void {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(processNode);
      return;
    }

    let resolved: unknown = node;
    if (
      typeof node === 'object' &&
      node !== null &&
      'type' in node &&
      typeof (node as TagliatelleElement).type === 'function'
    ) {
      const el = node as TagliatelleElement;
      const props = { ...el.props, children: el.children };
      const componentFn = el.type as (props: Record<string, unknown>) => unknown;
      resolved = componentFn(props);
    }

    if (typeof resolved === 'object' && resolved !== null && '__tagliatelle' in resolved) {
      const component = resolved as TagliatelleComponent;
      switch (component.__tagliatelle) {
        case COMPONENT_TYPES.RESPONSE:
          if (component.children) (component.children as unknown[]).forEach(processNode);
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
          response.statusCode = component.code as number;
          const errBody: Record<string, unknown> = { error: component.message };
          if (component.details) errBody.details = component.details;
          response.body = errBody;
          break;
      }
    }
  }

  processNode(element);
  return response;
}

function isJSXResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if ('__tagliatelle' in value) {
    const component = value as TagliatelleComponent;
    return [
      COMPONENT_TYPES.RESPONSE,
      COMPONENT_TYPES.STATUS,
      COMPONENT_TYPES.BODY,
      COMPONENT_TYPES.HEADERS,
      COMPONENT_TYPES.ERR,
    ].includes(component.__tagliatelle);
  }
  if ('type' in value && typeof (value as TagliatelleElement).type === 'function') return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 ROUTER
// ═══════════════════════════════════════════════════════════════════════════

// Type for config functions that wrap children
type ConfigFunction = (props: { children: TagliatelleNode[] }) => TagliatelleNode;

interface DirectoryTree {
  routes: Array<{ filePath: string; urlPath: string; module: RouteModule }>;
  subdirs: Map<string, DirectoryTree>;
  config?: ConfigFunction;
}

/**
 * Build a tree of directories with their routes and configs
 */
async function buildDirectoryTree(
  dir: string,
  routesDir: string,
  routeFiles: string[],
  configs: Map<string, string>
): Promise<DirectoryTree> {
  const tree: DirectoryTree = {
    routes: [],
    subdirs: new Map(),
  };

  // Load config for this directory if exists
  const configPath = configs.get(dir);
  if (configPath) {
    try {
      const configModule = await loadModule<{ default: ConfigFunction }>(configPath);
      tree.config = configModule.default;
    } catch (_error) {
      console.error(`  ${c.red}✗${c.reset} Config error: ${path.relative(routesDir, configPath)}`);
    }
  }

  // Group routes by their immediate directory
  for (const filePath of routeFiles) {
    const fileDir = path.dirname(filePath);

    if (fileDir === dir) {
      // Route is directly in this directory
      try {
        const module = await loadModule<RouteModule>(filePath);
        const urlPath = filePathToUrlPath(filePath, routesDir);
        tree.routes.push({ filePath, urlPath, module });
      } catch (_error) {
        console.error(`  ${c.red}✗${c.reset} Route error: ${path.relative(routesDir, filePath)}`);
      }
    } else if (fileDir.startsWith(dir + path.sep)) {
      // Route is in a subdirectory - find immediate child dir
      const relativePath = path.relative(dir, fileDir);
      const immediateSubdir = relativePath.split(path.sep)[0];
      const subdirPath = path.join(dir, immediateSubdir);

      if (!tree.subdirs.has(subdirPath)) {
        // Recursively build subtree
        const subRoutes = routeFiles.filter((f) => path.dirname(f).startsWith(subdirPath));
        const subtree = await buildDirectoryTree(subdirPath, routesDir, subRoutes, configs);
        tree.subdirs.set(subdirPath, subtree);
      }
    }
  }

  return tree;
}

/**
 * Convert a directory tree to JSX nodes, applying configs as wrappers
 */
function treeToJSX(tree: DirectoryTree): TagliatelleNode[] {
  // Create RouteFile markers for all routes in this directory
  const routeNodes: TagliatelleNode[] = tree.routes.map((r) =>
    RouteFile(r.module, r.filePath, r.urlPath)
  );

  // Add subdirectory trees
  for (const [, subtree] of tree.subdirs) {
    routeNodes.push(...treeToJSX(subtree));
  }

  // If this directory has a config, wrap the children
  if (tree.config && routeNodes.length > 0) {
    return [tree.config({ children: routeNodes })];
  }

  return routeNodes;
}

export async function registerRoutes(
  fastify: FastifyInstance,
  options: RouterOptions,
  initialConfig: RouteConfig
): Promise<RouteInfo[]> {
  const { routesDir, prefix = '' } = options;
  const routes: RouteInfo[] = [];

  // Security: Validate routes directory
  const resolvedRoutesDir = path.resolve(routesDir);

  // Ensure directory exists and is accessible
  try {
    const stat = await fs.stat(resolvedRoutesDir);
    if (!stat.isDirectory()) {
      throw new Error(`Routes path is not a directory: ${resolvedRoutesDir}`);
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      console.error(`  ${c.red}✗${c.reset} Routes directory not found: ${resolvedRoutesDir}`);
      return routes;
    }
    throw error;
  }

  console.log(
    `  ${c.dim}Routes:${c.reset} ${c.cyan}${path.basename(resolvedRoutesDir)}/${c.reset}`
  );

  // Scan for routes and configs
  const { routes: routeFiles, configs } = await scanDirectory(resolvedRoutesDir, resolvedRoutesDir);

  // Build the directory tree with routes and configs
  const tree = await buildDirectoryTree(resolvedRoutesDir, resolvedRoutesDir, routeFiles, configs);

  // Convert tree to JSX with configs wrapping their children
  const jsxTree = treeToJSX(tree);

  // Process the JSX tree - configs will clone and override the initial config
  for (const node of jsxTree) {
    await processConfigTree(node, fastify, initialConfig, prefix);
  }

  return routes;
}

export function createRouter(options: RouterOptions) {
  return {
    register: async (fastify: FastifyInstance, config: RouteConfig) => {
      return registerRoutes(fastify, options, config);
    },
  };
}

export default createRouter;
