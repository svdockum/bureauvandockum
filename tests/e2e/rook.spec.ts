import { test, expect } from '@playwright/test';

test('de homepage laadt in het Nederlands', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await expect(page.locator('h1')).toBeVisible();
});
