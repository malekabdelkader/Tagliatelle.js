/**
 * 🍝 <Tag>liatelle.js - Example Server
 * 
 * The "Chef's Table" with file-based routing!
 * Routes are automatically loaded from the routes/ directory.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  h,
  Fragment,
  render, 
  Server, 
  Logger,
  Cors,
  Routes
} from './tagliatelle.js';

// Get the directory of this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
// 🍽️ THE MENU - Your API Definition
// ═══════════════════════════════════════════════════════════════════════════

const App = () => (
  <Server port={3000}>
    {/* 📊 Logging Configuration */}
    <Logger level="info" />
    
    {/* 🌐 CORS for all routes */}
    <Cors origin="*">
      
      {/* 🍝 File-based routing  */}
      <Routes dir={path.join(__dirname, 'routes')} />
      
    </Cors>
  </Server>
);

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 START THE SERVER
// ═══════════════════════════════════════════════════════════════════════════

// Suppress unused variable warnings for JSX factory
void h;
void Fragment;

render(<App />);
