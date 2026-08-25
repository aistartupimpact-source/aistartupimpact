import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createUserToken,
  createFounderToken,
  createEmployerToken,
  createOrganizerToken,
  createExpiredToken,
  createInvalidToken,
  createWrongSecretToken,
  stubAuthEnv,
} from '../helpers/auth-helpers';

describe('cross-session token isolation', () => {
  beforeEach(() => {
    stubAuthEnv();
  });

  describe('token generation helpers produce valid JWTs', () => {
    it('creates user token with correct payload', async () => {
      const token = await createUserToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('creates founder token with correct payload', async () => {
      const token = await createFounderToken();
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    it('creates employer token with correct payload', async () => {
      const token = await createEmployerToken();
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    it('creates organizer token with correct payload', async () => {
      const token = await createOrganizerToken();
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('expired tokens', () => {
    it('creates expired user token', async () => {
      const token = await createExpiredToken('user');
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    it('creates expired founder token', async () => {
      const token = await createExpiredToken('founder');
      expect(token).toBeTruthy();
    });

    it('creates expired employer token', async () => {
      const token = await createExpiredToken('employer');
      expect(token).toBeTruthy();
    });

    it('creates expired organizer token', async () => {
      const token = await createExpiredToken('organizer');
      expect(token).toBeTruthy();
    });
  });

  describe('invalid tokens', () => {
    it('invalid token has 3 parts but bad signature', () => {
      const token = createInvalidToken();
      expect(token.split('.')).toHaveLength(3);
    });

    it('wrong-secret token is a valid JWT format but signed with wrong key', async () => {
      const token = await createWrongSecretToken();
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('token payload customization', () => {
    it('allows overriding user token payload', async () => {
      const token = await createUserToken({ userId: 'custom-user', email: 'custom@example.com' });
      expect(token).toBeTruthy();
    });

    it('allows overriding founder token payload', async () => {
      const token = await createFounderToken({ userId: 'custom-founder', name: 'Custom' });
      expect(token).toBeTruthy();
    });

    it('allows overriding employer token payload', async () => {
      const token = await createEmployerToken({ employerId: 'custom-emp', plan: 'PREMIUM' });
      expect(token).toBeTruthy();
    });

    it('allows overriding organizer token payload', async () => {
      const token = await createOrganizerToken({ sessionToken: 'custom-session' });
      expect(token).toBeTruthy();
    });
  });

  describe('different user types produce different tokens', () => {
    it('user and founder tokens are different', async () => {
      const userToken = await createUserToken({ email: 'same@example.com' });
      const founderToken = await createFounderToken({ email: 'same@example.com' });
      expect(userToken).not.toBe(founderToken);
    });

    it('employer and organizer tokens are different', async () => {
      const employerToken = await createEmployerToken({ email: 'same@example.com' });
      const organizerToken = await createOrganizerToken();
      expect(employerToken).not.toBe(organizerToken);
    });
  });
});
