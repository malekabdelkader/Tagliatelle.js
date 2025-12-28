/**
 * 🍝 TAGLIATELLE.JS - MONOLITH WITH MULTI-DB ARCHITECTURE
 * 
 * This demonstrates a clean monolith setup showcasing Tagliatelle features:
 * 
 * 🔐 AUTH DB - Identity & access management
 *    - Users, sessions, tokens, permissions
 *    - Routes: /auth/*
 * 
 * 📦 CONTENT DB - All platform content
 *    - Posts, comments, categories, tags, search, analytics
 *    - Routes: /posts/*, /categories/*, /tags/*, /search
 * 
 * Features demonstrated:
 * - Multiple <DB> providers in a single server
 * - Nested middleware composition
 * - File-based routing with _config.tsx
 * - JSX responses
 * - Rate limiting, CORS, logging
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, Server, Routes, RateLimiter, Logger, Cors, Middleware, DB } from 'tagliatelle';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔌 Plugins - using createPlugin API
import { Swagger, WS, Metrics } from './plugins/index.js';

// Database providers
import { createAuthDB } from './databases/authDB.js';
import { createContentDB } from './databases/contentDB.js';

// Global middleware
import { globalTimingMiddleware, requestLoggerMiddleware } from './middleware/global.js';

// Auth middleware
import { authMiddleware } from './middleware/auth.js';

// ═══════════════════════════════════════════════════════════════════════════
// 🍝 TAGLIATELLE SERVER - SINGLE PORT, MULTI-DB
// ═══════════════════════════════════════════════════════════════════════════

const App = () => (
  <Server port={3000} host="0.0.0.0">
    {/* 🔌 PLUGINS - Built with createPlugin API */}
    
    {/* 📚 Swagger/OpenAPI Documentation */}
    <Swagger 
      title="Tagliatelle.js API"
      version="1.0.0"
      description="🍝 Multi-DB Monolith Demo - Auth & Content APIs"
      path="/swagger"
      tags={[
        { name: 'auth', description: 'Authentication & user management' },
        { name: 'posts', description: 'Blog post operations' },
        { name: 'categories', description: 'Content categories' },
        { name: 'tags', description: 'Content tags' },
        { name: 'search', description: 'Search endpoints' },
        { name: 'system', description: 'Health & system info' }
      ]}
    />
    
    {/* 🔌 WebSocket - Real-time communication */}
    <WS path="/ws" />
    
    {/* 📈 Prometheus Metrics - Monitoring */}
    <Metrics path="/metrics" />
    
    <Cors origin={true} methods={["GET", "POST", "PUT", "PATCH", "DELETE"]}>
      <RateLimiter max={200} timeWindow="1 minute">
        <Logger level="info">
          <Middleware use={globalTimingMiddleware}>
            <Middleware use={requestLoggerMiddleware}>
              
              {/* 
                🏠 PAGES & HEALTH (No DB needed)
                Showcases HTML responses with JSX
                Includes /health check endpoint
              */}
              <Routes dir={path.join(__dirname, 'routes/pages')} />
              
              {/*
                🔐 AUTH ROUTES - Uses AuthDB
                Demonstrates: User management, sessions, token validation
              */}
              <DB provider={createAuthDB}>
                <Routes dir={path.join(__dirname, 'routes/auth')} prefix="/auth" />
              </DB>
              
              {/*
                📦 CONTENT ROUTES - Uses ContentDB  
                Demonstrates: Multi-resource DB, file-based routing
              */}
              <DB provider={createContentDB}>
                {/* Optional auth for viewing, required for mutations */}
                <Middleware use={authMiddleware}>
                  <Routes dir={path.join(__dirname, 'routes/posts')} prefix="/posts" />
                  <Routes dir={path.join(__dirname, 'routes/categories')} prefix="/categories" />
                  <Routes dir={path.join(__dirname, 'routes/tags')} prefix="/tags" />
                  <Routes dir={path.join(__dirname, 'routes/search')} prefix="/search" />
                </Middleware>
              </DB>
              
            </Middleware>
          </Middleware>
        </Logger>
      </RateLimiter>
    </Cors>
  </Server>
);

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 STARTUP
// ═══════════════════════════════════════════════════════════════════════════

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║              🍝 TAGLIATELLE.JS - MONOLITH MULTI-DB DEMO                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  🌐 SERVER → http://localhost:3000                                            ║
║                                                                               ║
║  🔌 PLUGINS (using createPlugin API)                                          ║
║     📚 Swagger  → /swagger   - OpenAPI documentation                          ║
║     🔌 WebSocket → /ws       - Real-time communication                        ║
║     📈 Metrics  → /metrics   - Prometheus monitoring                          ║
║                                                                               ║
║  📚 PAGES (JSX for HTML)                                                      ║
║     /           Landing page                                                  ║
║     /docs       Interactive documentation                                     ║
║                                                                               ║
║  🔐 AUTH ROUTES (AuthDB)                                                      ║
║     POST /auth/login       Login & get token                                  ║
║     POST /auth/register    Create account                                     ║
║     GET  /auth/me          Current user info                                  ║
║     GET  /auth/users       List users (admin)                                 ║
║                                                                               ║
║  📝 CONTENT ROUTES (ContentDB)                                                ║
║     GET  /posts            List posts                                         ║
║     POST /posts            Create post (auth required)                        ║
║     GET  /posts/:id        Get single post                                    ║
║     GET  /categories       List categories                                    ║
║     GET  /tags             List tags                                          ║
║     GET  /search?q=term    Search posts                                       ║
║                                                                               ║
║  ❤️ HEALTH                                                                     ║
║     GET  /health           System health check                                ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Two Databases:                                                               ║
║  • AuthDB: Users, sessions, tokens (identity)                                 ║
║  • ContentDB: Posts, comments, categories, tags (content)                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

render(<App />);
