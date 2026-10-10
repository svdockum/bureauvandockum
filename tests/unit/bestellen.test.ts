import { describe, it, expect } from 'vitest';
import { startBestelling, type BestelDeps } from '../../supabase/functions/_shared/bestellen.ts';

const formulier = (extra: Record<string, string> = {}) => {
  const f = new FormData();
  const velden = { product: 'snelle-scan', naam: 'Anna', email: 'anna@praktijk.nl', website: 'www.praktijk.nl', akkoord: 'ja', ...extra };
  for (const [k, v] of Object.entries(velden)) f.set(k, v);
  return f;
};

function maak(opties: { product?: boolean; mollieFaalt?: boolean } = {}) {
  const log: string[] = [];
  const deps: BestelDeps = {
    siteUrl: 'https://site.nl',
    functionsUrl: 'https://f.supabase.co/functions/v1',
    zoekProduct: async (slug) => (opties.product === false ? null : { slug, naam: 'Snelle scan', soort: 'scan', prijs_centen: 2400 }),
    maakBestelling: async () => { log.push('bestelling'); return 'b1'; },
    maakBetaling: async (v) => {
      if (opties.mollieFaalt) throw new Error('Mollie plat');
      log.push(`betaling ${v.amount.value} ${v.redirectUrl}`);
      return { id: 'tr_1', checkoutUrl: 'https://www.mollie.com/checkout/1' };
    },
    koppelBetaling: async (id, mollieId) => { log.push(`koppel ${id} ${mollieId}`); },
    markeerMislukt: async (id) => { log.push(`mislukt ${id}`); },
  };
  return { deps, log };
}

describe('startBestelling', () => {
  it('maakt een bestelling, start de betaling en stuurt naar Mollie', async () => {
    const { deps, log } = maak();
    expect(await startBestelling(formulier(), deps)).toBe('https://www.mollie.com/checkout/1');
    expect(log).toEqual(['bestelling', 'betaling 24.00 https://f.supabase.co/functions/v1/bestelling-terug?bestelling=b1', 'koppel b1 tr_1']);
  });
  it('stuurt naar de foutpagina bij een onbekend product', async () => {
    const { deps, log } = maak({ product: false });
    expect(await startBestelling(formulier(), deps)).toBe('https://site.nl/bestellen/mislukt/');
    expect(log).toEqual([]);
  });
  it('markeert de bestelling als mislukt als Mollie niet reageert', async () => {
    const { deps, log } = maak({ mollieFaalt: true });
    expect(await startBestelling(formulier(), deps)).toBe('https://site.nl/bestellen/mislukt/');
    expect(log).toEqual(['bestelling', 'mislukt b1']);
  });
  it('maakt niets aan bij ongeldige invoer of spam', async () => {
    const { deps, log } = maak();
    await startBestelling(formulier({ akkoord: '' }), deps);
    await startBestelling(formulier({ adres2: 'x' }), deps);
    expect(log).toEqual([]);
  });
});
