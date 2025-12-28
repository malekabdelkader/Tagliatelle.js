/**
 * 🌐 PLATFORM SERVICE - Documentation Page
 * 
 * GET /docs - Interactive API documentation
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

const docsHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📚 API Documentation - Tagliatelle.js</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0a0a0f;
      --bg-card: #12121a;
      --bg-card-hover: #1a1a25;
      --accent-orange: #ff6b35;
      --accent-blue: #4ecdc4;
      --accent-purple: #a855f7;
      --accent-green: #22c55e;
      --accent-yellow: #fbbf24;
      --accent-red: #ef4444;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border-color: #1e293b;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Space Grotesk', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      line-height: 1.6;
    }
    
    .container {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 100vh;
    }
    
    .sidebar {
      background: var(--bg-card);
      border-right: 1px solid var(--border-color);
      padding: 24px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .nav-section {
      margin-bottom: 24px;
    }
    
    .nav-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    
    .nav-link {
      display: block;
      padding: 10px 14px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.2s;
      margin-bottom: 4px;
    }
    
    .nav-link:hover {
      background: var(--bg-card-hover);
      color: var(--text-primary);
    }
    
    .nav-link.active {
      background: rgba(255, 107, 53, 0.1);
      color: var(--accent-orange);
    }
    
    .main {
      padding: 40px 60px;
      max-width: 1000px;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    
    h2 {
      font-size: 1.6rem;
      margin: 50px 0 20px;
      padding-top: 30px;
      border-top: 1px solid var(--border-color);
    }
    
    h3 {
      font-size: 1.2rem;
      margin: 30px 0 16px;
      color: var(--accent-blue);
    }
    
    p {
      color: var(--text-secondary);
      margin-bottom: 16px;
    }
    
    .intro {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 40px;
    }
    
    .endpoint-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-color);
    }
    
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
    }
    
    .method.get { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
    .method.post { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .method.put { background: rgba(251, 191, 36, 0.15); color: var(--accent-yellow); }
    .method.delete { background: rgba(239, 68, 68, 0.15); color: var(--accent-red); }
    
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    
    .endpoint-body {
      padding: 20px;
    }
    
    .endpoint-desc {
      color: var(--text-secondary);
      margin-bottom: 16px;
    }
    
    .params-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 10px;
    }
    
    .param {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .param:last-child { border-bottom: none; }
    
    .param-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--accent-purple);
      min-width: 120px;
    }
    
    .param-type {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: var(--bg-dark);
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .param-desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    
    .code-example {
      background: var(--bg-dark);
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      overflow-x: auto;
    }
    
    .response-example {
      background: var(--bg-dark);
      border-radius: 8px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      white-space: pre;
    }
    
    .token-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    
    .token-table th, .token-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    .token-table th {
      background: var(--bg-card);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
    }
    
    .token-table td {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
    }
    
    .badge.admin { background: rgba(239, 68, 68, 0.15); color: var(--accent-red); }
    .badge.editor { background: rgba(251, 191, 36, 0.15); color: var(--accent-yellow); }
    .badge.user { background: rgba(34, 197, 94, 0.15); color: var(--accent-green); }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    
    .back-link:hover { color: var(--accent-orange); }
    
    @media (max-width: 900px) {
      .container { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .main { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <aside class="sidebar">
      <div class="logo">🍝 <span>Docs</span></div>
      
      <nav class="nav-section">
        <div class="nav-title">Getting Started</div>
        <a href="#overview" class="nav-link active">Overview</a>
        <a href="#authentication" class="nav-link">Authentication</a>
        <a href="#test-tokens" class="nav-link">Test Tokens</a>
      </nav>
      
      <nav class="nav-section">
        <div class="nav-title">Auth Service</div>
        <a href="#auth-login" class="nav-link">POST /auth/login</a>
        <a href="#auth-register" class="nav-link">POST /auth/register</a>
        <a href="#auth-verify" class="nav-link">POST /auth/verify</a>
        <a href="#auth-users" class="nav-link">GET /auth/users</a>
      </nav>
      
      <nav class="nav-section">
        <div class="nav-title">Blog Service</div>
        <a href="#blog-list" class="nav-link">GET /posts</a>
        <a href="#blog-create" class="nav-link">POST /posts</a>
        <a href="#blog-single" class="nav-link">GET /posts/:id</a>
        <a href="#blog-comments" class="nav-link">Comments & Likes</a>
      </nav>
      
      <nav class="nav-section">
        <div class="nav-title">Platform Service</div>
        <a href="#platform-search" class="nav-link">GET /search</a>
        <a href="#platform-categories" class="nav-link">Categories</a>
        <a href="#platform-health" class="nav-link">Health Check</a>
      </nav>
      
      <nav class="nav-section">
        <a href="/" class="nav-link">← Back to Home</a>
      </nav>
    </aside>
    
    <main class="main">
      <a href="/" class="back-link">← Back to Home</a>
      
      <h1>📚 API Documentation</h1>
      <p class="intro">
        Complete reference for the Tagliatelle.js Microservices Platform. 
        Three independent services working together with isolated databases.
      </p>
      
      <h2 id="overview">Overview</h2>
      <p>This platform consists of three microservices:</p>
      <ul style="color: var(--text-secondary); padding-left: 24px; margin-bottom: 20px;">
        <li><strong style="color: var(--accent-orange);">Auth Service</strong> (port 3001) - Authentication & user management</li>
        <li><strong style="color: var(--accent-blue);">Blog Service</strong> (port 3002) - Content management (posts, comments)</li>
        <li><strong style="color: var(--accent-purple);">Platform Service</strong> (port 3003) - Infrastructure (categories, search, analytics)</li>
      </ul>
      
      <h2 id="authentication">Authentication</h2>
      <p>The platform uses Bearer token authentication. Include the token in the Authorization header:</p>
      <div class="code-example">
Authorization: Bearer &lt;token&gt;
      </div>
      <p style="margin-top: 16px;">The Blog Service validates tokens against the Auth Service for every authenticated request.</p>
      
      <h2 id="test-tokens">Test Tokens</h2>
      <p>Use these pre-configured tokens for testing:</p>
      <table class="token-table">
        <tr>
          <th>Token</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
        <tr>
          <td>token_admin_123</td>
          <td>admin@company.io</td>
          <td><span class="badge admin">admin</span></td>
        </tr>
        <tr>
          <td>token_editor_456</td>
          <td>editor@company.io</td>
          <td><span class="badge editor">editor</span></td>
        </tr>
        <tr>
          <td>token_reader_789</td>
          <td>reader@company.io</td>
          <td><span class="badge user">user</span></td>
        </tr>
      </table>
      
      <h2 id="auth-login">Auth Service Endpoints</h2>
      
      <div class="endpoint-card" id="auth-login">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <span class="endpoint-path">/auth/login</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">Authenticate a user and receive a session token.</p>
          <div class="params-title">Request Body</div>
          <div class="param">
            <span class="param-name">email</span>
            <span class="param-type">string</span>
            <span class="param-desc">User email address</span>
          </div>
          <div class="param">
            <span class="param-name">password</span>
            <span class="param-type">string</span>
            <span class="param-desc">User password</span>
          </div>
          <div class="code-example">
curl -X POST http://localhost:3001/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@company.io", "password": "admin_123"}'
          </div>
        </div>
      </div>
      
      <div class="endpoint-card" id="auth-register">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <span class="endpoint-path">/auth/register</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">Create a new user account.</p>
          <div class="params-title">Request Body</div>
          <div class="param">
            <span class="param-name">email</span>
            <span class="param-type">string</span>
            <span class="param-desc">Email address (must be unique)</span>
          </div>
          <div class="param">
            <span class="param-name">password</span>
            <span class="param-type">string</span>
            <span class="param-desc">Password (min 6 characters)</span>
          </div>
          <div class="param">
            <span class="param-name">name</span>
            <span class="param-type">string</span>
            <span class="param-desc">Display name</span>
          </div>
        </div>
      </div>
      
      <h2 id="blog-list">Blog Service Endpoints</h2>
      
      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="endpoint-path">/posts</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">List all published posts. No authentication required.</p>
          <div class="code-example">
curl http://localhost:3002/posts
          </div>
        </div>
      </div>
      
      <div class="endpoint-card" id="blog-create">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <span class="endpoint-path">/posts</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">Create a new blog post. Requires editor or admin role.</p>
          <div class="params-title">Request Body</div>
          <div class="param">
            <span class="param-name">title</span>
            <span class="param-type">string</span>
            <span class="param-desc">Post title</span>
          </div>
          <div class="param">
            <span class="param-name">content</span>
            <span class="param-type">string</span>
            <span class="param-desc">Post content</span>
          </div>
          <div class="param">
            <span class="param-name">publish</span>
            <span class="param-type">boolean</span>
            <span class="param-desc">Publish immediately (default: false)</span>
          </div>
          <div class="code-example">
curl -X POST http://localhost:3002/posts \\
  -H "Authorization: Bearer token_editor_456" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "My Post", "content": "Content...", "publish": true}'
          </div>
        </div>
      </div>
      
      <h2 id="platform-search">Platform Service Endpoints</h2>
      
      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="endpoint-path">/search?q=term</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">Search across all services. Returns posts, categories, and tags matching the query.</p>
          <div class="params-title">Query Parameters</div>
          <div class="param">
            <span class="param-name">q</span>
            <span class="param-type">string</span>
            <span class="param-desc">Search term (required)</span>
          </div>
          <div class="code-example">
curl "http://localhost:3003/search?q=microservices"
          </div>
        </div>
      </div>
      
      <div class="endpoint-card" id="platform-health">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <span class="endpoint-path">/health</span>
        </div>
        <div class="endpoint-body">
          <p class="endpoint-desc">System-wide health check. Checks connectivity to all services.</p>
          <div class="code-example">
curl http://localhost:3003/health
          </div>
          <div class="response-example" style="margin-top: 16px;">
{
  "status": "healthy",
  "services": [
    { "service": "auth", "status": "healthy", "responseTime": 12 },
    { "service": "blog", "status": "healthy", "responseTime": 18 },
    { "service": "platform", "status": "healthy", "responseTime": 8 }
  ]
}
          </div>
        </div>
      </div>
      
    </main>
  </div>
</body>
</html>
`;

export async function GET({ log }: HandlerProps) {
  log.info('📚 Documentation page served');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      }} />
      <Body data={docsHTML} />
    </Response>
  );
}

