import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@aistartupimpact/database', () => ({
  prisma: {
    webUser: { findUnique: vi.fn(() => Promise.resolve(null)), findFirst: vi.fn(() => Promise.resolve(null)), create: vi.fn() },
    emailOtp: { count: vi.fn(() => Promise.resolve(0)), updateMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(() => Promise.resolve(null)) },
    newsletterSubscriber: { findFirst: vi.fn(() => Promise.resolve(null)), create: vi.fn() },
    $queryRaw: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  getClientIdentifier: vi.fn(() => 'test-ip'),
  apiRateLimit: {},
  authRateLimit: {},
  strictRateLimit: {},
}));

vi.mock('@/lib/founder-auth', () => ({
  getFounderSession: vi.fn(() => Promise.resolve(null)),
  requireFounderAuth: vi.fn(() => Promise.reject(new Error('AUTH'))),
}));

vi.mock('@/lib/employer-auth', () => ({
  getEmployerSession: vi.fn(() => Promise.resolve(null)),
  requireEmployerAuth: vi.fn(() => { throw 'AUTH'; }),
}));

vi.mock('@/lib/organizer-auth', () => ({
  getOrganizerSession: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/lib/user-session', () => ({
  getUserSession: vi.fn(() => Promise.resolve(null)),
  isAuthenticated: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

function makeRequest(url: string, method = 'POST', body?: any) {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('input validation on API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('XSS payload rejection', () => {
    it('XSS in profile name is sanitized or rejected', async () => {
      // Even if the route accepts the input, Zod schema should validate
      // The key test: script tags should not pass through as-is
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '<svg onload=alert(1)>',
      ];

      for (const payload of xssPayloads) {
        // These should be caught by sanitizeText or validation
        const { sanitizeText } = await import('@/lib/validation');
        const sanitized = sanitizeText(payload);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
      }
    });
  });

  describe('schema validation prevents bad input', () => {
    it('rejects signup with missing fields', async () => {
      const { signupSchema } = await import('@/lib/validation');
      const result = signupSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects signup with XSS in email', async () => {
      const { signupSchema } = await import('@/lib/validation');
      const result = signupSchema.safeParse({
        email: '<script>alert(1)</script>',
        password: 'Abc12345',
        name: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('rejects review with rating out of range', async () => {
      const { reviewSchema } = await import('@/lib/validation');
      expect(reviewSchema.safeParse({ rating: 0, title: 'Test Title', body: 'OK' }).success).toBe(false);
      expect(reviewSchema.safeParse({ rating: 6, title: 'Test Title', body: 'OK' }).success).toBe(false);
      expect(reviewSchema.safeParse({ rating: -1, title: 'Test Title', body: 'OK' }).success).toBe(false);
    });

    it('rejects comment with body too long', async () => {
      const { commentSchema } = await import('@/lib/validation');
      const result = commentSchema.safeParse({
        name: 'John',
        body: 'x'.repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it('rejects startup submission with invalid URL', async () => {
      const { startupSubmissionSchema } = await import('@/lib/validation');
      const result = startupSubmissionSchema.safeParse({
        name: 'Test Startup',
        tagline: 'A great startup platform',
        description: 'x'.repeat(50),
        websiteUrl: 'not-a-valid-url',
        category: 'AI',
        stage: 'SEED',
        founderEmail: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });

    it('rejects tool submission with invalid pricing model', async () => {
      const { toolSubmissionSchema } = await import('@/lib/validation');
      const result = toolSubmissionSchema.safeParse({
        name: 'Test Tool',
        tagline: 'A great AI tool for you',
        description: 'x'.repeat(50),
        websiteUrl: 'https://example.com',
        pricingModel: 'INVALID_MODEL',
      });
      expect(result.success).toBe(false);
    });

    it('rejects newsletter with invalid email', async () => {
      const { newsletterSchema } = await import('@/lib/validation');
      const result = newsletterSchema.safeParse({ email: 'not-email' });
      expect(result.success).toBe(false);
    });

    it('rejects support ticket with short subject', async () => {
      const { supportTicketSchema } = await import('@/lib/validation');
      const result = supportTicketSchema.safeParse({
        subject: 'Hi',
        description: 'I need help with something',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateInput helper', () => {
    it('returns structured error for invalid data', async () => {
      const { validateInput, emailSchema } = await import('@/lib/validation');
      const result = validateInput(emailSchema, { email: 'not-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe('string');
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it('returns parsed data for valid input', async () => {
      const { validateInput, emailSchema } = await import('@/lib/validation');
      const result = validateInput(emailSchema, { email: 'test@example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });
  });
});
