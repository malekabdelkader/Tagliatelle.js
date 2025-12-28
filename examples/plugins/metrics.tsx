/**
 * 🍝 Metrics Plugin - Prometheus Monitoring
 * 
 * Usage:
 *   <Metrics path="/metrics" />
 * 
 * Requires:
 *   npm install fastify-metrics
 */

import { createPlugin } from 'tagliatelle';
import type { FastifyInstance } from 'fastify';

export interface MetricsProps {
  path?: string;
  defaultMetrics?: boolean;
  routeMetrics?: boolean;
}

export const Metrics = createPlugin<MetricsProps>(
  'Metrics',
  async (fastify: FastifyInstance, props: MetricsProps) => {
    try {
      const metricsPlugin = await import('fastify-metrics');
      
      await fastify.register(metricsPlugin.default, {
        endpoint: props.path ?? '/metrics',
        defaultMetrics: {
          enabled: props.defaultMetrics ?? true
        },
        routeMetrics: {
          enabled: props.routeMetrics ?? true
        }
      });
      
      console.log(`  📈 Metrics → ${props.path ?? '/metrics'}`);
    } catch {
      console.log('  ⚠ Metrics skipped (install fastify-metrics)');
    }
  }
);

export default Metrics;

