/**
 * 🔒 <Tag>liatelle.js - Security Utilities
 *
 * Additional security on top of Fastify's built-in protections:
 * - Error message sanitization (no stack trace leakage)
 * - Input validation helpers
 * - Middleware timeout wrapper
 * - Auth failure rate limiting
 *
 * Note: Fastify handles prototype pollution at JSON parse level
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ ERROR SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sensitive patterns that should never appear in error messages
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /authorization/i,
  /credential/i,
  /private/i,
  /\.env/i,
  /database/i,
  /connection/i,
  /node_modules/i,
  /at\s+\w+\s+\(/i, // Stack trace patterns
];

/**
 * Sanitizes an error message for safe external exposure
 * Removes stack traces, sensitive data, and internal paths
 */
export function sanitizeErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (!error) return fallback;

  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    return fallback;
  }

  // Remove stack traces (take first line only)
  message = message.split('\n')[0];

  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(message)) {
      return fallback;
    }
  }

  // Remove file paths
  message = message.replace(/\/[\w/.-]+\.(js|ts|tsx|jsx)/g, '[path]');

  // Limit length
  if (message.length > 200) {
    message = message.slice(0, 200) + '...';
  }

  return message || fallback;
}

/**
 * Creates a safe error response object
 */
export function safeErrorResponse(
  error: unknown,
  isDevelopment = false
): { error: string; details?: unknown } {
  const response: { error: string; details?: unknown } = {
    error: sanitizeErrorMessage(error, 'Internal server error'),
  };

  // Only include stack in development
  if (isDevelopment && error instanceof Error) {
    response.details = {
      message: error.message,
      stack: error.stack?.replace(/\(\/[^)]+\)/g, '([path])'),
    };
  }

  return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ SAFE OBJECT MERGE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Safely merges source into target
 * Note: Fastify already handles prototype pollution at JSON parse level
 */
export function safeMerge<T extends object>(target: T, source: unknown): T {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return target;
  }

  // Use Object.assign - Fastify has already sanitized the input
  Object.assign(target, source);
  return target;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validates that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a value is a safe string (no null bytes, control chars)
 */
export function isSafeString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.includes('\0')) return false;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) return false;
  return true;
}

/**
 * Validates that a value is a positive integer
 */
export function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Validates an ID string (alphanumeric, dashes, underscores)
 */
export function isValidId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

/**
 * Sanitizes a string for safe logging (prevents log injection)
 */
export function sanitizeForLog(value: string, maxLength = 100): string {
  return value
    .replace(/[\r\n]/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ MIDDLEWARE TIMEOUT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wraps an async function with a timeout
 */
export function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutError));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ AUTH FAILURE RATE LIMITING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tracks authentication failures per IP to prevent brute force attacks
 */
export class AuthFailureTracker {
  private failures = new Map<string, { count: number; firstFailure: number }>();
  private readonly maxFailures: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(
    options: {
      maxFailures?: number;
      windowMs?: number;
      blockDurationMs?: number;
    } = {}
  ) {
    this.maxFailures = options.maxFailures ?? 5;
    this.windowMs = options.windowMs ?? 15 * 60 * 1000; // 15 min
    this.blockDurationMs = options.blockDurationMs ?? 60 * 60 * 1000; // 1 hour
  }

  /**
   * Records an auth failure. Returns true if IP should be blocked.
   */
  recordFailure(ip: string): boolean {
    const now = Date.now();
    const record = this.failures.get(ip);

    if (!record || now - record.firstFailure > this.windowMs) {
      this.failures.set(ip, { count: 1, firstFailure: now });
      return false;
    }

    record.count++;

    if (record.count >= this.maxFailures) {
      record.firstFailure = now - this.windowMs + this.blockDurationMs;
      return true;
    }

    return false;
  }

  /**
   * Checks if an IP is currently blocked
   */
  isBlocked(ip: string): boolean {
    const record = this.failures.get(ip);
    if (!record) return false;

    const now = Date.now();

    if (now - record.firstFailure > this.windowMs + this.blockDurationMs) {
      this.failures.delete(ip);
      return false;
    }

    return record.count >= this.maxFailures;
  }

  /**
   * Clears failures for an IP (on successful auth)
   */
  clearFailures(ip: string): void {
    this.failures.delete(ip);
  }

  /**
   * Cleanup expired records
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = this.windowMs + this.blockDurationMs;

    for (const [ip, record] of this.failures) {
      if (now - record.firstFailure > maxAge) {
        this.failures.delete(ip);
      }
    }
  }
}

// Global auth failure tracker instance
export const authFailureTracker = new AuthFailureTracker();

// Auto-cleanup every 10 minutes
setInterval(() => authFailureTracker.cleanup(), 10 * 60 * 1000);
