import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  sanitizeErrorMessage,
  safeErrorResponse,
  isValidId,
  isNonEmptyString,
  isSafeString,
  isPositiveInt,
  sanitizeForLog,
  withTimeout,
  AuthFailureTracker,
} from '../security.js';

describe('sanitizeErrorMessage', () => {
  it('should return fallback for null/undefined', () => {
    expect(sanitizeErrorMessage(null)).toBe('An error occurred');
    expect(sanitizeErrorMessage(undefined)).toBe('An error occurred');
  });

  it('should extract message from Error objects', () => {
    const error = new Error('Simple error message');
    expect(sanitizeErrorMessage(error)).toBe('Simple error message');
  });

  it('should handle string errors', () => {
    expect(sanitizeErrorMessage('String error')).toBe('String error');
  });

  it('should return fallback for non-string/non-Error types', () => {
    expect(sanitizeErrorMessage(123)).toBe('An error occurred');
    expect(sanitizeErrorMessage({ message: 'object' })).toBe('An error occurred');
  });

  it('should take only first line (remove stack traces)', () => {
    const multiLineError = 'Error message\n    at function (/path/to/file.js:10:5)';
    expect(sanitizeErrorMessage(multiLineError)).toBe('Error message');
  });

  it('should return fallback for sensitive patterns', () => {
    expect(sanitizeErrorMessage('Invalid password provided')).toBe('An error occurred');
    expect(sanitizeErrorMessage('Missing API_KEY')).toBe('An error occurred');
    expect(sanitizeErrorMessage('Token expired')).toBe('An error occurred');
    expect(sanitizeErrorMessage('Database connection failed')).toBe('An error occurred');
    expect(sanitizeErrorMessage('Error in node_modules')).toBe('An error occurred');
    expect(sanitizeErrorMessage('at myFunction (')).toBe('An error occurred');
  });

  it('should replace file paths with [path]', () => {
    const errorWithPath = 'Failed to load /home/user/app/module.ts';
    expect(sanitizeErrorMessage(errorWithPath)).toBe('Failed to load [path]');
  });

  it('should truncate messages longer than 200 characters', () => {
    const longMessage = 'A'.repeat(250);
    const result = sanitizeErrorMessage(longMessage);
    expect(result).toHaveLength(203); // 200 + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('should use custom fallback message', () => {
    expect(sanitizeErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});

describe('safeErrorResponse', () => {
  it('should return error object with sanitized message', () => {
    const error = new Error('Something went wrong');
    const response = safeErrorResponse(error);
    expect(response).toEqual({ error: 'Something went wrong' });
  });

  it('should include details in development mode', () => {
    const error = new Error('Dev error');
    error.stack = 'Error: Dev error\n    at test (/path/to/file.js:10:5)';
    const response = safeErrorResponse(error, true);
    expect(response.error).toBe('Dev error');
    expect(response.details).toBeDefined();
    expect((response.details as { message: string }).message).toBe('Dev error');
    expect((response.details as { stack: string }).stack).toContain('([path])');
  });

  it('should not include details in production mode', () => {
    const error = new Error('Prod error');
    const response = safeErrorResponse(error, false);
    expect(response.details).toBeUndefined();
  });
});

describe('isValidId', () => {
  it('should return true for valid IDs', () => {
    expect(isValidId('abc123')).toBe(true);
    expect(isValidId('user_id')).toBe(true);
    expect(isValidId('user-id')).toBe(true);
    expect(isValidId('ABC_123-xyz')).toBe(true);
  });

  it('should return false for non-string values', () => {
    expect(isValidId(123)).toBe(false);
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId({})).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidId('')).toBe(false);
  });

  it('should return false for strings with invalid characters', () => {
    expect(isValidId('user@id')).toBe(false);
    expect(isValidId('user id')).toBe(false);
    expect(isValidId('user.id')).toBe(false);
    expect(isValidId('../path')).toBe(false);
  });

  it('should return false for strings longer than 128 characters', () => {
    const longId = 'a'.repeat(129);
    expect(isValidId(longId)).toBe(false);
    expect(isValidId('a'.repeat(128))).toBe(true);
  });
});

describe('isNonEmptyString', () => {
  it('should return true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString('  hello  ')).toBe(true);
  });

  it('should return false for empty or whitespace-only strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString('\t\n')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe('isSafeString', () => {
  it('should return true for safe strings', () => {
    expect(isSafeString('Hello World')).toBe(true);
    expect(isSafeString('Test 123!')).toBe(true);
    expect(isSafeString('')).toBe(true);
  });

  it('should return false for strings with null bytes', () => {
    expect(isSafeString('hello\0world')).toBe(false);
  });

  it('should return false for strings with control characters', () => {
    expect(isSafeString('hello\x01world')).toBe(false);
    expect(isSafeString('test\x1F')).toBe(false);
    expect(isSafeString('test\x7F')).toBe(false);
  });

  it('should allow newlines and tabs', () => {
    expect(isSafeString('hello\nworld')).toBe(true);
    expect(isSafeString('hello\tworld')).toBe(true);
    expect(isSafeString('hello\rworld')).toBe(true);
  });

  it('should return false for non-string values', () => {
    expect(isSafeString(123)).toBe(false);
    expect(isSafeString(null)).toBe(false);
    expect(isSafeString(undefined)).toBe(false);
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

  it('should return false for negative numbers', () => {
    expect(isPositiveInt(-1)).toBe(false);
    expect(isPositiveInt(-100)).toBe(false);
  });

  it('should return false for non-integers', () => {
    expect(isPositiveInt(1.5)).toBe(false);
    expect(isPositiveInt(0.001)).toBe(false);
  });

  it('should return false for non-number values', () => {
    expect(isPositiveInt('1')).toBe(false);
    expect(isPositiveInt(null)).toBe(false);
    expect(isPositiveInt(undefined)).toBe(false);
    expect(isPositiveInt(NaN)).toBe(false);
  });
});

describe('sanitizeForLog', () => {
  it('should replace newlines with spaces', () => {
    expect(sanitizeForLog('hello\nworld')).toBe('hello world');
    expect(sanitizeForLog('hello\r\nworld')).toBe('hello  world');
  });

  it('should remove control characters', () => {
    expect(sanitizeForLog('hello\x00world')).toBe('helloworld');
    expect(sanitizeForLog('test\x1F')).toBe('test');
  });

  it('should truncate to maxLength', () => {
    const longString = 'a'.repeat(150);
    expect(sanitizeForLog(longString)).toHaveLength(100);
    expect(sanitizeForLog(longString, 50)).toHaveLength(50);
  });

  it('should handle empty strings', () => {
    expect(sanitizeForLog('')).toBe('');
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve if function completes before timeout', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const promise = withTimeout(fn, 1000);

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('success');
  });

  it('should reject with timeout error if function takes too long', async () => {
    const fn = vi.fn().mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve('late'), 2000);
    }));

    const promise = withTimeout(fn, 1000);

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Operation timed out');
  });

  it('should use custom timeout error message', async () => {
    const fn = vi.fn().mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve('late'), 2000);
    }));

    const promise = withTimeout(fn, 1000, 'Custom timeout');

    vi.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Custom timeout');
  });

  it('should propagate function errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Function failed'));
    const promise = withTimeout(fn, 1000);

    await expect(promise).rejects.toThrow('Function failed');
  });
});

describe('AuthFailureTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track failures and return false before max failures', () => {
    const tracker = new AuthFailureTracker({ maxFailures: 5 });

    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
  });

  it('should return true when max failures reached', () => {
    const tracker = new AuthFailureTracker({ maxFailures: 3 });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');
    expect(tracker.recordFailure('192.168.1.1')).toBe(true);
  });

  it('should report IP as blocked after max failures', () => {
    const tracker = new AuthFailureTracker({ maxFailures: 3 });

    expect(tracker.isBlocked('192.168.1.1')).toBe(false);

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');

    expect(tracker.isBlocked('192.168.1.1')).toBe(true);
  });

  it('should reset failures after window expires', () => {
    const tracker = new AuthFailureTracker({
      maxFailures: 3,
      windowMs: 1000
    });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');

    vi.advanceTimersByTime(1500);

    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
  });

  it('should clear failures for an IP', () => {
    const tracker = new AuthFailureTracker({ maxFailures: 3 });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');
    tracker.clearFailures('192.168.1.1');

    expect(tracker.isBlocked('192.168.1.1')).toBe(false);
    expect(tracker.recordFailure('192.168.1.1')).toBe(false);
  });

  it('should track failures separately for different IPs', () => {
    const tracker = new AuthFailureTracker({ maxFailures: 2 });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.2');

    expect(tracker.recordFailure('192.168.1.1')).toBe(true);
    expect(tracker.isBlocked('192.168.1.2')).toBe(false);
  });

  it('should cleanup expired records', () => {
    const tracker = new AuthFailureTracker({
      maxFailures: 3,
      windowMs: 1000,
      blockDurationMs: 2000
    });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');

    expect(tracker.isBlocked('192.168.1.1')).toBe(true);

    // After max failures, firstFailure is set to: now - windowMs + blockDurationMs
    // So we need to wait more than windowMs + blockDurationMs from that adjusted time
    vi.advanceTimersByTime(4001);
    tracker.cleanup();

    expect(tracker.isBlocked('192.168.1.1')).toBe(false);
  });

  it('should unblock IP after block duration expires', () => {
    const tracker = new AuthFailureTracker({
      maxFailures: 2,
      windowMs: 1000,
      blockDurationMs: 2000
    });

    tracker.recordFailure('192.168.1.1');
    tracker.recordFailure('192.168.1.1');

    expect(tracker.isBlocked('192.168.1.1')).toBe(true);

    // After max failures, firstFailure is adjusted forward by blockDurationMs - windowMs
    // isBlocked returns false when: now - firstFailure > windowMs + blockDurationMs
    // Need to wait > windowMs + blockDurationMs from the adjusted firstFailure time
    vi.advanceTimersByTime(4001);

    expect(tracker.isBlocked('192.168.1.1')).toBe(false);
  });
});
