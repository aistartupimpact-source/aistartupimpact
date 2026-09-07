import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
  encryptSecret,
  decryptSecret,
} from '@/lib/two-factor';

describe('two-factor', () => {
  beforeEach(() => {
    vi.stubEnv('ENCRYPTION_KEY', 'test-encryption-key-for-unit-tests-32ch');
  });

  describe('generateBackupCodes', () => {
    it('generates 10 codes by default', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it('generates specified number of codes', () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('generates 8-character hex codes', () => {
      const codes = generateBackupCodes();
      codes.forEach(code => {
        expect(code).toMatch(/^[0-9A-F]{8}$/);
      });
    });

    it('generates unique codes', () => {
      const codes = generateBackupCodes(100);
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });
  });

  describe('hashBackupCodes / verifyBackupCode', () => {
    it('hashes codes with bcrypt', async () => {
      const codes = ['ABCD1234'];
      const hashed = await hashBackupCodes(codes);
      expect(hashed).toHaveLength(1);
      expect(hashed[0]).not.toBe('ABCD1234');
      expect(hashed[0]).toMatch(/^\$2[aby]?\$/);
    });

    it('verifies correct code and returns index', async () => {
      const codes = ['CODE0001', 'CODE0002', 'CODE0003'];
      const hashed = await hashBackupCodes(codes);
      const idx = await verifyBackupCode('CODE0002', hashed);
      expect(idx).toBe(1);
    });

    it('returns -1 for wrong code', async () => {
      const codes = ['CODE0001'];
      const hashed = await hashBackupCodes(codes);
      const idx = await verifyBackupCode('WRONG', hashed);
      expect(idx).toBe(-1);
    });

    it('returns -1 for empty hashed list', async () => {
      const idx = await verifyBackupCode('CODE0001', []);
      expect(idx).toBe(-1);
    });
  });

  describe('encryptSecret / decryptSecret', () => {
    it('round-trips correctly', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const encrypted = encryptSecret(secret);
      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(secret);
    });

    it('produces different output than input', () => {
      const secret = 'MY_TOTP_SECRET';
      const encrypted = encryptSecret(secret);
      expect(encrypted).not.toBe(secret);
    });

    it('includes IV prefix separated by colon', () => {
      const encrypted = encryptSecret('test');
      expect(encrypted).toContain(':');
      const [iv, data] = encrypted.split(':');
      expect(iv).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(data.length).toBeGreaterThan(0);
    });

    it('produces different ciphertext each time (random IV)', () => {
      const secret = 'SAME_SECRET';
      const a = encryptSecret(secret);
      const b = encryptSecret(secret);
      expect(a).not.toBe(b);
      expect(decryptSecret(a)).toBe(secret);
      expect(decryptSecret(b)).toBe(secret);
    });

    it('throws when ENCRYPTION_KEY is missing', () => {
      vi.stubEnv('ENCRYPTION_KEY', '');
      delete process.env.ENCRYPTION_KEY;
      expect(() => encryptSecret('test')).toThrow('ENCRYPTION_KEY environment variable is required');
    });
  });
});
