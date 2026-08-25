import { test, expect } from '@playwright/test';

test.describe('Employer portal', () => {
  test('employer landing page loads', async ({ page }) => {
    const response = await page.goto('/employer');
    expect(response?.status()).toBeLessThan(500);
  });

  test('employer dashboard does not return 500', async ({ page }) => {
    const response = await page.goto('/employer/dashboard');
    expect(response?.status()).toBeLessThan(500);
  });

  test('employer jobs does not return 500', async ({ page }) => {
    const response = await page.goto('/employer/jobs');
    expect(response?.status()).toBeLessThan(500);
  });

  test('employer company does not return 500', async ({ page }) => {
    const response = await page.goto('/employer/company');
    expect(response?.status()).toBeLessThan(500);
  });

  test('employer login has email and password fields', async ({ page }) => {
    await page.goto('/employer/login');
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('employer signup page loads', async ({ page }) => {
    const response = await page.goto('/employer/signup');
    expect(response?.status()).toBeLessThan(500);
  });
});
