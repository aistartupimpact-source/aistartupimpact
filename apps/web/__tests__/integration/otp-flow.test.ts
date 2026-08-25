import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

const mockPrisma = {
  emailOtp: {
    count: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@aistartupimpact/database', () => ({
  prisma: mockPrisma,
}));

describe('otp-flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOtp', () => {
    it('generates a 6-digit OTP and stores hashed version', async () => {
      mockPrisma.emailOtp.count.mockResolvedValue(0);
      mockPrisma.emailOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.emailOtp.create.mockResolvedValue({ id: 'otp-1' });

      const { createOtp } = await import('@/lib/otp');
      const result = await createOtp('Test@Example.COM');
      expect(result.otp).toBeTruthy();
      expect(result.otp).toMatch(/^\d{6}$/);
      expect(result.error).toBeUndefined();

      // Verify it lowercased the email
      expect(mockPrisma.emailOtp.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ email: 'test@example.com' }),
        })
      );

      // Verify it stored a hashed code (not plain)
      const createCall = mockPrisma.emailOtp.create.mock.calls[0][0];
      expect(createCall.data.code).not.toBe(result.otp);
      expect(createCall.data.code).toHaveLength(64); // SHA-256 hex
    });

    it('rate limits at 5 requests per hour', async () => {
      mockPrisma.emailOtp.count.mockResolvedValue(5);

      const { createOtp } = await import('@/lib/otp');
      const result = await createOtp('user@example.com');
      expect(result.otp).toBeNull();
      expect(result.error).toContain('Too many requests');
    });

    it('allows up to 4 requests', async () => {
      mockPrisma.emailOtp.count.mockResolvedValue(4);
      mockPrisma.emailOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.emailOtp.create.mockResolvedValue({ id: 'otp-1' });

      const { createOtp } = await import('@/lib/otp');
      const result = await createOtp('user@example.com');
      expect(result.otp).toBeTruthy();
    });

    it('invalidates previous unused OTPs', async () => {
      mockPrisma.emailOtp.count.mockResolvedValue(0);
      mockPrisma.emailOtp.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.emailOtp.create.mockResolvedValue({ id: 'otp-1' });

      const { createOtp } = await import('@/lib/otp');
      await createOtp('user@example.com');

      expect(mockPrisma.emailOtp.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ verified: false }),
          data: expect.objectContaining({ verified: true }),
        })
      );
    });

    it('sets expiry to 10 minutes', async () => {
      mockPrisma.emailOtp.count.mockResolvedValue(0);
      mockPrisma.emailOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.emailOtp.create.mockResolvedValue({ id: 'otp-1' });

      const before = Date.now();
      const { createOtp } = await import('@/lib/otp');
      await createOtp('user@example.com');
      const after = Date.now();

      const createCall = mockPrisma.emailOtp.create.mock.calls[0][0];
      const expiresAt = createCall.data.expiresAt.getTime();
      // Should be ~10 minutes from now
      expect(expiresAt).toBeGreaterThanOrEqual(before + 10 * 60 * 1000 - 1000);
      expect(expiresAt).toBeLessThanOrEqual(after + 10 * 60 * 1000 + 1000);
    });
  });

  describe('verifyOtp', () => {
    function hashCode(code: string): string {
      return crypto.createHash('sha256').update(code).digest('hex');
    }

    it('verifies correct code', async () => {
      const code = '123456';
      mockPrisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        code: hashCode(code),
        attempts: 0,
        verified: false,
        expiresAt: new Date(Date.now() + 600000),
      });
      mockPrisma.emailOtp.update.mockResolvedValue({});

      const { verifyOtp } = await import('@/lib/otp');
      const result = await verifyOtp('user@example.com', code);
      expect(result.valid).toBe(true);
    });

    it('rejects wrong code and increments attempts', async () => {
      mockPrisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        code: hashCode('123456'),
        attempts: 0,
        verified: false,
        expiresAt: new Date(Date.now() + 600000),
      });
      mockPrisma.emailOtp.update.mockResolvedValue({});

      const { verifyOtp } = await import('@/lib/otp');
      const result = await verifyOtp('user@example.com', '000000');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Incorrect code');
      expect(result.error).toContain('2 attempts remaining');

      expect(mockPrisma.emailOtp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ attempts: 1 }),
        })
      );
    });

    it('locks out after max attempts', async () => {
      mockPrisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-1',
        code: hashCode('123456'),
        attempts: 3, // MAX_ATTEMPTS
        verified: false,
        expiresAt: new Date(Date.now() + 600000),
      });
      mockPrisma.emailOtp.update.mockResolvedValue({});

      const { verifyOtp } = await import('@/lib/otp');
      const result = await verifyOtp('user@example.com', '123456');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Too many incorrect attempts');
    });

    it('returns error for expired/not found OTP', async () => {
      mockPrisma.emailOtp.findFirst.mockResolvedValue(null);

      const { verifyOtp } = await import('@/lib/otp');
      const result = await verifyOtp('user@example.com', '123456');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('lowercases email for lookup', async () => {
      mockPrisma.emailOtp.findFirst.mockResolvedValue(null);

      const { verifyOtp } = await import('@/lib/otp');
      await verifyOtp('User@EXAMPLE.com', '123456');

      expect(mockPrisma.emailOtp.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ email: 'user@example.com' }),
        })
      );
    });

    it('marks OTP as verified on success', async () => {
      const code = '654321';
      mockPrisma.emailOtp.findFirst.mockResolvedValue({
        id: 'otp-2',
        code: hashCode(code),
        attempts: 0,
        verified: false,
        expiresAt: new Date(Date.now() + 600000),
      });
      mockPrisma.emailOtp.update.mockResolvedValue({});

      const { verifyOtp } = await import('@/lib/otp');
      await verifyOtp('user@example.com', code);

      expect(mockPrisma.emailOtp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'otp-2' },
          data: expect.objectContaining({ verified: true }),
        })
      );
    });
  });
});
