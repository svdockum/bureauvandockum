import type { Mail } from './brevo.ts';
import { terugbelMailVoorBezoeker, terugbelMailVoorOns } from './mails.ts';
import { isSpam, valideerTerugbelverzoek } from './validatie.ts';

export type TerugbelDeps = { stuurMail(mail: Mail): Promise<void>; mailAan: string; siteUrl: string };

// Geeft de URL terug waar de bezoeker heen moet.
export async function verwerkTerugbelverzoek(form: FormData, deps: TerugbelDeps): Promise<string> {
  const gelukt = `${deps.siteUrl}/terugbellen/verzonden/`;
  const mislukt = `${deps.siteUrl}/terugbellen/niet-verzonden/`;
  if (isSpam(form)) return gelukt;

  const r = valideerTerugbelverzoek(form);
  if (!r.ok) return mislukt;

  try {
    await deps.stuurMail(terugbelMailVoorOns(r.waarde, deps.mailAan));
  } catch (fout) {
    console.error('Terugbelverzoek niet bij ons aangekomen', fout);
    return mislukt;
  }
  try {
    await deps.stuurMail(terugbelMailVoorBezoeker(r.waarde));
  } catch (fout) {
    // Wij hebben de aanvraag; alleen de bevestiging ontbreekt. Niet opnieuw laten versturen.
    console.error('Bevestiging aan bezoeker mislukt', fout);
  }
  return gelukt;
}
