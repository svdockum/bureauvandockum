import { stuurViaBrevo } from '../_shared/brevo.ts';
import { doorsturen, origineToegestaan } from '../_shared/http.ts';
import { mail, site } from '../_shared/omgeving.ts';
import { verwerkTerugbelverzoek } from '../_shared/terugbellen.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const { siteUrl, origins } = site();
  if (!origineToegestaan(req, origins)) return new Response('Verboden', { status: 403 });

  const cfg = mail();
  const naar = await verwerkTerugbelverzoek(await req.formData(), {
    mailAan: cfg.aan,
    siteUrl,
    stuurMail: (m) => stuurViaBrevo(m, cfg),
  });
  return doorsturen(naar);
});
