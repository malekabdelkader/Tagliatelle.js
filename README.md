# 🍝 `<Tag>liatelle.js`

> **The Declarative Backend Framework.** Build APIs with JSX. Yes, really.

`<Tag>liatelle.js` is a **TypeScript** backend framework built on top of **Fastify** that treats your API architecture like a component tree. Using JSX/TSX, you define your routes, middleware, and responses as a visual hierarchy.

**If you can write React, you can build a high-performance backend.**

```tsx
import { render, Server, Logger, Cors, Routes } from 'tagliatelle';

const App = () => (
  <Server port={3000}>
    <Logger level="info" />
    <Cors origin="*">
      <Routes dir="./routes" />
    </Cors>
  </Server>
);

render(<App />);
```

---

## 🤔 The Origin Story

This project started as a **joke**.

I noticed that every frontend framework is racing to become more server-oriented. React added Server Components. Next.js gave us `"use server"`. Remix is basically a backend framework wearing a React costume. The JavaScript ecosystem is slowly but surely... **becoming PHP**.

So I thought: *"If frontend devs want to write server code so badly, why not go all the way?"*

Instead of sneaking server code into your React components, let's do the **opposite** — write your entire backend in pure TSX. Routes? JSX. Middleware? JSX. Responses? You guessed it... JSX.

**Tagliatelle.js: Because if we're going to make everything look like PHP anyway, we might as well make it delicious.** 🍝

### Why "Tagliatelle"?

- **`<Tag>`** — Because we write everything in JSX tags. `<Server>`, `<Route>`, `<Response>`... it's tags all the way down.
- **Tagliatelle** — It's pasta. Because frontend developers clearly want to write spaghetti code in the backend. 🍝

*At least this spaghetti is type-safe and al dente.*

---

## 🚀 Quick Start

### Create a new project

```bash
npx tagliatelle@beta init my-api
cd my-api
npm run dev
```

That's it! Your API is running at `http://localhost:3000` 🍝

```bash
curl http://localhost:3000/health
# {"status":"Al Dente 🍝","timestamp":"..."}

curl http://localhost:3000/posts
# {"success":true,"count":2,"data":[...]}
```

---

## 🤌 Why `<Tag>liatelle.js`?

| Feature | Description |
|---------|-------------|
| **File-Based Routing** | Next.js-style routing — your file structure IS your API |
| **JSX Responses** | Return `<Response><Status code={201} /><Body data={...} /></Response>` |
| **JSX Middleware** | Use `<Err>` and `<Augment>` for clean auth flows |
| **JSX Config** | Configure routes with `<Logger>`, `<Middleware>`, `<RateLimiter>` |
| **Full TypeScript** | End-to-end type safety with `HandlerProps<TParams, TBody, TQuery>` |
| **Zero Boilerplate** | Handlers return data or JSX — no `res.send()` needed |
| **CLI Scaffolding** | `npx tagliatelle@beta init` creates a ready-to-run project |

---

## 📦 Installation

### New Project (Recommended)

```bash
npx tagliatelle@beta init my-api
```

### Add to Existing Project

```bash
npm install tagliatelle@beta
```

Then configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "tagliatelle"
  }
}
```

---

## 📂 Project Structure

```
my-api/
├── server.tsx              # Server entry point
├── routes/                 # File-based routing
│   ├── _config.tsx         # Global route config
│   ├── index.tsx           # GET /
│   ├── health.tsx          # GET /health
│   └── posts/
│       ├── _config.tsx     # Config for /posts/*
│       ├── _data.ts        # Shared data (not a route)
│       ├── index.tsx       # GET/POST /posts
│       └── [id].tsx        # GET/PUT/DELETE /posts/:id
├── middleware/
│   └── auth.tsx            # JSX middleware
├── tsconfig.json
└── package.json
```

---

## 🍽️ Server Configuration

### `server.tsx`

```tsx
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, Server, Logger, Cors, Routes } from 'tagliatelle';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const App = () => (
  <Server port={3000}>
    <Logger level="info" />
    <Cors origin="*">
      <Routes dir={path.join(__dirname, 'routes')} />
    </Cors>
  </Server>
);

render(<App />);
```

### Server Components

| Component | Description |
|-----------|-------------|
| `<Server port={3000}>` | Main server wrapper |
| `<Logger level="info" />` | Configure logging level |
| `<Cors origin="*">` | Enable CORS |
| `<Routes dir="./routes" />` | Load file-based routes |
| `<RateLimiter max={100} timeWindow="1 minute" />` | Rate limiting |
| `<Middleware use={fn} />` | Add global middleware |

### Runtime Options

You can override server settings at runtime using CLI flags or environment variables:

| Option | Env Variable | Description |
|--------|--------------|-------------|
| `-p, --port <number>` | `PORT` | Port to listen on (default: 3000) |
| `-H, --host <string>` | `HOST` | Host to bind to (default: 0.0.0.0) |
| `-o, --open` | — | Open browser after server starts |
| `-h, --help` | — | Show help message |

**Priority:** CLI flags > Environment variables > Code defaults

---

## 📁 File-Based Routing

Your file structure becomes your API:

| File | Route |
|------|-------|
| `routes/index.tsx` | `GET /` |
| `routes/health.tsx` | `GET /health` |
| `routes/posts/index.tsx` | `GET/POST /posts` |
| `routes/posts/[id].tsx` | `GET/PUT/DELETE /posts/:id` |
| `routes/users/[id]/posts.tsx` | `GET /users/:id/posts` |

### Route File Example

```tsx
// routes/posts/[id].tsx
import { Response, Status, Body, Err } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

interface PostParams { id: string }

export async function GET({ params, log }: HandlerProps<PostParams>) {
  log.info(`Fetching post ${params.id}`);
  
  const post = await db.posts.find(params.id);
  
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

export async function DELETE({ params }: HandlerProps<PostParams>) {
  await db.posts.delete(params.id);
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{ success: true, message: "Deleted" }} />
    </Response>
  );
}
```

---

## 🎛️ Route Configuration

Create `_config.tsx` files to configure routes per directory:

### `routes/_config.tsx` (Global)

```tsx
import { Logger } from 'tagliatelle';

export default () => (
  <>
    <Logger level="info" />
  </>
);
```

### `routes/posts/_config.tsx` (Posts-specific)

```tsx
import { Logger, Middleware, RateLimiter } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';
import { authMiddleware } from '../middleware/auth.js';

// Only require auth for write operations
const writeAuthMiddleware = async (props: HandlerProps, request, reply) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return; // Skip auth for reads
  }
  return authMiddleware(props, request, reply);
};

export default () => (
  <>
    <Logger level="debug" />
    <RateLimiter max={100} timeWindow="1 minute" />
    <Middleware use={writeAuthMiddleware} />
  </>
);
```

### Config Inheritance

Configs are **inherited** and **merged**:
- Child configs override parent settings
- Middleware is **additive** (stacks)
- Nested directories inherit from parents

---

## 📤 JSX Responses

Return beautiful, declarative responses:

```tsx
// Success response
return (
  <Response>
    <Status code={201} />
    <Body data={{ 
      success: true, 
      message: "Created!",
      data: newItem 
    }} />
  </Response>
);

// Error response (shorthand)
return <Err code={404} message="Not found" />;

// With custom headers
return (
  <Response>
    <Status code={200} />
    <Headers headers={{ 'X-Custom': 'value' }} />
    <Body data={result} />
  </Response>
);
```

### Response Components

| Component | Description |
|-----------|-------------|
| `<Response>` | Wrapper for composing responses |
| `<Status code={201} />` | Set HTTP status code |
| `<Body data={{...}} />` | Set JSON response body |
| `<Headers headers={{...}} />` | Set custom headers |
| `<Err code={404} message="..." />` | Error response shorthand |

---

## 🌶️ Middleware

Middleware can use JSX components for responses and prop augmentation!

### Creating Middleware

```tsx
// middleware/auth.tsx
import { Augment, Err, authFailureTracker, isSafeString } from 'tagliatelle';
import type { HandlerProps, MiddlewareFunction } from 'tagliatelle';

export const authMiddleware: MiddlewareFunction = async (props, request, reply) => {
  const apiKey = request.headers['x-api-key'];
  
  // Return JSX error response
  if (!apiKey || typeof apiKey !== 'string') {
    return <Err code={401} message="Authentication required" />;
  }
  
  const user = await verifyToken(apiKey);
  
  if (!user) {
    return <Err code={401} message="Invalid credentials" />;
  }
  
  // Augment props with user data
  return <Augment user={user} />;
};
```

### Middleware Factory Pattern

```tsx
// Role-based authorization factory
export function requireRole(role: string): MiddlewareFunction {
  return async (props, request, reply) => {
    const user = props.user;
    
    if (!user || user.role !== role) {
      return <Err code={403} message="Access denied" />;
    }
    
    return; // Continue to handler
  };
}

// Usage in _config.tsx
<Middleware use={requireRole('admin')} />
```

### Middleware Components

| Component | Description |
|-----------|-------------|
| `<Err code={401} message="..." />` | Return error and halt chain |
| `<Augment user={...} />` | Add data to handler props |

---

## ⚙️ Handler Props

Every handler receives typed props:

```tsx
interface HandlerProps<TParams, TBody, TQuery> {
  params: TParams;                    // URL parameters
  query: TQuery;                      // Query string
  body: TBody;                        // Request body
  headers: Record<string, string>;    // Request headers
  request: FastifyRequest;            // Raw Fastify request
  reply: FastifyReply;                // Raw Fastify reply
  log: Logger;                        // Fastify logger
  user?: unknown;                     // From auth middleware
  db?: unknown;                       // From DB provider
}
```

### Example with Types

```tsx
interface CreatePostBody {
  title: string;
  content: string;
}

export async function POST({ body, user, log }: HandlerProps<unknown, CreatePostBody>) {
  log.info('Creating post');
  
  if (!body.title) {
    return <Err code={400} message="Title required" />;
  }
  
  const post = await createPost({ ...body, author: user.id });
  
  return (
    <Response>
      <Status code={201} />
      <Body data={{ success: true, data: post }} />
    </Response>
  );
}
```

---

## 📜 Naming Conventions

| Pattern | Description |
|---------|-------------|
| `index.tsx` | Root of directory (`/posts/index.tsx` → `/posts`) |
| `[param].tsx` | Dynamic parameter (`/posts/[id].tsx` → `/posts/:id`) |
| `[...slug].tsx` | Catch-all (`/docs/[...slug].tsx` → `/docs/*`) |
| `_config.tsx` | Directory configuration (not a route) |
| `_*.ts` | Private files (ignored by router) |

---

## 🛡️ Security Utilities

Tagliatelle includes security helpers:

```tsx
import { 
  authFailureTracker,   // Rate limit auth failures by IP
  isSafeString,         // Validate string safety
  sanitizeErrorMessage, // Clean error messages
  safeErrorResponse,    // Safe error responses
  withTimeout,          // Add timeouts to async operations
} from 'tagliatelle';
```

---

## 🚀 Performance

Built on Fastify, you get:
- **100k+ requests/second** throughput
- **Low latency** JSON serialization
- **Schema validation** support
- **Automatic logging**

---

## 📋 CLI Reference

```bash
# Create a new project
npx tagliatelle@beta init my-api

# Development with hot reload
npm run dev

# Production mode  
npm run start

# Show runtime options (port, host, etc.)
npm run dev -- --help
```

---

## 🤝 Contributing

Got a new "ingredient"? Open a Pull Request! We're looking for:

- [ ] WebSocket support (`<WebSocket />`)
- [ ] OpenAPI schema generation
- [ ] Static file serving (`<Static />`)
- [ ] GraphQL integration
- [ ] Database adapters

---

## 📜 License

MIT

---

**Made with ❤️ and plenty of carbs. Chahya Tayba !** 🇹🇳
