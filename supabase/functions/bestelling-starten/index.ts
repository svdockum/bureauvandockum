import { startBestelling } from '../_shared/bestellen.ts';
import { doorsturen, origineToegestaan } from '../_shared/http.ts';
import { maakMollieBetaling } from '../_shared/mollie.ts';
import { mollieKey, site } from '../_shared/omgeving.ts';
import { bestelOpslag, maakDb } from '../_shared/opslag.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const { siteUrl, functionsUrl, origins } = site();
  if (!origineToegestaan(req, origins)) return new Response('Verboden', { status: 403 });

  try {
    const key = mollieKey();
    const naar = await startBestelling(await req.formData(), {
      ...bestelOpslag(maakDb()),
      maakBetaling: (verzoek) => maakMollieBetaling(verzoek, key),
      siteUrl,
      functionsUrl,
    });
    return doorsturen(naar);
  } catch (fout) {
    console.error('Bestelling starten mislukt', fout);
    return doorsturen(`${siteUrl}/bestellen/mislukt/`);
  }
});
