// Zoekt in de broncode naar tekst die vóór livegang nog ingevuld of nagelezen moet worden.
// We zoeken in src en niet in dist: Astro kan HTML-commentaar uit de build halen.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function* bronbestanden(map) {
  for (const item of await readdir(map, { withFileTypes: true })) {
    const pad = join(map, item.name);
    if (item.isDirectory()) yield* bronbestanden(pad);
    else if (/\.(astro|ts|md)$/.test(item.name)) yield pad;
  }
}

const gevonden = [];
for await (const bestand of bronbestanden('src')) {
  const tekst = await readFile(bestand, 'utf8');
  for (const [treffer] of tekst.matchAll(/\[in te vullen[^\]\n]*\]|TIJDELIJK|CONCEPT/g)) gevonden.push(`${bestand}: ${treffer}`);
}

if (gevonden.length) {
  console.error(`Nog niet klaar voor livegang:\n${[...new Set(gevonden)].join('\n')}`);
  process.exit(1);
}
console.log('Klaar voor livegang: geen open invulplekken.');
