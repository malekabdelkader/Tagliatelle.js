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

// Get the directory of this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
// 🍽️ THE MENU - Your API Definition
// ═══════════════════════════════════════════════════════════════════════════

const App = () => (
  <Server port={3000}>
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
