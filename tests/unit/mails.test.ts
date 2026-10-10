import { describe, it, expect } from 'vitest';
import { bestelMailVoorKlant, scanMailVoorBezoeker, scanMailVoorOns, terugbelMailVoorBezoeker, terugbelMailVoorOns } from '../../supabase/functions/_shared/mails.ts';
import { brevoBody } from '../../supabase/functions/_shared/brevo.ts';
import type { Scanaanvraag, Terugbelverzoek } from '../../supabase/functions/_shared/validatie.ts';

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
  it('noemt dag en dagdeel in de bevestiging, maar geen vrije tekst van de aanvrager', () => {
    const m = terugbelMailVoorBezoeker({ ...v, naam: 'Kwaadwillende naam', vraag: 'geheime vraag' });
    expect(m.tekst).toContain('op dinsdag, in de ochtend');
    expect(m.tekst).toContain('Beste lezer,');
    expect(m.tekst).not.toContain('Kwaadwillende');
    expect(m.html).not.toContain('Kwaadwillende');
    expect(m.tekst).not.toContain('geheime');
    expect(m.aan.naam).toBeUndefined();
  });
  it('bevestigt een betaalde bestelling neutraal, met productnaam, twee werkdagen en bestelnummer', () => {
    const m = bestelMailVoorKlant(scan);
    expect(m.onderwerp).toBe('Bedankt voor uw bestelling');
    expect(m.tekst).toContain('betaling voor Snelle scan');
    expect(m.tekst).toContain('binnen twee werkdagen contact met u op over de uitvoering');
    expect(m.tekst).toContain('b1');
    expect(m.tekst).not.toContain('vijf werkdagen');
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

const scanaanvraag: Scanaanvraag = { naam: 'Anna', email: 'anna@praktijk.nl', telefoon: '0612345678', organisatie: 'Praktijk', website: 'https://www.praktijk.nl/', opmerkingen: 'Kunt u kijken naar het formulier?' };

describe('scan-mails', () => {
  it('escapet HTML uit naam, website en opmerkingen in de mail aan ons', () => {
    const m = scanMailVoorOns({ ...scanaanvraag, naam: '<script>x</script>', website: 'https://x.nl/<img src=x onerror=alert(1)>', opmerkingen: '<script>y</script>' }, 'ons@bureau.nl');
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.html).not.toContain('<script>');
    expect(m.html).not.toContain('<img');
  });
  it('zet de bezoeker als antwoordadres in de mail aan ons', () => {
    expect(scanMailVoorOns(scanaanvraag, 'ons@bureau.nl').antwoordAan).toBe('anna@praktijk.nl');
  });
  it('noemt twee werkdagen en het bedrag, maar geen naam of webadres in de bevestiging', () => {
    const m = scanMailVoorBezoeker({ ...scanaanvraag, naam: 'Kwaadwillende naam' });
    expect(m.tekst).toContain('twee werkdagen');
    expect(m.tekst).toContain('€ 59');
    expect(m.tekst).toContain('Beste lezer,');
    expect(m.tekst).not.toContain('Kwaadwillende');
    expect(m.tekst).not.toContain('praktijk.nl/');
    expect(m.html).not.toContain('www.praktijk.nl');
    expect(m.aan.email).toBe('anna@praktijk.nl');
    expect(m.aan.naam).toBeUndefined();
  });
});
