/**
 * 🌐 PLATFORM SERVICE - Landing Page
 * 
 * GET / - Beautiful HTML landing page describing the entire system
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

const landingHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🍝 Tagliatelle.js - Microservices Platform</title>
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
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --border-color: #1e293b;
      --gradient-1: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      --gradient-2: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      --gradient-3: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }
    
    .hero {
      position: relative;
      padding: 80px 20px 60px;
      text-align: center;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: 
        radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 70% 60%, rgba(78, 205, 196, 0.06) 0%, transparent 40%),
        radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 40%);
      animation: pulse 15s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(5deg); }
    }
    
    .hero-content { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
    
    .logo {
      font-size: 4rem;
      margin-bottom: 10px;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 8px;
      background: var(--gradient-1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .tagline {
      font-size: 1.4rem;
      color: var(--text-secondary);
      margin-bottom: 30px;
    }
    
    .badge-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 50px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: blink 2s ease-in-out infinite;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    
    .services {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }
    
    .service-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 28px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    
    .service-card:hover {
      background: var(--bg-card-hover);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .service-card.auth::before { background: var(--gradient-1); }
    .service-card.blog::before { background: var(--gradient-2); }
    .service-card.platform::before { background: var(--gradient-3); }
    
    .service-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    
    .service-icon {
      font-size: 2.2rem;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .auth .service-icon { background: rgba(255, 107, 53, 0.15); }
    .blog .service-icon { background: rgba(78, 205, 196, 0.15); }
    .platform .service-icon { background: rgba(168, 85, 247, 0.15); }
    
    .service-title {
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    .service-team {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .service-desc {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-bottom: 20px;
    }
    
    .service-url {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--accent-blue);
      text-decoration: none;
      margin-bottom: 20px;
      transition: background 0.2s;
    }
    
    .service-url:hover { background: rgba(255, 255, 255, 0.1); }
    
    .endpoints {
      border-top: 1px solid var(--border-color);
      padding-top: 18px;
    }
    
    .endpoints-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    
    .endpoint {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      font-size: 0.85rem;
    }
    
    .method {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
    }
    
    .method.get { background: rgba(34, 197, 94, 0.2); color: var(--accent-green); }
    .method.post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .method.put { background: rgba(251, 191, 36, 0.2); color: var(--accent-yellow); }
    .method.delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    
    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-secondary);
    }
    
    .architecture {
      max-width: 1200px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }
    
    .section-title {
      font-size: 1.8rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 40px;
    }
    
    .arch-diagram {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 40px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      line-height: 1.8;
      overflow-x: auto;
      white-space: pre;
      color: var(--text-secondary);
    }
    
    .try-it {
      max-width: 800px;
      margin: 0 auto 60px;
      padding: 0 20px;
    }
    
    .code-block {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    
    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .code-content {
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.7;
      overflow-x: auto;
    }
    
    .code-comment { color: var(--text-muted); }
    .code-string { color: var(--accent-green); }
    .code-url { color: var(--accent-blue); }
    
    footer {
      text-align: center;
      padding: 40px 20px;
      border-top: 1px solid var(--border-color);
      color: var(--text-muted);
    }
    
    footer a {
      color: var(--accent-orange);
      text-decoration: none;
    }
    
    .nav-links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 40px;
    }
    
    .nav-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      background: var(--bg-card-hover);
      border-color: var(--accent-orange);
    }
    
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .tagline { font-size: 1.1rem; }
      .services { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="hero-content">
      <div class="logo">🍝</div>
      <h1>Tagliatelle.js</h1>
      <p class="tagline">Microservices Architecture Demo • JSX for the Backend</p>
      
      <div class="badge-row">
        <span class="badge">
          <span class="badge-dot" style="background: var(--accent-green);"></span>
          3 Services Running
        </span>
        <span class="badge">
          <span class="badge-dot" style="background: var(--accent-blue);"></span>
          3 Isolated Databases
        </span>
        <span class="badge">
          <span class="badge-dot" style="background: var(--accent-purple);"></span>
          Cross-Service Auth
        </span>
      </div>
      
      <div class="nav-links">
        <a href="/api" class="nav-link">📡 API Dashboard</a>
        <a href="/health" class="nav-link">❤️ Health Check</a>
        <a href="/docs" class="nav-link">📚 Documentation</a>
      </div>
    </div>
  </section>
  
  <section class="services">
    <div class="service-card auth">
      <div class="service-header">
        <div class="service-icon">🔐</div>
        <div>
          <div class="service-title">Auth Service</div>
          <div class="service-team">Identity & Access Team</div>
        </div>
      </div>
      <p class="service-desc">Centralized authentication and authorization. Manages users, sessions, tokens, and permissions. Other services validate tokens here.</p>
      <a href="http://localhost:3001/auth" class="service-url" target="_blank">
        <span>→</span> localhost:3001/auth
      </a>
      <div class="endpoints">
        <div class="endpoints-title">Key Endpoints</div>
        <div class="endpoint"><span class="method post">POST</span><span class="endpoint-path">/auth/login</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="endpoint-path">/auth/register</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="endpoint-path">/auth/verify</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/auth/users</span></div>
      </div>
    </div>
    
    <div class="service-card blog">
      <div class="service-header">
        <div class="service-icon">📝</div>
        <div>
          <div class="service-title">Blog Service</div>
          <div class="service-team">Content & Media Team</div>
        </div>
      </div>
      <p class="service-desc">Content management system. Handles posts, comments, likes, and drafts. Validates auth tokens via the Auth Service API.</p>
      <a href="http://localhost:3002/posts" class="service-url" target="_blank">
        <span>→</span> localhost:3002/posts
      </a>
      <div class="endpoints">
        <div class="endpoints-title">Key Endpoints</div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/posts</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="endpoint-path">/posts</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/posts/:id/comments</span></div>
        <div class="endpoint"><span class="method post">POST</span><span class="endpoint-path">/posts/:id/like</span></div>
      </div>
    </div>
    
    <div class="service-card platform">
      <div class="service-header">
        <div class="service-icon">🌐</div>
        <div>
          <div class="service-title">Platform Service</div>
          <div class="service-team">Platform & Infrastructure Team</div>
        </div>
      </div>
      <p class="service-desc">Infrastructure layer. Manages categories, tags, search index, and analytics. Aggregates data from all services.</p>
      <a href="http://localhost:3003/api" class="service-url" target="_blank">
        <span>→</span> localhost:3003/api
      </a>
      <div class="endpoints">
        <div class="endpoints-title">Key Endpoints</div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/categories</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/tags</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/search?q=term</span></div>
        <div class="endpoint"><span class="method get">GET</span><span class="endpoint-path">/analytics</span></div>
      </div>
    </div>
  </section>
  
  <section class="architecture">
    <h2 class="section-title">🏗️ Architecture Overview</h2>
    <div class="arch-diagram">
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              MICROSERVICES ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐             │
│   │  🔐 AUTH SERVICE │    │  📝 BLOG SERVICE │    │ 🌐 PLATFORM SVC  │             │
│   │    Port 3001     │◄───│    Port 3002     │    │    Port 3003     │             │
│   │                  │    │                  │    │         │        │             │
│   │  • Login/Logout  │    │  • Posts CRUD    │    │         ▼        │             │
│   │  • Token Verify  │    │  • Comments      │────►  Aggregates Data │             │
│   │  • User Mgmt     │    │  • Likes         │    │  from all services│             │
│   └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘             │
│            │                       │                       │                        │
│            ▼                       ▼                       ▼                        │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐             │
│   │    AUTH DB 🗄️    │    │    BLOG DB 🗄️    │    │  PLATFORM DB 🗄️  │             │
│   │  Users, Sessions │    │  Posts, Comments │    │ Categories, Tags │             │
│   │  Tokens, API Keys│    │  Likes, Drafts   │    │ Analytics, Search│             │
│   └──────────────────┘    └──────────────────┘    └──────────────────┘             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
    </div>
  </section>
  
  <section class="try-it">
    <h2 class="section-title">🧪 Try It Now</h2>
    
    <div class="code-block">
      <div class="code-header">
        <span>Login to Auth Service</span>
        <span>bash</span>
      </div>
      <div class="code-content">
<span class="code-comment"># Authenticate and get a token</span>
curl -X POST <span class="code-url">http://localhost:3001/auth/login</span> \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -d <span class="code-string">'{"email": "admin@company.io", "password": "admin_123"}'</span>
      </div>
    </div>
    
    <div class="code-block">
      <div class="code-header">
        <span>Create a Blog Post</span>
        <span>bash</span>
      </div>
      <div class="code-content">
<span class="code-comment"># Use the token to create content (validated via Auth Service)</span>
curl -X POST <span class="code-url">http://localhost:3002/posts</span> \\
  -H <span class="code-string">"Authorization: Bearer token_editor_456"</span> \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -d <span class="code-string">'{"title": "My Post", "content": "Hello!", "publish": true}'</span>
      </div>
    </div>
    
    <div class="code-block">
      <div class="code-header">
        <span>Search Across Services</span>
        <span>bash</span>
      </div>
      <div class="code-content">
<span class="code-comment"># Platform service aggregates from Auth + Blog</span>
curl <span class="code-url">"http://localhost:3003/search?q=microservices"</span>
      </div>
    </div>
  </section>
  
  <footer>
    <p>Built with <a href="https://github.com/yourusername/tagliatelle">🍝 Tagliatelle.js</a> v1.0.0-beta.5</p>
    <p style="margin-top: 8px; font-size: 0.85rem;">JSX for the Backend • Multiple Servers • Isolated Databases</p>
  </footer>
</body>
</html>
`;

export async function GET({ log }: HandlerProps) {
  log.info('🏠 Landing page served');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      }} />
      <Body data={landingHTML} />
    </Response>
  );
}

