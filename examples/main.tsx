/**
 * 🍝 <Tag>liatelle.js - Example Server
 * 
 * The "Chef's Table" with file-based routing!
 * Routes are automatically loaded from the routes/ directory.
 * 
 * Run with CLI options:
 *   npm run example              # Default port 3000
 *   npm run example -- -p 8080   # Custom port
 *   npm run example -- -H localhost -p 3001
 *   npm run example -- --help    # Show all options
 *   PORT=8080 npm run example    # Using env variable
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  render, 
  Server, 
  Logger,
  Cors,
  RateLimiter,
  Routes
} from 'tagliatelle';

// Custom plugins - this is how you extend Tagliatelle!
import { Swagger } from './plugins/swagger.js';
import { WS } from './plugins/websocket.js';

// Get the directory of this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
// 🍽️ THE MENU - Your API Definition
// ═══════════════════════════════════════════════════════════════════════════

const App = () => (
  <Server port={3000}>
    {/* 📚 Swagger/OpenAPI Documentation - visit /docs */}
    <Swagger 
      title="Tagliatelle Example API"
      version="1.0.0"
      description="🍝 A delicious API served with Tagliatelle.js"
      tags={[
        { name: 'posts', description: 'Blog post operations' },
        { name: 'health', description: 'Health check endpoints' }
      ]}
    />
    
    {/* 🔌 WebSocket - connect to ws://localhost:3000/ws */}
    <WS path="/ws" />
    
    {/* 📊 Logging Configuration */}
    <Logger level="info">
      
      {/* 🌐 CORS for all routes */}
      <Cors origin="*">
        
        {/* 🚦 Rate limiting at top level (can be overridden) */}
        <RateLimiter max={1000} timeWindow="1 minute">
          
          {/* 🍝 File-based routing  */}
          <Routes dir={path.join(__dirname, 'routes')} />
          
        </RateLimiter>
      </Cors>
    </Logger>
  </Server>
);

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 START THE SERVER
// ═══════════════════════════════════════════════════════════════════════════

render(<App />);
