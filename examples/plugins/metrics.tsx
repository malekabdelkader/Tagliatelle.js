/**
 * 🍝 Metrics Plugin Example
 * 
 * This shows how to add Prometheus metrics to Tagliatelle.
 * 
 * Usage:
 *   <Metrics path="/metrics" />
 * 
 * Requires:
 *   npm install fastify-metrics
 */

import { createPlugin } from 'tagliatelle';

// ═══════════════════════════════════════════════════════════════════════════
// 📊 METRICS PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MetricsProps {
  /** Metrics endpoint path (default: "/metrics") */
  path?: string;
  /** Default metrics to collect */
  defaultMetrics?: boolean;
  /** Route metrics */
  routeMetrics?: boolean;
  /** Custom labels */
  labels?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔌 METRICS PLUGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Prometheus metrics plugin for monitoring
 */
export const Metrics = createPlugin<MetricsProps>(
  'Metrics',
  async (fastify, props) => {
    // Dynamic import - package is optional
    const metricsPlugin = await import('fastify-metrics');
    
    await fastify.register(metricsPlugin.default, {
      endpoint: props.path ?? '/metrics',
      defaultMetrics: {
        enabled: props.defaultMetrics ?? true,
        labels: props.labels
      },
      routeMetrics: {
        enabled: props.routeMetrics ?? true
      }
    });
  }
);

export default Metrics;
