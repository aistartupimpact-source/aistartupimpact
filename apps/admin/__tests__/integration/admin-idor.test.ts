import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetServerSession = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/audit-log', () => ({
  logAuditEvent: vi.fn(),
  canDelete: vi.fn(() => Promise.resolve({ allowed: true })),
  snapshot: vi.fn((r: any) => r),
}));

vi.mock('@aistartupimpact/database', () => ({
  prisma: {
    startup: { findUnique: vi.fn(), update: vi.fn() },
    aiTool: { findUnique: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('@aistartupimpact/utils', () => ({
  startupRejectionHtml: vi.fn(() => ''),
  startupApprovalHtml: vi.fn(() => ''),
}));

vi.mock('@/lib/email-send', () => ({
  sendEmailFireAndForget: vi.fn(),
}));

vi.mock('@/lib/impact-score', () => ({
  calculateImpactScore: vi.fn(() => 50),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

function makeRequest(url: string, method = 'GET', body?: any) {
  const init: any = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3001'), init);
}

describe('Admin IDOR — dynamic route auth enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(null);
  });

  it('PUT /api/admin/employers/[id] requires auth', async () => {
    const { PUT } = await import('@/app/api/admin/employers/[id]/route');
    const res = await PUT(
      makeRequest('/api/admin/employers/test-id', 'PUT', { isVerified: true }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('PATCH /api/admin/web-users/[id] requires auth', async () => {
    const { PATCH } = await import('@/app/api/admin/web-users/[id]/route');
    const res = await PATCH(
      makeRequest('/api/admin/web-users/test-id', 'PATCH', { isActive: false }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('PUT /api/admin/startups/[id]/slug requires auth', async () => {
    const { PUT } = await import('@/app/api/admin/startups/[id]/slug/route');
    const res = await PUT(
      makeRequest('/api/admin/startups/test-id/slug', 'PUT', { slug: 'new-slug' }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('PUT /api/admin/tools/[id]/slug requires auth', async () => {
    const { PUT } = await import('@/app/api/admin/tools/[id]/slug/route');
    const res = await PUT(
      makeRequest('/api/admin/tools/test-id/slug', 'PUT', { slug: 'new-slug' }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });
});

describe('Admin IDOR — WRITER cannot modify resources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { id: 'writer-1', email: 'writer@example.com', role: 'WRITER' },
    });
  });

  it('WRITER cannot update employer verification', async () => {
    const { PUT } = await import('@/app/api/admin/employers/[id]/route');
    const res = await PUT(
      makeRequest('/api/admin/employers/test-id', 'PUT', { isVerified: true }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect([401, 403]).toContain(res.status);
  });

  it('WRITER cannot deactivate web users', async () => {
    const { PATCH } = await import('@/app/api/admin/web-users/[id]/route');
    const res = await PATCH(
      makeRequest('/api/admin/web-users/test-id', 'PATCH', { isActive: false }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect([401, 403]).toContain(res.status);
  });

  it('WRITER cannot change startup slugs', async () => {
    const { PUT } = await import('@/app/api/admin/startups/[id]/slug/route');
    const res = await PUT(
      makeRequest('/api/admin/startups/test-id/slug', 'PUT', { slug: 'hacked' }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect([401, 403]).toContain(res.status);
  });

  it('WRITER cannot change tool slugs', async () => {
    const { PUT } = await import('@/app/api/admin/tools/[id]/slug/route');
    const res = await PUT(
      makeRequest('/api/admin/tools/test-id/slug', 'PUT', { slug: 'hacked' }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect([401, 403]).toContain(res.status);
  });
});

describe('Admin IDOR — delete operations require proper auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(null);
  });

  it('POST /api/india-ai/stats/[id]/delete requires auth', async () => {
    const { POST } = await import('@/app/api/india-ai/stats/[id]/delete/route');
    const res = await POST(
      makeRequest('/api/india-ai/stats/test-id/delete', 'POST'),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('POST /api/founder/startups/[id]/reject requires auth', async () => {
    const { POST } = await import('@/app/api/founder/startups/[id]/reject/route');
    const res = await POST(
      makeRequest('/api/founder/startups/test-id/reject', 'POST', { reason: 'test' }),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });

  it('POST /api/founder/startups/[id]/approve requires auth', async () => {
    const { POST } = await import('@/app/api/founder/startups/[id]/approve/route');
    const res = await POST(
      makeRequest('/api/founder/startups/test-id/approve', 'POST'),
      { params: Promise.resolve({ id: 'test-id' }) }
    );
    expect(res.status).toBe(401);
  });
});
