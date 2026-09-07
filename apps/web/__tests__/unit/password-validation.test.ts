import { describe, it, expect } from 'vitest';
import { validatePassword } from '@/lib/password-validation';

describe('validatePassword', () => {
  describe('length rules', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const r = validatePassword('Aa1!xyz');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Must be at least 8 characters');
    });

    it('rejects passwords longer than 128 characters', () => {
      const r = validatePassword('A'.repeat(129) + 'a1!');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Must be 128 characters or fewer');
    });

    it('accepts 8-character password with all requirements', () => {
      const r = validatePassword('Abcd12!@');
      expect(r.valid).toBe(true);
    });
  });

  describe('character class requirements', () => {
    it('requires uppercase letter', () => {
      const r = validatePassword('abcd1234!@');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Include at least one uppercase letter');
    });

    it('requires lowercase letter', () => {
      const r = validatePassword('ABCD1234!@');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Include at least one lowercase letter');
    });

    it('requires number', () => {
      const r = validatePassword('Abcdefgh!@');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Include at least one number');
    });

    it('requires special character', () => {
      const r = validatePassword('Abcdefg123');
      expect(r.valid).toBe(false);
      expect(r.errors).toContain('Include at least one special character (!@#$...)');
    });

    it('accumulates multiple errors', () => {
      const r = validatePassword('abc');
      expect(r.errors.length).toBeGreaterThan(1);
    });
  });

  describe('common password blocklist', () => {
    it('rejects "password" (case insensitive)', () => {
      const r = validatePassword('Password');
      expect(r.errors).toContain('This password is too common');
    });

    it('rejects "passw0rd"', () => {
      const r = validatePassword('Passw0rd');
      expect(r.errors).toContain('This password is too common');
    });

    it('rejects "admin123"', () => {
      const r = validatePassword('Admin123');
      expect(r.errors).toContain('This password is too common');
    });

    it('does not flag uncommon passwords', () => {
      const r = validatePassword('Xy7$kLm9!qR');
      expect(r.errors).not.toContain('This password is too common');
    });
  });

  describe('context-aware rejection', () => {
    it('rejects password containing user name', () => {
      const r = validatePassword('Venkatesh1!', { name: 'Venkatesh', email: null });
      expect(r.errors).toContain('Password must not contain your name');
    });

    it('is case insensitive for name check', () => {
      const r = validatePassword('venkatesh1A!', { name: 'Venkatesh', email: null });
      expect(r.errors).toContain('Password must not contain your name');
    });

    it('skips name check if name is shorter than 3 chars', () => {
      const r = validatePassword('Ab12345!@', { name: 'Ab', email: null });
      expect(r.errors).not.toContain('Password must not contain your name');
    });

    it('rejects password containing email local part', () => {
      const r = validatePassword('lahori12A!', { name: null, email: 'lahori@example.com' });
      expect(r.errors).toContain('Password must not contain your email');
    });

    it('rejects password containing email domain', () => {
      const r = validatePassword('example1A!', { name: null, email: 'user@example.com' });
      expect(r.errors).toContain('Password must not contain your email domain');
    });

    it('skips email check if local part is shorter than 3 chars', () => {
      const r = validatePassword('Ab12345!@', { name: null, email: 'ab@example.com' });
      expect(r.errors).not.toContain('Password must not contain your email');
    });

    it('works with no context', () => {
      const r = validatePassword('Xy7$kLm9!q');
      expect(r.valid).toBe(true);
    });
  });

  describe('strength scoring', () => {
    it('returns Weak for score <= 1', () => {
      const r = validatePassword('abcdefgh');
      expect(r.strength.label).toBe('Weak');
      expect(r.strength.color).toBe('#ef4444');
    });

    it('returns Fair for score <= 2', () => {
      const r = validatePassword('Abcdefgh');
      expect(r.strength.label).toBe('Fair');
      expect(r.strength.color).toBe('#f59e0b');
    });

    it('returns Good for score <= 3', () => {
      const r = validatePassword('Abcdefgh12');
      expect(r.strength.label).toBe('Good');
      expect(r.strength.color).toBe('#3b82f6');
    });

    it('returns Strong for score >= 4', () => {
      const r = validatePassword('Abcdefgh12!@');
      expect(r.strength.label).toBe('Strong');
      expect(r.strength.color).toBe('#22c55e');
    });
  });

  describe('valid passwords', () => {
    it('returns valid with no errors for a strong password', () => {
      const r = validatePassword('Xy7$kLm9!qR');
      expect(r.valid).toBe(true);
      expect(r.errors).toEqual([]);
    });
  });
});
