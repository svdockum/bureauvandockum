import { paginaVoorStatus, werkStatusBij } from '../_shared/betaling.ts';
import { doorsturen, isUuid } from '../_shared/http.ts';
import { haalMollieBetaling } from '../_shared/mollie.ts';
import { mollieKey, site } from '../_shared/omgeving.ts';
import { betaalOpslag, maakDb, zoekMollieId } from '../_shared/opslag.ts';

// Mollie stuurt de klant hierheen terug. Wij werken alleen de status bij en sturen door naar een vaste pagina.
// Mailen doet de webhook: die probeert Mollie opnieuw als het mislukt, deze terugkeer niet.
Deno.serve(async (req) => {
  const { siteUrl } = site();
  const naar = (pagina: string) => doorsturen(`${siteUrl}/bestellen/${pagina}/`);
  const bestellingId = new URL(req.url).searchParams.get('bestelling');
  if (!isUuid(bestellingId)) return naar('mislukt');

  try {
    const db = maakDb();
    const mollieId = await zoekMollieId(db, bestellingId);
    if (!mollieId) return naar('mislukt');
    const key = mollieKey();
    const status = await werkStatusBij(mollieId, {
      ...betaalOpslag(db),
      haalBetaling: (id) => haalMollieBetaling(id, key),
    });
    return naar(paginaVoorStatus(status));
  } catch (fout) {
    // Status onbekend: de webhook maakt het af. De klant ziet 'bezig' en krijgt mail zodra het binnen is.
    console.error('Terugkeer na betaling', fout);
    return naar('bezig');
  }
});
