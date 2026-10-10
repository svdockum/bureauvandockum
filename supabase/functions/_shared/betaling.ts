import type { BestellingVoorMail } from './mails.ts';
import { naarBestelstatus, type Bestelstatus } from './mollie.ts';

export type BetaalDeps = {
  haalBetaling(mollieId: string): Promise<{ status: string }>;
  /** Zet de status, maar nooit over een bestelling die al betaald is. */
  zetStatus(mollieId: string, status: Bestelstatus): Promise<void>;
  /** Claimt het versturen: zet gemaild_op als de bestelling betaald is en nog niet gemaild. Geeft de bestelling terug als de claim gelukt is. */
  claimMail(mollieId: string): Promise<BestellingVoorMail | null>;
  /** Maakt de claim ongedaan, zodat een volgende melding het opnieuw probeert. */
  geefMailVrij(bestellingId: string): Promise<void>;
  /** Stuurt eerst de mail aan ons, dan aan de klant. */
  stuurMails(bestelling: BestellingVoorMail): Promise<void>;
};

// Wordt aangeroepen door de webhook én bij terugkeer van de klant. Mag dus vaker draaien:
// de mail gaat precies één keer, en bij een mislukte mail probeert de volgende melding het opnieuw.
export async function verwerkBetaling(mollieId: string, deps: BetaalDeps): Promise<Bestelstatus> {
  const { status: mollieStatus } = await deps.haalBetaling(mollieId);
  const status = naarBestelstatus(mollieStatus);
  await deps.zetStatus(mollieId, status);

  if (status === 'betaald') {
    const bestelling = await deps.claimMail(mollieId);
    if (bestelling) {
      try {
        await deps.stuurMails(bestelling);
      } catch (fout) {
        await deps.geefMailVrij(bestelling.id);
        throw fout;
      }
    }
  }
  return status;
}

export function paginaVoorStatus(status: Bestelstatus): 'gelukt' | 'bezig' | 'mislukt' {
  if (status === 'betaald') return 'gelukt';
  if (status === 'open') return 'bezig';
  return 'mislukt';
}
