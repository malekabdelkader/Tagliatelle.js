#!/usr/bin/env node
/**
 * Build static docs for Netlify deployment
 * Extracts HTML from examples/routes/pages/ and writes to docs/
 */

const fs = require('fs');

// Extract HTML template from TSX file
function extractHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/const\s+\w*HTML\s*=\s*`([\s\S]*?)`;/);
  return match ? match[1] : '';
}

// Create docs folder
fs.mkdirSync('examples/docs', { recursive: true });

// Build pages
const indexHTML = extractHTML('examples/routes/pages/index.tsx');
const docsHTML = extractHTML('examples/routes/pages/docs.tsx');

fs.writeFileSync('examples/docs/index.html', indexHTML);
fs.writeFileSync('examples/docs/docs.html', docsHTML);
fs.writeFileSync('examples/docs/.nojekyll', '');
fs.writeFileSync('examples/docs/404.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Tagliatelle.js</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0c0c14;
      color: #f5f5f7;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    h1 { font-size: 4rem; margin: 0; }
    p { color: #a0a0b0; margin: 20px 0; }
    a { color: #ffa726; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div>
    <h1>🍝 404</h1>
    <p>This page doesn't exist.</p>
    <a href="./">← Back to Home</a>
  </div>
</body>
</html>`);

console.log('✅ Built: examples/docs/index.html, examples/docs/docs.html, examples/docs/404.html');

