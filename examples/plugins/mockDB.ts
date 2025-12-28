/**
 * 🗃️ MOCK DATABASE PROVIDER
 * Simulates a database for demonstration purposes
 */

// In-memory data stores
const users = new Map([
  ['1', { id: '1', name: 'Admin Chef', email: 'admin@tagliatelle.io', role: 'admin' }],
  ['2', { id: '2', name: 'Pasta Master', email: 'pasta@tagliatelle.io', role: 'user' }],
  ['3', { id: '3', name: 'Sauce Expert', email: 'sauce@tagliatelle.io', role: 'editor' }],
]);

const posts = new Map([
  ['1', { id: '1', title: 'Getting Started with Tagliatelle.js', authorId: '1', content: 'Learn JSX for backend!', views: 1500, createdAt: '2024-01-15' }],
  ['2', { id: '2', title: 'Advanced Middleware Patterns', authorId: '2', content: 'Chaining middleware like a pro', views: 890, createdAt: '2024-02-20' }],
  ['3', { id: '3', title: 'File-Based Routing Deep Dive', authorId: '1', content: 'Master _config.tsx', views: 450, createdAt: '2024-03-10' }],
]);

const comments = new Map([
  ['1', { id: '1', postId: '1', userId: '2', text: 'Amazing framework!', createdAt: '2024-01-16' }],
  ['2', { id: '2', postId: '1', userId: '3', text: 'The JSX approach is genius', createdAt: '2024-01-17' }],
  ['3', { id: '3', postId: '2', userId: '1', text: 'Great middleware tips', createdAt: '2024-02-21' }],
]);

const categories = new Map([
  ['1', { id: '1', name: 'Tutorials', slug: 'tutorials', description: 'Learn the basics' }],
  ['2', { id: '2', name: 'Advanced', slug: 'advanced', description: 'Deep dives' }],
  ['3', { id: '3', name: 'Recipes', slug: 'recipes', description: 'Pasta recipes (meta!)' }],
]);

const tags = new Map([
  ['1', { id: '1', name: 'jsx', color: '#61dafb' }],
  ['2', { id: '2', name: 'backend', color: '#68a063' }],
  ['3', { id: '3', name: 'typescript', color: '#3178c6' }],
  ['4', { id: '4', name: 'fastify', color: '#000000' }],
]);

export interface MockDB {
  // User operations
  users: {
    findMany: () => typeof users extends Map<string, infer V> ? V[] : never;
    findById: (id: string) => ReturnType<typeof users.get>;
    create: (data: { name: string; email: string; role?: string }) => { id: string; name: string; email: string; role: string };
    update: (id: string, data: Partial<{ name: string; email: string; role: string }>) => ReturnType<typeof users.get>;
    delete: (id: string) => boolean;
  };
  // Post operations
  posts: {
    findMany: () => typeof posts extends Map<string, infer V> ? V[] : never;
    findById: (id: string) => ReturnType<typeof posts.get>;
    create: (data: { title: string; content: string; authorId: string }) => { id: string; title: string; content: string; authorId: string; views: number; createdAt: string };
    update: (id: string, data: Partial<{ title: string; content: string }>) => ReturnType<typeof posts.get>;
    delete: (id: string) => boolean;
    incrementViews: (id: string) => void;
  };
  // Comment operations
  comments: {
    findByPostId: (postId: string) => Array<ReturnType<typeof comments.get>>;
    create: (data: { postId: string; userId: string; text: string }) => { id: string; postId: string; userId: string; text: string; createdAt: string };
    delete: (id: string) => boolean;
  };
  // Category operations
  categories: {
    findMany: () => typeof categories extends Map<string, infer V> ? V[] : never;
    findBySlug: (slug: string) => ReturnType<typeof categories.get>;
  };
  // Tag operations
  tags: {
    findMany: () => typeof tags extends Map<string, infer V> ? V[] : never;
    findById: (id: string) => ReturnType<typeof tags.get>;
  };
  // Stats
  stats: {
    getCounts: () => { users: number; posts: number; comments: number; categories: number; tags: number };
  };
}

/**
 * Creates the mock database instance
 * This is an async function as required by the DB provider pattern
 */
export const createMockDB = async (): Promise<MockDB> => {
  console.log('🗃️  Mock Database connected!');
  
  return {
    users: {
      findMany: () => Array.from(users.values()),
      findById: (id: string) => users.get(id),
      create: (data) => {
        const id = String(users.size + 1);
        const user = { id, ...data, role: data.role || 'user' };
        users.set(id, user);
        return user;
      },
      update: (id, data) => {
        const user = users.get(id);
        if (!user) return undefined;
        const updated = { ...user, ...data };
        users.set(id, updated);
        return updated;
      },
      delete: (id) => users.delete(id),
    },
    posts: {
      findMany: () => Array.from(posts.values()),
      findById: (id: string) => posts.get(id),
      create: (data) => {
        const id = String(posts.size + 1);
        const post = { id, ...data, views: 0, createdAt: new Date().toISOString().split('T')[0] };
        posts.set(id, post);
        return post;
      },
      update: (id, data) => {
        const post = posts.get(id);
        if (!post) return undefined;
        const updated = { ...post, ...data };
        posts.set(id, updated);
        return updated;
      },
      delete: (id) => posts.delete(id),
      incrementViews: (id) => {
        const post = posts.get(id);
        if (post) {
          post.views++;
        }
      },
    },
    comments: {
      findByPostId: (postId: string) => 
        Array.from(comments.values()).filter(c => c?.postId === postId),
      create: (data) => {
        const id = String(comments.size + 1);
        const comment = { id, ...data, createdAt: new Date().toISOString().split('T')[0] };
        comments.set(id, comment);
        return comment;
      },
      delete: (id) => comments.delete(id),
    },
    categories: {
      findMany: () => Array.from(categories.values()),
      findBySlug: (slug: string) => 
        Array.from(categories.values()).find(c => c?.slug === slug),
    },
    tags: {
      findMany: () => Array.from(tags.values()),
      findById: (id: string) => tags.get(id),
    },
    stats: {
      getCounts: () => ({
        users: users.size,
        posts: posts.size,
        comments: comments.size,
        categories: categories.size,
        tags: tags.size,
      }),
    },
  };
};

/**
 * Alternative SQLite-like DB for demonstrating DB switching
 */
export const createLiteDB = async (): Promise<{ type: string; query: (sql: string) => string }> => {
  console.log('🪶  LiteDB connected!');
  return {
    type: 'lite',
    query: (sql: string) => `Executed: ${sql}`,
  };
};

