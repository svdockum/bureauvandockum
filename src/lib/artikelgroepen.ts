export const groepen = [
  { id: 'basis', naam: 'Basis', uitleg: 'Wat toegankelijkheid is, en welke regels gelden.' },
  { id: 'tekst-en-inhoud', naam: 'Tekst en inhoud', uitleg: 'Schrijven, koppen, links en afbeeldingen.' },
  { id: 'vormgeving', naam: 'Vormgeving', uitleg: 'Kleur, letters, beweging en focus.' },
  { id: 'bediening', naam: 'Bediening', uitleg: 'Toetsenbord, schermlezer en formulieren.' },
  { id: 'beeld-en-geluid', naam: 'Beeld en geluid', uitleg: 'Video en audio voor iedereen.' },
  { id: 'per-sector', naam: 'Per sector', uitleg: 'Zorg, webshops, verenigingen en drukwerk.' },
  { id: 'testen-en-onderhoud', naam: 'Testen en onderhoud', uitleg: 'Zelf controleren en toegankelijk blijven.' },
] as const;

export type Groep = (typeof groepen)[number]['id'];
export const groepIds = groepen.map((g) => g.id) as [Groep, ...Groep[]];
