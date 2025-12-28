// @ts-nocheck
/**
 * 📦 CONTENT DATABASE
 * 
 * Merged database for all content-related data:
 * - Posts, Comments, Likes, Drafts (from BlogDB)
 * - Categories, Tags, Search, Analytics (from PlatformDB)
 * 
 * This demonstrates Tagliatelle's multi-DB capability in a realistic scenario:
 * - AuthDB: Identity & access (users, sessions, tokens)
 * - ContentDB: All platform content & metadata
 */

// ═══════════════════════════════════════════════════════════════════════════
// POSTS & CONTENT
// ═══════════════════════════════════════════════════════════════════════════

const posts = new Map([
  ['post_1', {
    id: 'post_1',
    authorId: 'user_1',
    title: 'Getting Started with Tagliatelle.js',
    slug: 'getting-started-tagliatelle',
    content: `
# Welcome to Tagliatelle.js! 🍝

Tagliatelle brings the elegance of JSX to backend development. Instead of chaining methods or writing verbose configuration objects, you declare your server structure with familiar component syntax.

## Why JSX for Backend?

\`\`\`tsx
// Traditional approach
const server = express();
server.use(cors());
server.use(rateLimit({ max: 100 }));
server.use('/api', apiRoutes);

// Tagliatelle approach
<Server port={3000}>
  <Cors origin="*">
    <RateLimiter max={100}>
      <Routes dir="./routes/api" prefix="/api" />
    </RateLimiter>
  </Cors>
</Server>
\`\`\`

The component tree mirrors your mental model of the request flow!
    `.trim(),
    excerpt: 'Learn how to build modern backends with JSX using Tagliatelle.js',
    status: 'published' as const,
    categoryId: 'cat_1',
    tagIds: ['tag_1', 'tag_2'],
    views: 2500,
    likes: 145,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    publishedAt: '2024-01-15T12:00:00Z',
  }],
  ['post_2', {
    id: 'post_2',
    authorId: 'user_2',
    title: 'Middleware Composition with JSX',
    slug: 'middleware-composition-jsx',
    content: `
# Middleware Composition in Tagliatelle 🔧

Middleware in Tagliatelle works through JSX nesting. Each component wraps its children, creating a natural flow.

## Stacking Middleware

\`\`\`tsx
<Server port={3000}>
  <Logger level="info">
    <Cors origin="https://myapp.com">
      <RateLimiter max={100} timeWindow="1 minute">
        <Middleware use={authMiddleware}>
          <DB provider={createDatabase}>
            <Routes dir="./routes" />
          </DB>
        </Middleware>
      </RateLimiter>
    </Cors>
  </Logger>
</Server>
\`\`\`

Request flows: Logger → Cors → RateLimiter → Auth → DB → Routes

## Custom Middleware

\`\`\`tsx
const timingMiddleware = async (props, request, reply) => {
  const start = Date.now();
  // Returning nothing continues to handler
  // Augment props for downstream
  return { requestTime: start };
};

// In _config.tsx
<Middleware use={timingMiddleware}>
  {children}
</Middleware>
\`\`\`
    `.trim(),
    excerpt: 'Master middleware patterns with component-based composition',
    status: 'published' as const,
    categoryId: 'cat_2',
    tagIds: ['tag_1', 'tag_3'],
    views: 1800,
    likes: 92,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-25T11:00:00Z',
    publishedAt: '2024-02-20T14:00:00Z',
  }],
  ['post_3', {
    id: 'post_3',
    authorId: 'user_1',
    title: 'Multi-Database Patterns',
    slug: 'multi-database-patterns',
    content: `
# Working with Multiple Databases 🗄️

Tagliatelle supports multiple database connections through the \`<DB>\` component.

## Two-Database Architecture

A common pattern separates identity from content:

\`\`\`tsx
<Server port={3000}>
  {/* Auth routes get AuthDB */}
  <DB provider={createAuthDB}>
    <Routes dir="./routes/auth" prefix="/auth" />
  </DB>
  
  {/* Content routes get ContentDB */}
  <DB provider={createContentDB}>
    <Routes dir="./routes/posts" prefix="/posts" />
    <Routes dir="./routes/categories" />
  </DB>
</Server>
\`\`\`

## Accessing the Database

In route handlers, the database is available via props:

\`\`\`tsx
export async function GET({ db, params }: HandlerProps) {
  const post = db.posts.findById(params.id);
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{ post }} />
    </Response>
  );
}
\`\`\`
    `.trim(),
    excerpt: 'Learn how to work with multiple databases in Tagliatelle',
    status: 'published' as const,
    categoryId: 'cat_2',
    tagIds: ['tag_2', 'tag_4'],
    views: 1200,
    likes: 67,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
    publishedAt: '2024-03-10T10:00:00Z',
  }],
  ['post_4', {
    id: 'post_4',
    authorId: 'user_2',
    title: 'Route Handlers & JSX Responses',
    slug: 'route-handlers-jsx-responses',
    content: `
# Route Handlers in Tagliatelle 📍

Routes are defined as exported async functions matching HTTP methods.

## Basic Handler

\`\`\`tsx
// routes/users/[id].tsx
export async function GET({ params, db }: HandlerProps) {
  const user = db.users.findById(params.id);
  
  if (!user) {
    return (
      <Response>
        <Status code={404} />
        <Body data={{ error: 'User not found' }} />
      </Response>
    );
  }
  
  return (
    <Response>
      <Status code={200} />
      <Body data={{ user }} />
    </Response>
  );
}
\`\`\`

## POST with Body Parsing

\`\`\`tsx
interface CreateUserBody {
  email: string;
  name: string;
}

export async function POST({ body, db }: HandlerProps<{}, CreateUserBody>) {
  const user = db.users.create(body);
  
  return (
    <Response>
      <Status code={201} />
      <Headers headers={{ 'Location': \`/users/\${user.id}\` }} />
      <Body data={{ user }} />
    </Response>
  );
}
\`\`\`

## File-based Routing

- \`routes/index.tsx\` → \`/\`
- \`routes/users/index.tsx\` → \`/users\`
- \`routes/users/[id].tsx\` → \`/users/:id\`
- \`routes/posts/[id]/comments.tsx\` → \`/posts/:id/comments\`
    `.trim(),
    excerpt: 'Understand how to create route handlers with JSX responses',
    status: 'published' as const,
    categoryId: 'cat_1',
    tagIds: ['tag_1', 'tag_5'],
    views: 950,
    likes: 54,
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-03-15T14:00:00Z',
    publishedAt: '2024-03-15T16:00:00Z',
  }],
]);

const drafts = new Map([
  ['draft_1', {
    id: 'draft_1',
    authorId: 'user_1',
    title: 'Upcoming: WebSocket Support',
    content: 'Real-time features coming soon...',
    lastSaved: '2024-12-26T20:00:00Z',
  }],
]);

const comments = new Map([
  ['comment_1', {
    id: 'comment_1',
    postId: 'post_1',
    authorId: 'user_2',
    content: 'This is exactly what I needed! JSX for backend makes so much sense.',
    likes: 12,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: null,
  }],
  ['comment_2', {
    id: 'comment_2',
    postId: 'post_1',
    authorId: 'user_3',
    content: 'The code examples are super helpful. Thanks!',
    likes: 8,
    createdAt: '2024-01-17T14:30:00Z',
    updatedAt: null,
  }],
  ['comment_3', {
    id: 'comment_3',
    postId: 'post_2',
    authorId: 'user_1',
    content: 'Great explanation of the middleware flow!',
    likes: 5,
    createdAt: '2024-02-21T10:00:00Z',
    updatedAt: null,
  }],
]);

const likes = new Map([
  ['user_2_post_1', { userId: 'user_2', postId: 'post_1', createdAt: '2024-01-16T09:00:00Z' }],
  ['user_3_post_1', { userId: 'user_3', postId: 'post_1', createdAt: '2024-01-17T14:30:00Z' }],
  ['user_1_post_2', { userId: 'user_1', postId: 'post_2', createdAt: '2024-02-21T10:00:00Z' }],
]);

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES & TAGS
// ═══════════════════════════════════════════════════════════════════════════

const categories = new Map([
  ['cat_1', {
    id: 'cat_1',
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Beginner-friendly tutorials and guides',
    icon: '🚀',
    color: '#4CAF50',
    order: 1,
  }],
  ['cat_2', {
    id: 'cat_2',
    name: 'Advanced Topics',
    slug: 'advanced',
    description: 'Deep dives into complex patterns',
    icon: '🎯',
    color: '#2196F3',
    order: 2,
  }],
  ['cat_3', {
    id: 'cat_3',
    name: 'Best Practices',
    slug: 'best-practices',
    description: 'Recommended patterns and conventions',
    icon: '✨',
    color: '#9C27B0',
    order: 3,
  }],
]);

const tags = new Map([
  ['tag_1', { id: 'tag_1', name: 'tagliatelle', slug: 'tagliatelle', color: '#FF5722' }],
  ['tag_2', { id: 'tag_2', name: 'jsx', slug: 'jsx', color: '#61DAFB' }],
  ['tag_3', { id: 'tag_3', name: 'middleware', slug: 'middleware', color: '#FFC107' }],
  ['tag_4', { id: 'tag_4', name: 'database', slug: 'database', color: '#795548' }],
  ['tag_5', { id: 'tag_5', name: 'routing', slug: 'routing', color: '#3178C6' }],
]);

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH INDEX
// ═══════════════════════════════════════════════════════════════════════════

const searchIndex = new Map([
  ['tagliatelle', ['post_1', 'post_2', 'post_3', 'post_4']],
  ['jsx', ['post_1', 'post_2', 'post_4']],
  ['middleware', ['post_2']],
  ['database', ['post_3']],
  ['routing', ['post_4']],
  ['backend', ['post_1', 'post_2', 'post_3', 'post_4']],
  ['component', ['post_1', 'post_2']],
]);

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

const analyticsEvents: Array<{
  id: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}> = [
  { id: 'evt_1', event: 'page_view', data: { path: '/posts/post_1' }, timestamp: '2024-12-27T10:00:00Z' },
  { id: 'evt_2', event: 'user_login', data: { userId: 'user_1' }, timestamp: '2024-12-27T09:00:00Z' },
  { id: 'evt_3', event: 'post_like', data: { postId: 'post_1', userId: 'user_2' }, timestamp: '2024-12-27T10:05:00Z' },
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface Post {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  categoryId: string;
  tagIds: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface ContentDB {
  // Post operations
  posts: {
    findById: (id: string) => Post | undefined;
    findBySlug: (slug: string) => Post | undefined;
    findMany: (options?: { status?: 'published' | 'draft'; authorId?: string; categoryId?: string }) => Post[];
    create: (data: Omit<Post, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>) => Post;
    update: (id: string, data: Partial<Post>) => Post | undefined;
    delete: (id: string) => boolean;
    incrementViews: (id: string) => void;
    toggleLike: (postId: string, userId: string) => { liked: boolean; totalLikes: number };
    getPopular: (limit: number) => Post[];
    count: () => number;
  };
  
  // Comment operations
  comments: {
    findByPostId: (postId: string) => Comment[];
    create: (data: { postId: string; authorId: string; content: string }) => Comment;
    delete: (id: string) => boolean;
    count: (postId?: string) => number;
  };
  
  // Draft operations
  drafts: {
    findByAuthor: (authorId: string) => Array<{ id: string; title: string; lastSaved: string }>;
    save: (authorId: string, data: { title: string; content: string }) => { id: string };
  };
  
  // Category operations
  categories: {
    findById: (id: string) => Category | undefined;
    findBySlug: (slug: string) => Category | undefined;
    findMany: () => Category[];
    getPostCount: (categoryId: string) => number;
  };
  
  // Tag operations
  tags: {
    findById: (id: string) => Tag | undefined;
    findBySlug: (slug: string) => Tag | undefined;
    findMany: () => Tag[];
    getPopular: (limit: number) => Array<Tag & { count: number }>;
  };
  
  // Search operations
  search: {
    query: (term: string) => string[];
    index: (postId: string, keywords: string[]) => void;
  };
  
  // Analytics operations
  analytics: {
    track: (event: string, data: Record<string, unknown>) => void;
    getRecent: (limit: number) => typeof analyticsEvents;
    getSummary: () => { totalEvents: number; byEvent: Record<string, number> };
  };
  
  // Stats
  stats: () => {
    posts: number;
    comments: number;
    drafts: number;
    categories: number;
    tags: number;
    totalViews: number;
    totalLikes: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const createContentDB = async (): Promise<ContentDB> => {
  console.log('📦 Content Database connected!');
  
  return {
    posts: {
      findById: (id) => posts.get(id),
      findBySlug: (slug) => Array.from(posts.values()).find(p => p.slug === slug),
      findMany: (options) => {
        let result = Array.from(posts.values());
        if (options?.status) {
          result = result.filter(p => p.status === options.status);
        }
        if (options?.authorId) {
          result = result.filter(p => p.authorId === options.authorId);
        }
        if (options?.categoryId) {
          result = result.filter(p => p.categoryId === options.categoryId);
        }
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      create: (data) => {
        const id = `post_${posts.size + 1}`;
        const now = new Date().toISOString();
        const post: Post = {
          id,
          ...data,
          views: 0,
          likes: 0,
          createdAt: now,
          updatedAt: now,
        };
        posts.set(id, post);
        return post;
      },
      update: (id, data) => {
        const post = posts.get(id);
        if (!post) return undefined;
        const updated = { ...post, ...data, updatedAt: new Date().toISOString() };
        posts.set(id, updated);
        return updated;
      },
      delete: (id) => posts.delete(id),
      incrementViews: (id) => {
        const post = posts.get(id);
        if (post) post.views++;
      },
      toggleLike: (postId, userId) => {
        const likeKey = `${userId}_${postId}`;
        const post = posts.get(postId);
        if (!post) return { liked: false, totalLikes: 0 };
        
        if (likes.has(likeKey)) {
          likes.delete(likeKey);
          post.likes--;
          return { liked: false, totalLikes: post.likes };
        } else {
          likes.set(likeKey, { userId, postId, createdAt: new Date().toISOString() });
          post.likes++;
          return { liked: true, totalLikes: post.likes };
        }
      },
      getPopular: (limit) => {
        return Array.from(posts.values())
          .filter(p => p.status === 'published')
          .sort((a, b) => b.views - a.views)
          .slice(0, limit);
      },
      count: () => posts.size,
    },
    
    comments: {
      findByPostId: (postId) => 
        Array.from(comments.values())
          .filter(c => c.postId === postId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      create: (data) => {
        const id = `comment_${comments.size + 1}`;
        const comment: Comment = {
          id,
          ...data,
          likes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        };
        comments.set(id, comment);
        return comment;
      },
      delete: (id) => comments.delete(id),
      count: (postId) => {
        if (postId) {
          return Array.from(comments.values()).filter(c => c.postId === postId).length;
        }
        return comments.size;
      },
    },
    
    drafts: {
      findByAuthor: (authorId) => 
        Array.from(drafts.values())
          .filter(d => d.authorId === authorId)
          .map(d => ({ id: d.id, title: d.title, lastSaved: d.lastSaved })),
      save: (authorId, data) => {
        const id = `draft_${drafts.size + 1}`;
        drafts.set(id, { id, authorId, ...data, lastSaved: new Date().toISOString() });
        return { id };
      },
    },
    
    categories: {
      findById: (id) => categories.get(id),
      findBySlug: (slug) => Array.from(categories.values()).find(c => c.slug === slug),
      findMany: () => Array.from(categories.values()).sort((a, b) => a.order - b.order),
      getPostCount: (categoryId) => 
        Array.from(posts.values()).filter(p => p.categoryId === categoryId && p.status === 'published').length,
    },
    
    tags: {
      findById: (id) => tags.get(id),
      findBySlug: (slug) => Array.from(tags.values()).find(t => t.slug === slug),
      findMany: () => Array.from(tags.values()),
      getPopular: (limit) => {
        const tagCounts = new Map<string, number>();
        posts.forEach(post => {
          if (post.status === 'published') {
            post.tagIds.forEach(tagId => {
              tagCounts.set(tagId, (tagCounts.get(tagId) || 0) + 1);
            });
          }
        });
        
        return Array.from(tags.values())
          .map(tag => ({ ...tag, count: tagCounts.get(tag.id) || 0 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },
    },
    
    search: {
      query: (term) => {
        const normalized = term.toLowerCase();
        const results = new Set<string>();
        
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
    },
    
    analytics: {
      track: (event, data) => {
        analyticsEvents.push({
          id: `evt_${analyticsEvents.length + 1}`,
          event,
          data,
          timestamp: new Date().toISOString(),
        });
      },
      getRecent: (limit) => analyticsEvents.slice(-limit).reverse(),
      getSummary: () => {
        const byEvent: Record<string, number> = {};
        analyticsEvents.forEach(e => {
          byEvent[e.event] = (byEvent[e.event] || 0) + 1;
        });
        return { totalEvents: analyticsEvents.length, byEvent };
      },
    },
    
    stats: () => ({
      posts: posts.size,
      comments: comments.size,
      drafts: drafts.size,
      categories: categories.size,
      tags: tags.size,
      totalViews: Array.from(posts.values()).reduce((sum, p) => sum + p.views, 0),
      totalLikes: Array.from(posts.values()).reduce((sum, p) => sum + p.likes, 0),
    }),
  };
};

