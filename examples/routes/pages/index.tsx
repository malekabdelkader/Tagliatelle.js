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
  <title>🍝 Tagliatelle.js - JSX for the Backend</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0c0c14;
      --bg-card: #13131f;
      --bg-code: #0a0a12;
      --accent-pasta: #ffa726;
      --accent-tomato: #ef5350;
      --accent-basil: #66bb6a;
      --accent-cheese: #ffee58;
      --accent-blue: #42a5f5;
      --accent-purple: #ab47bc;
      --text-primary: #f5f5f7;
      --text-secondary: #a0a0b0;
      --text-muted: #6a6a7a;
      --border-color: #252535;
      --gradient-pasta: linear-gradient(135deg, #ffa726 0%, #ff7043 100%);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      line-height: 1.7;
      overflow-x: hidden;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 20px;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(255, 167, 38, 0.08) 0%, transparent 70%);
      top: -200px;
      right: -200px;
      pointer-events: none;
    }
    
    .hero::after {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(66, 165, 245, 0.05) 0%, transparent 70%);
      bottom: -100px;
      left: -100px;
      pointer-events: none;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 900px;
    }
    
    .logo {
      font-size: 5rem;
      margin-bottom: 20px;
      animation: float 4s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(3deg); }
    }
    
    h1 {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 16px;
      background: var(--gradient-pasta);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .tagline {
      font-size: 1.5rem;
      color: var(--text-secondary);
      margin-bottom: 40px;
      font-weight: 300;
    }
    
    .tagline strong {
      color: var(--text-primary);
      font-weight: 600;
    }
    
    .cta-row {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 60px;
    }
    
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .cta-btn.primary {
      background: var(--gradient-pasta);
      color: #000;
    }
    
    .cta-btn.primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(255, 167, 38, 0.3);
    }
    
    .cta-btn.secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    
    .cta-btn.secondary:hover {
      border-color: var(--accent-pasta);
    }
    
    /* Code Preview */
    .code-preview {
      background: var(--bg-code);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      text-align: left;
      max-width: 700px;
      margin: 0 auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }
    
    .code-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.03);
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
      font-family: 'Fira Code', monospace;
    }
    
    .code-body {
      padding: 24px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9rem;
      line-height: 1.8;
      overflow-x: auto;
      white-space: pre;
    }
    
    .code-body .comment { color: #6a6a7a; }
    .code-body .keyword { color: #c792ea; }
    .code-body .component { color: #82aaff; }
    .code-body .prop { color: #c3e88d; }
    .code-body .string { color: #c3e88d; }
    .code-body .number { color: #f78c6c; }
    .code-body .bracket { color: #89ddff; }
    
    /* Features Section */
    .features {
      padding: 100px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }
    
    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .section-header p {
      color: var(--text-secondary);
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 32px;
      transition: all 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      border-color: var(--accent-pasta);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      font-size: 1.4rem;
      margin-bottom: 12px;
    }
    
    .feature-card p {
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    
    .feature-code {
      background: var(--bg-code);
      border-radius: 10px;
      padding: 16px;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      overflow-x: auto;
      white-space: pre;
    }
    
    /* Examples Section */
    .examples {
      padding: 100px 20px;
      background: rgba(255, 255, 255, 0.01);
    }
    
    .examples-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .example-block {
      margin-bottom: 60px;
    }
    
    .example-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .example-number {
      width: 48px;
      height: 48px;
      background: var(--gradient-pasta);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      color: #000;
    }
    
    .example-header h3 {
      font-size: 1.6rem;
    }
    
    .example-desc {
      color: var(--text-secondary);
      margin-bottom: 20px;
      font-size: 1.1rem;
    }
    
    .example-code {
      background: var(--bg-code);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .example-code-header {
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--border-color);
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .example-code-body {
      padding: 24px;
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      line-height: 1.7;
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
      padding: 10px 16px;
      background: rgba(102, 187, 106, 0.1);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }
    
    .response-header .status {
      color: var(--accent-basil);
      font-weight: 600;
    }
    
    .response-body {
      padding: 16px;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: pre;
    }
    
    /* Footer */
    footer {
      text-align: center;
      padding: 60px 20px;
      border-top: 1px solid var(--border-color);
    }
    
    footer p {
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    
    footer a {
      color: var(--accent-pasta);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      .tagline { font-size: 1.1rem; }
      .features-grid { grid-template-columns: 1fr; }
      .code-preview { margin: 0 -10px; border-radius: 12px; }
    }
  </style>
</head>
<body>
  <section class="hero">
    <div class="hero-content">
      <div class="logo">🍝</div>
      <h1>Tagliatelle.js</h1>
      <p class="tagline">
        Build backend APIs with <strong>JSX components</strong>.<br>
        The framework that makes server code look beautiful.
      </p>
      
      <div class="cta-row">
        <a href="./docs.html" class="cta-btn primary">📚 Documentation</a>
        <a href="https://github.com/malekabdelkader/Tagliatelle.js" class="cta-btn secondary">⭐ GitHub</a>
      </div>
      
      <div class="code-preview">
        <div class="code-header">
          <div class="code-dot red"></div>
          <div class="code-dot yellow"></div>
          <div class="code-dot green"></div>
          <span class="code-title">server.tsx</span>
        </div>
        <div class="code-body">
<span class="comment">// Define your server with JSX 🍝</span>
<span class="keyword">const</span> App = () => (
  <span class="bracket">&lt;</span><span class="component">Server</span> <span class="prop">port</span>=<span class="bracket">{</span><span class="number">3000</span><span class="bracket">}</span><span class="bracket">&gt;</span>
    <span class="bracket">&lt;</span><span class="component">Logger</span> <span class="prop">level</span>=<span class="string">"info"</span><span class="bracket">&gt;</span>
      <span class="bracket">&lt;</span><span class="component">RateLimiter</span> <span class="prop">max</span>=<span class="bracket">{</span><span class="number">100</span><span class="bracket">}</span><span class="bracket">&gt;</span>
        <span class="bracket">&lt;</span><span class="component">DB</span> <span class="prop">provider</span>=<span class="bracket">{</span>createDB<span class="bracket">}</span><span class="bracket">&gt;</span>
          <span class="bracket">&lt;</span><span class="component">Routes</span> <span class="prop">dir</span>=<span class="string">"./routes"</span> <span class="bracket">/&gt;</span>
        <span class="bracket">&lt;/</span><span class="component">DB</span><span class="bracket">&gt;</span>
      <span class="bracket">&lt;/</span><span class="component">RateLimiter</span><span class="bracket">&gt;</span>
    <span class="bracket">&lt;/</span><span class="component">Logger</span><span class="bracket">&gt;</span>
  <span class="bracket">&lt;/</span><span class="component">Server</span><span class="bracket">&gt;</span>
);
        </div>
      </div>
    </div>
  </section>
  
  <section class="features">
    <div class="section-header">
      <h2>Why Tagliatelle?</h2>
      <p>Familiar syntax, powerful features, beautiful code.</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📦</div>
        <h3>Component-Based Architecture</h3>
        <p>Nest middleware naturally. Each component wraps its children, creating a clear request flow.</p>
        <div class="feature-code">
<span style="color:#c792ea">&lt;Cors&gt;</span>
  <span style="color:#82aaff">&lt;Auth&gt;</span>
    <span style="color:#ffcb6b">&lt;Routes /&gt;</span>
  <span style="color:#82aaff">&lt;/Auth&gt;</span>
<span style="color:#c792ea">&lt;/Cors&gt;</span>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🗄️</div>
        <h3>Multi-Database Support</h3>
        <p>Different routes can use different databases. Perfect for separation of concerns.</p>
        <div class="feature-code">
<span style="color:#82aaff">&lt;DB</span> <span style="color:#c3e88d">provider</span>=<span style="color:#89ddff">{</span>authDB<span style="color:#89ddff">}</span><span style="color:#82aaff">&gt;</span>
  &lt;Routes dir="./auth" /&gt;
<span style="color:#82aaff">&lt;/DB&gt;</span>
<span style="color:#ffcb6b">&lt;DB</span> <span style="color:#c3e88d">provider</span>=<span style="color:#89ddff">{</span>contentDB<span style="color:#89ddff">}</span><span style="color:#ffcb6b">&gt;</span>
  &lt;Routes dir="./posts" /&gt;
<span style="color:#ffcb6b">&lt;/DB&gt;</span>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📍</div>
        <h3>File-Based Routing</h3>
        <p>Routes are files. Dynamic params use [brackets]. Nested folders create nested paths.</p>
        <div class="feature-code">
routes/
├── index.tsx      → /
├── posts/
│   ├── index.tsx  → /posts
│   └── [id].tsx   → /posts/:id
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <h3>JSX Responses</h3>
        <p>Return responses as JSX. Status codes, headers, and body in a declarative format.</p>
        <div class="feature-code">
<span style="color:#c792ea">return</span> (
  <span style="color:#82aaff">&lt;Response&gt;</span>
    <span style="color:#ffcb6b">&lt;Status</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">200</span><span style="color:#89ddff">}</span> <span style="color:#ffcb6b">/&gt;</span>
    <span style="color:#ffcb6b">&lt;Body</span> <span style="color:#c3e88d">data</span>=<span style="color:#89ddff">{</span>{ user }<span style="color:#89ddff">}</span> <span style="color:#ffcb6b">/&gt;</span>
  <span style="color:#82aaff">&lt;/Response&gt;</span>
);
        </div>
      </div>
    </div>
  </section>
  
  <section class="examples">
    <div class="examples-container">
      <div class="section-header">
        <h2>See It In Action</h2>
        <p>Real code from this demo project.</p>
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
    <span style="color:#c792ea">return</span> (
      <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
        <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Status</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">404</span><span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
        <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Body</span> <span style="color:#c3e88d">data</span>=<span style="color:#89ddff">{</span>{ error: <span style="color:#c3e88d">'Not found'</span> }<span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
      <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
    );
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
    "views": 2500,
    "likes": 145
  }
}
          </div>
        </div>
      </div>
      
      <div class="example-block">
        <div class="example-header">
          <div class="example-number">2</div>
          <h3>Middleware Composition</h3>
        </div>
        <p class="example-desc">Middleware wraps routes using JSX nesting. Data flows through props.</p>
        <div class="example-code">
          <div class="example-code-header">middleware/auth.ts</div>
          <div class="example-code-body">
<span style="color:#c792ea">export const</span> <span style="color:#82aaff">authMiddleware</span> = <span style="color:#c792ea">async</span> (props, request, reply) => {
  <span style="color:#c792ea">const</span> token = request.headers.authorization;
  
  <span style="color:#c792ea">if</span> (!token) {
    <span style="color:#6a6a7a">// Return JSX to halt request</span>
    <span style="color:#c792ea">return</span> (
      <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
        <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Status</span> <span style="color:#c3e88d">code</span>=<span style="color:#89ddff">{</span><span style="color:#f78c6c">401</span><span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
        <span style="color:#89ddff">&lt;</span><span style="color:#82aaff">Body</span> <span style="color:#c3e88d">data</span>=<span style="color:#89ddff">{</span>{ error: <span style="color:#c3e88d">'Unauthorized'</span> }<span style="color:#89ddff">}</span> <span style="color:#89ddff">/&gt;</span>
      <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Response</span><span style="color:#89ddff">&gt;</span>
    );
  }
  
  <span style="color:#6a6a7a">// Return data to augment props for downstream</span>
  <span style="color:#c792ea">return</span> { user: validateToken(token), isAuthenticated: <span style="color:#f78c6c">true</span> };
};
          </div>
        </div>
      </div>
      
      <div class="example-block">
        <div class="example-header">
          <div class="example-number">3</div>
          <h3>Config Files for Route Groups</h3>
        </div>
        <p class="example-desc">Use _config.tsx to apply middleware to all routes in a directory.</p>
        <div class="example-code">
          <div class="example-code-header">routes/posts/_config.tsx</div>
          <div class="example-code-body">
<span style="color:#c792ea">import</span> { Middleware } <span style="color:#c792ea">from</span> <span style="color:#c3e88d">'tagliatelle'</span>;
<span style="color:#c792ea">import</span> { authMiddleware } <span style="color:#c792ea">from</span> <span style="color:#c3e88d">'../../middleware/auth'</span>;

<span style="color:#6a6a7a">// All routes in /posts/* get this middleware</span>
<span style="color:#c792ea">export default</span> ({ children }) => (
  <span style="color:#89ddff">&lt;</span><span style="color:#ffcb6b">Middleware</span> <span style="color:#c3e88d">use</span>=<span style="color:#89ddff">{</span>authMiddleware<span style="color:#89ddff">}</span><span style="color:#89ddff">&gt;</span>
    {children}
  <span style="color:#89ddff">&lt;/</span><span style="color:#ffcb6b">Middleware</span><span style="color:#89ddff">&gt;</span>
);
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <footer>
    <p>🍝 Built with <a href="https://github.com/malekabdelkader/Tagliatelle.js">Tagliatelle.js</a> v1.0.0</p>
    <p style="font-size: 0.9rem; margin-top: 16px;">
      <a href="./docs.html">Documentation</a> • 
      <a href="https://www.npmjs.com/package/tagliatelle">NPM Package</a> • 
      <a href="https://github.com/malekabdelkader/Tagliatelle.js">GitHub</a>
    </p>
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
