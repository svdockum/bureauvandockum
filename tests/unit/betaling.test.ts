import { describe, it, expect } from 'vitest';
import { paginaVoorStatus, verwerkBetaling, type BetaalDeps } from '../../supabase/functions/_shared/betaling.ts';
import type { Bestelstatus } from '../../supabase/functions/_shared/mollie.ts';

// Nepopslag die dezelfde regels volgt als de echte: een betaalde bestelling blijft betaald,
// en gemaild_op wordt alleen gezet als het nog leeg is.
function maak() {
  const rij = { id: 'b1', mollieId: 'tr_1', status: 'open' as Bestelstatus, gemaildOp: null as string | null };
  const mails: string[] = [];
  const stand = { mollie: 'paid', mailFaalt: false };
  const deps: BetaalDeps = {
    haalBetaling: async () => ({ status: stand.mollie }),
    zetStatus: async (id, status) => { if (id === rij.mollieId && rij.status !== 'betaald') rij.status = status; },
    claimMail: async (id) => {
      if (id !== rij.mollieId || rij.status !== 'betaald' || rij.gemaildOp) return null;
      rij.gemaildOp = 'nu';
      return { id: rij.id, naam: 'Anna', email: 'anna@praktijk.nl', website: 'https://x.nl/', product: { naam: 'Snelle scan', soort: 'scan' } };
    },
    geefMailVrij: async () => { rij.gemaildOp = null; },
    stuurMails: async (b) => { if (stand.mailFaalt) throw new Error('Brevo plat'); mails.push(b.id); },
  };
  return { rij, mails, stand, deps };
}

describe('verwerkBetaling', () => {
  it('zet een betaalde bestelling op betaald en mailt één keer', async () => {
    const t = maak();
    expect(await verwerkBetaling('tr_1', t.deps)).toBe('betaald');
    expect(t.rij.status).toBe('betaald');
    expect(t.mails).toEqual(['b1']);
  });
  it('mailt niet nog eens bij een dubbele melding of bij terugkeer na de webhook', async () => {
    const t = maak();
    await verwerkBetaling('tr_1', t.deps);
    await verwerkBetaling('tr_1', t.deps);
    expect(t.mails).toEqual(['b1']);
  });
  it('mailt niet zolang de betaling open is', async () => {
    const t = maak();
    t.stand.mollie = 'open';
    expect(await verwerkBetaling('tr_1', t.deps)).toBe('open');
    expect(t.mails).toEqual([]);
  });
  it('geeft de mail vrij als versturen mislukt, zodat de volgende melding het opnieuw doet', async () => {
    const t = maak();
    t.stand.mailFaalt = true;
    await expect(verwerkBetaling('tr_1', t.deps)).rejects.toThrow('Brevo plat');
    expect(t.rij.gemaildOp).toBeNull();
    t.stand.mailFaalt = false;
    await verwerkBetaling('tr_1', t.deps);
    expect(t.mails).toEqual(['b1']);
  });
  it('mailt niet voor een onbekende betaling', async () => {
    const t = maak();
    await verwerkBetaling('tr_onbekend', t.deps);
    expect(t.mails).toEqual([]);
  });
});

describe('paginaVoorStatus', () => {
  it.each([
    ['betaald', 'gelukt'], ['open', 'bezig'], ['mislukt', 'mislukt'], ['verlopen', 'mislukt'], ['geannuleerd', 'mislukt'],
  ] as const)('%s → %s', (status, pagina) => expect(paginaVoorStatus(status)).toBe(pagina));
});
