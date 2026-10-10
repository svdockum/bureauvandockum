import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.3';
import type { BestelDeps, Product } from './bestellen.ts';
import type { BetaalDeps } from './betaling.ts';
import type { BestellingVoorMail } from './mails.ts';
import type { Bestelstatus } from './mollie.ts';

export function maakDb(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function bestelOpslag(db: SupabaseClient): Pick<BestelDeps, 'zoekProduct' | 'maakBestelling' | 'koppelBetaling' | 'markeerMislukt'> {
  return {
    async zoekProduct(slug) {
      const { data, error } = await db.from('producten').select('slug, naam, soort, prijs_centen').eq('slug', slug).eq('actief', true).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
    async maakBestelling(g, product) {
      const { data, error } = await db.from('bestellingen').insert({
        product_slug: product.slug, naam: g.naam, email: g.email, bedrijf: g.bedrijf || null,
        website: g.website, bedrag_centen: product.prijs_centen,
      }).select('id').single();
      if (error) throw error;
      return data.id as string;
    },
    async koppelBetaling(id, mollieId) {
      const { error } = await db.from('bestellingen').update({ mollie_id: mollieId }).eq('id', id);
      if (error) throw error;
    },
    async markeerMislukt(id) {
      const { error } = await db.from('bestellingen').update({ status: 'mislukt' }).eq('id', id).eq('status', 'open');
      if (error) throw error;
    },
  };
}

export async function zoekMollieId(db: SupabaseClient, bestellingId: string): Promise<string | null> {
  const { data, error } = await db.from('bestellingen').select('mollie_id').eq('id', bestellingId).maybeSingle();
  if (error) throw error;
  return (data?.mollie_id as string | null) ?? null;
}

export function betaalOpslag(db: SupabaseClient): Pick<BetaalDeps, 'zetStatus' | 'claimMail' | 'geefMailVrij'> {
  return {
    async zetStatus(mollieId: string, status: Bestelstatus) {
      const wijziging = status === 'betaald' ? { status, betaald_op: new Date().toISOString() } : { status };
      const { error } = await db.from('bestellingen').update(wijziging).eq('mollie_id', mollieId).neq('status', 'betaald');
      if (error) throw error;
    },
    async claimMail(mollieId: string): Promise<BestellingVoorMail | null> {
      const { data, error } = await db.from('bestellingen')
        .update({ gemaild_op: new Date().toISOString() })
        .eq('mollie_id', mollieId).eq('status', 'betaald').is('gemaild_op', null)
        .select('id, naam, email, website, producten(naam, soort)')
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const product = data.producten as unknown as { naam: string; soort: 'scan' | 'thema' };
      return { id: data.id, naam: data.naam, email: data.email, website: data.website, product };
    },
    async geefMailVrij(bestellingId: string) {
      const { error } = await db.from('bestellingen').update({ gemaild_op: null }).eq('id', bestellingId);
      if (error) throw error;
    },
  };
}
