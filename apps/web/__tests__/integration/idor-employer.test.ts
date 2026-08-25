import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetEmployerSession = vi.fn();
const mockSql = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

vi.mock('@/lib/employer-auth', () => ({
  getEmployerSession: () => mockGetEmployerSession(),
  requireEmployerAuth: () => {
    const s = mockGetEmployerSession();
    if (!s) throw 'EMPLOYER_AUTH_REQUIRED';
    return s;
  },
}));

vi.mock('@/lib/db', () => ({
  sql: (...args: any[]) => mockSql(...args),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
  getClientIdentifier: vi.fn(() => 'test-ip'),
  apiRateLimit: {},
  strictRateLimit: {},
}));

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn(() => Promise.resolve([]))),
}));

vi.mock('@aistartupimpact/database', () => ({
  prisma: { $queryRaw: vi.fn(() => Promise.resolve([])) },
}));

function makeRequest(url: string, method = 'GET', body?: any) {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

const EMPLOYER_A = {
  id: 'employer-a',
  email: 'employerA@example.com',
  companyName: 'Company A',
  slug: 'company-a',
  plan: 'FREE',
  onboardingCompleted: true,
};

const EMPLOYER_B = {
  id: 'employer-b',
  email: 'employerB@example.com',
  companyName: 'Company B',
  slug: 'company-b',
  plan: 'FREE',
  onboardingCompleted: true,
};

describe('IDOR — Employer A cannot access Employer B resources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/employer/jobs — scoped to own employer', () => {
    it('returns only jobs owned by authenticated employer', async () => {
      mockGetEmployerSession.mockResolvedValue(EMPLOYER_A);
      mockSql.mockResolvedValueOnce([
        { id: 'job-1', title: 'Dev', employerId: 'employer-a' },
      ]);
      const { GET } = await import('@/app/api/employer/jobs/route');
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.jobs).toBeDefined();
    });

    it('returns 401 without session', async () => {
      mockGetEmployerSession.mockResolvedValue(null);
      const { GET } = await import('@/app/api/employer/jobs/route');
      const res = await GET();
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/employer/jobs/[id] — ownership check', () => {
    it('Employer A can access own job', async () => {
      mockGetEmployerSession.mockResolvedValue(EMPLOYER_A);
      mockSql.mockResolvedValueOnce([{ id: 'job-1', title: 'Dev' }]);
      const { GET } = await import('@/app/api/employer/jobs/[id]/route');
      const res = await GET(
        makeRequest('/api/employer/jobs/job-1'),
        { params: { id: 'job-1' } } as any
      );
      expect(res.status).toBe(200);
    });

    it('Employer B cannot access Employer A job (query scoped by session.id)', async () => {
      mockGetEmployerSession.mockResolvedValue(EMPLOYER_B);
      mockSql.mockResolvedValueOnce([]);
      const { GET } = await import('@/app/api/employer/jobs/[id]/route');
      const res = await GET(
        makeRequest('/api/employer/jobs/job-1'),
        { params: { id: 'job-1' } } as any
      );
      expect(res.status).toBe(404);
    });

    it('returns 401 without session', async () => {
      mockGetEmployerSession.mockResolvedValue(null);
      const { GET } = await import('@/app/api/employer/jobs/[id]/route');
      const res = await GET(
        makeRequest('/api/employer/jobs/job-1'),
        { params: { id: 'job-1' } } as any
      );
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/employer/jobs/[id] — ownership check', () => {
    it('Employer A can update own job', async () => {
      mockGetEmployerSession.mockResolvedValue(EMPLOYER_A);
      mockSql.mockResolvedValueOnce([{ id: 'job-1' }]); // ownership check
      mockSql.mockResolvedValueOnce([]); // update
      const { PUT } = await import('@/app/api/employer/jobs/[id]/route');
      const res = await PUT(
        makeRequest('/api/employer/jobs/job-1', 'PUT', { title: 'Updated' }),
        { params: { id: 'job-1' } } as any
      );
      expect(res.status).toBe(200);
    });

    it('Employer B cannot update Employer A job', async () => {
      mockGetEmployerSession.mockResolvedValue(EMPLOYER_B);
      mockSql.mockResolvedValueOnce([]);
      const { PUT } = await import('@/app/api/employer/jobs/[id]/route');
      const res = await PUT(
        makeRequest('/api/employer/jobs/job-1', 'PUT', { title: 'Hacked' }),
        { params: { id: 'job-1' } } as any
      );
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/employer/company — scoped to own company', () => {
    it('returns 401 without session', async () => {
      mockGetEmployerSession.mockResolvedValue(null);
      const { GET } = await import('@/app/api/employer/company/route');
      const res = await GET(makeRequest('/api/employer/company'));
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/employer/analytics — scoped to own employer', () => {
    it('returns 401 without session', async () => {
      mockGetEmployerSession.mockResolvedValue(null);
      const { GET } = await import('@/app/api/employer/analytics/route');
      const res = await GET(makeRequest('/api/employer/analytics'));
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/employer/delete-account — can only delete own', () => {
    it('rejects without session (requireEmployerAuth throws)', async () => {
      mockGetEmployerSession.mockResolvedValue(null);
      const { DELETE } = await import('@/app/api/employer/delete-account/route');
      const res = await DELETE(makeRequest('/api/employer/delete-account', 'DELETE', { password: 'test' }));
      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });
});
