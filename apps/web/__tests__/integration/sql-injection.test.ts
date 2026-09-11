import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn(() => Promise.resolve([]));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => mockSql),
}));

vi.mock('@/lib/db', () => ({
  sql: mockSql,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

vi.mock('@/lib/founder-auth', () => ({
  getFounderSession: vi.fn(() => Promise.resolve({ userId: 'founder-1', startupId: 'startup-1' })),
}));

vi.mock('@/lib/user-session', () => ({
  getUserSession: vi.fn(() => Promise.resolve({ id: 'user-1', email: 'test@example.com', name: 'Test' })),
  isAuthenticated: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  getClientIdentifier: vi.fn(() => 'test-ip'),
  apiRateLimit: {},
  authRateLimit: {},
  strictRateLimit: {},
}));

function makeRequest(url: string, method = 'GET', body?: any) {
  const init: any = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

describe('SQL injection resistance — parameterized queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('search endpoint uses parameterized queries, not string concatenation', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('app/api/search/route.ts', 'utf8')
    );
    // Should use template literal sql`` which auto-parameterizes
    expect(src).toMatch(/sql`/);
    // Should NOT have string concatenation in SQL
    expect(src).not.toMatch(/sql\(`.*\+.*`\)/);
    expect(src).not.toMatch(/`SELECT.*\$\{.*\}.*`[^;]*(?!sql)/);
  });

  it('newsletter subscribe uses parameterized queries', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('app/api/newsletter/subscribe/route.ts', 'utf8')
    );
    expect(src).toMatch(/sql`/);
  });

  it('contact form uses validated input (not raw SQL)', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('app/api/contact/route.ts', 'utf8')
    );
    expect(src).toMatch(/validateInput|sanitizeText/);
  });

  it('user profile uses parameterized queries', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('app/api/user/profile/route.ts', 'utf8')
    );
    expect(src).toMatch(/sql`/);
  });

  it('no raw string concatenation in SQL across all API routes', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const glob = await import('fs').then(f => {
      function walkSync(dir: string, files: string[] = []): string[] {
        for (const file of f.readdirSync(dir)) {
          const full = path.join(dir, file);
          if (f.statSync(full).isDirectory()) walkSync(full, files);
          else if (full.endsWith('.ts')) files.push(full);
        }
        return files;
      }
      return { walkSync };
    });

    const routeFiles = glob.walkSync('app/api').filter(f => f.endsWith('route.ts'));
    const dangerousPatterns = [
      /`SELECT[^`]*\$\{[^}]*\}[^`]*`(?!\s*;?\s*\/\/)/, // template literal outside sql``
    ];

    for (const file of routeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('sql`') && !content.includes('sql(')) continue;

      // Check no raw query construction with string concatenation
      expect(content).not.toMatch(/"SELECT.*"\s*\+/);
      expect(content).not.toMatch(/'SELECT.*'\s*\+/);
    }
  });
});

describe('SQL injection — validation blocks malicious input', () => {
  it('rejects SQL injection in email field', async () => {
    const { signupSchema } = await import('@/lib/validation');
    const payloads = [
      "admin'--",
      "' OR 1=1 --",
      "'; DROP TABLE users; --",
      "admin@test.com' UNION SELECT * FROM users --",
    ];
    for (const payload of payloads) {
      const result = signupSchema.safeParse({
        email: payload,
        password: 'Abc12345',
        name: 'Test',
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects SQL injection in newsletter email', async () => {
    const { newsletterSchema } = await import('@/lib/validation');
    const result = newsletterSchema.safeParse({
      email: "' OR 1=1 --",
    });
    expect(result.success).toBe(false);
  });
});
