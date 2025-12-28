/**
 * 🌐 PLATFORM DATABASE
 * 
 * Owned by: Platform & Infrastructure Team
 * Contains: Categories, Tags, Analytics, Search Index, System Config
 * 
 * This is the aggregation layer. It references data from other services
 * and maintains platform-wide metadata and analytics.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORES
// ═══════════════════════════════════════════════════════════════════════════

const categories = new Map([
  ['cat_1', {
    id: 'cat_1',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Beginner-friendly tutorials and guides',
    icon: '🚀',
    color: '#4CAF50',
    postCount: 1, // Aggregated from Blog Service
    order: 1,
  }],
  ['cat_2', {
    id: 'cat_2',
    name: 'Advanced Topics',
    slug: 'advanced',
    description: 'Deep dives into complex patterns',
    icon: '🎯',
    color: '#2196F3',
    postCount: 2,
    order: 2,
  }],
  ['cat_3', {
    id: 'cat_3',
    name: 'Architecture',
    slug: 'architecture',
    description: 'System design and architectural patterns',
    icon: '🏗️',
    color: '#9C27B0',
    postCount: 1,
    order: 3,
  }],
]);

const tags = new Map([
  ['tag_1', { id: 'tag_1', name: 'tagliatelle', slug: 'tagliatelle', color: '#FF5722', usageCount: 2 }],
  ['tag_2', { id: 'tag_2', name: 'microservices', slug: 'microservices', color: '#00BCD4', usageCount: 2 }],
  ['tag_3', { id: 'tag_3', name: 'middleware', slug: 'middleware', color: '#FFC107', usageCount: 1 }],
  ['tag_4', { id: 'tag_4', name: 'database', slug: 'database', color: '#795548', usageCount: 1 }],
  ['tag_5', { id: 'tag_5', name: 'typescript', slug: 'typescript', color: '#3178C6', usageCount: 0 }],
]);

// Simple search index (in production, use Elasticsearch, Algolia, etc.)
const searchIndex = new Map([
  ['microservices', ['post_1', 'post_3']],
  ['middleware', ['post_2']],
  ['tagliatelle', ['post_1', 'post_2']],
  ['database', ['post_3']],
  ['architecture', ['post_1', 'post_3']],
  ['jsx', ['post_1']],
  ['backend', ['post_1', 'post_2', 'post_3']],
]);

// Analytics events
const analyticsEvents: Array<{
  id: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  service: string;
}> = [
  { id: 'evt_1', event: 'page_view', data: { path: '/posts/post_1' }, timestamp: '2024-12-27T10:00:00Z', service: 'blog' },
  { id: 'evt_2', event: 'user_login', data: { userId: 'user_1' }, timestamp: '2024-12-27T09:00:00Z', service: 'auth' },
  { id: 'evt_3', event: 'post_like', data: { postId: 'post_1', userId: 'user_2' }, timestamp: '2024-12-27T10:05:00Z', service: 'blog' },
];

// Service health status (aggregated from all services)
const serviceHealth = new Map([
  ['auth', { status: 'healthy', lastCheck: Date.now(), responseTime: 12, uptime: 99.99 }],
  ['blog', { status: 'healthy', lastCheck: Date.now(), responseTime: 18, uptime: 99.95 }],
  ['platform', { status: 'healthy', lastCheck: Date.now(), responseTime: 8, uptime: 100 }],
]);

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  usageCount: number;
}

export interface PlatformDB {
  // Category operations
  categories: {
    findById: (id: string) => Category | undefined;
    findBySlug: (slug: string) => Category | undefined;
    findMany: () => Category[];
    updatePostCount: (id: string, delta: number) => void;
  };
  // Tag operations
  tags: {
    findById: (id: string) => Tag | undefined;
    findBySlug: (slug: string) => Tag | undefined;
    findMany: () => Tag[];
    getPopular: (limit: number) => Tag[];
    updateUsageCount: (id: string, delta: number) => void;
  };
  // Search operations
  search: {
    query: (term: string) => string[]; // Returns post IDs
    index: (postId: string, keywords: string[]) => void;
    remove: (postId: string) => void;
  };
  // Analytics operations
  analytics: {
    track: (event: string, data: Record<string, unknown>, service: string) => void;
    getRecent: (limit: number) => typeof analyticsEvents;
    getByService: (service: string) => typeof analyticsEvents;
    getSummary: () => { totalEvents: number; byService: Record<string, number>; byEvent: Record<string, number> };
  };
  // Health monitoring
  health: {
    getAll: () => Array<{ service: string; status: string; responseTime: number; uptime: number }>;
    update: (service: string, status: string, responseTime: number) => void;
    isSystemHealthy: () => boolean;
  };
  // Aggregated stats (from all services)
  aggregatedStats: () => {
    categories: number;
    tags: number;
    searchIndexSize: number;
    analyticsEvents: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const createPlatformDB = async (): Promise<PlatformDB> => {
  console.log('🌐 Platform Database connected! (Platform & Infrastructure Team)');
  
  return {
    categories: {
      findById: (id) => categories.get(id),
      findBySlug: (slug) => Array.from(categories.values()).find(c => c.slug === slug),
      findMany: () => Array.from(categories.values()).sort((a, b) => a.order - b.order),
      updatePostCount: (id, delta) => {
        const cat = categories.get(id);
        if (cat) cat.postCount += delta;
      },
    },
    tags: {
      findById: (id) => tags.get(id),
      findBySlug: (slug) => Array.from(tags.values()).find(t => t.slug === slug),
      findMany: () => Array.from(tags.values()),
      getPopular: (limit) => 
        Array.from(tags.values())
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit),
      updateUsageCount: (id, delta) => {
        const tag = tags.get(id);
        if (tag) tag.usageCount += delta;
      },
    },
    search: {
      query: (term) => {
        const normalized = term.toLowerCase();
        const results = new Set<string>();
        
        // Search in index
        searchIndex.forEach((postIds, keyword) => {
          if (keyword.includes(normalized) || normalized.includes(keyword)) {
            postIds.forEach(id => results.add(id));
          }
        });
        
        return Array.from(results);
      },
      index: (postId, keywords) => {
        keywords.forEach(keyword => {
          const normalized = keyword.toLowerCase();
          const existing = searchIndex.get(normalized) || [];
          if (!existing.includes(postId)) {
            searchIndex.set(normalized, [...existing, postId]);
          }
        });
      },
      remove: (postId) => {
        searchIndex.forEach((postIds, keyword) => {
          const filtered = postIds.filter(id => id !== postId);
          if (filtered.length > 0) {
            searchIndex.set(keyword, filtered);
          } else {
            searchIndex.delete(keyword);
          }
        });
      },
    },
    analytics: {
      track: (event, data, service) => {
        analyticsEvents.push({
          id: `evt_${analyticsEvents.length + 1}`,
          event,
          data,
          timestamp: new Date().toISOString(),
          service,
        });
      },
      getRecent: (limit) => analyticsEvents.slice(-limit).reverse(),
      getByService: (service) => analyticsEvents.filter(e => e.service === service),
      getSummary: () => {
        const byService: Record<string, number> = {};
        const byEvent: Record<string, number> = {};
        
        analyticsEvents.forEach(e => {
          byService[e.service] = (byService[e.service] || 0) + 1;
          byEvent[e.event] = (byEvent[e.event] || 0) + 1;
        });
        
        return { totalEvents: analyticsEvents.length, byService, byEvent };
      },
    },
    health: {
      getAll: () => 
        Array.from(serviceHealth.entries()).map(([service, data]) => ({
          service,
          ...data,
        })),
      update: (service, status, responseTime) => {
        const existing = serviceHealth.get(service);
        serviceHealth.set(service, {
          status,
          lastCheck: Date.now(),
          responseTime,
          uptime: existing?.uptime || 100,
        });
      },
      isSystemHealthy: () => 
        Array.from(serviceHealth.values()).every(s => s.status === 'healthy'),
    },
    aggregatedStats: () => ({
      categories: categories.size,
      tags: tags.size,
      searchIndexSize: searchIndex.size,
      analyticsEvents: analyticsEvents.length,
    }),
  };
};

