// Gegevens die op meerdere pagina's staan. Waarden tussen blokhaken moeten vóór livegang echt zijn;
// `npm run controle:livegang` (taak 7) zoekt ernaar.
export const bedrijf = {
  naam: 'Bureau van Dockum',
  email: 'hallo@bureauvandockum.nl',
  eigenaar: 'Stefan van Dockum',
  kvk: '11053393',
  btw: 'NL001929106B52',
  adres: '[in te vullen: vestigingsadres]',
} as const;

// Lokaal valt dit terug op de lokale Supabase. Een bouw op Vercel zonder de variabele zou formulieren
// opleveren die naar localhost posten, dus die laten we mislukken.
if (!import.meta.env.PUBLIC_FUNCTIONS_URL && typeof process !== 'undefined' && process.env.VERCEL) {
  throw new Error('PUBLIC_FUNCTIONS_URL ontbreekt in de Vercel-instellingen');
}

export const FUNCTIONS_URL: string =
  import.meta.env.PUBLIC_FUNCTIONS_URL ?? 'http://127.0.0.1:54521/functions/v1';
