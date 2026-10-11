import { test, expect } from '@playwright/test';

test('de eerste Tab toont de skiplink en die springt naar de inhoud', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skiplink = page.getByRole('link', { name: 'Naar de inhoud' });
  await expect(skiplink).toBeFocused();
  await expect(skiplink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('het hoofdmenu heeft precies vijf items in de goede volgorde', async ({ page }) => {
  await page.goto('/');
  const items = page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link');
  await expect(items).toHaveText(['Toegankelijke website', 'UX Testing', 'Thema’s', 'Tarieven', 'Info']);
});

test('het logo in de footer gaat naar de homepage', async ({ page }) => {
  await page.goto('/tarieven/');
  await page.locator('footer').getByRole('link', { name: 'Bureau van Dockum' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Websites en webshops');
});

test('mobiel menu opent, sluit met Escape en geeft de focus terug', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const knop = page.getByRole('button', { name: 'Menu' });
  await expect(knop).toHaveAttribute('aria-expanded', 'false');
  await knop.click();
  await expect(knop).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: 'Info' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(knop).toHaveAttribute('aria-expanded', 'false');
  await expect(knop).toBeFocused();
});
