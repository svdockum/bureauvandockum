import { test, expect } from '@playwright/test';

const FUNCTIONS = 'http://127.0.0.1:54521/functions/v1';

test('leeg terugbelformulier toont een foutoverzicht met links naar de velden', async ({ page }) => {
  await page.goto('/terugbellen/');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht).toBeVisible();
  await expect(overzicht).toBeFocused();
  await expect(overzicht.getByRole('link', { name: 'Vul uw naam in.' })).toBeVisible();
  await expect(page.getByLabel('Naam', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await overzicht.getByRole('link', { name: 'Vul uw naam in.' }).click();
  await expect(page.getByLabel('Naam', { exact: true })).toBeFocused();
});

test('ingevuld terugbelformulier gaat naar de functie en daarna naar de bevestiging', async ({ page }) => {
  await page.route(`${FUNCTIONS}/terugbellen`, (route) =>
    route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/terugbellen/verzonden/' } }));
  await page.goto('/terugbellen/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna de Vries');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Telefoonnummer').fill('06 12345678');
  await page.getByLabel('Waar gaat het over?').selectOption('advies');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/terugbellen\/verzonden\/$/);
  await expect(page.locator('h1')).toContainText('We bellen u terug');
});

test('bestelformulier eist akkoord en een webadres', async ({ page }) => {
  await page.goto('/bestellen/snelle-scan/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByRole('button', { name: 'Bestellen en betalen' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht.getByRole('link', { name: /webadres/ })).toBeVisible();
  await expect(overzicht.getByRole('link', { name: /voorwaarden/ })).toBeVisible();
});

test('ingevuld bestelformulier gaat naar de functie', async ({ page }) => {
  let ontvangen = '';
  await page.route(`${FUNCTIONS}/bestelling-starten`, async (route) => {
    ontvangen = route.request().postData() ?? '';
    await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/bestellen/bezig/' } });
  });
  await page.goto('/bestellen/snelle-scan/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Webadres van uw site').fill('www.praktijk.nl');
  await page.getByLabel(/akkoord met de voorwaarden/).check();
  await page.getByRole('button', { name: 'Bestellen en betalen' }).click();
  await expect(page).toHaveURL(/\/bestellen\/bezig\/$/);
  expect(ontvangen).toContain('product=snelle-scan');
  expect(ontvangen).toContain('akkoord=ja');
});
