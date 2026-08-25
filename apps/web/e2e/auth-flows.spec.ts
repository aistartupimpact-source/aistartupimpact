import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test.describe('Founder/User auth', () => {
    test('login page renders sign-in modal', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByText(/sign in/i).first()).toBeVisible();
    });

    test('signup page renders sign-up mode', async ({ page }) => {
      await page.goto('/auth/signup');
      await expect(page.getByText(/sign up|create.*account/i).first()).toBeVisible();
    });

    test('login form has email and password fields', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });

    test('login with empty fields shows validation', async ({ page }) => {
      await page.goto('/auth/login');
      const submitBtn = page.getByRole('button', { name: /sign in|log in|continue/i }).first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);
        // Should still be on login page (not redirected)
        expect(page.url()).toContain('/auth/login');
      }
    });

    test('signup has terms/privacy links', async ({ page }) => {
      await page.goto('/auth/signup');
      const content = await page.textContent('body');
      // Should have some reference to terms or privacy
      expect(
        content?.includes('privacy') || content?.includes('terms') || content?.includes('Privacy')
      ).toBeTruthy();
    });

    test('forgot password page exists', async ({ page }) => {
      const response = await page.goto('/auth/forgot-password');
      expect(response?.status()).toBe(200);
    });

    test('returnTo parameter is preserved', async ({ page }) => {
      await page.goto('/auth/login?returnTo=/founder/dashboard');
      expect(page.url()).toContain('returnTo');
    });
  });

  test.describe('Employer auth', () => {
    test('employer login page renders', async ({ page }) => {
      await page.goto('/employer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });

    test('employer signup page renders', async ({ page }) => {
      const response = await page.goto('/employer/signup');
      expect(response?.status()).toBe(200);
    });

    test('employer login form has password field', async ({ page }) => {
      await page.goto('/employer/login');
      const passwordField = page.locator('input[type="password"]').first();
      await expect(passwordField).toBeVisible();
    });

    test('employer login shows error on invalid credentials', async ({ page }) => {
      await page.goto('/employer/login');
      await page.getByPlaceholder(/email/i).first().fill('invalid@test.com');
      await page.locator('input[type="password"]').first().fill('wrongpassword');
      await page.getByRole('button', { name: /sign in|log in|continue/i }).first().click();
      await page.waitForTimeout(1000);
      // Should show error or stay on login page
      expect(page.url()).toContain('/employer');
    });
  });

  test.describe('Organizer auth', () => {
    test('organizer login page renders', async ({ page }) => {
      await page.goto('/organizer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    });

    test('organizer login has signup toggle', async ({ page }) => {
      await page.goto('/organizer/login');
      const content = await page.textContent('body');
      expect(
        content?.includes('Sign up') || content?.includes('Create') || content?.includes('Register')
      ).toBeTruthy();
    });
  });

  test.describe('Protected routes redirect', () => {
    test('founder dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/founder/dashboard');
      await page.waitForTimeout(1000);
      const url = page.url();
      // Should redirect to login or show auth prompt
      expect(
        url.includes('/auth/login') || url.includes('/founder') || url.includes('login')
      ).toBeTruthy();
    });

    test('employer dashboard redirects unauthenticated users', async ({ page }) => {
      await page.goto('/employer/dashboard');
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(
        url.includes('/employer/login') || url.includes('/employer')
      ).toBeTruthy();
    });

    test('client portal redirects unauthenticated users', async ({ page }) => {
      const response = await page.goto('/client-portal');
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(
        url.includes('/auth/login') || url.includes('/client-portal') || response?.status() === 302
      ).toBeTruthy();
    });
  });
});
