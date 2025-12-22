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
import type { Handler, MiddlewareFunction, HandlerProps, CorsConfig } from './types.js';
import { COMPONENT_TYPES } from './types.js';
import type { TagliatelleComponent, TagliatelleNode, TagliatelleElement } from './types.js';
import { safeMerge, sanitizeErrorMessage, withTimeout } from './security.js';

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
    case 'GET': return c.brightGreen;
    case 'POST': return c.brightYellow;
    case 'PUT': return c.brightBlue;
    case 'PATCH': return c.brightCyan;
    case 'DELETE': return c.red;
    default: return c.white;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// 📝 TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface ParsedConfig {
  middleware: MiddlewareFunction[];
  cors?: boolean | CorsConfig;
  rateLimit?: { max: number; timeWindow: string };
  logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
  prefix?: string;
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
  middleware?: MiddlewareFunction[];
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
// 🔍 JSX CONFIG PARSER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse JSX config components into a ParsedConfig object
 */
function parseJSXConfig(element: TagliatelleNode): ParsedConfig {
  const config: ParsedConfig = {
    middleware: []
  };

  function processNode(node: TagliatelleNode): void {
    if (!node) return;

    // Handle arrays (fragments)
    if (Array.isArray(node)) {
      node.forEach(processNode);
      return;
    }

    // Resolve JSX elements
    let resolved: TagliatelleNode | TagliatelleComponent = node;
    if (typeof node === 'object' && node !== null && 'type' in node && typeof (node as TagliatelleElement).type === 'function') {
      const el = node as TagliatelleElement;
      const props = { ...el.props, children: el.children };
      const componentFn = el.type as (props: Record<string, unknown>) => TagliatelleNode;
      resolved = componentFn(props);
      
      // If resolution returned an array (e.g., Fragment), process each item
      if (Array.isArray(resolved)) {
        resolved.forEach(processNode);
        return;
      }
    }

    // Process TagliatelleComponent
    if (typeof resolved === 'object' && resolved !== null && '__tagliatelle' in resolved) {
      const component = resolved as TagliatelleComponent;

      switch (component.__tagliatelle) {
        case COMPONENT_TYPES.LOGGER:
          config.logLevel = component.level as ParsedConfig['logLevel'];
          break;

        case COMPONENT_TYPES.MIDDLEWARE:
          if (component.use) {
            config.middleware.push(component.use as MiddlewareFunction);
          }
          break;

        case COMPONENT_TYPES.RATE_LIMITER:
          config.rateLimit = {
            max: component.max as number,
            timeWindow: component.timeWindow as string
          };
          break;

        case COMPONENT_TYPES.GROUP:
          if (component.prefix) {
            config.prefix = (config.prefix || '') + (component.prefix as string);
          }
          break;
      }

      // Process children
      if (component.children) {
        (component.children as TagliatelleNode[]).forEach(processNode);
      }
    }
  }

  processNode(element);
  return config;
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
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
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
  return await import(fileUrl) as T;
}

function getConfigChain(routeDir: string, routesDir: string, configs: Map<string, string>): string[] {
  const chain: string[] = [];
  let current = routeDir;
  
  while (current.startsWith(routesDir) || current === routesDir) {
    const configPath = configs.get(current);
    if (configPath) {
      chain.unshift(configPath);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  
  return chain;
}

function mergeConfigs(configs: ParsedConfig[], baseMiddleware: MiddlewareFunction[]): ParsedConfig {
  const resolved: ParsedConfig = {
    middleware: [...baseMiddleware],
    prefix: ''
  };
  
  for (const config of configs) {
    // Middleware is additive
    resolved.middleware.push(...config.middleware);
    
    // Rate limit overrides
    if (config.rateLimit) {
      resolved.rateLimit = config.rateLimit;
    }
    
    // Log level overrides
    if (config.logLevel) {
      resolved.logLevel = config.logLevel;
    }
    
    // Prefix is additive
    if (config.prefix) {
      resolved.prefix = (resolved.prefix || '') + config.prefix;
    }
    
    // CORS overrides
    if (config.cors !== undefined) {
      resolved.cors = config.cors;
    }
  }
  
  return resolved;
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
  if (typeof result === 'object' && result !== null && 'type' in result && typeof (result as TagliatelleElement).type === 'function') {
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
            message: (comp.message as string) ?? 'Request halted'
          };
        }
        break;
        
      case COMPONENT_TYPES.ERR:
        resolved.halt = true;
        resolved.error = {
          code: (comp.code as number) ?? 500,
          message: (comp.message as string) ?? 'Error'
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

function wrapRouteHandler(
  handler: Handler,
  middlewares: MiddlewareFunction[],
  context: { get: <T>(key: string) => T | undefined },
  _logLevel?: string
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Use our pretty logger instead of Fastify's JSON logger
    const prettyLog = context.get<PrettyLog>('prettyLog') || {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
    
    const props: HandlerProps = {
      params: request.params as Record<string, string>,
      query: request.query as Record<string, string>,
      body: request.body,
      headers: request.headers as Record<string, string | string[] | undefined>,
      request,
      reply,
      db: context.get('db'),
      log: prettyLog as unknown as FastifyRequest['log'],
    };

    // Middleware timeout (30 seconds max)
    const MIDDLEWARE_TIMEOUT = 30000;
    
    for (const mw of middlewares) {
      try {
        // Wrap middleware in timeout to prevent hanging
        const result = await withTimeout(
          async () => mw(props, request, reply),
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
                error: sanitizeErrorMessage(resolved.error.message, 'Request failed') 
              });
            }
            return;
          }
          
          if (resolved.augment) {
            // Use safeMerge to prevent prototype pollution
            safeMerge(props, resolved.augment);
          }
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
          error: sanitizeErrorMessage(err, 'Internal server error') 
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
    if (Array.isArray(node)) { node.forEach(processNode); return; }

    let resolved: unknown = node;
    if (typeof node === 'object' && node !== null && 'type' in node && typeof (node as TagliatelleElement).type === 'function') {
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
    return [COMPONENT_TYPES.RESPONSE, COMPONENT_TYPES.STATUS, COMPONENT_TYPES.BODY, COMPONENT_TYPES.HEADERS, COMPONENT_TYPES.ERR].includes(component.__tagliatelle);
  }
  if ('type' in value && typeof (value as TagliatelleElement).type === 'function') return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export async function registerRoutes(
  fastify: FastifyInstance,
  options: RouterOptions,
  context: { get: <T>(key: string) => T | undefined; set: <T>(key: string, value: T) => void }
): Promise<RouteInfo[]> {
  const { routesDir, prefix = '', middleware = [] } = options;
  const routes: RouteInfo[] = [];
  
  console.log(`  ${c.dim}Routes:${c.reset} ${c.cyan}${path.basename(routesDir)}/${c.reset}`);
  
  // Scan for routes and configs
  const { routes: routeFiles, configs } = await scanDirectory(routesDir, routesDir);
  
  // Load and parse all config files
  const loadedConfigs = new Map<string, ParsedConfig>();
  for (const [dir, configPath] of configs) {
    try {
      const configModule = await loadModule<{ default: () => TagliatelleNode }>(configPath);
      const jsxTree = configModule.default();
      const parsedConfig = parseJSXConfig(jsxTree);
      loadedConfigs.set(dir, parsedConfig);
      
      // Config loaded silently
    } catch (error) {
      console.error(`  ${c.red}✗${c.reset} Config error: ${path.relative(routesDir, configPath)}`);
    }
  }
  
  // Process each route
  for (const filePath of routeFiles) {
    try {
      const module = await loadModule<RouteModule>(filePath);
      const routeDir = path.dirname(filePath);
      
      // Get config chain and merge
      const configChain = getConfigChain(routeDir, routesDir, configs);
      const chainedConfigs: ParsedConfig[] = [];
      
      for (const configPath of configChain) {
        // Find the config for this path
        for (const [dir, cfg] of loadedConfigs) {
          if (configs.get(dir) === configPath) {
            chainedConfigs.push(cfg);
            break;
          }
        }
      }
      
      const resolvedConfig = mergeConfigs(chainedConfigs, middleware);
      
      // Add route-level middleware
      if (module.middleware) {
        const routeMw = Array.isArray(module.middleware) ? module.middleware : [module.middleware];
        resolvedConfig.middleware.push(...routeMw);
      }
      
      // Calculate URL path
      const urlPath = prefix + (resolvedConfig.prefix || '') + filePathToUrlPath(filePath, routesDir);
      
      // Register each HTTP method
      const httpMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      const methods: HTTPMethod[] = [];
      
      for (const method of httpMethods) {
        if (typeof module[method] === 'function') {
          methods.push(method);
          
          fastify.route({
            method,
            url: urlPath,
            handler: wrapRouteHandler(
              module[method]!,
              resolvedConfig.middleware,
              context,
              resolvedConfig.logLevel
            )
          });
          
          console.log(`  ${c.dim}├${c.reset} ${methodColor(method)}${method.padEnd(6)}${c.reset} ${c.white}${urlPath}${c.reset}`);
        }
      }
      
      if (methods.length > 0) {
        routes.push({
          filePath,
          urlPath,
          methods,
          config: resolvedConfig
        });
      }
    } catch (error) {
      console.error(`  ${c.red}✗${c.reset} Route error: ${path.relative(routesDir, filePath)}`);
    }
  }
  
  return routes;
}

export function createRouter(options: RouterOptions) {
  return {
    register: async (fastify: FastifyInstance, context: { get: <T>(key: string) => T | undefined; set: <T>(key: string, value: T) => void }) => {
      return registerRoutes(fastify, options, context);
    }
  };
}

export default createRouter;
