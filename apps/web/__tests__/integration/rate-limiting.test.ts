import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('rate-limiting', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getClientIdentifier', () => {
    it('returns cf-connecting-ip when available', async () => {
      const { getClientIdentifier } = await import('@/lib/rate-limit');
      const request = new Request('http://localhost/api/test', {
        headers: {
          'cf-connecting-ip': '1.2.3.4',
          'x-forwarded-for': '5.6.7.8',
          'x-real-ip': '9.10.11.12',
        },
      });
      expect(getClientIdentifier(request)).toBe('1.2.3.4');
    });

    it('falls back to x-real-ip', async () => {
      const { getClientIdentifier } = await import('@/lib/rate-limit');
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '5.6.7.8',
          'x-real-ip': '9.10.11.12',
        },
      });
      expect(getClientIdentifier(request)).toBe('9.10.11.12');
    });

    it('falls back to first x-forwarded-for', async () => {
      const { getClientIdentifier } = await import('@/lib/rate-limit');
      const request = new Request('http://localhost/api/test', {
        headers: {
          'x-forwarded-for': '5.6.7.8, 10.0.0.1',
        },
      });
      expect(getClientIdentifier(request)).toBe('5.6.7.8');
    });

    it('returns "unknown" when no headers present', async () => {
      const { getClientIdentifier } = await import('@/lib/rate-limit');
      const request = new Request('http://localhost/api/test');
      expect(getClientIdentifier(request)).toBe('unknown');
    });
  });

  describe('checkRateLimit — without Redis', () => {
    it('allows in non-production when no Redis', async () => {
      vi.stubEnv('NODE_ENV', 'test');
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const result = await checkRateLimit(null, 'test-id');
      expect(result.success).toBe(true);
      expect(result.limit).toBe(999);
    });

    it('blocks in production when no Redis (fail-closed)', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const { checkRateLimit } = await import('@/lib/rate-limit');
      const result = await checkRateLimit(null, 'test-id');
      expect(result.success).toBe(false);
    });
  });

  describe('rate limit tiers are correctly configured', () => {
    it('authRateLimit is null without Redis', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const { authRateLimit } = await import('@/lib/rate-limit');
      expect(authRateLimit).toBeNull();
    });

    it('apiRateLimit is null without Redis', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const { apiRateLimit } = await import('@/lib/rate-limit');
      expect(apiRateLimit).toBeNull();
    });

    it('strictRateLimit is null without Redis', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const { strictRateLimit } = await import('@/lib/rate-limit');
      expect(strictRateLimit).toBeNull();
    });
  });
});
