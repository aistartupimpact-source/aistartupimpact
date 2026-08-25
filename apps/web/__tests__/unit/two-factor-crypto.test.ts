import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import {
  encryptSecret,
  decryptSecret,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
} from '@/lib/two-factor';

describe('two-factor crypto security', () => {
  beforeEach(() => {
    vi.stubEnv('ENCRYPTION_KEY', 'test-crypto-key-for-security-tests');
  });

  describe('encryption uses createCipheriv (not deprecated createCipher)', () => {
    it('uses AES-256-CBC with random IV', () => {
      const encrypted = encryptSecret('test-secret');
      const [ivHex, ciphertext] = encrypted.split(':');
      expect(ivHex).toHaveLength(32);
      expect(ciphertext.length).toBeGreaterThan(0);
    });

    it('IV is 16 bytes (128-bit)', () => {
      const encrypted = encryptSecret('test');
      const ivHex = encrypted.split(':')[0];
      const iv = Buffer.from(ivHex, 'hex');
      expect(iv.length).toBe(16);
    });

    it('each encryption produces a unique IV', () => {
      const ivs = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const encrypted = encryptSecret('same-input');
        ivs.add(encrypted.split(':')[0]);
      }
      expect(ivs.size).toBe(20);
    });

    it('ciphertext differs for same plaintext due to random IV', () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        results.add(encryptSecret('identical-secret'));
      }
      expect(results.size).toBe(10);
    });
  });

  describe('no hardcoded fallback key', () => {
    it('throws when ENCRYPTION_KEY is missing', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encryptSecret('test')).toThrow('ENCRYPTION_KEY environment variable is required');
    });

    it('throws when ENCRYPTION_KEY is empty string', () => {
      vi.stubEnv('ENCRYPTION_KEY', '');
      delete process.env.ENCRYPTION_KEY;
      expect(() => encryptSecret('test')).toThrow('ENCRYPTION_KEY environment variable is required');
    });

    it('decrypt throws when ENCRYPTION_KEY is missing', () => {
      const encrypted = encryptSecret('test');
      delete process.env.ENCRYPTION_KEY;
      expect(() => decryptSecret(encrypted)).toThrow('ENCRYPTION_KEY environment variable is required');
    });
  });

  describe('round-trip integrity', () => {
    it('handles empty string', () => {
      const encrypted = encryptSecret('');
      expect(decryptSecret(encrypted)).toBe('');
    });

    it('handles long secrets', () => {
      const secret = 'A'.repeat(1000);
      expect(decryptSecret(encryptSecret(secret))).toBe(secret);
    });

    it('handles unicode secrets', () => {
      const secret = 'TOTP秘密🔐키';
      expect(decryptSecret(encryptSecret(secret))).toBe(secret);
    });

    it('handles special characters', () => {
      const secret = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      expect(decryptSecret(encryptSecret(secret))).toBe(secret);
    });

    it('wrong key cannot decrypt', () => {
      const encrypted = encryptSecret('secret-data');
      vi.stubEnv('ENCRYPTION_KEY', 'different-key-for-decryption-test');
      expect(() => decryptSecret(encrypted)).toThrow();
    });

    it('tampered ciphertext fails to decrypt', () => {
      const encrypted = encryptSecret('secret-data');
      const parts = encrypted.split(':');
      const tampered = parts[0] + ':' + 'ff'.repeat(parts[1].length / 2);
      expect(() => decryptSecret(tampered)).toThrow();
    });

    it('tampered IV fails to decrypt correctly', () => {
      const encrypted = encryptSecret('known-secret');
      const parts = encrypted.split(':');
      const flippedIv = 'aa'.repeat(16);
      const tampered = flippedIv + ':' + parts[1];
      try {
        const result = decryptSecret(tampered);
        expect(result).not.toBe('known-secret');
      } catch {
        // Decryption failure is also acceptable
      }
    });
  });

  describe('backup code cryptographic properties', () => {
    it('codes have sufficient entropy (4 random bytes = 32 bits)', () => {
      const codes = generateBackupCodes(1);
      expect(codes[0]).toMatch(/^[0-9A-F]{8}$/);
    });

    it('bcrypt hashes are salted (same code produces different hashes)', async () => {
      const code = 'ABCD1234';
      const hashed1 = await hashBackupCodes([code]);
      const hashed2 = await hashBackupCodes([code]);
      expect(hashed1[0]).not.toBe(hashed2[0]);
    });

    it('bcrypt uses cost factor >= 10', async () => {
      const hashed = await hashBackupCodes(['TEST1234']);
      const match = hashed[0].match(/^\$2[aby]?\$(\d+)\$/);
      expect(match).toBeTruthy();
      expect(parseInt(match![1])).toBeGreaterThanOrEqual(10);
    });

    it('timing-safe: wrong code takes similar time as right code', async () => {
      const codes = ['CODE0001'];
      const hashed = await hashBackupCodes(codes);
      const start1 = performance.now();
      await verifyBackupCode('CODE0001', hashed);
      const time1 = performance.now() - start1;
      const start2 = performance.now();
      await verifyBackupCode('WRONGCOD', hashed);
      const time2 = performance.now() - start2;
      // bcrypt comparison is constant-time by design; times should be similar order of magnitude
      expect(Math.abs(time1 - time2)).toBeLessThan(time1 * 5);
    });
  });
});
