import type { Mail } from './brevo.ts';
import type { TerugbelDeps } from './terugbellen.ts';
import { scanMailVoorBezoeker, scanMailVoorOns } from './mails.ts';
import { isSpam, valideerScanaanvraag } from './validatie.ts';

// Geeft de URL terug waar de bezoeker heen moet.
export async function verwerkScanaanvraag(form: FormData, deps: TerugbelDeps): Promise<string> {
  const gelukt = `${deps.siteUrl}/scan-aanvragen/verzonden/`;
  const mislukt = `${deps.siteUrl}/scan-aanvragen/niet-verzonden/`;
  if (isSpam(form)) return gelukt;

  const r = valideerScanaanvraag(form);
  if (!r.ok) return mislukt;

  try {
    await deps.stuurMail(scanMailVoorOns(r.waarde, deps.mailAan));
  } catch (fout) {
    console.error('Scanaanvraag niet bij ons aangekomen', fout);
    return mislukt;
  }
  try {
    await deps.stuurMail(scanMailVoorBezoeker(r.waarde));
  } catch (fout) {
    // Wij hebben de aanvraag; alleen de bevestiging ontbreekt. Niet opnieuw laten versturen.
    console.error('Bevestiging aan bezoeker mislukt', fout);
  }
  return gelukt;
}
