import { describe, it, expect } from 'vitest';
import { isSpam, normaliseerWebsite, valideerBestelling, valideerTerugbelverzoek } from '../../supabase/functions/_shared/validatie.ts';

function formulier(velden: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(velden)) f.set(k, v);
  return f;
}

const terugbel = { naam: 'Anna de Vries', email: 'anna@praktijk.nl', telefoon: '06 12345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: '' };
const bestelling = { product: 'snelle-scan', naam: 'Anna de Vries', email: 'anna@praktijk.nl', bedrijf: '', website: 'www.praktijk.nl', akkoord: 'ja' };

describe('valideerTerugbelverzoek', () => {
  it('accepteert een volledig ingevuld formulier', () => {
    expect(valideerTerugbelverzoek(formulier(terugbel)).ok).toBe(true);
  });
  it('geeft per verplicht veld een fout bij een leeg formulier', () => {
    const r = valideerTerugbelverzoek(formulier({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fouten).sort()).toEqual(['dag', 'dagdeel', 'email', 'naam', 'onderwerp', 'telefoon']);
  });
  it('accepteert een internationaal nummer', () => {
    expect(valideerTerugbelverzoek(formulier({ ...terugbel, telefoon: '+31 6 1234 5678' })).ok).toBe(true);
  });
  it('weigert een onbekend onderwerp', () => {
    const r = valideerTerugbelverzoek(formulier({ ...terugbel, onderwerp: 'iets' }));
    expect(r.ok).toBe(false);
  });
  it('kapt een te lange vraag af op 2000 tekens', () => {
    const r = valideerTerugbelverzoek(formulier({ ...terugbel, vraag: 'a'.repeat(5000) }));
    expect(r.ok && r.waarde.vraag.length).toBe(2000);
  });
});

describe('valideerBestelling', () => {
  it('vult https:// aan bij een webadres zonder schema', () => {
    const r = valideerBestelling(formulier(bestelling));
    expect(r.ok && r.waarde.website).toBe('https://www.praktijk.nl/');
  });
  it('eist een webadres bij de snelle scan', () => {
    const r = valideerBestelling(formulier({ ...bestelling, website: '' }));
    expect(!r.ok && r.fouten.website).toBeTruthy();
  });
  it('weigert javascript: als webadres', () => {
    expect(normaliseerWebsite('javascript:alert(1)')).toBeNull();
  });
  it('eist akkoord met de voorwaarden', () => {
    const r = valideerBestelling(formulier({ ...bestelling, akkoord: '' }));
    expect(!r.ok && r.fouten.akkoord).toBeTruthy();
  });
  it('weigert een productnaam met vreemde tekens', () => {
    const r = valideerBestelling(formulier({ ...bestelling, product: '../x' }));
    expect(!r.ok && r.fouten.product).toBeTruthy();
  });
});

describe('isSpam', () => {
  it('herkent een ingevuld lokveld', () => {
    expect(isSpam(formulier({ adres2: 'http://spam' }))).toBe(true);
    expect(isSpam(formulier({}))).toBe(false);
  });
});
