export const MOLLIE_API = 'https://api.mollie.com/v2';
export type Bestelstatus = 'open' | 'betaald' | 'mislukt' | 'verlopen' | 'geannuleerd';

export type BetaalVerzoek = {
  amount: { currency: 'EUR'; value: string };
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: { bestelling: string };
  locale: 'nl_NL';
};

export function centenNaarBedrag(centen: number): string {
  if (!Number.isInteger(centen) || centen <= 0) throw new Error(`Ongeldig bedrag: ${centen}`);
  return (centen / 100).toFixed(2);
}

// Mollie-status naar onze status. 'pending' en 'authorized' zijn nog niet af.
export function naarBestelstatus(mollieStatus: string): Bestelstatus {
  switch (mollieStatus) {
    case 'paid': return 'betaald';
    case 'failed': return 'mislukt';
    case 'expired': return 'verlopen';
    case 'canceled': return 'geannuleerd';
    default: return 'open';
  }
}

// De terugkeer-URL bouwen we zelf; nooit uit invoer van de bezoeker (geen open redirect).
export function maakBetaalVerzoek(a: { bestellingId: string; productNaam: string; centen: number; functionsUrl: string }): BetaalVerzoek {
  return {
    amount: { currency: 'EUR', value: centenNaarBedrag(a.centen) },
    description: `${a.productNaam} — Bureau van Dockum`,
    redirectUrl: `${a.functionsUrl}/bestelling-terug?bestelling=${encodeURIComponent(a.bestellingId)}`,
    webhookUrl: `${a.functionsUrl}/mollie-webhook`,
    metadata: { bestelling: a.bestellingId },
    locale: 'nl_NL',
  };
}

export function isMollieId(waarde: string | null): waarde is string {
  return waarde !== null && /^tr_[A-Za-z0-9]+$/.test(waarde);
}

export async function maakMollieBetaling(verzoek: BetaalVerzoek, apiKey: string, doeFetch: typeof fetch = fetch): Promise<{ id: string; checkoutUrl: string }> {
  const res = await doeFetch(`${MOLLIE_API}/payments`, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(verzoek),
  });
  if (!res.ok) throw new Error(`Mollie ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const checkoutUrl = data?._links?.checkout?.href;
  if (typeof data?.id !== 'string' || typeof checkoutUrl !== 'string') throw new Error('Onverwacht antwoord van Mollie');
  return { id: data.id, checkoutUrl };
}

// De webhook vertelt alleen een id; de echte status halen we altijd zelf op.
export async function haalMollieBetaling(id: string, apiKey: string, doeFetch: typeof fetch = fetch): Promise<{ status: string }> {
  const res = await doeFetch(`${MOLLIE_API}/payments/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Mollie ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (typeof data?.status !== 'string') throw new Error('Onverwacht antwoord van Mollie');
  return { status: data.status };
}
