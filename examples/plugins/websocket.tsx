/**
 * 🍝 WebSocket Plugin - Real-time Communication
 * 
 * Usage:
 *   <WS path="/ws" onConnection={handleConnection} />
 * 
 * Requires:
 *   npm install @fastify/websocket
 */

import { createPlugin } from 'tagliatelle';
import type { FastifyInstance } from 'fastify';

export interface WSProps {
  path?: string;
  onConnection?: (socket: unknown, request: unknown) => void;
}

export const WS = createPlugin<WSProps>(
  'WebSocket',
  async (fastify: FastifyInstance, props: WSProps) => {
    try {
      const websocket = await import('@fastify/websocket');
      
      await fastify.register(websocket.default);
      
      // Register WebSocket route
      fastify.get(
        props.path ?? '/ws', 
        { websocket: true } as Record<string, unknown>, 
        (socket: unknown, request: unknown) => {
          if (props.onConnection) {
            props.onConnection(socket, request);
          }
          
          // Default echo behavior
          const sock = socket as { on: (event: string, cb: (msg: Buffer) => void) => void; send: (msg: string) => void };
          sock.on('message', (message: Buffer) => {
            sock.send(`Echo: ${message.toString()}`);
          });
        }
      );
      
      console.log(`  🔌 WebSocket → ${props.path ?? '/ws'}`);
    } catch {
      console.log('  ⚠ WebSocket skipped (install @fastify/websocket)');
    }
  }
);

export default WS;

