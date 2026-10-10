// Formulieren posten gewoon (geen fetch). De browser stuurt dan een Origin-header mee;
// die moet van onze eigen site komen.
export function leesToegestaneOrigins(siteUrl: string, extra: string | undefined): string[] {
  const lijst = (extra ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return [new URL(siteUrl).origin, ...lijst];
}

export function origineToegestaan(req: Request, toegestaan: string[]): boolean {
  const origin = req.headers.get('origin');
  return origin !== null && toegestaan.includes(origin);
}

export function doorsturen(url: string): Response {
  return new Response(null, { status: 303, headers: { location: url } });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(waarde: string | null): waarde is string {
  return waarde !== null && UUID.test(waarde);
}
