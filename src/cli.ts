#!/usr/bin/env node
/**
 * 🍝 Tagliatelle CLI
 * 
 * Create new Tagliatelle projects with a single command!
 * 
 * Usage:
 *   npx tagliatelle init my-api
 *   npx tagliatelle init my-api --skip-install
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

// ═══════════════════════════════════════════════════════════════════════════
// 📦 TEMPLATE FILES
// ═══════════════════════════════════════════════════════════════════════════

const templates: Record<string, string> = {
  'package.json': `{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.tsx",
    "start": "tsx server.tsx",
    "build": "tsc",
    "serve": "node dist/server.js"
  },
  "dependencies": {
    "tagliatelle": "^1.0.0-beta.6"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.6.0",
    "@types/node": "^20.10.0"
  }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    
    "jsx": "react-jsx",
    "jsxImportSource": "tagliatelle"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}`,

  'server.tsx': `/**
 * 🍝 {{PROJECT_NAME}} - Powered by Tagliatelle
 * 
 * Start your server:
 *   npm run dev              # Development with hot reload
 *   npm run start            # Production mode
 *   npm run dev -- -p 8080   # Custom port
 *   npm run dev -- --help    # Show all CLI options
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, Server, Logger, Cors, Routes, DB } from 'tagliatelle';
import { dbPlugin } from './plugins/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const App = () => (
  <Server port={3000}>
    <Logger level="info" />
    <DB provider={dbPlugin}>
      <Cors origin="*">
        <Routes dir={path.join(__dirname, 'routes')} />
      </Cors>
    </DB>
  </Server>
);

render(<App />);
`,

  'routes/index.tsx': `/**
 * 🍝 Root Route
 * 
 * GET /
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log }: HandlerProps) {
  log.info('API info request');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        name: '{{PROJECT_NAME}}',
        version: '0.1.0',
        powered_by: 'Tagliatelle 🍝'
      }} />
    </Response>
  );
}
`,

  'routes/health.tsx': `/**
 * 🍝 Health Check Route
 * 
 * GET /health
 */

import { Response, Status, Body } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

export async function GET({ log }: HandlerProps) {
  log.info('Health check');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        status: 'Al Dente 🍝',
        timestamp: new Date().toISOString()
      }} />
    </Response>
  );
}
`,

  'routes/posts/_config.tsx': `/**
 * 🍝 Posts Routes Config
 * 
 * This config applies to all routes in /posts/*
 * Config wraps children - components apply their effects to child routes!
 */

import { Logger, RateLimiter } from 'tagliatelle';
import type { TagliatelleNode } from 'tagliatelle';

export default ({ children }: { children: TagliatelleNode[] }) => (
  <Logger level="debug">
    <RateLimiter max={100} timeWindow="1 minute">
      {children}
    </RateLimiter>
  </Logger>
);
`,

  'routes/posts/_data.ts': `/**
 * 🍝 Posts Data Store
 * 
 * In-memory data store for demo purposes.
 * Replace with your actual database!
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

export const posts: Post[] = [
  {
    id: '1',
    title: 'Welcome to Tagliatelle',
    content: 'The most delicious backend framework ever made.',
    author: 'Chef de Code',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'File-Based Routing is Here!',
    content: 'Just like Next.js, but for your API. Bellissimo!',
    author: 'The Pasta Architect',
    createdAt: new Date()
  }
];
`,

  'routes/posts/index.tsx': `/**
 * 🍝 Posts Collection Route
 * 
 * GET  /posts     - List all posts
 * POST /posts     - Create a new post
 */

import { Response, Status, Body, Err } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import { posts } from './_data.js';

interface CreatePostBody {
  title: string;
  content: string;
  author?: string;
}

export async function GET({ log }: HandlerProps) {
  log.info('Fetching all posts');
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        count: posts.length,
        data: posts
      }} />
    </Response>
  );
}

export async function POST({ body, log }: HandlerProps<unknown, CreatePostBody>) {
  log.info('Creating new post');
  
  if (!body.title || !body.content) {
    return (
      <Err 
        code={400} 
        message="Missing required fields" 
        details={{ required: ['title', 'content'] }}
      />
    );
  }
  
  const newPost = {
    id: String(posts.length + 1),
    title: body.title,
    content: body.content,
    author: body.author || 'Anonymous',
    createdAt: new Date()
  };
  
  posts.push(newPost);
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{
        success: true,
        message: 'Post created successfully! 🍝',
        data: newPost
      }} />
    </Response>
  );
}
`,

  'routes/posts/[id].tsx': `/**
 * 🍝 Single Post Route
 * 
 * GET    /posts/:id  - Get a post
 * PUT    /posts/:id  - Update a post
 * DELETE /posts/:id  - Delete a post
 */

import { Response, Status, Body, Err } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import { posts } from './_data.js';

interface PostParams {
  id: string;
}

interface UpdatePostBody {
  title?: string;
  content?: string;
  author?: string;
}

export async function GET({ params, log }: HandlerProps<PostParams>) {
  log.info(\`Fetching post \${params.id}\`);
  
  const post = posts.find(p => p.id === params.id);
  
  if (!post) {
    return <Err code={404} message="Post not found" />;
  }
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{ success: true, data: post }} />
    </Response>
  );
}

export async function PUT({ params, body, log }: HandlerProps<PostParams, UpdatePostBody>) {
  log.info(\`Updating post \${params.id}\`);
  
  const postIndex = posts.findIndex(p => p.id === params.id);
  
  if (postIndex === -1) {
    return <Err code={404} message="Post not found" />;
  }
  
  posts[postIndex] = { ...posts[postIndex], ...body };
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post updated!',
        data: posts[postIndex]
      }} />
    </Response>
  );
}

export async function DELETE({ params, log }: HandlerProps<PostParams>) {
  log.info(\`Deleting post \${params.id}\`);
  
  const postIndex = posts.findIndex(p => p.id === params.id);
  
  if (postIndex === -1) {
    return <Err code={404} message="Post not found" />;
  }
  
  const deleted = posts.splice(postIndex, 1)[0];
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{
        success: true,
        message: 'Post deleted!',
        data: deleted
      }} />
    </Response>
  );
}
`,

  'plugins/db.ts': `/**
 * 🗄️ Database Plugin
 * 
 * Example database provider for Tagliatelle.
 * Replace with your actual database connection (PostgreSQL, MongoDB, etc.)
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📦 TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Database {
  query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  insert: <T>(table: string, data: Record<string, unknown>) => Promise<T>;
  update: (table: string, id: string, data: Record<string, unknown>) => Promise<boolean>;
  delete: (table: string, id: string) => Promise<boolean>;
  close: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🍝 DATABASE PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a mock database connection
 * Replace this with your actual database connection logic
 * 
 * Examples:
 *   - PostgreSQL: pg or postgres
 *   - MongoDB: mongoose or mongodb
 *   - SQLite: better-sqlite3
 *   - Prisma: @prisma/client
 */
export async function dbPlugin(): Promise<Database> {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  console.log('🗄️  Database connected');
  
  // In-memory storage (replace with real DB)
  const storage: Record<string, Record<string, unknown>[]> = {};
  
  return {
    async query<T>(sql: string, _params?: unknown[]): Promise<T[]> {
      console.log(\`🗄️  Query: \${sql}\`);
      const table = sql.match(/FROM\\s+(\\w+)/i)?.[1] || 'default';
      return (storage[table] || []) as T[];
    },
    
    async insert<T>(table: string, data: Record<string, unknown>): Promise<T> {
      console.log(\`🗄️  Insert into \${table}:\`, data);
      if (!storage[table]) storage[table] = [];
      const record = { id: String(storage[table].length + 1), ...data };
      storage[table].push(record);
      return record as T;
    },
    
    async update(table: string, id: string, data: Record<string, unknown>): Promise<boolean> {
      console.log(\`🗄️  Update \${table}/\${id}:\`, data);
      if (!storage[table]) return false;
      const index = storage[table].findIndex(r => r.id === id);
      if (index === -1) return false;
      storage[table][index] = { ...storage[table][index], ...data };
      return true;
    },
    
    async delete(table: string, id: string): Promise<boolean> {
      console.log(\`🗄️  Delete \${table}/\${id}\`);
      if (!storage[table]) return false;
      const index = storage[table].findIndex(r => r.id === id);
      if (index === -1) return false;
      storage[table].splice(index, 1);
      return true;
    },
    
    async close(): Promise<void> {
      console.log('🗄️  Database connection closed');
    }
  };
}
`,

  '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
`,

  'README.md': `# {{PROJECT_NAME}}

A delicious API powered by [Tagliatelle](https://github.com/malekabdelkader/Tagliatelle.js) 🍝

## Getting Started

\`\`\`bash
# Development with hot reload
npm run dev

# Production
npm run start
\`\`\`

## CLI Options

| Option | Env Variable | Description |
|--------|--------------|-------------|
| \`-p, --port\` | \`PORT\` | Port to listen on (default: 3000) |
| \`-H, --host\` | \`HOST\` | Host to bind to (default: 0.0.0.0) |
| \`-o, --open\` | — | Open browser after start |
| \`-h, --help\` | — | Show all options |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | \`/\` | API info |
| GET | \`/health\` | Health check |
| GET | \`/posts\` | List all posts |
| POST | \`/posts\` | Create a post |
| GET | \`/posts/:id\` | Get a post |
| PUT | \`/posts/:id\` | Update a post |
| DELETE | \`/posts/:id\` | Delete a post |

## Project Structure

\`\`\`
{{PROJECT_NAME}}/
├── server.tsx          # Entry point
├── plugins/
│   └── db.ts           # Database provider
├── routes/
│   ├── index.tsx       # GET /
│   ├── health.tsx      # GET /health
│   └── posts/
│       ├── _config.tsx # Route group config
│       ├── _data.ts    # Data store
│       ├── index.tsx   # GET/POST /posts
│       └── [id].tsx    # GET/PUT/DELETE /posts/:id
├── package.json
└── tsconfig.json
\`\`\`

## Learn More

- [Tagliatelle Docs](https://github.com/malekabdelkader/Tagliatelle.js)
- [File-Based Routing](https://github.com/malekabdelkader/Tagliatelle.js#routing)
- [JSX Components](https://github.com/malekabdelkader/Tagliatelle.js#components)
`,
};

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function printBanner() {
  console.log(`
${c.yellow}  ╔══════════════════════════════════════════════════════════════╗
  ║  ${c.bold}🍝 Tagliatelle${c.reset}${c.yellow}                                              ║
  ║  ${c.dim}The Declarative Backend Framework${c.reset}${c.yellow}                          ║
  ╚══════════════════════════════════════════════════════════════╝${c.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`${c.bold}Usage:${c.reset}
  ${c.cyan}npx tagliatelle init${c.reset} <project-name> [options]

${c.bold}Commands:${c.reset}
  ${c.green}init${c.reset} <name>     Create a new Tagliatelle project

${c.bold}Options:${c.reset}
  ${c.yellow}--skip-install${c.reset}  Skip npm install after scaffolding
  ${c.yellow}--help, -h${c.reset}      Show this help message

${c.bold}Examples:${c.reset}
  ${c.dim}# Create a new project${c.reset}
  ${c.cyan}npx tagliatelle init my-api${c.reset}

  ${c.dim}# Create without installing dependencies${c.reset}
  ${c.cyan}npx tagliatelle init my-api --skip-install${c.reset}
`);
}

function createDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  createDir(dir);
  fs.writeFileSync(filePath, content);
}

function scaffold(projectName: string, targetDir: string) {
  console.log(`\n${c.cyan}Creating project:${c.reset} ${c.bold}${projectName}${c.reset}\n`);

  // Create all files from templates
  for (const [relativePath, template] of Object.entries(templates)) {
    const content = template.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    const filePath = path.join(targetDir, relativePath);
    writeFile(filePath, content);
    console.log(`  ${c.green}✓${c.reset} ${relativePath}`);
  }
}

function runNpmInstall(targetDir: string) {
  console.log(`\n${c.cyan}Installing dependencies...${c.reset}\n`);
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
    return true;
  } catch {
    console.log(`\n${c.yellow}⚠${c.reset} Failed to install dependencies. Run ${c.cyan}npm install${c.reset} manually.\n`);
    return false;
  }
}

function printSuccess(projectName: string, skipInstall: boolean) {
  console.log(`
${c.green}✓ Project created successfully!${c.reset}

${c.bold}Next steps:${c.reset}

  ${c.cyan}cd${c.reset} ${projectName}${skipInstall ? `
  ${c.cyan}npm install${c.reset}` : ''}
  ${c.cyan}npm run dev${c.reset}

${c.dim}Your API will be running at ${c.cyan}http://localhost:3000${c.reset}

${c.bold}CLI Options:${c.reset}
  ${c.dim}npm run dev -- -p 8080${c.reset}        ${c.dim}# Custom port${c.reset}
  ${c.dim}npm run dev -- -H localhost${c.reset}   ${c.dim}# Bind to localhost${c.reset}
  ${c.dim}npm run dev -- --open${c.reset}         ${c.dim}# Open browser${c.reset}
  ${c.dim}npm run dev -- --help${c.reset}         ${c.dim}# All options${c.reset}

${c.yellow}🍝 Buon appetito!${c.reset}
`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  
  // Handle help
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command !== 'init') {
    console.log(`${c.red}Unknown command:${c.reset} ${command}\n`);
    printHelp();
    process.exit(1);
  }
  
  const projectName = args[1];
  
  if (!projectName) {
    console.log(`${c.red}Error:${c.reset} Please provide a project name\n`);
    console.log(`  ${c.cyan}npx tagliatelle init my-api${c.reset}\n`);
    process.exit(1);
  }
  
  // Validate project name
  if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
    console.log(`${c.red}Error:${c.reset} Invalid project name. Use only letters, numbers, dashes, and underscores.\n`);
    process.exit(1);
  }
  
  const skipInstall = args.includes('--skip-install');
  const targetDir = path.resolve(process.cwd(), projectName);
  
  // Check if directory exists
  if (fs.existsSync(targetDir)) {
    console.log(`${c.red}Error:${c.reset} Directory ${c.bold}${projectName}${c.reset} already exists.\n`);
    process.exit(1);
  }
  
  printBanner();
  
  // Scaffold project
  scaffold(projectName, targetDir);
  
  // Install dependencies
  if (!skipInstall) {
    runNpmInstall(targetDir);
  }
  
  // Success message
  printSuccess(projectName, skipInstall);
}

main();

