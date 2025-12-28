/**
 * 🔐 AUTH DATABASE
 * 
 * User identity and session management.
 * Contains: Users, Sessions, Tokens, API Keys
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA STORES
// ═══════════════════════════════════════════════════════════════════════════

const users = new Map([
  ['user_1', { 
    id: 'user_1', 
    email: 'admin@company.io', 
    name: 'System Admin',
    passwordHash: 'hashed_admin_123', // In production: use bcrypt
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete', 'admin'],
    createdAt: '2024-01-01',
    lastLogin: '2024-12-27',
    mfaEnabled: true,
  }],
  ['user_2', { 
    id: 'user_2', 
    email: 'editor@company.io', 
    name: 'Content Editor',
    passwordHash: 'hashed_editor_456',
    role: 'editor' as const,
    permissions: ['read', 'write'],
    createdAt: '2024-02-15',
    lastLogin: '2024-12-26',
    mfaEnabled: false,
  }],
  ['user_3', { 
    id: 'user_3', 
    email: 'reader@company.io', 
    name: 'Regular Reader',
    passwordHash: 'hashed_reader_789',
    role: 'user' as const,
    permissions: ['read'],
    createdAt: '2024-03-20',
    lastLogin: '2024-12-25',
    mfaEnabled: false,
  }],
]);

const sessions = new Map([
  ['sess_admin_active', {
    id: 'sess_admin_active',
    userId: 'user_1',
    token: 'token_admin_123',
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() + 86400000, // 24h from now
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    isActive: true,
  }],
  ['sess_editor_active', {
    id: 'sess_editor_active',
    userId: 'user_2',
    token: 'token_editor_456',
    createdAt: Date.now() - 7200000,
    expiresAt: Date.now() + 86400000,
    ipAddress: '192.168.1.2',
    userAgent: 'Chrome/120',
    isActive: true,
  }],
  ['sess_reader_active', {
    id: 'sess_reader_active',
    userId: 'user_3',
    token: 'token_reader_789',
    createdAt: Date.now() - 1800000,
    expiresAt: Date.now() + 86400000,
    ipAddress: '192.168.1.3',
    userAgent: 'Safari/17',
    isActive: true,
  }],
]);

// API keys for internal service authentication
const apiKeys = new Map([
  ['key_internal', {
    id: 'key_internal',
    key: 'internal_api_key_abc123',
    serviceName: 'Internal Service',
    permissions: ['validate_token', 'get_user'],
    createdAt: '2024-01-01',
    lastUsed: null as string | null,
    rateLimit: 1000,
  }],
]);

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthDBUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'editor' | 'user';
  permissions: string[];
  createdAt: string;
  lastLogin: string;
  mfaEnabled: boolean;
}

export interface AuthDBSession {
  id: string;
  userId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface AuthDB {
  // User operations
  users: {
    findById: (id: string) => AuthDBUser | undefined;
    findByEmail: (email: string) => AuthDBUser | undefined;
    findMany: () => AuthDBUser[];
    create: (data: Omit<AuthDBUser, 'id' | 'createdAt' | 'lastLogin'>) => AuthDBUser;
    updateLastLogin: (id: string) => void;
    count: () => number;
  };
  
  // Session operations
  sessions: {
    findByToken: (token: string) => AuthDBSession | undefined;
    findByUserId: (userId: string) => AuthDBSession[];
    create: (userId: string, token: string, meta: { ip: string; userAgent: string }) => AuthDBSession;
    invalidate: (sessionId: string) => boolean;
    invalidateAllForUser: (userId: string) => number;
    isTokenValid: (token: string) => { valid: boolean; user?: AuthDBUser; reason?: string };
  };
  
  // API key operations
  apiKeys: {
    validate: (key: string) => { valid: boolean; serviceName?: string; permissions?: string[] };
  };
  
  // Stats
  stats: () => { users: number; activeSessions: number; apiKeys: number };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export const createAuthDB = async (): Promise<AuthDB> => {
  console.log('🔐 Auth Database connected!');
  
  return {
    users: {
      findById: (id) => users.get(id),
      findByEmail: (email) => Array.from(users.values()).find(u => u.email === email),
      findMany: () => Array.from(users.values()),
      create: (data) => {
        const id = `user_${users.size + 1}`;
        const user: AuthDBUser = {
          id,
          ...data,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
        };
        users.set(id, user);
        return user;
      },
      updateLastLogin: (id) => {
        const user = users.get(id);
        if (user) {
          user.lastLogin = new Date().toISOString().split('T')[0];
        }
      },
      count: () => users.size,
    },
    
    sessions: {
      findByToken: (token) => Array.from(sessions.values()).find(s => s.token === token),
      findByUserId: (userId) => Array.from(sessions.values()).filter(s => s.userId === userId),
      create: (userId, token, meta) => {
        const id = `sess_${Date.now()}`;
        const session: AuthDBSession = {
          id,
          userId,
          token,
          createdAt: Date.now(),
          expiresAt: Date.now() + 86400000, // 24h
          ipAddress: meta.ip,
          userAgent: meta.userAgent,
          isActive: true,
        };
        sessions.set(id, session);
        return session;
      },
      invalidate: (sessionId) => {
        const session = sessions.get(sessionId);
        if (session) {
          session.isActive = false;
          return true;
        }
        return false;
      },
      invalidateAllForUser: (userId) => {
        let count = 0;
        sessions.forEach(s => {
          if (s.userId === userId && s.isActive) {
            s.isActive = false;
            count++;
          }
        });
        return count;
      },
      isTokenValid: (token) => {
        const session = Array.from(sessions.values()).find(s => s.token === token);
        
        if (!session) {
          return { valid: false, reason: 'Token not found' };
        }
        
        if (!session.isActive) {
          return { valid: false, reason: 'Session invalidated' };
        }
        
        if (session.expiresAt < Date.now()) {
          return { valid: false, reason: 'Token expired' };
        }
        
        const user = users.get(session.userId);
        if (!user) {
          return { valid: false, reason: 'User not found' };
        }
        
        return { valid: true, user };
      },
    },
    
    apiKeys: {
      validate: (key) => {
        const apiKey = Array.from(apiKeys.values()).find(k => k.key === key);
        if (!apiKey) {
          return { valid: false };
        }
        apiKey.lastUsed = new Date().toISOString();
        return { valid: true, serviceName: apiKey.serviceName, permissions: apiKey.permissions };
      },
    },
    
    stats: () => ({
      users: users.size,
      activeSessions: Array.from(sessions.values()).filter(s => s.isActive).length,
      apiKeys: apiKeys.size,
    }),
  };
};
