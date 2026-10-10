import { verwerkBetaling } from '../_shared/betaling.ts';
import { stuurViaBrevo } from '../_shared/brevo.ts';
import { bestelMailVoorKlant, bestelMailVoorOns } from '../_shared/mails.ts';
import { haalMollieBetaling, isMollieId } from '../_shared/mollie.ts';
import { mail, mollieKey } from '../_shared/omgeving.ts';
import { betaalOpslag, maakDb } from '../_shared/opslag.ts';

// Mollie stuurt alleen `id=tr_...` (form-encoded), zonder Supabase-JWT.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const id = (await req.formData()).get('id');
  // Onbekende of rare id's: 200, zodat Mollie niet blijft herhalen en we niets prijsgeven.
  if (typeof id !== 'string' || !isMollieId(id)) return new Response('ok');

  try {
    const key = mollieKey();
    const cfg = mail();
    await verwerkBetaling(id, {
      ...betaalOpslag(maakDb()),
      haalBetaling: (mollieId) => haalMollieBetaling(mollieId, key),
      stuurMails: async (b) => {
        await stuurViaBrevo(bestelMailVoorOns(b, cfg.aan), cfg);
        await stuurViaBrevo(bestelMailVoorKlant(b), cfg);
      },
    });
    return new Response('ok');
  } catch (fout) {
    // 500: Mollie probeert het later opnieuw.
    console.error('Webhook mislukt', fout);
    return new Response('Fout', { status: 500 });
  }
});
