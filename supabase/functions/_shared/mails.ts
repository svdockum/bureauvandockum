import { escapeHtml } from './html.ts';
import type { Mail } from './brevo.ts';
import type { Scanaanvraag, Terugbelverzoek } from './validatie.ts';

export type BestellingVoorMail = {
  id: string; naam: string; email: string; website: string | null;
  product: { naam: string; soort: 'scan' | 'thema' };
};

const ONDERWERP: Record<Terugbelverzoek['onderwerp'], string> = {
  'toegankelijke-website': 'Toegankelijke website', advies: 'Advies voor de huidige site',
  'ux-testing': 'UX Testing', thema: 'Thema', anders: 'Iets anders',
};
const DAGDEEL: Record<Terugbelverzoek['dagdeel'], string> = { ochtend: 'in de ochtend', middag: 'in de middag', 'maakt-niet-uit': 'op elk moment van de dag' };
const dagTekst = (dag: Terugbelverzoek['dag']) => (dag === 'maakt-niet-uit' ? 'op elke werkdag' : `op ${dag}`);

// Eenvoudige, toegankelijke opmaak: echte tekst, 16px, hoog contrast, taal ingesteld.
function omhul(titel: string, alineas: string[]): string {
  const inhoud = alineas.map((a) => `<p style="margin:0 0 16px">${a}</p>`).join('');
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(titel)}</title></head>`
    + `<body style="margin:0;padding:24px;background:#ffffff;color:#111111;font:16px/1.6 Arial,Helvetica,sans-serif">`
    + `<div style="max-width:560px">${inhoud}<p style="margin:32px 0 0;color:#5b5b5b">Bureau van Dockum</p></div></body></html>`;
}

function regels(paren: [string, string][]): string {
  return paren.map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`).join('<br>');
}

export function terugbelMailVoorOns(v: Terugbelverzoek, aan: string): Mail {
  const paren: [string, string][] = [
    ['Naam', v.naam], ['E-mail', v.email], ['Telefoon', v.telefoon], ['Onderwerp', ONDERWERP[v.onderwerp]],
    ['Bellen', `${dagTekst(v.dag)}, ${DAGDEEL[v.dagdeel]}`], ['Vraag', v.vraag || '(geen)'],
  ];
  return {
    aan: { email: aan }, antwoordAan: v.email,
    onderwerp: `Terugbelverzoek: ${v.naam}`,
    html: omhul('Terugbelverzoek', [regels(paren)]),
    tekst: paren.map(([k, w]) => `${k}: ${w}`).join('\n'),
  };
}

export function terugbelMailVoorBezoeker(v: Terugbelverzoek): Mail {
  const moment = `${dagTekst(v.dag)}, ${DAGDEEL[v.dagdeel]}`;
  const alineas = [
    `Beste ${escapeHtml(v.naam)},`,
    'Dank u wel. We hebben uw aanvraag ontvangen. Binnen één werkdag mailen we u een moment om te bellen.',
    `U gaf aan dat we u het best kunnen bellen ${escapeHtml(moment)}.`,
  ];
  return {
    aan: { email: v.email, naam: v.naam },
    onderwerp: 'We bellen u terug',
    html: omhul('We bellen u terug', alineas),
    tekst: `Beste ${v.naam},\n\nDank u wel. We hebben uw aanvraag ontvangen. Binnen één werkdag mailen we u een moment om te bellen.\n\nU gaf aan dat we u het best kunnen bellen ${moment}.\n\nBureau van Dockum`,
  };
}

export function bestelMailVoorKlant(b: BestellingVoorMail): Mail {
  if (b.product.soort !== 'scan') throw new Error('Levering van thema’s is nog niet gebouwd');
  const site = b.website ?? '(onbekend)';
  return {
    aan: { email: b.email, naam: b.naam },
    onderwerp: 'Bedankt voor uw bestelling: snelle scan',
    html: omhul('Bedankt voor uw bestelling', [
      `Beste ${escapeHtml(b.naam)},`,
      `Dank u wel voor uw betaling. We gaan aan de slag met de snelle scan van ${escapeHtml(site)}.`,
      'U krijgt het rapport binnen vijf werkdagen per e-mail.',
      `Uw bestelnummer is ${escapeHtml(b.id)}.`,
    ]),
    tekst: `Beste ${b.naam},\n\nDank u wel voor uw betaling. We gaan aan de slag met de snelle scan van ${site}.\nU krijgt het rapport binnen vijf werkdagen per e-mail.\n\nUw bestelnummer is ${b.id}.\n\nBureau van Dockum`,
  };
}

export function bestelMailVoorOns(b: BestellingVoorMail, aan: string): Mail {
  const paren: [string, string][] = [['Product', b.product.naam], ['Naam', b.naam], ['E-mail', b.email], ['Website', b.website ?? '-'], ['Bestelnummer', b.id]];
  return {
    aan: { email: aan }, antwoordAan: b.email,
    onderwerp: `Betaald: ${b.product.naam} voor ${b.naam}`,
    html: omhul('Nieuwe bestelling', [regels(paren)]),
    tekst: paren.map(([k, w]) => `${k}: ${w}`).join('\n'),
  };
}

export function scanMailVoorOns(a: Scanaanvraag, aan: string): Mail {
  const paren: [string, string][] = [
    ['Naam', a.naam], ['Organisatie', a.organisatie || '-'], ['E-mail', a.email], ['Telefoon', a.telefoon],
    ['Website', a.website], ['Extra aandachtspunten', a.opmerkingen || '(geen)'],
  ];
  return {
    aan: { email: aan }, antwoordAan: a.email,
    onderwerp: `Scanaanvraag: ${a.website}`,
    html: omhul('Scanaanvraag', [regels(paren)]),
    tekst: paren.map(([k, w]) => `${k}: ${w}`).join('\n'),
  };
}

export function scanMailVoorBezoeker(a: Scanaanvraag): Mail {
  const alineas = [
    `Beste ${escapeHtml(a.naam)},`,
    `Dank u wel voor uw aanvraag voor een toegankelijkheidsscan van ${escapeHtml(a.website)}.`,
    'Binnen twee werkdagen nemen wij contact met u op. Dan stemmen we samen de verwachtingen af, en hoort u waar we extra op letten.',
    'De scan kost € 59, inclusief btw. Uw aanvraag is vrijblijvend.',
  ];
  return {
    aan: { email: a.email, naam: a.naam },
    onderwerp: 'Uw aanvraag voor een toegankelijkheidsscan',
    html: omhul('Uw aanvraag voor een toegankelijkheidsscan', alineas),
    tekst: `Beste ${a.naam},\n\nDank u wel voor uw aanvraag voor een toegankelijkheidsscan van ${a.website}.\nBinnen twee werkdagen nemen wij contact met u op. Dan stemmen we samen de verwachtingen af, en hoort u waar we extra op letten.\n\nDe scan kost € 59, inclusief btw. Uw aanvraag is vrijblijvend.\n\nBureau van Dockum`,
  };
}
