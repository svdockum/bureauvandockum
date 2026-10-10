import { describe, it, expect } from 'vitest';
import { centenNaarBedrag, haalMollieBetaling, isMollieId, maakBetaalVerzoek, maakMollieBetaling, naarBestelstatus } from '../../supabase/functions/_shared/mollie.ts';

const nepFetch = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('bedragen', () => {
  it('zet centen om naar een Mollie-bedrag', () => {
    expect(centenNaarBedrag(2400)).toBe('24.00');
    expect(centenNaarBedrag(1999)).toBe('19.99');
  });
  it('weigert nul en negatieve bedragen', () => {
    expect(() => centenNaarBedrag(0)).toThrow();
    expect(() => centenNaarBedrag(-5)).toThrow();
  });
});

describe('statussen', () => {
  it.each([
    ['paid', 'betaald'], ['failed', 'mislukt'], ['expired', 'verlopen'], ['canceled', 'geannuleerd'],
    ['open', 'open'], ['pending', 'open'], ['authorized', 'open'],
  ])('%s wordt %s', (mollie, ons) => expect(naarBestelstatus(mollie)).toBe(ons));
});

describe('betaalverzoek', () => {
  const v = maakBetaalVerzoek({ bestellingId: 'abc-123', productNaam: 'Snelle scan', centen: 2400, functionsUrl: 'https://x.supabase.co/functions/v1' });
  it('stuurt terug via onze eigen functie', () => {
    expect(v.redirectUrl).toBe('https://x.supabase.co/functions/v1/bestelling-terug?bestelling=abc-123');
    expect(v.webhookUrl).toBe('https://x.supabase.co/functions/v1/mollie-webhook');
    expect(v.amount).toEqual({ currency: 'EUR', value: '24.00' });
  });
});

describe('Mollie-API', () => {
  it('geeft id en checkout-URL terug', async () => {
    const r = await maakMollieBetaling(maakBetaalVerzoek({ bestellingId: 'a', productNaam: 'p', centen: 100, functionsUrl: 'https://f' }), 'test_x',
      nepFetch(201, { id: 'tr_abc', _links: { checkout: { href: 'https://www.mollie.com/checkout/x' } } }));
    expect(r).toEqual({ id: 'tr_abc', checkoutUrl: 'https://www.mollie.com/checkout/x' });
  });
  it('gooit een fout bij een foutstatus', async () => {
    await expect(haalMollieBetaling('tr_abc', 'test_x', nepFetch(500, {}))).rejects.toThrow('Mollie 500');
  });
  it('herkent een Mollie-id', () => {
    expect(isMollieId('tr_WDqYK6vllg')).toBe(true);
    expect(isMollieId('tr_../x')).toBe(false);
    expect(isMollieId(null)).toBe(false);
  });
});
