// Gegevens die op meerdere pagina's staan. Waarden tussen blokhaken moeten vóór livegang echt zijn;
// `npm run controle:livegang` (taak 7) zoekt ernaar.
export const bedrijf = {
  naam: 'Bureau van Dockum',
  email: 'hallo@bureauvandockum.nl',
  eigenaar: 'Stefan van Dockum',
  kvk: '[in te vullen: KvK-nummer]',
  btw: '[in te vullen: btw-id]',
  adres: '[in te vullen: vestigingsadres]',
} as const;

export const FUNCTIONS_URL: string =
  import.meta.env.PUBLIC_FUNCTIONS_URL ?? 'http://127.0.0.1:54321/functions/v1';
