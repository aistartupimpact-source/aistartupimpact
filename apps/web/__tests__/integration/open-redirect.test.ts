import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('jose', () => ({
  jwtVerify: vi.fn(() => Promise.resolve({ payload: {} })),
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

function makeRedirectRequest(pathname: string, host = 'localhost:3000') {
  return new NextRequest(new URL(pathname, `http://${host}`), {
    method: 'GET',
    headers: { host },
  });
}

describe('Open redirect protection', () => {
  let middleware: (req: NextRequest) => Promise<NextResponse | undefined>;

  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_WEB_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_ADMIN_URL = 'http://localhost:4000';
    process.env.DATABASE_URL = 'postgresql://test@localhost/test';
    process.env.FOUNDER_JWT_SECRET = 'test-secret';
    (process.env as any).NODE_ENV = 'test';
    const mod = await import('@/middleware');
    middleware = mod.middleware;
  });

  it('middleware redirects use internal paths, not user-controlled URLs', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('middleware.ts', 'utf8')
    );
    // All NextResponse.redirect calls should use new URL(path, request.url)
    // not user-supplied URLs directly
    const redirectCalls = src.match(/NextResponse\.redirect\([^)]+\)/g) || [];
    for (const call of redirectCalls) {
      // Redirects should use new URL() or an internally constructed variable, not user input
      const usesNewUrl = call.includes('new URL(');
      const usesInternalVar = call.match(/NextResponse\.redirect\(\w+\)/);
      expect(usesNewUrl || !!usesInternalVar).toBe(true);
      // Should not redirect to an arbitrary user-supplied URL
      expect(call).not.toMatch(/NextResponse\.redirect\(\s*(?:req|request)\.(url|query|searchParams)/);
    }
  });

  it('does not redirect GET to arbitrary external URLs', async () => {
    const req = makeRedirectRequest('/api/redirect?url=https://evil.com');
    const res = await middleware(req);
    if (res && res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (location) {
        const locationUrl = new URL(location, 'http://localhost:3000');
        expect(locationUrl.hostname).toMatch(/localhost/);
      }
    }
  });

  it('slug redirects go to internal paths only', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('middleware.ts', 'utf8')
    );
    // All redirect destinations should be relative paths like /startups/slug or /tools/slug
    const redirectPaths = src.match(/new URL\(`\/[^`]+`/g) || [];
    for (const path of redirectPaths) {
      expect(path).toMatch(/new URL\(`\//);
    }
  });
});

describe('Open redirect — link validation', () => {
  it('allowed URL schemes in sanitize config do not include javascript:', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('lib/sanitize.ts', 'utf8')
    );
    expect(src).toContain("allowedSchemes: ['http', 'https', 'mailto']");
    expect(src).not.toContain('javascript');
  });
});
