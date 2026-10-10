import { maakBetaalVerzoek, type BetaalVerzoek } from './mollie.ts';
import { isSpam, valideerBestelling, type Bestelgegevens } from './validatie.ts';

export type Product = { slug: string; naam: string; soort: 'scan' | 'thema'; prijs_centen: number };

export type BestelDeps = {
  zoekProduct(slug: string): Promise<Product | null>;
  maakBestelling(gegevens: Bestelgegevens, product: Product): Promise<string>;
  maakBetaling(verzoek: BetaalVerzoek): Promise<{ id: string; checkoutUrl: string }>;
  koppelBetaling(bestellingId: string, mollieId: string): Promise<void>;
  markeerMislukt(bestellingId: string): Promise<void>;
  siteUrl: string;
  functionsUrl: string;
};

// Geeft de URL terug: de betaalpagina van Mollie, of onze foutpagina.
export async function startBestelling(form: FormData, deps: BestelDeps): Promise<string> {
  const mislukt = `${deps.siteUrl}/bestellen/mislukt/`;
  if (isSpam(form)) return mislukt;

  const r = valideerBestelling(form);
  if (!r.ok) return mislukt;

  const product = await deps.zoekProduct(r.waarde.product);
  if (!product) return mislukt;

  const id = await deps.maakBestelling(r.waarde, product);
  try {
    const betaling = await deps.maakBetaling(
      maakBetaalVerzoek({ bestellingId: id, productNaam: product.naam, centen: product.prijs_centen, functionsUrl: deps.functionsUrl }),
    );
    await deps.koppelBetaling(id, betaling.id);
    return betaling.checkoutUrl;
  } catch (fout) {
    console.error('Betaling starten mislukt', fout);
    await deps.markeerMislukt(id);
    return mislukt;
  }
}
