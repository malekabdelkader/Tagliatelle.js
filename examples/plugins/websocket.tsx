/**
 * 🍝 WebSocket Plugin Example
 * 
 * This shows how to add WebSocket support to Tagliatelle.
 * 
 * Usage:
 *   <WS path="/ws" onConnection={handleConnection} />
 * 
 * Requires:
 *   npm install @fastify/websocket
 */

import { createPlugin } from 'tagliatelle';

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 WEBSOCKET PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WSProps {
  /** WebSocket endpoint path (default: "/ws") */
  path?: string;
  /** Connection handler */
  onConnection?: (socket: unknown, request: unknown) => void;
  /** Custom options for ws */
  options?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 WEBSOCKET PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * WebSocket plugin for real-time communication
 */
export const WS = createPlugin<WSProps>(
  'WebSocket',
  async (fastify, props) => {
    // Dynamic import - package is optional
    const websocket = await import('@fastify/websocket');
    
    await fastify.register(websocket.default, props.options);
    
    // Register WebSocket route
    fastify.get(
      props.path ?? '/ws', 
      { websocket: true } as Record<string, unknown>, 
      (socket: unknown, request: unknown) => {
        if (props.onConnection) {
          props.onConnection(socket, request);
        }
        
        // Default echo behavior if no handler provided
        const sock = socket as { on: (event: string, cb: (msg: Buffer) => void) => void; send: (msg: string) => void };
        sock.on('message', (message: Buffer) => {
          sock.send(`Echo: ${message.toString()}`);
        });
      }
    );
  }
);

export default WS;
