export type LimietDeps = {
  tel(sleutel: string, sinds: Date): Promise<number>;
  registreer(sleutel: string): Promise<void>;
};

// Maximaal `max` verzoeken per afzender per uur. Registreert het verzoek als het binnen de limiet valt.
export async function binnenLimiet(sleutel: string, deps: LimietDeps, nu = new Date(), max = 5): Promise<boolean> {
  const sinds = new Date(nu.getTime() - 60 * 60 * 1000);
  if ((await deps.tel(sleutel, sinds)) >= max) return false;
  await deps.registreer(sleutel);
  return true;
}

// Hash van functie + IP-adres; het IP-adres zelf komt nergens terecht.
export async function afzenderSleutel(functie: string, req: Request): Promise<string> {
  const doorgestuurd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = doorgestuurd || req.headers.get('cf-connecting-ip')?.trim() || 'onbekend';
  const bytes = new TextEncoder().encode(`${functie}:${ip}`);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
}
