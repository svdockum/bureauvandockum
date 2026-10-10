# Live zetten

Deze stappen zet je één keer in de juiste volgorde. Alles wat hieronder staat met `<...>` vul je zelf in.

## 1. Supabase

1. Maak een nieuw project aan op supabase.com. Kies als regio **Europa**.
2. Koppel de repository aan het project. Vervang `<ref>` door de project-ref uit het dashboard:

   ```bash
   supabase link --project-ref <ref>
   ```

3. Zet de database-tabellen klaar:

   ```bash
   supabase db push
   ```

4. Zet de geheimen (secrets) klaar. `TOEGESTANE_ORIGINS` is een lijst van extra adressen, gescheiden door een komma, die formulieren mogen versturen. Laat die leeg als je er geen hebt.

   ```bash
   supabase secrets set BREVO_API_KEY=... MAIL_VAN=... MAIL_AAN=... SITE_URL=https://<vercel-domein> TOEGESTANE_ORIGINS=...
   ```

   `MOLLIE_API_KEY` heb je nu nog niet nodig. Die zet je pas als de thema's te koop zijn (zie stap 7).

5. Zet de Edge Functions online:

   ```bash
   supabase functions deploy
   ```

   De instelling `verify_jwt = false` staat in `supabase/config.toml` en wordt dan meegenomen.

6. Controleer in het dashboard, bij Edge Functions, dat alle vijf functies **Verify JWT** uit hebben:
   - terugbellen
   - scan-aanvragen
   - bestelling-starten
   - bestelling-terug
   - mollie-webhook

   Staat er één aan, zet hem uit en controleer het formulier opnieuw. Met Verify JWT aan krijgt een bezoeker een fout.

## 2. Brevo

1. Verifieer je afzenderdomein in Brevo. Voeg de SPF- en DKIM-records toe bij je domeinbeheerder en wacht tot Brevo ze goedkeurt.
2. Maak een API-sleutel aan in Brevo. Die sleutel is de waarde van `BREVO_API_KEY` uit stap 1.
3. Het adres van `MAIL_VAN` moet op het geverifieerde domein staan. Anders komt de mail niet aan.

## 3. Vercel

1. Maak een project aan op vercel.com en koppel de GitHub-repository.
2. Kies als framework **Astro**. De build-instellingen (`npm run build`) vullen zich dan zelf in.
3. Voeg de omgevingsvariabelen toe:
   - `PUBLIC_FUNCTIONS_URL` = `https://<ref>.supabase.co/functions/v1` (zonder slash aan het eind)
   - `SITE_URL` = het adres van de site, bijvoorbeeld `https://bureauvandockum.vercel.app`
4. Deploy. De beveiligingsheaders uit `vercel.json` gaan vanzelf mee.

**Let op:** het gratis Hobby-abonnement is volgens de voorwaarden van Vercel alleen voor niet-commercieel gebruik. Stap naar Pro vóór de site voor het eerst commercieel wordt gebruikt.

## 4. Testen op de live site

1. Vul het **terugbelformulier** in en verstuur het. Je moet op de pagina `verzonden` uitkomen.
2. Vul het **scanformulier** in en verstuur het. Je moet op de pagina `verzonden` uitkomen.
3. Controleer dat er per formulier twee mails binnenkomen: één bij ons (`MAIL_AAN`) en één bij de bezoeker.
4. Stuur één verzoek van buiten de site, bijvoorbeeld met `curl -X POST` en zonder de juiste `Origin`-header naar `https://<ref>.supabase.co/functions/v1/terugbellen`. Het antwoord moet **403** zijn.

## 5. Supabase wakker houden

Een gratis Supabase-project wordt na een week zonder activiteit gepauzeerd. Stefan houdt het project wakker via een aparte website. Er is in deze repository geen actie nodig.

## 6. Livegang

1. Controleer de gegevens in `src/lib/bedrijf.ts`: KvK-nummer, btw-id en adres.
2. Vervang de tijdelijke tekst op de Info-pagina (`src/pages/info/index.astro`, markering `TIJDELIJK`) door de echte tekst en foto.
3. Lees de pagina's Privacy (`src/pages/privacy.astro`) en Voorwaarden (`src/pages/voorwaarden.astro`). Ze zijn nog een concept (markering `CONCEPT`). Keur ze goed of pas ze aan, en haal daarna de markering weg.
4. Draai de controle:

   ```bash
   npm run controle:livegang
   ```

   Die moet slagen. Zolang er nog een open invulplek of een `CONCEPT`- of `TIJDELIJK`-tekst in `src/` staat, meldt het script wat er nog moet gebeuren.

## 7. Later: thema's te koop

Doe dit pas als de thema's klaar zijn en je ze wilt verkopen.

1. Zet `MOLLIE_API_KEY` in Supabase. Gebruik eerst de **testsleutel** van Mollie en pas daarna de livesleutel:

   ```bash
   supabase secrets set MOLLIE_API_KEY=test_...
   ```

2. Zet de betaalmethoden aan in het Mollie-dashboard (iDEAL, creditcard, Bancontact).
3. Zet een themaproduct actief.
4. Verwijder in `supabase/functions/_shared/bestellen.ts` de controle die alleen de soort `scan` toestaat (de regel `product.soort !== 'scan'`). Doe dat pas als de levering van thema's is gebouwd.

## Lokaal

De lokale Supabase in deze repository gebruikt de poorten **54521 tot en met 54529** (zie `supabase/config.toml`). Die zijn anders dan de standaardpoorten van Supabase.
