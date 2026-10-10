import { describe, it, expect } from 'vitest';
import { verwerkTerugbelverzoek } from '../../supabase/functions/_shared/terugbellen.ts';
import type { Mail } from '../../supabase/functions/_shared/brevo.ts';

const velden = { naam: 'Anna', email: 'anna@praktijk.nl', telefoon: '0612345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: '' };
const formulier = (extra: Record<string, string> = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...velden, ...extra })) f.set(k, v);
  return f;
};

function deps(faalOp?: 'ons' | 'bezoeker') {
  const verstuurd: Mail[] = [];
  return {
    verstuurd,
    deps: {
      mailAan: 'ons@bureau.nl',
      siteUrl: 'https://site.nl',
      stuurMail: async (m: Mail) => {
        const isOns = m.aan.email === 'ons@bureau.nl';
        if ((faalOp === 'ons' && isOns) || (faalOp === 'bezoeker' && !isOns)) throw new Error('Brevo plat');
        verstuurd.push(m);
      },
    },
  };
}

describe('verwerkTerugbelverzoek', () => {
  it('stuurt eerst ons een mail, dan de bezoeker', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier(), d.deps)).toBe('https://site.nl/terugbellen/verzonden/');
    expect(d.verstuurd.map((m) => m.aan.email)).toEqual(['ons@bureau.nl', 'anna@praktijk.nl']);
  });
  it('stuurt niets bij ongeldige invoer', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier({ email: 'geen' }), d.deps)).toBe('https://site.nl/terugbellen/niet-verzonden/');
    expect(d.verstuurd).toHaveLength(0);
  });
  it('doet bij spam alsof het gelukt is, zonder te mailen', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier({ adres2: 'x' }), d.deps)).toBe('https://site.nl/terugbellen/verzonden/');
    expect(d.verstuurd).toHaveLength(0);
  });
  it('meldt mislukt als de mail aan ons niet lukt', async () => {
    expect(await verwerkTerugbelverzoek(formulier(), deps('ons').deps)).toBe('https://site.nl/terugbellen/niet-verzonden/');
  });
  it('meldt gelukt als alleen de bevestiging niet lukt', async () => {
    expect(await verwerkTerugbelverzoek(formulier(), deps('bezoeker').deps)).toBe('https://site.nl/terugbellen/verzonden/');
  });
});
