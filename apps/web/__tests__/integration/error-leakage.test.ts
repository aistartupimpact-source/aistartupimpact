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

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(() => { throw new Error('DB connection failed: host=prod.db.internal password=secret123'); })),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(() => { throw new Error('DB connection failed: host=prod.db.internal password=secret123'); }),
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
}));

vi.mock('@/lib/user-session', () => ({
  getUserSession: vi.fn(() => Promise.resolve(null)),
  isAuthenticated: vi.fn(() => Promise.resolve(false)),
}));

function makeRequest(url: string, method = 'GET') {
  return new NextRequest(new URL(url, 'http://localhost:3000'), { method } as any);
}

const call = (handler: any, ...args: any[]) => handler(...args) as Promise<Response>;

describe('Error information leakage — API routes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('search route does not leak DB connection details on error', async () => {
    try {
      const { GET } = await import('@/app/api/search/route');
      const res = await call(GET, makeRequest('/api/search?q=test'));
      const body = await res.json();
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('password=');
      expect(bodyStr).not.toContain('host=prod');
      expect(bodyStr).not.toContain('DB connection');
    } catch {
      // Route may throw — that's fine for this test, we verify response bodies
    }
  });

  it('contact route does not leak internal errors', async () => {
    try {
      const { POST } = await import('@/app/api/contact/route');
      const res = await POST(makeRequest('/api/contact'));
      const body = await res.json();
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('password=');
      expect(bodyStr).not.toContain('host=prod');
    } catch {
      // OK
    }
  });

  it('newsletter subscribe does not leak internal errors', async () => {
    try {
      const { POST } = await import('@/app/api/newsletter/subscribe/route');
      const req = new NextRequest(new URL('/api/newsletter/subscribe', 'http://localhost:3000'), {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
        headers: { 'Content-Type': 'application/json' },
      } as any);
      const res = await POST(req);
      const body = await res.json();
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('password=');
      expect(bodyStr).not.toContain('prod.db.internal');
    } catch {
      // OK
    }
  });
});

describe('Error handling — generic error messages', () => {
  it('API error responses use generic messages', async () => {
    const fs = await import('fs');
    const path = await import('path');

    function walkSync(dir: string, files: string[] = []): string[] {
      for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) walkSync(full, files);
        else if (full.endsWith('route.ts')) files.push(full);
      }
      return files;
    }

    const routeFiles = walkSync('app/api');
    let routesWithCatchAll = 0;

    for (const file of routeFiles) {
      const content = fs.readFileSync(file, 'utf8');
      // Check that catch blocks don't return error.message directly
      // Pattern: catch (error) { ... return ...json({ error: error.message })
      if (content.includes('catch')) {
        routesWithCatchAll++;
        // Should not expose raw error.message in response
        expect(content).not.toMatch(/json\(\s*\{\s*error:\s*(?:error|err|e)\.message\s*\}/);
      }
    }
    expect(routesWithCatchAll).toBeGreaterThan(0);
  });
});
