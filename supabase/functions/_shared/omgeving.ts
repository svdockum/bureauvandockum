import { leesToegestaneOrigins } from './http.ts';

function verplicht(naam: string): string {
  const waarde = Deno.env.get(naam);
  if (!waarde) throw new Error(`Omgevingsvariabele ${naam} ontbreekt`);
  return waarde;
}

export function site() {
  const siteUrl = verplicht('SITE_URL').replace(/\/$/, '');
  const functionsUrl = (Deno.env.get('FUNCTIONS_URL') ?? `${verplicht('SUPABASE_URL')}/functions/v1`).replace(/\/$/, '');
  return { siteUrl, functionsUrl, origins: leesToegestaneOrigins(siteUrl, Deno.env.get('TOEGESTANE_ORIGINS')) };
}

export function mail() {
  return { apiKey: verplicht('BREVO_API_KEY'), afzender: verplicht('MAIL_VAN'), aan: verplicht('MAIL_AAN') };
}

export function mollieKey(): string {
  return verplicht('MOLLIE_API_KEY');
}
