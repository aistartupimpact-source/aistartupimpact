import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test.describe('Founder/User auth pages', () => {
    test('login page loads', async ({ page }) => {
      const response = await page.goto('/auth/login');
      expect(response?.status()).toBeLessThan(500);
    });

    test('signup page loads', async ({ page }) => {
      const response = await page.goto('/auth/signup');
      expect(response?.status()).toBeLessThan(500);
    });

    test('forgot password page loads', async ({ page }) => {
      const response = await page.goto('/auth/forgot-password');
      expect(response?.status()).toBeLessThan(500);
    });

    test('login page has email input', async ({ page }) => {
      await page.goto('/auth/login');
      const emailInput = page.getByPlaceholder(/email/i).first();
      await expect(emailInput).toBeVisible();
    });

    test('signup page has sign up text', async ({ page }) => {
      await page.goto('/auth/signup');
      const body = await page.textContent('body');
      expect(
        body?.includes('Sign') || body?.includes('Create') || body?.includes('account')
      ).toBeTruthy();
    });

    test('returnTo parameter preserved in URL', async ({ page }) => {
      await page.goto('/auth/login?returnTo=/founder/dashboard');
      expect(page.url()).toContain('returnTo');
    });
  });

  test.describe('Employer auth pages', () => {
    test('employer login page loads', async ({ page }) => {
      const response = await page.goto('/employer/login');
      expect(response?.status()).toBeLessThan(500);
    });

    test('employer signup page loads', async ({ page }) => {
      const response = await page.goto('/employer/signup');
      expect(response?.status()).toBeLessThan(500);
    });

    test('employer login has email and password fields', async ({ page }) => {
      await page.goto('/employer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
  });

  test.describe('Organizer auth pages', () => {
    test('organizer login page loads', async ({ page }) => {
      const response = await page.goto('/organizer/login');
      expect(response?.status()).toBeLessThan(500);
    });

    test('organizer login has email field', async ({ page }) => {
      await page.goto('/organizer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });
  });

  test.describe('Protected routes return non-500', () => {
    const protectedRoutes = [
      '/founder/dashboard',
      '/employer/dashboard',
      '/organizer/events',
      '/client-portal',
    ];

    for (const route of protectedRoutes) {
      test(`${route} does not return 500`, async ({ page }) => {
        const response = await page.goto(route);
        expect(response?.status()).toBeLessThan(500);
      });
    }
  });
});
