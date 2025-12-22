# 🍝 `<Tag>liatelle.js`

> **The Declarative Backend Framework.** Why write dry, linear routing when you can serve up a delicious plate of functional spaghetti?

`<Tag>liatelle.js` is a **TypeScript** backend framework built on top of **Fastify** that treats your API architecture like a UI component tree. Using JSX/TSX, you define your routes, middleware, and responses as a visual hierarchy.

**If you can write React, you can build a high-performance backend.**

---

## 🤌 Why `<Tag>liatelle.js`?

| Feature | Description |
|---------|-------------|
| **File-Based Routing** | Next.js-style routing - your file structure IS your API |
| **JSX Responses** | Return `<Response><Status code={201} /><Body data={...} /></Response>` |
| **JSX Middleware** | Use `<Err>` and `<Augment>` in middleware for clean auth flows |
| **JSX Config** | Configure routes with `<Logger>`, `<Middleware>`, `<RateLimiter>` |
| **Full TypeScript** | End-to-end type safety with `HandlerProps<TParams, TBody, TQuery>` |
| **Zero Boilerplate** | Handlers just return data or JSX, no `res.send()` |

---

## 📂 Project Structure

```
my-api/
├── src/
│   ├── main.tsx              # Server entry point
│   ├── routes/               # File-based routing
│   │   ├── _config.tsx       # Global route config
│   │   ├── index.tsx         # GET /
│   │   ├── health.tsx        # GET /health
│   │   └── posts/
│   │       ├── _config.tsx   # Config for /posts/*
│   │       ├── index.tsx     # GET/POST /posts
│   │       └── [id].tsx      # GET/PUT/DELETE /posts/:id
│   ├── middleware/
│   │   └── auth.tsx          # JSX middleware!
│   └── tagliatelle.ts        # Framework core
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm run dev    # Development with hot reload
npm start      # Production
```

### 3. Test your API

```bash
curl http://localhost:3000/health
# {"status":"Al Dente 🍝","timestamp":"..."}

curl http://localhost:3000/posts
# {"success":true,"count":2,"data":[...]}
```

---

## 🍽️ Server Configuration

### `main.tsx`

```tsx
import { h, render, Server, Logger, Routes } from './tagliatelle.js';
import path from 'node:path';

const App = () => (
  <Server 
    port={3000} 
    cors={{ origin: true, credentials: true }}
  >
    <Logger level="info" />
    <Routes dir={path.join(__dirname, 'routes')} />
  </Server>
);

render(<App />);
```

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
import { h, Response, Status, Body, Err } from '../../tagliatelle.js';
import type { HandlerProps } from '../../types.js';

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
import { h, Fragment, Logger } from '../tagliatelle.js';

export default () => (
  <>
    <Logger level="info" />
  </>
);
```

### `routes/posts/_config.tsx` (Posts-specific)

```tsx
import { h, Fragment, Logger, Middleware, RateLimiter } from '../../tagliatelle.js';
import { authMiddleware } from '../../middleware/auth.tsx';

// Only require auth for write operations
const writeAuthMiddleware = async (props, request, reply) => {
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

### Config Components

| Component | Description |
|-----------|-------------|
| `<Logger level="debug" />` | Set log level for this directory |
| `<Middleware use={fn} />` | Add middleware (stacks with parent) |
| `<RateLimiter max={100} timeWindow="1 minute" />` | Rate limiting |
| `<Group prefix="/v1" />` | Add URL prefix |

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

// Error response
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
| `<Augment user={...} />` | Augment handler props (middleware) |

---

## 🌶️ Middleware

Middleware can use JSX components for responses and prop augmentation!

### Creating Middleware (JSX Style)

```tsx
// middleware/auth.tsx
import { h, Augment, Err } from '../tagliatelle.js';
import type { MiddlewareFunction } from '../types.js';

void h; // JSX factory

export const authMiddleware: MiddlewareFunction = async (props, request, reply) => {
  const apiKey = request.headers['x-api-key'];
  
  // Return JSX error response
  if (!apiKey) {
    return <Err code={401} message="Missing API key" />;
  }
  
  const user = await verifyToken(apiKey);
  
  // Augment props with JSX component
  return <Augment user={user} />;
};
```

### Middleware Components

| Component | Description |
|-----------|-------------|
| `<Err code={401} message="..." />` | Return error and halt chain |
| `<Augment user={...} />` | Add data to handler props |

### Middleware Factory Pattern

```tsx
// Role-based authorization factory
export function requireRole(role: string): MiddlewareFunction {
  return async (props, request, reply) => {
    const user = props.user;
    
    if (!user || user.role !== role) {
      return <Err code={403} message={`Requires "${role}" role`} />;
    }
    
    return; // Continue
  };
}

// Usage in _config.tsx
<Middleware use={requireRole('admin')} />
```

### Using Middleware

**In `_config.tsx`:**
```tsx
import { authMiddleware } from '../../middleware/auth.tsx';

<Middleware use={authMiddleware} />
```

**Per-route (in route file):**
```tsx
import { authMiddleware } from '../../middleware/auth.tsx';

export const middleware = [authMiddleware];

export async function POST({ body, user }: HandlerProps) {
  // user is available from <Augment> in middleware
}
```

---

## ⚙️ Handler Props

Every handler receives typed props:

```tsx
interface HandlerProps<TParams, TBody, TQuery> {
  params: TParams;       // URL parameters
  query: TQuery;         // Query string
  body: TBody;           // Request body
  headers: Record<string, string>;
  request: FastifyRequest;
  reply: FastifyReply;
  db: unknown;           // From DB provider
  log: Logger;           // Fastify logger
  user?: unknown;        // From auth middleware
}
```

---

## 🔧 Server Props

```tsx
<Server 
  port={3000}
  host="0.0.0.0"
  cors={{
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }}
>
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

## 🚀 Performance

Built on Fastify, you get:
- **100k+ requests/second** throughput
- **Low latency** JSON serialization
- **Schema validation** support
- **Automatic logging**

---

## 🤝 Contributing

Got a new "ingredient"? Open a Pull Request! We're looking for:

- [ ] WebSocket support (`<WebSocket />`)
- [ ] OpenAPI schema generation
- [ ] Static file serving (`<Static />`)
- [ ] GraphQL integration

---

## 📜 License

MIT

---

**Made with ❤️ and plenty of carbs. Buon appetito!** 🇮🇹
