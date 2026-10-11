import { test, expect } from '@playwright/test';

const FUNCTIONS = 'http://127.0.0.1:54521/functions/v1';

test('de keynote-knop op Info kiest het onderwerp in het terugbelformulier alvast', async ({ page }) => {
  await page.goto('/info/');
  await page.getByRole('link', { name: 'Neem contact op voor een keynote' }).click();
  await expect(page).toHaveURL(/\/terugbellen\/\?onderwerp=keynote$/);
  await expect(page.getByLabel('Waar gaat het over?')).toHaveValue('keynote');
});

test('een onbekend onderwerp in de link laat de keuze leeg', async ({ page }) => {
  await page.goto('/terugbellen/?onderwerp=bestaat-niet');
  await expect(page.getByLabel('Waar gaat het over?')).toHaveValue('');
});

test('leeg terugbelformulier toont een foutoverzicht met links naar de velden', async ({ page }) => {
  await page.goto('/terugbellen/');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht).toBeVisible();
  await expect(overzicht).toBeFocused();
  await expect(overzicht.getByRole('link', { name: 'Vul uw naam in.' })).toBeVisible();
  await expect(page.getByLabel('Naam (verplicht)', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await overzicht.getByRole('link', { name: 'Vul uw naam in.' }).click();
  await expect(page.getByLabel('Naam (verplicht)', { exact: true })).toBeFocused();
});

test('terugbelformulier controleert net zo streng als de server', async ({ page }) => {
  await page.goto('/terugbellen/');
  await page.getByLabel('Naam (verplicht)', { exact: true }).fill('   ');
  await page.getByLabel('E-mailadres').fill('naam@gmailcom');
  await page.getByLabel('Telefoonnummer').fill('06.12345678');
  await page.getByLabel('Waar gaat het over?').selectOption('advies');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht).toBeVisible();
  await expect(overzicht).toHaveAccessibleName('Controleer deze velden');
  await expect(overzicht.getByRole('link', { name: 'Vul uw naam in.' })).toBeVisible();
  await expect(overzicht.getByRole('link', { name: /geldig e-mailadres/ })).toBeVisible();
  await expect(page.getByLabel('Telefoonnummer')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(overzicht.getByRole('link', { name: /telefoonnummer/ })).toHaveCount(0);
});

test('scanformulier weigert een webadres zonder punt, met een eigen melding', async ({ page }) => {
  await page.goto('/scan-aanvragen/');
  await page.getByLabel('Webadres van uw site').fill('praktijk');
  await page.getByRole('button', { name: 'Vraag de scan aan' }).click();
  await expect(page.locator('.foutoverzicht').getByRole('link', { name: 'Dit webadres klopt niet. Vul het in zoals www.uwpraktijk.nl.' })).toBeVisible();
});

test('ingevuld terugbelformulier gaat naar de functie en daarna naar de bevestiging', async ({ page }) => {
  let ontvangen = '';
  await page.route(`${FUNCTIONS}/terugbellen`, async (route) => {
    ontvangen = route.request().postData() ?? '';
    await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/terugbellen/verzonden/' } });
  });
  await page.goto('/terugbellen/');
  await page.getByLabel('Naam (verplicht)', { exact: true }).fill('Anna de Vries');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Telefoonnummer').fill('06 12345678');
  await page.getByLabel('Waar gaat het over?').selectOption('advies');
  await page.getByLabel('Uw vraag (niet verplicht)').fill('Kunt u mij helpen?');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/terugbellen\/verzonden\/$/);
  await expect(page.locator('h1')).toContainText('We bellen u terug');
  const velden = new URLSearchParams(ontvangen);
  expect([...velden.keys()].sort()).toEqual(['adres2', 'dag', 'dagdeel', 'email', 'naam', 'onderwerp', 'telefoon', 'vraag']);
  expect(Object.fromEntries(velden)).toEqual({
    naam: 'Anna de Vries', email: 'anna@praktijk.nl', telefoon: '06 12345678', onderwerp: 'advies',
    dag: 'maakt-niet-uit', dagdeel: 'maakt-niet-uit', vraag: 'Kunt u mij helpen?', adres2: '',
  });
});

test('leeg scanformulier toont een foutoverzicht', async ({ page }) => {
  await page.goto('/scan-aanvragen/');
  await page.getByRole('button', { name: 'Vraag de scan aan' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht).toBeVisible();
  await expect(overzicht).toBeFocused();
  await expect(overzicht.getByRole('link', { name: 'Vul uw naam in.' })).toBeVisible();
  await expect(overzicht.getByRole('link', { name: 'Vul het webadres in dat we scannen, zoals www.uwpraktijk.nl.' })).toBeVisible();
});

test('ingevuld scanformulier gaat naar de functie', async ({ page }) => {
  let ontvangen = '';
  await page.route(`${FUNCTIONS}/scan-aanvragen`, async (route) => {
    ontvangen = route.request().postData() ?? '';
    await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/scan-aanvragen/verzonden/' } });
  });
  await page.goto('/scan-aanvragen/');
  await page.getByLabel('Naam (verplicht)', { exact: true }).fill('Anna');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Telefoonnummer').fill('06 12345678');
  await page.getByLabel('Naam van uw organisatie (niet verplicht)').fill('Praktijk Anna');
  await page.getByLabel('Webadres van uw site').fill('www.praktijk.nl');
  await page.getByLabel('Waar moeten we extra op letten? (niet verplicht)').fill('Het afsprakenformulier');
  await page.getByRole('button', { name: 'Vraag de scan aan' }).click();
  await expect(page).toHaveURL(/\/scan-aanvragen\/verzonden\/$/);
  const velden = new URLSearchParams(ontvangen);
  expect([...velden.keys()].sort()).toEqual(['adres2', 'email', 'naam', 'opmerkingen', 'organisatie', 'telefoon', 'website']);
  expect(Object.fromEntries(velden)).toEqual({
    naam: 'Anna', organisatie: 'Praktijk Anna', email: 'anna@praktijk.nl', telefoon: '06 12345678',
    website: 'www.praktijk.nl', opmerkingen: 'Het afsprakenformulier', adres2: '',
  });
});

test.describe('zonder JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('scanformulier heeft verplichte velden en verstuurt gewoon', async ({ page }) => {
    let ontvangen = '';
    await page.route(`${FUNCTIONS}/scan-aanvragen`, async (route) => {
      ontvangen = route.request().postData() ?? '';
      await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/scan-aanvragen/verzonden/' } });
    });
    await page.goto('/scan-aanvragen/');
    for (const id of ['naam', 'email', 'telefoon', 'website']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('required', '');
    }
    await page.getByLabel('Naam (verplicht)', { exact: true }).fill('Anna');
    await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
    await page.getByLabel('Telefoonnummer').fill('06 12345678');
    await page.getByLabel('Webadres van uw site').fill('www.praktijk.nl');
    await page.getByRole('button', { name: 'Vraag de scan aan' }).click();
    await expect(page).toHaveURL(/\/scan-aanvragen\/verzonden\/$/);
    expect(new URLSearchParams(ontvangen).get('website')).toBe('www.praktijk.nl');
  });
});
