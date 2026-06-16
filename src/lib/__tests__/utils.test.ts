import { sanitizeInput, globalRateLimiter } from '../utils';

/**
 * Security & Utility Tests
 * Validates XSS sanitization and rate limiter behavior.
 */
describe('sanitizeInput', () => {
  test('strips HTML tags from input', () => {
    expect(sanitizeInput('<script>alert(1)</script>Hello')).toBe('alert(1)Hello');
  });

  test('removes javascript: protocol', () => {
    // eslint-disable-next-line no-script-url
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  test('removes on* event handlers', () => {
    expect(sanitizeInput('onerror=alert(1)')).toBe('alert(1)');
  });

  test('removes data: URIs', () => {
    expect(sanitizeInput('data:text/html,<h1>Hi</h1>')).toBe('text/html,Hi');
  });

  test('handles empty input gracefully', () => {
    expect(sanitizeInput('')).toBe('');
  });

  test('handles null-ish input gracefully', () => {
    expect(sanitizeInput(undefined as any)).toBe('');
  });

  test('enforces maximum input length of 1000 characters', () => {
    const longString = 'a'.repeat(1500);
    expect(sanitizeInput(longString).length).toBe(1000);
  });

  test('trims whitespace from input', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('RateLimiter', () => {
  test('initializes with maximum tokens', () => {
    expect(globalRateLimiter.tokens).toBeDefined();
    expect(globalRateLimiter.maxTokens).toBeGreaterThan(0);
  });

  test('consumes a token on canProceed()', () => {
    const initial = globalRateLimiter.tokens;
    globalRateLimiter.canProceed();
    expect(globalRateLimiter.tokens).toBeLessThan(initial);
  });

  test('prevents proceeding when all tokens are consumed', () => {
    for (let i = 0; i < 20; i++) globalRateLimiter.canProceed();
    expect(globalRateLimiter.canProceed()).toBe(false);
  });

  test('refills tokens based on elapsed time', () => {
    globalRateLimiter.lastRefill = Date.now() - 5000;
    globalRateLimiter.canProceed();
    expect(globalRateLimiter.tokens).toBeGreaterThan(0);
  });

  test('caps refilled tokens at maxTokens', () => {
    globalRateLimiter.lastRefill = Date.now() - 100000;
    globalRateLimiter.canProceed();
    expect(globalRateLimiter.tokens).toBe(globalRateLimiter.maxTokens - 1);
  });
});
