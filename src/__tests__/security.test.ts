import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeErrorMessage,
  safeErrorResponse,
  safeMerge,
  isNonEmptyString,
  isSafeString,
  isPositiveInt,
  isValidId,
  sanitizeForLog,
  withTimeout,
  AuthFailureTracker,
} from '../security.js';

describe('sanitizeErrorMessage', () => {
  it('should return fallback for null/undefined errors', () => {
    expect(sanitizeErrorMessage(null)).toBe('An error occurred');
    expect(sanitizeErrorMessage(undefined)).toBe('An error occurred');
  });

  it('should extract message from Error objects', () => {
    const error = new Error('Something went wrong');
    expect(sanitizeErrorMessage(error)).toBe('Something went wrong');
  });

  it('should handle string errors', () => {
    expect(sanitizeErrorMessage('Simple error')).toBe('Simple error');
  });

  it('should return fallback for non-string/non-Error types', () => {
    expect(sanitizeErrorMessage(123)).toBe('An error occurred');
    expect(sanitizeErrorMessage({ message: 'test' })).toBe('An error occurred');
    expect(sanitizeErrorMessage([])).toBe('An error occurred');
  });

  it('should remove multiline content (stack traces)', () => {
    const errorWithStack = 'Error message\n    at Function.test\n    at Object.run';
    expect(sanitizeErrorMessage(errorWithStack)).toBe('Error message');
  });

  it('should redact sensitive patterns - password', () => {
    expect(sanitizeErrorMessage('Invalid password provided')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - secret', () => {
    expect(sanitizeErrorMessage('Secret key is missing')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - token', () => {
    expect(sanitizeErrorMessage('Token expired')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - api_key', () => {
    expect(sanitizeErrorMessage('api_key not found')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - authorization', () => {
    expect(sanitizeErrorMessage('Authorization header missing')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - credential', () => {
    expect(sanitizeErrorMessage('Invalid credential')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - database', () => {
    expect(sanitizeErrorMessage('Database connection failed')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - .env', () => {
    expect(sanitizeErrorMessage('Missing .env file')).toBe('An error occurred');
  });

  it('should redact sensitive patterns - node_modules', () => {
    expect(sanitizeErrorMessage('Error in node_modules/package')).toBe('An error occurred');
  });

  it('should redact stack trace patterns', () => {
    expect(sanitizeErrorMessage('at Function (')).toBe('An error occurred');
  });

  it('should replace file paths with [path]', () => {
    const error = 'Error loading /home/user/app/src/index.ts';
    expect(sanitizeErrorMessage(error)).toBe('Error loading [path]');
  });

  it('should truncate long messages', () => {
    const longMessage = 'A'.repeat(300);
    const result = sanitizeErrorMessage(longMessage);
    expect(result.length).toBe(203); // 200 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('should use custom fallback message', () => {
    expect(sanitizeErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});

describe('safeErrorResponse', () => {
  it('should return sanitized error message', () => {
    const response = safeErrorResponse(new Error('Test error'));
    expect(response.error).toBe('Test error');
    expect(response.details).toBeUndefined();
  });

  it('should include details in development mode', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at (/home/user/app.js:1:1)';
    const response = safeErrorResponse(error, true);
    expect(response.error).toBe('Test error');
    expect(response.details).toBeDefined();
    expect((response.details as { message: string }).message).toBe('Test error');
    expect((response.details as { stack: string }).stack).toContain('[path]');
  });

  it('should not include details in production mode', () => {
    const error = new Error('Test error');
    const response = safeErrorResponse(error, false);
    expect(response.details).toBeUndefined();
  });

  it('should use default fallback for internal errors', () => {
    const response = safeErrorResponse(null);
    expect(response.error).toBe('Internal server error');
  });
});

describe('safeMerge', () => {
  it('should merge objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = safeMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should return target for null source', () => {
    const target = { a: 1 };
    const result = safeMerge(target, null);
    expect(result).toEqual({ a: 1 });
  });

  it('should return target for undefined source', () => {
    const target = { a: 1 };
    const result = safeMerge(target, undefined);
    expect(result).toEqual({ a: 1 });
  });

  it('should return target for array source', () => {
    const target = { a: 1 };
    const result = safeMerge(target, [1, 2, 3]);
    expect(result).toEqual({ a: 1 });
  });

  it('should return target for primitive source', () => {
    const target = { a: 1 };
    const result = safeMerge(target, 'string');
    expect(result).toEqual({ a: 1 });
  });
});

describe('isNonEmptyString', () => {
  it('should return true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString('  hello  ')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('should return false for non-strings', () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
    expect(isNonEmptyString([])).toBe(false);
  });
});

describe('isSafeString', () => {
  it('should return true for safe strings', () => {
    expect(isSafeString('hello world')).toBe(true);
    expect(isSafeString('hello\nworld')).toBe(true); // newlines are allowed
    expect(isSafeString('hello\tworld')).toBe(true); // tabs are allowed
  });

  it('should return false for strings with null bytes', () => {
    expect(isSafeString('hello\0world')).toBe(false);
  });

  it('should return false for strings with control characters', () => {
    expect(isSafeString('hello\x00world')).toBe(false);
    expect(isSafeString('hello\x1Fworld')).toBe(false);
    expect(isSafeString('hello\x7Fworld')).toBe(false);
  });

  it('should return false for non-strings', () => {
    expect(isSafeString(null)).toBe(false);
    expect(isSafeString(undefined)).toBe(false);
    expect(isSafeString(123)).toBe(false);
  });
});

describe('isPositiveInt', () => {
  it('should return true for positive integers', () => {
    expect(isPositiveInt(1)).toBe(true);
    expect(isPositiveInt(100)).toBe(true);
    expect(isPositiveInt(999999)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isPositiveInt(0)).toBe(false);
  });

  it('should return false for negative integers', () => {
    expect(isPositiveInt(-1)).toBe(false);
    expect(isPositiveInt(-100)).toBe(false);
  });

  it('should return false for non-integers', () => {
    expect(isPositiveInt(1.5)).toBe(false);
    expect(isPositiveInt(0.1)).toBe(false);
  });

  it('should return false for non-numbers', () => {
    expect(isPositiveInt('1')).toBe(false);
    expect(isPositiveInt(null)).toBe(false);
    expect(isPositiveInt(undefined)).toBe(false);
  });
});

describe('isValidId', () => {
  it('should return true for valid IDs', () => {
    expect(isValidId('abc123')).toBe(true);
    expect(isValidId('user_id')).toBe(true);
    expect(isValidId('some-id')).toBe(true);
    expect(isValidId('ABC_123-test')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isValidId('')).toBe(false);
  });

  it('should return false for IDs with invalid characters', () => {
    expect(isValidId('hello world')).toBe(false);
    expect(isValidId('user@id')).toBe(false);
    expect(isValidId('id!test')).toBe(false);
  });

  it('should return false for IDs longer than 128 characters', () => {
    expect(isValidId('a'.repeat(129))).toBe(false);
  });

  it('should return true for IDs exactly 128 characters', () => {
    expect(isValidId('a'.repeat(128))).toBe(true);
  });

  it('should return false for non-strings', () => {
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId(123)).toBe(false);
  });
});

describe('sanitizeForLog', () => {
  it('should replace newlines with spaces', () => {
    expect(sanitizeForLog('line1\nline2\rline3')).toBe('line1 line2 line3');
  });

  it('should remove control characters', () => {
    expect(sanitizeForLog('hello\x00world')).toBe('helloworld');
    expect(sanitizeForLog('test\x1F')).toBe('test');
  });

  it('should truncate long strings', () => {
    const longString = 'a'.repeat(200);
    expect(sanitizeForLog(longString).length).toBe(100);
  });

  it('should respect custom maxLength', () => {
    const string = 'a'.repeat(50);
    expect(sanitizeForLog(string, 20).length).toBe(20);
  });
});

describe('withTimeout', () => {
  it('should resolve when function completes before timeout', async () => {
    const result = await withTimeout(() => Promise.resolve('success'), 1000);
    expect(result).toBe('success');
  });

  it('should reject when function times out', async () => {
    await expect(
      withTimeout(() => new Promise((resolve) => setTimeout(resolve, 100)), 10)
    ).rejects.toThrow('Operation timed out');
  });

  it('should use custom timeout error message', async () => {
    await expect(
      withTimeout(() => new Promise((resolve) => setTimeout(resolve, 100)), 10, 'Custom timeout')
    ).rejects.toThrow('Custom timeout');
  });

  it('should propagate function errors', async () => {
    await expect(
      withTimeout(() => Promise.reject(new Error('Function error')), 1000)
    ).rejects.toThrow('Function error');
  });
});

describe('AuthFailureTracker', () => {
  let tracker: AuthFailureTracker;

  beforeEach(() => {
    tracker = new AuthFailureTracker({
      maxFailures: 3,
      windowMs: 1000,
      blockDurationMs: 2000,
    });
  });

  it('should not block on first failure', () => {
    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
  });

  it('should not be blocked initially', () => {
    expect(tracker.isBlocked('192.168.1.1')).toBe(false);
  });

  it('should block after max failures', () => {
    const ip = '192.168.1.2';
    tracker.recordFailure(ip);
    tracker.recordFailure(ip);
    const shouldBlock = tracker.recordFailure(ip);
    expect(shouldBlock).toBe(true);
    expect(tracker.isBlocked(ip)).toBe(true);
  });

  it('should clear failures on success', () => {
    const ip = '192.168.1.3';
    tracker.recordFailure(ip);
    tracker.recordFailure(ip);
    tracker.clearFailures(ip);
    expect(tracker.isBlocked(ip)).toBe(false);
    // Should not block on next failure since cleared
    expect(tracker.recordFailure(ip)).toBe(false);
  });

  it('should track failures independently per IP', () => {
    const ip1 = '192.168.1.4';
    const ip2 = '192.168.1.5';

    tracker.recordFailure(ip1);
    tracker.recordFailure(ip1);
    tracker.recordFailure(ip1);

    expect(tracker.isBlocked(ip1)).toBe(true);
    expect(tracker.isBlocked(ip2)).toBe(false);
  });

  it('should use default options when not provided', () => {
    const defaultTracker = new AuthFailureTracker();
    expect(defaultTracker.isBlocked('192.168.1.6')).toBe(false);
  });
});
