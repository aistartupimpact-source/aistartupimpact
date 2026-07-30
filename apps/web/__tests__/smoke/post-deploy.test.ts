/**
 * Smoke Tests — Run after every deployment.
 * Must complete in < 60 seconds.
 * Verifies critical endpoints are responding.
 */
import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.SMOKE_TEST_URL || 'http://localhost:3000';

describe('Post-Deploy Smoke Tests', () => {
  it('homepage returns 200', async () => {
    const res = await fetch(BASE_URL);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('AI Startup Impact');
  });

  it('tools page returns 200', async () => {
    const res = await fetch(`${BASE_URL}/tools`);
    expect(res.status).toBe(200);
  });

  it('startups page returns 200', async () => {
    const res = await fetch(`${BASE_URL}/startups`);
    expect(res.status).toBe(200);
  });

  it('user session endpoint responds', async () => {
    const res = await fetch(`${BASE_URL}/api/user/session`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('authenticated');
  });

  it('search endpoint responds', async () => {
    const res = await fetch(`${BASE_URL}/api/search?q=test`);
    expect(res.status).toBe(200);
  });

  it('newsletter subscribe endpoint accepts POST', async () => {
    const res = await fetch(`${BASE_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'smoke-test-invalid' }), // intentionally invalid
    });
    // Should return 400 (validation) not 500 (server error)
    expect(res.status).toBeLessThan(500);
  });
});
