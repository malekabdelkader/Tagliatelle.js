// @ts-nocheck
/**
 * 📝 BLOG DATABASE
 * 
 * Owned by: Content & Media Team
 * Contains: Posts, Comments, Likes, Drafts
 * 
 * This DB only stores content. User info is fetched from Auth Service.
 * Posts reference authorId but don't store user details (denormalized on read).
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORES
// ═══════════════════════════════════════════════════════════════════════════

const posts = new Map([
  ['post_1', {
    id: 'post_1',
    authorId: 'user_1', // References Auth DB
    title: 'Getting Started with Microservices in Tagliatelle.js',
    slug: 'getting-started-microservices',
    content: 'Learn how to build scalable microservices architecture using JSX for the backend...',
    excerpt: 'A comprehensive guide to microservices with Tagliatelle.js',
    status: 'published' as const,
    categoryIds: ['cat_1'], // References Platform DB
    tagIds: ['tag_1', 'tag_2'], // References Platform DB
    views: 2500,
    likes: 145,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    publishedAt: '2024-01-15T12:00:00Z',
  }],
  ['post_2', {
    id: 'post_2',
    authorId: 'user_2',
    title: 'Advanced Middleware Patterns for Enterprise Apps',
    slug: 'advanced-middleware-patterns',
    content: 'Deep dive into middleware composition, chaining, and error handling...',
    excerpt: 'Master middleware patterns for production applications',
    status: 'published' as const,
    categoryIds: ['cat_2'],
    tagIds: ['tag_1', 'tag_3'],
    views: 1800,
    likes: 92,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-25T11:00:00Z',
    publishedAt: '2024-02-20T14:00:00Z',
  }],
  ['post_3', {
    id: 'post_3',
    authorId: 'user_2',
    title: 'Database Patterns: One DB per Service',
    slug: 'database-per-service',
    content: 'Why and how to implement database-per-service pattern...',
    excerpt: 'Isolate your data for better scalability',
    status: 'published' as const,
    categoryIds: ['cat_2', 'cat_3'],
    tagIds: ['tag_2', 'tag_4'],
    views: 1200,
    likes: 67,
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-10T08:00:00Z',
    publishedAt: '2024-03-10T10:00:00Z',
  }],
]);

const drafts = new Map([
  ['draft_1', {
    id: 'draft_1',
    authorId: 'user_1',
    title: 'Upcoming: Event-Driven Architecture',
    content: 'Work in progress...',
    lastSaved: '2024-12-26T20:00:00Z',
  }],
]);

const comments = new Map([
  ['comment_1', {
    id: 'comment_1',
    postId: 'post_1',
    authorId: 'user_2', // References Auth DB
    content: 'This is exactly what I needed! Great explanation of the architecture.',
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
    content: 'Great follow-up to the first article!',
    likes: 5,
    createdAt: '2024-02-21T10:00:00Z',
    updatedAt: null,
  }],
]);

const likes = new Map([
  // Format: `${userId}_${postId}` -> like record
  ['user_2_post_1', { userId: 'user_2', postId: 'post_1', createdAt: '2024-01-16T09:00:00Z' }],
  ['user_3_post_1', { userId: 'user_3', postId: 'post_1', createdAt: '2024-01-17T14:30:00Z' }],
  ['user_1_post_2', { userId: 'user_1', postId: 'post_2', createdAt: '2024-02-21T10:00:00Z' }],
]);

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  categoryIds: string[];
  tagIds: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface BlogDB {
  // Post operations
  posts: {
    findById: (id: string) => BlogPost | undefined;
    findBySlug: (slug: string) => BlogPost | undefined;
    findMany: (options?: { status?: 'published' | 'draft'; authorId?: string }) => BlogPost[];
    create: (data: Omit<BlogPost, 'id' | 'views' | 'likes' | 'createdAt' | 'updatedAt'>) => BlogPost;
    update: (id: string, data: Partial<BlogPost>) => BlogPost | undefined;
    delete: (id: string) => boolean;
    incrementViews: (id: string) => void;
    toggleLike: (postId: string, userId: string) => { liked: boolean; totalLikes: number };
    getPopular: (limit: number) => BlogPost[];
  };
  // Comment operations
  comments: {
    findByPostId: (postId: string) => BlogComment[];
    create: (data: { postId: string; authorId: string; content: string }) => BlogComment;
    delete: (id: string) => boolean;
    count: (postId: string) => number;
  };
  // Draft operations
  drafts: {
    findByAuthor: (authorId: string) => Array<{ id: string; title: string; lastSaved: string }>;
    save: (authorId: string, data: { title: string; content: string }) => { id: string };
  };
  // Stats
  stats: () => { posts: number; comments: number; drafts: number; totalViews: number; totalLikes: number };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const createBlogDB = async (): Promise<BlogDB> => {
  console.log('📝 Blog Database connected! (Content & Media Team)');
  
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
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      create: (data) => {
        const id = `post_${posts.size + 1}`;
        const now = new Date().toISOString();
        const post: BlogPost = {
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
    },
    comments: {
      findByPostId: (postId) => 
        Array.from(comments.values())
          .filter(c => c.postId === postId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      create: (data) => {
        const id = `comment_${comments.size + 1}`;
        const comment: BlogComment = {
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
      count: (postId) => Array.from(comments.values()).filter(c => c.postId === postId).length,
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
    stats: () => ({
      posts: posts.size,
      comments: comments.size,
      drafts: drafts.size,
      totalViews: Array.from(posts.values()).reduce((sum, p) => sum + p.views, 0),
      totalLikes: Array.from(posts.values()).reduce((sum, p) => sum + p.likes, 0),
    }),
  };
};
