import { describe, it, expect } from 'vitest';
import { bestelMailVoorKlant, terugbelMailVoorBezoeker, terugbelMailVoorOns } from '../../supabase/functions/_shared/mails.ts';
import { brevoBody } from '../../supabase/functions/_shared/brevo.ts';
import type { Terugbelverzoek } from '../../supabase/functions/_shared/validatie.ts';

const v: Terugbelverzoek = { naam: 'Anna', email: 'anna@praktijk.nl', telefoon: '0612345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: 'Kunt u helpen?' };
const scan = { id: 'b1', naam: 'Anna', email: 'anna@praktijk.nl', website: 'https://www.praktijk.nl/', product: { naam: 'Snelle scan', soort: 'scan' as const } };

describe('mails', () => {
  it('escapet HTML uit de invoer', () => {
    const m = terugbelMailVoorOns({ ...v, naam: '<script>x</script>', vraag: '<img src=x onerror=alert(1)>' }, 'ons@bureau.nl');
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.html).not.toContain('<script>');
    expect(m.html).not.toContain('<img');
  });
  it('zet de bezoeker als antwoordadres in de mail aan ons', () => {
    expect(terugbelMailVoorOns(v, 'ons@bureau.nl').antwoordAan).toBe('anna@praktijk.nl');
  });
  it('noemt dag en dagdeel in de bevestiging', () => {
    expect(terugbelMailVoorBezoeker(v).tekst).toContain('op dinsdag, in de ochtend');
  });
  it('bevestigt de snelle scan met webadres en levertijd', () => {
    const m = bestelMailVoorKlant(scan);
    expect(m.tekst).toContain('https://www.praktijk.nl/');
    expect(m.tekst).toContain('vijf werkdagen');
  });
  it('weigert een themamail zolang levering niet gebouwd is', () => {
    expect(() => bestelMailVoorKlant({ ...scan, product: { naam: 'X', soort: 'thema' } })).toThrow();
  });
  it('bouwt een geldig Brevo-verzoek', () => {
    const body = brevoBody(terugbelMailVoorOns(v, 'ons@bureau.nl'), 'noreply@bureau.nl');
    expect(body.sender.email).toBe('noreply@bureau.nl');
    expect(body.replyTo).toEqual({ email: 'anna@praktijk.nl' });
    expect(body.to).toEqual([{ email: 'ons@bureau.nl' }]);
  });
});
