import { paginaVoorStatus, verwerkBetaling } from '../_shared/betaling.ts';
import { stuurViaBrevo } from '../_shared/brevo.ts';
import { doorsturen, isUuid } from '../_shared/http.ts';
import { bestelMailVoorKlant, bestelMailVoorOns } from '../_shared/mails.ts';
import { haalMollieBetaling } from '../_shared/mollie.ts';
import { mail, mollieKey, site } from '../_shared/omgeving.ts';
import { betaalOpslag, maakDb, zoekMollieId } from '../_shared/opslag.ts';

// Mollie stuurt de klant hierheen terug. Wij kijken de status na en sturen door naar een vaste pagina.
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
    const cfg = mail();
    const status = await verwerkBetaling(mollieId, {
      ...betaalOpslag(db),
      haalBetaling: (id) => haalMollieBetaling(id, key),
      stuurMails: async (b) => {
        await stuurViaBrevo(bestelMailVoorOns(b, cfg.aan), cfg);
        await stuurViaBrevo(bestelMailVoorKlant(b), cfg);
      },
    });
    return naar(paginaVoorStatus(status));
  } catch (fout) {
    // Status onbekend: de webhook maakt het af. De klant ziet 'bezig' en krijgt mail zodra het binnen is.
    console.error('Terugkeer na betaling', fout);
    return naar('bezig');
  }
});
