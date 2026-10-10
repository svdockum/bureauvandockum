import { stuurViaBrevo } from '../_shared/brevo.ts';
import { doorsturen, origineToegestaan } from '../_shared/http.ts';
import { afzenderSleutel, binnenLimiet } from '../_shared/limiet.ts';
import { mail, site } from '../_shared/omgeving.ts';
import { limietOpslag, maakDb } from '../_shared/opslag.ts';
import { verwerkTerugbelverzoek } from '../_shared/terugbellen.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const { siteUrl, origins } = site();
  if (!origineToegestaan(req, origins)) return new Response('Verboden', { status: 403 });

  try {
    if (!(await binnenLimiet(await afzenderSleutel('terugbellen', req), limietOpslag(maakDb())))) {
      return doorsturen(`${siteUrl}/terugbellen/niet-verzonden/`);
    }
    const cfg = mail();
    const naar = await verwerkTerugbelverzoek(await req.formData(), {
      mailAan: cfg.aan,
      siteUrl,
      stuurMail: (m) => stuurViaBrevo(m, cfg),
    });
    return doorsturen(naar);
  } catch (fout) {
    console.error('Terugbelverzoek mislukt', fout);
    return doorsturen(`${siteUrl}/terugbellen/niet-verzonden/`);
  }
});
