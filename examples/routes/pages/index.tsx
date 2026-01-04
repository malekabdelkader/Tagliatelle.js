/**
 * 🍝 LANDING PAGE
 * 
 * GET / - Beautiful landing page showcasing Tagliatelle.js features
 * 
 * Demonstrates:
 * - Serving HTML with JSX components
 * - Code examples from the actual project
 */

import { Response, Status, Body, Headers } from 'tagliatelle';
import type { HandlerProps } from 'tagliatelle';

const landingHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🍝 Tagliatelle.js - The Declarative Backend Framework</title>
  <meta name="description" content="Build backend APIs with JSX. Type-safe, declarative, and delicious.">
  <meta name="keywords" content="typescript, jsx, backend, framework, fastify, api, nodejs">
  <meta property="og:title" content="Tagliatelle.js - JSX for the Backend">
  <meta property="og:description" content="Build backend APIs with JSX. The declarative backend framework.">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://malekabdelkader.github.io/Tagliatelle.js/">
  
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-S2CWXP1642"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-S2CWXP1642');
  </script>
  
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #08080c;
      --bg-card: #0f0f15;
      --bg-code: #0a0a0f;
      --bg-hover: #151520;
      --accent-gold: #f5a623;
      --accent-orange: #ff6b35;
      --accent-red: #ff4757;
      --accent-green: #2ed573;
      --accent-blue: #5352ed;
      --accent-purple: #a55eea;
      --text-primary: #fafafa;
      --text-secondary: #a8a8b3;
      --text-muted: #5c5c6d;
      --border-color: #1e1e2e;
      --border-glow: rgba(245, 166, 35, 0.15);
      --gradient-gold: linear-gradient(135deg, #f5a623 0%, #ff6b35 50%, #ff4757 100%);
      --gradient-subtle: linear-gradient(180deg, rgba(245, 166, 35, 0.03) 0%, transparent 100%);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    html { scroll-behavior: smooth; }
    
    body {
      font-family: 'Space Grotesk', -apple-system, sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      line-height: 1.7;
      overflow-x: hidden;
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(8, 8, 12, 0.8);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
    }
    
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
    }
    
    .nav-logo span { font-size: 1.6rem; }
    
    .nav-links {
      display: flex;
      gap: 32px;
      align-items: center;
    }
    
    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-links a:hover { color: var(--accent-gold); }
    
    .nav-links .btn-primary {
      background: var(--gradient-gold);
      color: #000;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 120px 20px 80px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      width: 1000px;
      height: 1000px;
      background: radial-gradient(circle, rgba(245, 166, 35, 0.06) 0%, transparent 60%);
      top: -300px;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
    }
    
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 900px;
    }
    
    .logo-icon {
      font-size: 5rem;
      margin-bottom: 24px;
      display: inline-block;
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(2deg); }
    }
    
    h1 {
      font-size: clamp(3rem, 8vw, 5rem);
      font-weight: 700;
      margin-bottom: 20px;
      background: var(--gradient-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      animation: fadeInUp 0.6s ease-out 0.1s both;
    }
    
    .tagline {
      font-size: clamp(1.1rem, 3vw, 1.4rem);
      color: var(--text-secondary);
      margin-bottom: 48px;
      font-weight: 400;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }
    
    .tagline strong {
      color: var(--text-primary);
      font-weight: 600;
    }
    
    /* CTA Buttons */
    .cta-row {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 64px;
      animation: fadeInUp 0.6s ease-out 0.3s both;
    }
    
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 28px;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      cursor: pointer;
    }
    
    .cta-btn.primary {
      background: var(--gradient-gold);
      color: #000;
      box-shadow: 0 4px 20px rgba(245, 166, 35, 0.25);
    }
    
    .cta-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(245, 166, 35, 0.35);
    }
    
    .cta-btn.secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    
    .cta-btn.secondary:hover {
      border-color: var(--accent-gold);
      background: var(--bg-hover);
    }
    
    /* Install Command */
    .install-cmd {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      background: var(--bg-code);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.95rem;
      margin-bottom: 64px;
      animation: fadeInUp 0.6s ease-out 0.4s both;
    }
    
    .install-cmd code {
      color: var(--accent-gold);
    }
    
    .install-cmd .dollar {
      color: var(--text-muted);
    }
    
    .copy-btn {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: var(--text-muted);
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
    
    .copy-btn.copied {
      background: rgba(46, 213, 115, 0.2);
      color: var(--accent-green);
    }
    
    .copy-btn .icon {
      transition: transform 0.2s;
    }
    
    .copy-btn.copied .icon {
      transform: scale(1.2);
    }
    
    /* Code Preview */
    .code-preview {
      background: var(--bg-code);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      text-align: left;
      max-width: 680px;
      margin: 0 auto;
      box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 0.6s ease-out 0.5s both;
    }
    
    .code-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-color);
    }
    
    .code-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .code-dot.red { background: #ff5f56; }
    .code-dot.yellow { background: #ffbd2e; }
    .code-dot.green { background: #27c93f; }
    
    .code-title {
      margin-left: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }
    
    .code-body {
      padding: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.9;
      overflow-x: auto;
      white-space: pre;
    }
    
    .code-body .comment { color: #5c5c6d; font-style: italic; }
    .code-body .keyword { color: #c792ea; }
    .code-body .component { color: #82aaff; }
    .code-body .prop { color: #c3e88d; }
    .code-body .string { color: #c3e88d; }
    .code-body .number { color: #f78c6c; }
    .code-body .bracket { color: #89ddff; }
    
    /* Features Section */
    .features {
      padding: 120px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 80px;
    }
    
    .section-header h2 {
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    
    .section-header p {
      color: var(--text-secondary);
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }
    
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 32px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient-gold);
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      border-color: rgba(245, 166, 35, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .feature-card:hover::before {
      opacity: 1;
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .feature-card p {
      color: var(--text-secondary);
      margin-bottom: 24px;
      font-size: 0.95rem;
    }
    
    .feature-code {
      background: var(--bg-code);
      border-radius: 10px;
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      white-space: pre;
      line-height: 1.6;
    }
    
    /* Examples Section */
    .examples {
      padding: 120px 20px;
      background: var(--gradient-subtle);
    }
    
    .examples-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .example-block {
      margin-bottom: 80px;
    }
    
    .example-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .example-number {
      width: 52px;
      height: 52px;
      background: var(--gradient-gold);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.3rem;
      color: #000;
      flex-shrink: 0;
    }
    
    .example-header h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .example-desc {
      color: var(--text-secondary);
      margin-bottom: 24px;
      font-size: 1.05rem;
    }
    
    .example-code {
      background: var(--bg-code);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .example-code-header {
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--border-color);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    
    .example-code-body {
      padding: 24px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.8;
      overflow-x: auto;
      white-space: pre;
    }
    
    /* Response Preview */
    .response-preview {
      margin-top: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .response-header {
      padding: 12px 18px;
      background: rgba(46, 213, 115, 0.08);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
    }
    
    .response-header .status {
      color: var(--accent-green);
      font-weight: 600;
    }
    
    .response-body {
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: pre;
    }
    
    /* Stats Section */
    .stats {
      padding: 80px 20px;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
    }
    
    .stat-item h4 {
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--gradient-gold);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    
    .stat-item p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    
    /* CTA Section */
    .cta-section {
      padding: 120px 20px;
      text-align: center;
    }
    
    .cta-section h2 {
      font-size: clamp(2rem, 5vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .cta-section p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin-bottom: 40px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Footer */
    footer {
      text-align: center;
      padding: 60px 20px;
      border-top: 1px solid var(--border-color);
    }
    
    footer p {
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    
    footer a {
      color: var(--accent-gold);
      text-decoration: none;
      transition: opacity 0.2s;
    }
    
    footer a:hover { opacity: 0.8; }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
    }
    
    /* Mobile */
    @media (max-width: 768px) {
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      .hero { padding: 100px 20px 60px; }
      .features-grid { grid-template-columns: 1fr; }
      .code-preview { margin: 0 -10px; border-radius: 12px; }
      .example-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  </style>
</head>
<body>
  <nav>
    <a href="./" class="nav-logo">
      <span>🍝</span> Tagliatelle.js
    </a>
    <div class="nav-links">
      <a href="./docs.html">Documentation</a>
      <a href="https://www.npmjs.com/package/tagliatelle">NPM</a>
      <a href="https://github.com/malekabdelkader/Tagliatelle.js" class="btn-primary">GitHub ⭐</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <div class="logo-icon">🍝</div>
      <h1>Tagliatelle.js</h1>
      <p class="tagline">
        The <strong>Declarative Backend Framework</strong>.<br>
        Build APIs with JSX. Type-safe, composable, delicious.
      </p>
      
      <div class="cta-row">
        <a href="./docs.html" class="cta-btn primary">Get Started →</a>
        <a href="https://github.com/malekabdelkader/Tagliatelle.js" class="cta-btn secondary">View on GitHub</a>
      </div>
      
      <div class="install-cmd">
        <code><span class="dollar">$</span> npx tagliatelle init my-api</code>
        <button class="copy-btn" id="copyBtn" onclick="copyCommand()">
          <span class="icon" id="copyIcon">📋</span>
          <span id="copyText">Copy</span>
        </button>
      </div>
      
      <script>
        function copyCommand() {
          navigator.clipboard.writeText('npx tagliatelle init my-api');
          const btn = document.getElementById('copyBtn');
          const icon = document.getElementById('copyIcon');
          const text = document.getElementById('copyText');
          
          btn.classList.add('copied');
          icon.textContent = '✓';
          text.textContent = 'Copied!';
          
          setTimeout(() => {
            btn.classList.remove('copied');
            icon.textContent = '📋';
            text.textContent = 'Copy';
          }, 2000);
        }
      </script>
      
      <div class="code-preview">
        <div class="code-header">
          <div class="code-dot red"></div>
          <div class="code-dot yellow"></div>
          <div class="code-dot green"></div>
          <span class="code-title">server.tsx</span>
        </div>
        <div class="code-body">
<span class="keyword">const</span> App = () => (
  <span class="bracket">&lt;</span><span class="component">Server</span> <span class="prop">port</span>=<span class="bracket">{</span><span class="number">3000</span><span class="bracket">}</span><span class="bracket">&gt;</span>
    <span class="bracket">&lt;</span><span class="component">Swagger</span> <span class="prop">title</span>=<span class="string">"My API"</span> <span class="bracket">/&gt;</span>
    <span class="bracket">&lt;</span><span class="component">Logger</span> <span class="prop">level</span>=<span class="string">"info"</span><span class="bracket">&gt;</span>
      <span class="bracket">&lt;</span><span class="component">RateLimiter</span> <span class="prop">max</span>=<span class="bracket">{</span><span class="number">100</span><span class="bracket">}</span><span class="bracket">&gt;</span>
        <span class="bracket">&lt;</span><span class="component">DB</span> <span class="prop">provider</span>=<span class="bracket">{</span>createDB<span class="bracket">}</span><span class="bracket">&gt;</span>
          <span class="bracket">&lt;</span><span class="component">Routes</span> <span class="prop">dir</span>=<span class="string">"./routes"</span> <span class="bracket">/&gt;</span>
        <span class="bracket">&lt;/</span><span class="component">DB</span><span class="bracket">&gt;</span>
      <span class="bracket">&lt;/</span><span class="component">RateLimiter</span><span class="bracket">&gt;</span>
    <span class="bracket">&lt;/</span><span class="component">Logger</span><span class="bracket">&gt;</span>
  <span class="bracket">&lt;/</span><span class="component">Server</span><span class="bracket">&gt;</span>
);

render(<span class="bracket">&lt;</span><span class="component">App</span> <span class="bracket">/&gt;</span>);
        </div>
      </div>
    </div>
  </section>
  
  <section class="features">
    <div class="section-header">
      <h2>Why Tagliatelle?</h2>
      <p>Familiar syntax meets powerful backend patterns. Configure once, compose everywhere.</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🌳</div>
        <h3>Visual Architecture</h3>
        <p>Your component tree IS your middleware chain. Nesting defines the request flow.</p>
        <div class="feature-code">
<span style="color:#c792ea">&lt;Cors&gt;</span>
  <span style="color:#82aaff">&lt;Auth&gt;</span>
    <span style="color:#ffcb6b">&lt;Routes /&gt;</span>
  <span style="color:#82aaff">&lt;/Auth&gt;</span>
<span style="color:#c792ea">&lt;/Cors&gt;</span>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Multi-Context</h3>
        <p>Scope databases, loggers, rate limits—any context—to specific route branches.</p>
        <div class="feature-code">
<span style="color:#82aaff">&lt;DB</span> <span style="color:#c3e88d">provider</span>=<span style="color:#89ddff">{</span>authDB<span style="color:#89ddff">}</span><span style="color:#82aaff">&gt;</span>
  <span style="color:#ffcb6b">&lt;Logger</span> <span style="color:#c3e88d">level</span>=<span style="color:#c3e88d">"debug"</span><span style="color:#ffcb6b">&gt;</span>
    &lt;Routes dir="./auth" /&gt;
  <span style="color:#ffcb6b">&lt;/Logger&gt;</span>
<span style="color:#82aaff">&lt;/DB&gt;</span>
<span style="color:#c792ea">&lt;DB</span> <span style="color:#c3e88d">provider</span>=<span style="color:#89ddff">{</span>contentDB<span style="color:#89ddff">}</span><span style="color:#c792ea">&gt;</span>
  &lt;Routes dir="./posts" /&gt;
<span style="color:#c792ea">&lt;/DB&gt;</span>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📁</div>
        <h3>File-Based Routing</h3>
        <p>Routes are files. Dynamic params use [brackets]. Zero configuration.</p>
        <div class="feature-code">
routes/
├── index.tsx      → /
├── posts/
│   ├── index.tsx  → /posts
│   └── [id].tsx   → /posts/:id
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>AI-Friendly Code</h3>
        <p>Faster development. Visual structure that AI assistants understand instantly.</p>
        <div class="feature-code">
<span style="color:#5c5c6d">// Why AI loves JSX backends:</span>
<span style="color:#c3e88d">✓</span> Visual hierarchy = clear intent
<span style="color:#c3e88d">✓</span> Familiar JSX syntax
<span style="color:#c3e88d">✓</span> Less boilerplate, less errors
<span style="color:#c3e88d">✓</span> Self-documenting structure
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔌</div>
        <h3>Plugin System</h3>
        <p>Wrap any Fastify plugin as a JSX component. Swagger, WebSocket, GraphQL—anything.</p>
        <div class="feature-code">
<span style="color:#82aaff">&lt;Swagger</span> <span style="color:#c3e88d">title</span>=<span style="color:#c3e88d">"API"</span> <span style="color:#82aaff">/&gt;</span>
<span style="color:#ffcb6b">&lt;WebSocket</span> <span style="color:#c3e88d">path</span>=<span style="color:#c3e88d">"/ws"</span> <span style="color:#ffcb6b">/&gt;</span>
<span style="color:#c792ea">&lt;Redis</span> <span style="color:#c3e88d">url</span>=<span style="color:#c3e88d">"redis://..."</span> <span style="color:#c792ea">/&gt;</span>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <h3>Type-Safe</h3>
        <p>Full TypeScript support. Typed params, body, query—end to end.</p>
        <div class="feature-code">
<span style="color:#c792ea">export async function</span> <span style="color:#82aaff">GET</span>({
  params,  <span style="color:#5c5c6d">// typed!</span>
  body,    <span style="color:#5c5c6d">// typed!</span>
  db,      <span style="color:#5c5c6d">// typed!</span>
}: <span style="color:#ffcb6b">HandlerProps</span>&lt;Params&gt;) {
  <span style="color:#5c5c6d">// ...</span>
}
        </div>
      </div>
    </div>
  </section>
  
  <section class="stats">
    <div class="stats-grid">
      <div class="stat-item">
        <h4>100k+</h4>
        <p>Requests/second (Fastify)</p>
      </div>
      <div class="stat-item">
        <h4>0</h4>
        <p>Runtime dependencies</p>
      </div>
      <div class="stat-item">
        <h4>100%</h4>
        <p>TypeScript</p>
      </div>
      <div class="stat-item">
        <h4>MIT</h4>
        <p>Open Source</p>
      </div>
    </div>
  </section>
  
  <section class="examples">
    <div class="examples-container">
      <div class="section-header">
        <h2>See It In Action</h2>
        <p>Real code patterns from production apps.</p>
      </div>
      
      <div class="example-block">
        <div class="example-header">
          <div class="example-number">1</div>
          <h3>Route Handler with JSX Response</h3>
        </div>
        <p class="example-desc">HTTP methods are exported functions. Return JSX to send responses.</p>
        <div class="example-code">
          <div class="example-code-header">routes/posts/[id].tsx</div>
          <div class="example-code-body">
<span style="color:#c792ea">export async function</span> <span style="color:#82aaff">GET</span>({ params, db }: HandlerProps) {
  <span style="color:#c792ea">const</span> post = db.posts.findById(params.id);
  
  <span style="color:#c792ea">if</span> (!post) {
    <span style="color:#c792ea">return</span> <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Err</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">404</span><span style="color:#89ddff">}</span> <span style="color:#c3e88d">message</span>=<span style="color:#c3e88d">"Not found"</span> <span style="color:#89ddff">/&gt;</span>;
  }
  
  <span style="color:#c792ea">return</span> (
    <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
      <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Status</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">200</span><span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
      <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Body</span> <span style="color:#c3e88d">data</span>=<span style="color:#89ddff">{</span>{ success: <span style="color:#f78c6c">true</span>, data: post }<span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
    <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
  );
}
          </div>
        </div>
        <div class="response-preview">
          <div class="response-header">
            <span>Response</span>
            <span class="status">200 OK</span>
          </div>
          <div class="response-body">
{
  "success": true,
  "data": {
    "id": "post_1",
    "title": "Getting Started with Tagliatelle.js",
    "author": "chef"
  }
}
          </div>
        </div>
      </div>
      
      <div class="example-block">
        <div class="example-header">
          <div class="example-number">2</div>
          <h3>Middleware with Augmented Props</h3>
        </div>
        <p class="example-desc">Middleware can add data to handler props using &lt;Augment&gt;.</p>
        <div class="example-code">
          <div class="example-code-header">middleware/auth.tsx</div>
          <div class="example-code-body">
<span style="color:#c792ea">export const</span> <span style="color:#82aaff">authMiddleware</span> = <span style="color:#c792ea">async</span> (props, request) => {
  <span style="color:#c792ea">const</span> token = request.headers.authorization;
  
  <span style="color:#c792ea">if</span> (!token) {
    <span style="color:#c792ea">return</span> <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Err</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">401</span><span style="color:#89ddff">}</span> <span style="color:#c3e88d">message</span>=<span style="color:#c3e88d">"Unauthorized"</span> <span style="color:#89ddff">/&gt;</span>;
  }
  
  <span style="color:#c792ea">const</span> user = <span style="color:#c792ea">await</span> validateToken(token);
  
  <span style="color:#5c5c6d">// Add user to props for downstream handlers</span>
  <span style="color:#c792ea">return</span> <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Augment</span> <span style="color:#c3e88d">user</span>=<span style="color:#89ddff">{</span>user<span style="color:#89ddff">}</span> <span style="color:#c3e88d">isAuthenticated</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">true</span><span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>;
};
          </div>
        </div>
      </div>
      
      <div class="example-block">
        <div class="example-header">
          <div class="example-number">3</div>
          <h3>Directory Config Files</h3>
        </div>
        <p class="example-desc">Apply middleware to entire route directories with _config.tsx.</p>
        <div class="example-code">
          <div class="example-code-header">routes/admin/_config.tsx</div>
          <div class="example-code-body">
<span style="color:#c792ea">import</span> { Middleware, Logger } <span style="color:#c792ea">from</span> <span style="color:#c3e88d">'tagliatelle'</span>;
<span style="color:#c792ea">import</span> { requireRole } <span style="color:#c792ea">from</span> <span style="color:#c3e88d">'../../middleware/auth'</span>;

<span style="color:#5c5c6d">// All routes in /admin/* require admin role</span>
<span style="color:#c792ea">export default</span> () => (
  <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Logger</span> <span style="color:#c3e88d">level</span>=<span style="color:#c3e88d">"debug"</span><span style="color:#89ddff">&gt;</span>
    <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Middleware</span> <span style="color:#c3e88d">use</span>=<span style="color:#89ddff">{</span>requireRole(<span style="color:#c3e88d">'admin'</span>)<span style="color:#89ddff">}</span><span style="color:#89ddff">&gt;</span>
      {children}
    <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Middleware</span><span style="color:#89ddff">&gt;</span>
  <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Logger</span><span style="color:#89ddff">&gt;</span>
);
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <section class="cta-section">
    <h2>Ready to cook? 🍝</h2>
    <p>Get started in under a minute. Zero config, full TypeScript.</p>
    <div class="cta-row">
      <a href="./docs.html" class="cta-btn primary">Read the Docs →</a>
      <a href="https://github.com/malekabdelkader/Tagliatelle.js" class="cta-btn secondary">Star on GitHub ⭐</a>
    </div>
  </section>
  
  <footer>
    <p>🍝 Built with Tagliatelle.js v1.0.0</p>
    <div class="footer-links">
      <a href="./docs.html">Documentation</a>
      <a href="https://www.npmjs.com/package/tagliatelle">NPM Package</a>
      <a href="https://github.com/malekabdelkader/Tagliatelle.js">GitHub</a>
    </div>
    <p style="margin-top: 24px; font-size: 0.9rem;">Made with ❤️ and plenty of carbs. Chahya Tayba! 🇹🇳</p>
  </footer>
</body>
</html>
`;

export async function GET({ log }: HandlerProps) {
  log.info('🏠 Serving landing page');
  
  return (
    <Response>
      <Status code={200} />
      <Headers headers={{ 'Content-Type': 'text/html; charset=utf-8' }} />
      <Body data={landingHTML} />
    </Response>
  );
}
