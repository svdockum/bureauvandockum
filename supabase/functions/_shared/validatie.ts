export type Veldfouten = Record<string, string>;
export type Resultaat<T> = { ok: true; waarde: T } | { ok: false; fouten: Veldfouten };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9-]{1,60}$/;
export const ONDERWERPEN = ['toegankelijke-website', 'advies', 'ux-testing', 'thema', 'keynote', 'anders'] as const;
export const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'maakt-niet-uit'] as const;
export const DAGDELEN = ['ochtend', 'middag', 'maakt-niet-uit'] as const;

export type Terugbelverzoek = {
  naam: string; email: string; telefoon: string;
  onderwerp: (typeof ONDERWERPEN)[number]; dag: (typeof DAGEN)[number]; dagdeel: (typeof DAGDELEN)[number];
  vraag: string;
};
export type Bestelgegevens = { product: string; naam: string; email: string; bedrijf: string; website: string | null };

function tekst(form: FormData, veld: string, max: number): string {
  const waarde = form.get(veld);
  return typeof waarde === 'string' ? waarde.trim().slice(0, max) : '';
}

function eenVan<T extends readonly string[]>(lijst: T, waarde: string): waarde is T[number] {
  return (lijst as readonly string[]).includes(waarde);
}

// Lokveld: onzichtbaar voor mensen, bots vullen het in.
export function isSpam(form: FormData): boolean {
  return tekst(form, 'adres2', 200) !== '';
}

export function normaliseerWebsite(invoer: string): string | null {
  if (!invoer) return null;
  try {
    const url = new URL(invoer.includes('://') ? invoer : `https://${invoer}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;
    if (!url.hostname.includes('.')) return null;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.startsWith('[')) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function valideerTerugbelverzoek(form: FormData): Resultaat<Terugbelverzoek> {
  const fouten: Veldfouten = {};
  const naam = tekst(form, 'naam', 120);
  const email = tekst(form, 'email', 200);
  const telefoon = tekst(form, 'telefoon', 40);
  const onderwerp = tekst(form, 'onderwerp', 40);
  const dag = tekst(form, 'dag', 20);
  const dagdeel = tekst(form, 'dagdeel', 20);
  const vraag = tekst(form, 'vraag', 2000);

  if (!naam) fouten.naam = 'Vul uw naam in.';
  if (!EMAIL.test(email)) fouten.email = 'Vul een geldig e-mailadres in, zoals naam@voorbeeld.nl.';
  if (telefoon.replace(/\D/g, '').length < 10) fouten.telefoon = 'Vul een telefoonnummer in van minstens tien cijfers.';
  if (!eenVan(ONDERWERPEN, onderwerp)) fouten.onderwerp = 'Kies waar het over gaat.';
  if (!eenVan(DAGEN, dag)) fouten.dag = 'Kies een dag.';
  if (!eenVan(DAGDELEN, dagdeel)) fouten.dagdeel = 'Kies ochtend, middag of maakt niet uit.';

  if (Object.keys(fouten).length > 0) return { ok: false, fouten };
  return {
    ok: true,
    waarde: { naam, email, telefoon, onderwerp: onderwerp as Terugbelverzoek['onderwerp'], dag: dag as Terugbelverzoek['dag'], dagdeel: dagdeel as Terugbelverzoek['dagdeel'], vraag },
  };
}

export function valideerBestelling(form: FormData): Resultaat<Bestelgegevens> {
  const fouten: Veldfouten = {};
  const product = tekst(form, 'product', 60);
  const naam = tekst(form, 'naam', 120);
  const email = tekst(form, 'email', 200);
  const bedrijf = tekst(form, 'bedrijf', 120);
  const websiteInvoer = tekst(form, 'website', 300);
  const website = normaliseerWebsite(websiteInvoer);

  if (!SLUG.test(product)) fouten.product = 'Onbekend product.';
  if (!naam) fouten.naam = 'Vul uw naam in.';
  if (!EMAIL.test(email)) fouten.email = 'Vul een geldig e-mailadres in, zoals naam@voorbeeld.nl.';
  if (product === 'snelle-scan' && !website) fouten.website = 'Vul het webadres in dat we scannen, zoals www.uwpraktijk.nl.';
  if (websiteInvoer && !website) fouten.website = 'Dit webadres klopt niet. Vul het in zoals www.uwpraktijk.nl.';
  if (tekst(form, 'akkoord', 10) !== 'ja') fouten.akkoord = 'Ga akkoord met de voorwaarden om te bestellen.';

  if (Object.keys(fouten).length > 0) return { ok: false, fouten };
  return { ok: true, waarde: { product, naam, email, bedrijf, website } };
}

export type Scanaanvraag = { naam: string; email: string; telefoon: string; organisatie: string; website: string; opmerkingen: string };

export function valideerScanaanvraag(form: FormData): Resultaat<Scanaanvraag> {
  const fouten: Veldfouten = {};
  const naam = tekst(form, 'naam', 120);
  const email = tekst(form, 'email', 200);
  const telefoon = tekst(form, 'telefoon', 40);
  const organisatie = tekst(form, 'organisatie', 120);
  const websiteInvoer = tekst(form, 'website', 300);
  const website = normaliseerWebsite(websiteInvoer);
  const opmerkingen = tekst(form, 'opmerkingen', 2000);

  if (!naam) fouten.naam = 'Vul uw naam in.';
  if (!EMAIL.test(email)) fouten.email = 'Vul een geldig e-mailadres in, zoals naam@voorbeeld.nl.';
  if (telefoon.replace(/\D/g, '').length < 10) fouten.telefoon = 'Vul een telefoonnummer in van minstens tien cijfers.';
  if (!websiteInvoer) fouten.website = 'Vul het webadres in dat we scannen, zoals www.uwpraktijk.nl.';
  else if (!website) fouten.website = 'Dit webadres klopt niet. Vul het in zoals www.uwpraktijk.nl.';

  if (Object.keys(fouten).length > 0 || !website) return { ok: false, fouten };
  return { ok: true, waarde: { naam, email, telefoon, organisatie, website, opmerkingen } };
}
