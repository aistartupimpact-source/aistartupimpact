import { test, expect } from '@playwright/test';

test.describe('Employer portal', () => {
  test.describe('unauthenticated access', () => {
    test('employer landing page loads', async ({ page }) => {
      const response = await page.goto('/employer');
      expect(response?.status()).toBeLessThan(400);
    });

    test('employer dashboard requires auth', async ({ page }) => {
      await page.goto('/employer/dashboard');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in') ||
        body?.includes('Email')
      ).toBeTruthy();
    });

    test('employer jobs page requires auth', async ({ page }) => {
      await page.goto('/employer/jobs');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });

    test('employer applications page requires auth', async ({ page }) => {
      await page.goto('/employer/applications');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });

    test('employer company page requires auth', async ({ page }) => {
      await page.goto('/employer/company');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });

    test('employer analytics requires auth', async ({ page }) => {
      await page.goto('/employer/analytics');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });
  });

  test.describe('login form', () => {
    test('has email and password fields', async ({ page }) => {
      await page.goto('/employer/login');
      await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });

    test('has link to signup', async ({ page }) => {
      await page.goto('/employer/login');
      const signupLink = page.locator('a[href*="/employer/signup"]').first();
      const body = await page.textContent('body');
      expect(
        (await signupLink.isVisible().catch(() => false)) ||
        body?.includes('Sign up') ||
        body?.includes('Create')
      ).toBeTruthy();
    });

    test('signup page has company name field', async ({ page }) => {
      await page.goto('/employer/signup');
      await page.waitForLoadState('domcontentloaded');
      const body = await page.textContent('body');
      expect(
        body?.includes('Company') || body?.includes('company') || body?.includes('Organization')
      ).toBeTruthy();
    });

    test('employer settings requires auth', async ({ page }) => {
      await page.goto('/employer/settings');
      await page.waitForTimeout(1000);
      const url = page.url();
      const body = await page.textContent('body');
      expect(
        url.includes('/employer/login') ||
        body?.includes('Sign in') ||
        body?.includes('Log in')
      ).toBeTruthy();
    });
  });
});
