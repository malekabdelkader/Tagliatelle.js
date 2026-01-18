/**
 * Minimal Tagliatelle.js Example
 *
 * Run with: npx tsx --tsconfig tsconfig.examples.json examples/minimal/server.tsx
 */

import { render, Server, Get, Response, Status, Body } from '../../src/index.js';

const hello = async () => (
  <Response>
    <Status code={200} />
    <Body data={{ message: 'Hello from Tagliatelle!' }} />
  </Response>
);

const App = () => (
  <Server port={3000}>
    <Get path="/hello" handler={hello} />
  </Server>
);

render(<App />);
