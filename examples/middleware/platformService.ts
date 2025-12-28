// @ts-nocheck
/**
 * 🌐 PLATFORM SERVICE MIDDLEWARE
 * 
 * Middleware specific to the Platform Service
 * Handles aggregation and cross-service data fetching
 */

import type { HandlerProps } from 'tagliatelle';
import type { FastifyRequest, FastifyReply } from 'fastify';

// Service URLs
const AUTH_SERVICE_URL = 'http://localhost:3001';
const BLOG_SERVICE_URL = 'http://localhost:3002';

/**
 * Cross-service data fetcher
 * Fetches data from other services with proper error handling
 */
export async function fetchFromService<T>(
  serviceUrl: string,
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${serviceUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': 'service_key_platform_xyz789',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      return { success: false, error: `Service returned ${response.status}` };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Service unavailable' };
  }
}

/**
 * Platform Service Middleware
 * - Adds service context
 * - Provides cross-service fetch utilities
 */
export const platformServiceMiddleware = async (
  props: HandlerProps,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Add service identifier
  reply.header('X-Service', 'platform-service');
  reply.header('X-Service-Version', '1.0.0');
  
  props.log.debug({ service: 'platform' }, '🌐 Platform Service handling request');
  
  // Provide utilities for cross-service communication
  return {
    serviceName: 'platform-service',
    serviceVersion: '1.0.0',
    
    // Utility to fetch from Auth Service
    fetchAuthService: <T>(path: string, options?: RequestInit) => 
      fetchFromService<T>(AUTH_SERVICE_URL, path, options),
    
    // Utility to fetch from Blog Service
    fetchBlogService: <T>(path: string, options?: RequestInit) => 
      fetchFromService<T>(BLOG_SERVICE_URL, path, options),
    
    // Get aggregated data from all services
    async aggregateData() {
      const [authStats, blogStats] = await Promise.all([
        fetchFromService<{ stats: Record<string, number> }>(AUTH_SERVICE_URL, '/auth/stats'),
        fetchFromService<{ stats: Record<string, number> }>(BLOG_SERVICE_URL, '/stats'),
      ]);
      
      return {
        auth: authStats.success ? authStats.data?.stats : null,
        blog: blogStats.success ? blogStats.data?.stats : null,
        timestamp: new Date().toISOString(),
      };
    },
  };
};

