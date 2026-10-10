# Eigen website Bureau van Dockum — uitvoeringsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De eigen site van Bureau van Dockum live krijgen: statische Astro-site op Vercel in de Raster-stijl, met terugbelformulier en online bestellen van de snelle scan (€ 24) via Supabase, Mollie en Brevo, plus Info met de eerste acht artikelen.

**Architecture:** Astro bouwt alle pagina's statisch. Formulieren posten gewoon (zonder fetch) naar Supabase Edge Functions, die antwoorden met een 303-redirect. Zo werkt alles ook zonder JavaScript en is CORS niet nodig. Alle logica van de Edge Functions zit in pure modules in `supabase/functions/_shared/` die Vitest test; de `index.ts`-bestanden koppelen alleen omgeving, database en HTTP.

**Tech Stack:** Node 24, Astro 7.3.x, `@fontsource-variable/geist` en `-geist-mono` 5.3.x, Vitest, Playwright + `@axe-core/playwright` 4.13.x, Supabase (Postgres, Edge Functions op Deno, CLI), Mollie Payments API v2, Brevo Transactional Email API v3, Vercel (statisch).

**Spec:** `docs/project/bouwplan.html` (fase 1 Fundament en fase 2 De eigen website). Referentie voor stijl en markup: `docs/stijltest/index.html?stijl=raster` met `docs/stijltest/css/basis.css` en `docs/stijltest/css/stijl-raster.css`.

## Uitvoering en modellen

Zo goedkoop mogelijk, zonder de betaalstroom te riskeren. Achtergrond en kosten: `docs/project/modelinzet.md`.

| Rol | Model | Effort | Waarom |
|---|---|---|---|
| Orkestratie (deze uitvoering aansturen) | Sonnet 5.5, in een **nieuwe sessie** | medium | Het plan bevat het ontwerp; aansturen vraagt geen Opus. Een verse sessie scheelt de lange context van het ontwerpgesprek. |
| Taken 1 en 12 | Haiku 5.5 | medium | Mechanisch: opzet, config, workflowbestand. |
| Taken 2–11 | Sonnet 5.5 | medium | Code, toegankelijkheid en Nederlandse tekst op B1-niveau. |
| Review na taken 8, 9, 10 en 11 | Sonnet 5.5 | high | Betaling, beveiliging en formulieren: hier kost een fout geld of vertrouwen. |
| Overige taken | geen aparte review | — | De tests (axe, Vitest, Playwright) zijn de poort; de eindreview vangt de rest. |
| Eindreview van de hele branch (taak 13) | Opus 5.5 | high | Eén keer het sterkste model over het geheel, vooral de betaalstroom. |

Werk op branch `bouw/eigen-website`. Commit na elke taak, met de Co-Authored-By-regel uit de sessie-instructies.

## Global Constraints

- Taal Nederlands. ‘Wij’ voor het bureau, ‘u’ voor de bezoeker. Taalniveau B1: korte zinnen, gewone woorden.
- Menu exact vier items, in deze volgorde: Toegankelijke website, UX Testing, Thema’s, Info. Plus de knop rechtsboven: “Plan een terugbelafspraak”.
- Stijl Raster: wit #FFFFFF, inkt #111111, grijs #5B5B5B, vlak #F3F3F1, lijn rgba(17,17,17,.14). Geen accentkleur. Knoppen met `border-radius: 6px`. Zeskoloms raster met dunne lijnen op de achtergrond. Logo: zwart vierkant + “Bureau van Dockum”, met “van Dockum” onderstreept (2px, offset 4px), in header en footer.
- Letters Geist en Geist Mono, zelf gehost via Fontsource. Geen Google Fonts, geen tracking van derden, geen cookies.
- WCAG 2.2 AA: axe vindt niets op elke pagina; alles werkt met toetsenbord; geen horizontaal scrollen op 320px; focus altijd zichtbaar; `prefers-reduced-motion` gerespecteerd.
- Contact: geen telefoonnummer op de site. Formulier → mail via Brevo → wij bellen terug.
- Snelle scan: € 24, inclusief btw, vooraf te betalen via Mollie, rapport binnen vijf werkdagen.
- Maatwerk-zin, letterlijk waar hij genoemd wordt: “Maatwerk is bijna altijd de beste oplossing: een website die precies past bij uw praktijk, club of winkel. Wilt u snel en voordelig starten? Dan zijn onze thema’s een goed alternatief. Ze zijn met dezelfde zorg gebouwd en vooraf getoetst aan WCAG 2.2 AA.”
- Bestanden onder de 500 regels. Afhankelijkheden met vaste versies en een gecommitte lockfile.
- Geen geheimen in de repository. `.env` staat in `.gitignore`.

## Review Focus

1. **Mollie meldt een betaling twee keer, of de klant komt terug vóór de melding.** Verwacht: precies één keer mail, status klopt. Test: `tests/unit/betaling.test.ts` (taak 9).
2. **De klant annuleert bij Mollie, of de betaling is bij terugkeer nog ‘open’.** Verwacht: pagina ‘mislukt’ of ‘bezig’, nooit ‘gelukt’. Test: `paginaVoorStatus` in `tests/unit/betaling.test.ts` (taak 9).
3. **HTML of script in naam of vraag.** Verwacht: ge-escaped in elke mail. Test: `tests/unit/mails.test.ts` (taak 9).
4. **Brevo of Mollie is even onbereikbaar.** Verwacht: de bezoeker komt op een nette foutpagina met het e-mailadres. Na een mislukte bevestigingsmail probeert Mollie de webhook opnieuw en gaat de mail alsnog. Tests: `tests/unit/terugbellen.test.ts`, `bestellen.test.ts`, `betaling.test.ts` (taak 9).
5. **Een formulier wordt vanaf een andere site gepost.** Verwacht: 403. Test: `tests/unit/http.test.ts` (taak 9).

---

### Task 1: Projectopzet (Haiku 5.5)

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`, `src/pages/index.astro`, `tests/e2e/routes.ts`, `tests/e2e/rook.spec.ts`

**Interfaces:**
- Produces: npm-scripts `dev`, `build`, `preview`, `test` (Vitest), `test:e2e` (Playwright). Bestand `tests/e2e/routes.ts` met `export const routes: string[]` dat latere taken aanvullen.

- [ ] **Step 1: Astro handmatig installeren in de bestaande repo (root)**

`npm create astro` weigert een map die niet leeg is (hier staan `docs/` en `README.md`), dus handmatig:
```bash
npm init -y
npm pkg set type=module private=true --json
npm install --save-exact astro@7.3.8 @fontsource-variable/geist@5.3.0 @fontsource-variable/geist-mono@5.3.0
npm install --save-exact -D vitest @playwright/test @axe-core/playwright@4.13.0
npx playwright install chromium
```
Scripts in `package.json`: `"dev": "astro dev"`, `"build": "astro build"`, `"preview": "astro preview"`.

- [ ] **Step 2: Config schrijven**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://bureauvandockum.vercel.app',
  trailingSlash: 'always',
});
```

`tsconfig.json`: laat de Astro-basis staan en voeg toe:
```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist", "supabase/functions"] }
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['tests/unit/**/*.test.ts'] } });
```

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:4321' },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    // Vaste functie-URL, zodat de formuliertests hem kunnen onderscheppen, ook als .env iets anders zegt.
    env: { PUBLIC_FUNCTIONS_URL: 'http://127.0.0.1:54321/functions/v1' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

`package.json` scripts: `"test": "vitest run"`, `"test:e2e": "playwright test"`.

`.gitignore`: voeg toe `node_modules/`, `dist/`, `.astro/`, `.env`, `test-results/`, `playwright-report/`, `.playwright-mcp/`, `supabase/.temp/`.

`.env.example`:
```
# Basis-URL van de Supabase Edge Functions, zonder slash aan het eind
PUBLIC_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1
SITE_URL=https://bureauvandockum.vercel.app
```

- [ ] **Step 3: Rooktest schrijven**

`tests/e2e/routes.ts`:
```ts
// Elke pagina die de site heeft. Latere taken voegen hun routes toe; de toegankelijkheidstest loopt ze allemaal af.
export const routes: string[] = ['/'];
```

`tests/e2e/rook.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('de homepage laadt in het Nederlands', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await expect(page.locator('h1')).toBeVisible();
});
```

`src/pages/index.astro` (tijdelijk, taak 2 vervangt de layout en taak 5 de inhoud):
```astro
<!doctype html>
<html lang="nl"><head><meta charset="utf-8" /><title>Bureau van Dockum</title></head>
<body><main><h1>Bureau van Dockum</h1></main></body></html>
```

- [ ] **Step 4: Draaien**

Run: `npm run build && npm run test:e2e`
Expected: 1 passed. (`npm test` meldt nog “no test files”; dat is goed tot taak 3.)

- [ ] **Step 5: Commit**

```bash
git checkout -b bouw/eigen-website
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .gitignore .env.example src tests
git commit -m "chore: Astro-project met Vitest en Playwright opzetten"
```

---

### Task 2: Fundament — stijl, layout, header en footer (Sonnet 5.5)

**Files:**
- Create: `src/styles/basis.css`, `src/layouts/Basis.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/lib/bedrijf.ts`, `public/favicon.svg`, `tests/e2e/toegankelijkheid.spec.ts`, `tests/e2e/navigatie.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: layout `Basis` met props `{ titel: string; beschrijving: string }` (titel `'Home'` geeft de lange sitetitel). CSS-klassen uit de stijltest: `.wrap`, `.knop`, `.knop-primair`, `.knop-secundair`, `.knop-icoon`, `.eyebrow`, `.lead`, `.sectie`, `.sectie-kop`, `.tekstlink`, `.kaart`. `src/lib/bedrijf.ts` exporteert `bedrijf` (zie hieronder).

- [ ] **Step 1: Tests schrijven**

`tests/e2e/toegankelijkheid.spec.ts`:
```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { routes } from './routes';

for (const route of routes) {
  test(`axe vindt niets op ${route}`, async ({ page }) => {
    await page.goto(route);
    const resultaat = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(resultaat.violations).toEqual([]);
  });

  test(`geen horizontaal scrollen op 320px: ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route);
    const overloop = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overloop).toBeLessThanOrEqual(0);
  });
}
```

`tests/e2e/navigatie.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('de eerste Tab toont de skiplink en die springt naar de inhoud', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skiplink = page.getByRole('link', { name: 'Naar de inhoud' });
  await expect(skiplink).toBeFocused();
  await expect(skiplink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('het hoofdmenu heeft precies vier items in de goede volgorde', async ({ page }) => {
  await page.goto('/');
  const items = page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link');
  await expect(items).toHaveText(['Toegankelijke website', 'UX Testing', 'Thema’s', 'Info']);
});

test('mobiel menu opent, sluit met Escape en geeft de focus terug', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const knop = page.getByRole('button', { name: 'Menu' });
  await expect(knop).toHaveAttribute('aria-expanded', 'false');
  await knop.click();
  await expect(knop).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Hoofdmenu' }).getByRole('link', { name: 'Info' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(knop).toHaveAttribute('aria-expanded', 'false');
  await expect(knop).toBeFocused();
});
```

- [ ] **Step 2: Draaien, verwacht FAIL**

Run: `npm run test:e2e`
Expected: FAIL (geen skiplink, geen menu).

- [ ] **Step 3: CSS overzetten**

Maak `src/styles/basis.css` door uit `docs/stijltest/css/basis.css` en `docs/stijltest/css/stijl-raster.css` samen te voegen:
- Neem de tokens van `[data-basis="raster"]` over als `:root`-variabelen en schrijf elke selector `[data-basis="raster"] X` als gewoon `X`.
- Font-variabelen: `--font-body: "Geist Variable", system-ui, sans-serif; --font-display: var(--font-body); --font-mono: "Geist Mono Variable", ui-monospace, monospace;`.
- Laat weg: alles van `.stijlkiezer`, de reveal-animatie (`.reveal`, `.reveal-aan`, `.zichtbaar`) en de thema-preview-klassen (`.pv-*`, `.thema-preview`).
- Laat staan: tokens, reset, `.wrap`, skiplink, focus, typografie, knoppen (6px), header en mobiel menu (`.js`-gating), hero, sectoren, secties, diensten, statement, stappen, kennismaken (`.cta`), footer, het zeskoloms raster (`body::before`), logo-onderstreping (`.merk-b`, `.footer-merk span`) en `prefers-reduced-motion`.
- Voeg toe: `.kaart` (rand 1px `var(--line)`, radius 6px, padding 1.5rem, achtergrond `var(--bg)`), en `.formulier`-stijlen volgen in taak 11.
- Houd het bestand onder de 500 regels.

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#111"/><text x="16" y="21" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">vD</text></svg>
```

- [ ] **Step 4: Bedrijfsgegevens, layout, header en footer**

`src/lib/bedrijf.ts`:
```ts
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
```

`src/layouts/Basis.astro`:
```astro
---
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../styles/basis.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props { titel: string; beschrijving: string }
const { titel, beschrijving } = Astro.props;
const volledig = titel === 'Home'
  ? 'Bureau van Dockum — toegankelijke websites en webshops'
  : `${titel} — Bureau van Dockum`;
---
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{volledig}</title>
    <meta name="description" content={beschrijving} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script is:inline>document.documentElement.classList.add('js');</script>
  </head>
  <body>
    <a class="skiplink" href="#inhoud">Naar de inhoud</a>
    <Header />
    <main id="inhoud" tabindex="-1"><slot /></main>
    <Footer />
  </body>
</html>
```

`src/components/Header.astro`:
```astro
---
const pad = Astro.url.pathname;
const menu = [
  { href: '/toegankelijke-website/', label: 'Toegankelijke website' },
  { href: '/ux-testing/', label: 'UX Testing' },
  { href: '/themas/', label: 'Thema’s' },
  { href: '/info/', label: 'Info' },
];
const huidig = (href: string) => (pad === href ? 'page' : pad.startsWith(href) ? 'true' : undefined);
---
<header class="site-header">
  <div class="wrap header-inner">
    <a class="merk" href="/">
      <span class="merk-teken" aria-hidden="true"></span>
      <span class="merk-tekst">Bureau <span class="merk-b">van Dockum</span></span>
    </a>
    <button class="menu-knop" type="button" aria-expanded="false" aria-controls="nav-paneel">
      <span class="menu-knop-lijnen" aria-hidden="true"><span></span><span></span></span>
      <span>Menu</span>
    </button>
    <div class="nav-paneel" id="nav-paneel">
      <nav class="hoofdmenu" aria-label="Hoofdmenu">
        <ul>
          {menu.map((item) => (
            <li><a href={item.href} aria-current={huidig(item.href)}>{item.label}</a></li>
          ))}
        </ul>
      </nav>
      <a class="knop knop-primair header-cta" href="/terugbellen/">Plan een terugbelafspraak</a>
    </div>
  </div>
</header>

<script>
  const header = document.querySelector<HTMLElement>('.site-header');
  const knop = header?.querySelector<HTMLButtonElement>('.menu-knop');
  if (header && knop) {
    const zet = (open: boolean) => {
      header.classList.toggle('is-open', open);
      knop.setAttribute('aria-expanded', String(open));
    };
    knop.addEventListener('click', () => zet(knop.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        zet(false);
        knop.focus();
      }
    });
  }
</script>
```
CSS: geef `[aria-current]` in het hoofdmenu een zichtbare onderstreping (2px), zodat de huidige pagina niet alleen met kleur wordt aangegeven.

`src/components/Footer.astro`: merk (`<p class="footer-merk">Bureau <span>van Dockum</span></p>`), een `<nav aria-label="Footermenu">` met de vier menu-items plus Toegankelijkheidsverklaring (`/toegankelijkheidsverklaring/`), Privacy (`/privacy/`) en Voorwaarden (`/voorwaarden/`), en `© {new Date().getFullYear()} Bureau van Dockum · {bedrijf.email}` met een `mailto:`-link.

`src/pages/index.astro`: gebruik `Basis` met `titel="Home"` en een `<h1>` “Websites en webshops die voor iedereen werken.” (inhoud volgt in taak 5).

- [ ] **Step 5: Draaien, verwacht PASS**

Run: `npm run test:e2e`
Expected: alle tests PASS. Faalt axe op een link naar een nog niet bestaande pagina? Dat is geen axe-regel; alleen echte overtredingen tellen.

- [ ] **Step 6: Commit**

```bash
git add src public tests
git commit -m "feat: Raster-stijl, layout, header met mobiel menu en footer"
```

---

### Task 3: Artikelen — collectie, Info-pagina en artikeltemplate (Sonnet 5.5)

**Files:**
- Create: `src/content.config.ts`, `src/lib/artikelgroepen.ts`, `src/lib/leestijd.ts`, `tests/unit/leestijd.test.ts`, `src/pages/info/index.astro`, `src/pages/info/[id].astro`, `src/content/artikelen/wat-is-digitale-toegankelijkheid.md`
- Modify: `tests/e2e/routes.ts`

**Interfaces:**
- Produces: collectie `artikelen` (id = bestandsnaam zonder `.md`); `groepen` en `type Groep` uit `src/lib/artikelgroepen.ts`; `leestijd(tekst: string): number` (minuten, minimaal 1).

- [ ] **Step 1: Failing test voor leestijd**

`tests/unit/leestijd.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { leestijd } from '../../src/lib/leestijd';

describe('leestijd', () => {
  it('rekent 200 woorden per minuut, naar boven afgerond', () => {
    expect(leestijd(Array(401).fill('woord').join(' '))).toBe(3);
  });
  it('geeft minimaal één minuut', () => {
    expect(leestijd('kort')).toBe(1);
    expect(leestijd('')).toBe(1);
  });
  it('telt Markdown-tekens niet als woorden', () => {
    expect(leestijd('## Kop\n\n- **een** _twee_\n\n---')).toBe(1);
  });
});
```
Run: `npm test` → FAIL (module bestaat niet).

- [ ] **Step 2: Implementeren**

`src/lib/leestijd.ts`:
```ts
// Leestijd in hele minuten, op 200 woorden per minuut (rustig lezen, B1-niveau).
export function leestijd(tekst: string): number {
  const woorden = tekst.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.ceil(woorden / 200));
}
```
Run: `npm test` → PASS.

- [ ] **Step 3: Groepen en collectie**

`src/lib/artikelgroepen.ts`:
```ts
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
```

`src/content.config.ts`:
```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { groepIds } from './lib/artikelgroepen';

const artikelen = defineCollection({
  loader: glob({ base: './src/content/artikelen', pattern: '*.md' }),
  schema: z.object({
    titel: z.string(),
    samenvatting: z.string().max(220),
    groep: z.enum(groepIds),
    volgorde: z.number().int(),
    gepubliceerd: z.coerce.date(),
    gecontroleerd: z.coerce.date(),
    wcag: z.array(z.object({ nummer: z.string(), naam: z.string(), url: z.string().url() })).default([]),
    verwijzing: z.object({ tekst: z.string(), href: z.string() }),
  }),
});

export const collections = { artikelen };
```

- [ ] **Step 4: Eerste artikel schrijven**

`src/content/artikelen/wat-is-digitale-toegankelijkheid.md`, frontmatter:
```yaml
---
titel: Wat is digitale toegankelijkheid, en voor wie doet u het?
samenvatting: Een toegankelijke website werkt voor iedereen, ook voor mensen die slecht zien, slecht horen of geen muis gebruiken. Wat dat betekent, en waarom het u ook iets oplevert.
groep: basis
volgorde: 1
gepubliceerd: 2026-10-10
gecontroleerd: 2026-10-10
wcag:
  - { nummer: "WCAG 2.2", naam: "Overzicht van de richtlijnen", url: "https://www.w3.org/TR/WCAG22/" }
verwijzing: { tekst: "Laat uw site snel scannen voor € 24", href: "/toegankelijke-website/advies/" }
---
```
Inhoud (600–900 woorden, B1, ‘wij’ en ‘u’): wat het is; voor wie (blind en slechtziend, doof en slechthorend, motorische beperking, cognitieve beperking, ouderen, tijdelijke situaties zoals een gebroken arm of fel zonlicht); wat WCAG is, in één alinea; wat het oplevert (meer bezoekers, beter vindbaar, minder vragen aan de balie); eindig met de kop `## Zelf controleren` en een lijstje van drie dingen. Kopniveaus: alleen `##` en `###` (de `h1` komt uit het template). Geen percentages of aantallen zonder bron; noem ze liever niet.

- [ ] **Step 5: Info-pagina**

`src/pages/info/index.astro`. Opbouw:
1. `<h1>` “Info”, en een sectie `aria-labelledby` met kop “Wie zit er achter Bureau van Dockum?”. Tijdelijke tekst (besluit 13 in het bouwplan; Stefan levert de echte tekst en een foto aan): “Achter Bureau van Dockum zit Stefan van Dockum. Wij maken websites en webshops die voor iedereen werken, en we testen ze met echte bezoekers. Wilt u weten wat wij voor u kunnen doen? Plan een terugbelafspraak.” Zet erboven `<!-- TIJDELIJK: echte tekst en foto volgen (bouwplan, besluit 13) -->`.
2. Sectie “Kennisbank” met een korte inleiding: “Vaste uitleg over toegankelijkheid, per onderwerp. Kies een onderwerp of lees verder.”
3. Een raster van tegels, één per groep uit `groepen`: naam (kop `h3`), uitleg, en het aantal artikelen (“3 artikelen”, “1 artikel”). Heeft een groep artikelen, dan is de tegel een link naar `#groep-<id>`; zo niet, dan geen link en de tekst “Volgt nog”.
4. Per groep met artikelen een sectie `id="groep-<id>"` met kop `h2` en kaarten (`.kaart`, als `<ul>`-lijst). Elke kaart: kop `h3` met daarin de link naar `/info/<id>/` (één link per kaart, niet de hele kaart als link), samenvatting, en in mono “Leestijd: N min”. Sorteer op `volgorde`.

Haal artikelen op met `getCollection('artikelen')` en reken de leestijd met `leestijd(entry.body ?? '')`.

- [ ] **Step 6: Artikeltemplate**

`src/pages/info/[id].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import Basis from '../../layouts/Basis.astro';
import { groepen } from '../../lib/artikelgroepen';
import { leestijd } from '../../lib/leestijd';

export async function getStaticPaths() {
  const artikelen = await getCollection('artikelen');
  return artikelen.map((artikel) => ({ params: { id: artikel.id }, props: { artikel } }));
}

const { artikel } = Astro.props;
const { Content } = await render(artikel);
const groep = groepen.find((g) => g.id === artikel.data.groep)!;
const datum = (d: Date) => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
---
<Basis titel={artikel.data.titel} beschrijving={artikel.data.samenvatting}>
  <article class="wrap artikel">
    <p class="eyebrow"><a href={`/info/#groep-${groep.id}`}>{groep.naam}</a></p>
    <h1>{artikel.data.titel}</h1>
    <p class="lead">{artikel.data.samenvatting}</p>
    <p class="artikel-meta">
      Leestijd: {leestijd(artikel.body ?? '')} min ·
      Gepubliceerd <time datetime={artikel.data.gepubliceerd.toISOString().slice(0, 10)}>{datum(artikel.data.gepubliceerd)}</time> ·
      Laatst gecontroleerd <time datetime={artikel.data.gecontroleerd.toISOString().slice(0, 10)}>{datum(artikel.data.gecontroleerd)}</time>
    </p>
    <div class="artikel-tekst"><Content /></div>
    {artikel.data.wcag.length > 0 && (
      <aside class="artikel-wcag" aria-labelledby="wcag-titel">
        <h2 id="wcag-titel">Uit de richtlijnen</h2>
        <ul>{artikel.data.wcag.map((c) => <li><a href={c.url}>{c.nummer}: {c.naam}</a></li>)}</ul>
      </aside>
    )}
    <p><a class="knop knop-primair" href={artikel.data.verwijzing.href}>{artikel.data.verwijzing.tekst}</a></p>
  </article>
</Basis>
```
CSS voor `.artikel` in `basis.css`: tekstkolom max. 40em, `h2`/`h3` met ruimte erboven, lijsten met normale opsommingstekens, links onderstreept.

- [ ] **Step 7: Routes en tests**

Voeg in `tests/e2e/routes.ts` toe: `'/info/'`, `'/info/wat-is-digitale-toegankelijkheid/'`.
Run: `npm test && npm run test:e2e` → PASS.

- [ ] **Step 8: Commit**

```bash
git add src tests
git commit -m "feat: Info met kennisbank en eerste artikel"
```

---

### Task 4: De overige zeven artikelen (Sonnet 5.5)

**Files:**
- Create: zeven bestanden in `src/content/artikelen/`
- Modify: `tests/e2e/routes.ts`

**Interfaces:**
- Consumes: schema uit taak 3. Dezelfde frontmatter-velden, dezelfde schrijfregels.

- [ ] **Step 1: Schrijven**

| Bestand | titel | groep | volgorde | wcag (nummer, naam, url) | verwijzing |
|---|---|---|---|---|---|
| `european-accessibility-act-webshop.md` | De European Accessibility Act: geldt die voor uw webshop? | basis | 2 | — | “Laat uw webshop snel scannen voor € 24” → `/toegankelijke-website/advies/` |
| `alt-teksten-schrijven.md` | Alt-teksten schrijven voor afbeeldingen | tekst-en-inhoud | 4 | 1.1.1, Niet-tekstuele content, `https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html` | “Meer over toegankelijke websites” → `/toegankelijke-website/` |
| `kleurcontrast-controleren.md` | Kleurcontrast: zo controleert u het | vormgeving | 1 | 1.4.3, Contrast (minimum), `.../contrast-minimum.html`; 1.4.11, Contrast van niet-tekstuele content, `.../non-text-contrast.html` | “Laat uw site snel scannen voor € 24” → `/toegankelijke-website/advies/` |
| `alles-met-het-toetsenbord.md` | Alles met het toetsenbord | bediening | 1 | 2.1.1, Toetsenbord, `.../keyboard.html`; 2.4.7, Focus zichtbaar, `.../focus-visible.html`; 2.4.11, Focus niet bedekt (minimum), `.../focus-not-obscured-minimum.html` | “Laat uw site testen door echte bezoekers” → `/ux-testing/` |
| `formulieren-die-iedereen-kan-invullen.md` | Formulieren die iedereen kan invullen | bediening | 3 | 3.3.1, Foutidentificatie, `.../error-identification.html`; 3.3.2, Labels of instructies, `.../labels-or-instructions.html`; 1.3.5, Identificeer het doel van de input, `.../identify-input-purpose.html` | “Laat uw site testen door echte bezoekers” → `/ux-testing/` |
| `zelf-testen-in-tien-minuten.md` | Zelf testen in tien minuten | testen-en-onderhoud | 1 | — | “Liever een grondige scan? € 24” → `/toegankelijke-website/advies/` |
| `overlays-en-plugins-afgeraden.md` | Overlays en toegankelijkheidsplugins: waarom we ze afraden | testen-en-onderhoud | 3 | — | “Meer over toegankelijke websites” → `/toegankelijke-website/` |

`...` staat voor `https://www.w3.org/WAI/WCAG22/Understanding`. Datums: `2026-10-10`. Elk artikel 600–900 woorden, B1, kopjes `##`/`###`, eindigt met `## Zelf controleren` (drie tot vijf punten).

Feiten voor het EAA-artikel; noem niets wat hier niet staat:
- De European Accessibility Act (EU-richtlijn 2019/882) geldt sinds 28 juni 2025.
- Ze geldt onder meer voor diensten in de elektronische handel: webshops die aan consumenten verkopen.
- Micro-ondernemingen die diensten leveren zijn uitgezonderd: minder dan 10 medewerkers, en een jaaromzet of balanstotaal van niet meer dan € 2 miljoen.
- De bijbehorende Europese norm is EN 301 549. Die verwijst voor websites naar de WCAG-eisen op niveau AA.
- Nederland heeft de richtlijn in eigen wetgeving omgezet. Noem geen toezichthouder en geen boetebedragen. Sluit af met: laat u bij twijfel juridisch adviseren.

Overlays-artikel: leg uit dat een overlay (een knop of plugin die de site ‘toegankelijk maakt’) de onderliggende code niet repareert, dat schermlezergebruikers er vaak last van hebben, en dat echte verbetering in de site zelf zit. Noem geen merknamen.

- [ ] **Step 2: Routes toevoegen en testen**

Voeg de zeven routes `/info/<bestandsnaam>/` toe aan `tests/e2e/routes.ts`.
Run: `npm run build && npm run test:e2e` → PASS. Controleer op `/info/` dat de groepen Basis, Tekst en inhoud, Vormgeving, Bediening en Testen en onderhoud tegels met links hebben.

- [ ] **Step 3: Commit**

```bash
git add src/content tests/e2e/routes.ts
git commit -m "content: zeven artikelen voor de kennisbank"
```

---

### Task 5: Homepage (Sonnet 5.5)

**Files:**
- Modify: `src/pages/index.astro`, `src/styles/basis.css` (alleen wat ontbreekt)

**Interfaces:**
- Consumes: `Basis`, de CSS-klassen uit taak 2, `getCollection('artikelen')`, `leestijd`.

- [ ] **Step 1: Bouwen naar de stijltest**

Neem de markup van `docs/stijltest/index.html` over, met deze wijzigingen:
- Geen stijlkiezer, geen `reveal`-klassen, geen thema-voorbeelden.
- Hero: eyebrow “Digitale toegankelijkheid, van praktijk tot webshop”, h1 “Websites en webshops die voor <em>iedereen</em> werken.”, lead uit de stijltest, knoppen “Plan een terugbelafspraak” (→ `/terugbellen/`) en “Laat uw site scannen voor € 24” (→ `/toegankelijke-website/advies/`). Kenmerken: “Getoetst aan WCAG 2.2 niveau AA”, “Getest met echte bezoekers”, “WordPress, WooCommerce, Shopify, Drupal en HTML”.
- Sectoren: “Wij werken voor”: Eerstelijnszorg, Webshops, Praktijken, Verenigingen en clubs.
- Diensten: drie kaarten zoals in de stijltest (Toegankelijke website, UX Testing, Thema’s), met links naar `/toegankelijke-website/`, `/ux-testing/` en `/themas/`.
- Nieuw blok “Advies voor uw huidige site”: twee zinnen uit het bouwplan (sectie Advies) en de knop “Bestel de snelle scan, € 24” → `/bestellen/snelle-scan/`.
- Statement: zoals de stijltest.
- Werkwijze: de vier stappen uit de stijltest.
- Thema’s: kop “Thema’s om mee te starten”, de maatwerk-zin uit Global Constraints, en “De eerste thema’s verschijnen hier zodra ze getest zijn.” met link naar `/themas/`. Geen thema-kaarten.
- Kennisbank: de drie artikelen met de laagste `volgorde` uit de groep `basis` en `bediening` (sorteer op groepvolgorde, dan `volgorde`), als kaarten zoals op Info, plus link “Alle uitleg over toegankelijkheid” → `/info/`.
- Kennismaken (`.cta`): kop “Zullen we kennismaken?”, tekst “Laat uw gegevens achter. Binnen één werkdag mailen we u een moment om te bellen.”, knop “Plan een terugbelafspraak” → `/terugbellen/`. Geen telefoonnummer.

- [ ] **Step 2: Testen**

Run: `npm run test:e2e` → PASS (de route `/` staat al in de lijst).

- [ ] **Step 3: Commit**

```bash
git add src
git commit -m "feat: homepage in de Raster-stijl"
```

---

### Task 6: Dienstpagina’s (Sonnet 5.5)

**Files:**
- Create: `src/pages/toegankelijke-website/index.astro`, `src/pages/toegankelijke-website/advies.astro`, `src/pages/ux-testing.astro`, `src/pages/themas.astro`
- Modify: `tests/e2e/routes.ts`

**Interfaces:**
- Consumes: `Basis`, CSS-klassen, `getCollection('artikelen')` voor de blokken “Lees ook”.

Elke pagina: één `h1`, een lead, secties met `h2`, onderaan het kennismaken-blok (zoals op home) en een blok “Lees ook” met twee à drie passende artikelen uit de collectie (filter op id). Teksten B1, ‘wij’/‘u’, gebaseerd op `docs/project/bouwplan.html`.

- [ ] **Step 1: Toegankelijke website** (`/toegankelijke-website/`)

Secties: “Een nieuwe site of webshop” (platforms: WordPress, WooCommerce, Shopify, Drupal, HTML); “Uw huidige site verbeteren” met link naar Advies; “De European Accessibility Act” (twee zinnen, link naar het EAA-artikel); “Wat u van ons krijgt” (de lijst ‘Wat elk thema meekrijgt’ uit het bouwplan, herschreven voor maatwerk). Lees ook: `wat-is-digitale-toegankelijkheid`, `european-accessibility-act-webshop`, `overlays-en-plugins-afgeraden`.

- [ ] **Step 2: Advies voor uw huidige site** (`/toegankelijke-website/advies/`)

h1 “Advies voor uw huidige site”. De drie vormen uit het bouwplan als drie kaarten: Snelle scan (€ 24, inclusief btw, rapport binnen vijf werkdagen, knop “Bestel de snelle scan” → `/bestellen/snelle-scan/`), Volledige audit (op offerte, knop “Plan een terugbelafspraak”), Begeleiding en hertest (op offerte). Daaronder “Wat we bij de snelle scan bekijken” (home, contact, een formulier, bij een webshop de weg naar afrekenen; automatisch en met de hand). Lees ook: `zelf-testen-in-tien-minuten`, `kleurcontrast-controleren`.

- [ ] **Step 3: UX Testing** (`/ux-testing/`)

Secties: “Hoe een test verloopt” (genummerde stappen: kennismaking, testplan, sessies met echte bezoekers onder wie mensen met een beperking, rapport), “Wat u krijgt” (rapport met verbeteringen op volgorde van belang), “Voor wie” (sectoren). Lees ook: `alles-met-het-toetsenbord`, `formulieren-die-iedereen-kan-invullen`.

- [ ] **Step 4: Thema’s** (`/themas/`)

h1 “Thema’s”. Bovenaan de maatwerk-zin (letterlijk). Sectie “Binnenkort”: “Wij bouwen thema’s voor WordPress, HTML, Shopify, WooCommerce en Drupal. Elk thema komt hier pas te staan als het getest is met echte bezoekers.” Daaronder een lijst van de vijf platforms met per platform één zin uit ‘Waarom welk platform’ in het bouwplan. Geen namen van thema’s die nog niet bestaan. Knop “Liever maatwerk? Plan een terugbelafspraak”.

- [ ] **Step 5: Routes en tests**

Voeg toe aan `routes.ts`: `'/toegankelijke-website/'`, `'/toegankelijke-website/advies/'`, `'/ux-testing/'`, `'/themas/'`.
Run: `npm run test:e2e` → PASS, inclusief de navigatietest (`aria-current` klopt op deze pagina’s).

- [ ] **Step 6: Commit**

```bash
git add src tests/e2e/routes.ts
git commit -m "feat: pagina's Toegankelijke website, Advies, UX Testing en Thema's"
```

---

### Task 7: Verklaringen, voorwaarden, 404 en livegang-controle (Sonnet 5.5)

**Files:**
- Create: `src/pages/toegankelijkheidsverklaring.astro`, `src/pages/privacy.astro`, `src/pages/voorwaarden.astro`, `src/pages/404.astro`, `scripts/controle-livegang.mjs`
- Modify: `package.json` (script), `tests/e2e/routes.ts`

- [ ] **Step 1: Pagina’s**

Gebruik `bedrijf` uit `src/lib/bedrijf.ts` voor naam, e-mail, KvK, btw en adres. Zet bovenaan privacy en voorwaarden `<!-- CONCEPT: laten nalezen vóór livegang -->`.
- Toegankelijkheidsverklaring: doel (WCAG 2.2 AA), hoe getoetst (axe automatisch, handmatig met toetsenbord en schermlezer), datum laatste toets 10 oktober 2026, bekende problemen: “de betaalpagina is van Mollie; die kunnen wij niet aanpassen”, en contact via e-mail.
- Privacy: welke gegevens (terugbelformulier: naam, e-mail, telefoon, onderwerp, voorkeur, vraag; bestelling: naam, e-mail, bedrijf, webadres, betaalstatus), waarvoor, verwerkers (Supabase voor bestellingen, Brevo voor e-mail, Mollie voor betalingen, Vercel voor hosting), bewaartermijnen (terugbelaanvragen: zolang nodig voor het contact, maximaal één jaar; bestellingen: zeven jaar, fiscale bewaarplicht), geen cookies en geen tracking, rechten van de bezoeker, contact.
- Voorwaarden: wie we zijn (bedrijfsgegevens), prijzen inclusief btw, de snelle scan (wat erin zit, levering binnen vijf werkdagen na betaling), herroepingsrecht (voor consumenten: veertien dagen; bij een dienst die met uitdrukkelijke toestemming binnen die termijn volledig is uitgevoerd vervalt het recht; leg dat uit in gewone taal), betalen via Mollie, aansprakelijkheid beperkt tot het factuurbedrag, Nederlands recht.
- 404: h1 “Deze pagina bestaat niet”, korte uitleg en links naar home, Info en terugbellen.

- [ ] **Step 2: Livegang-controle**

`scripts/controle-livegang.mjs`:
```js
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
```
`package.json`: `"controle:livegang": "node scripts/controle-livegang.mjs"`.

- [ ] **Step 3: Testen**

Voeg toe aan `routes.ts`: `'/toegankelijkheidsverklaring/'`, `'/privacy/'`, `'/voorwaarden/'`.
Run: `npm run test:e2e` → PASS.
Run: `npm run controle:livegang` → verwacht exit 1 met de invulplekken uit `bedrijf.ts` en de TIJDELIJK/CONCEPT-markeringen. Dat is goed: het script werkt.

- [ ] **Step 4: Commit**

```bash
git add src scripts package.json tests/e2e/routes.ts
git commit -m "feat: verklaringen, voorwaarden, 404 en livegang-controle"
```

---

### Task 8: Supabase — project, tabellen en functie-instellingen (Sonnet 5.5, review: Sonnet high)

**Files:**
- Create: `supabase/config.toml` (via `supabase init`), `supabase/migrations/<tijdstempel>_bestellingen.sql`

**Interfaces:**
- Produces: tabel `public.producten (slug text pk, naam, soort 'scan'|'thema', prijs_centen int, actief bool)` met rij `snelle-scan` à 2400; tabel `public.bestellingen (id uuid, product_slug, naam, email, bedrijf, website, bedrag_centen, status, mollie_id unique, aangemaakt_op, betaald_op, gemaild_op)`. Alleen `service_role` heeft rechten.

- [ ] **Step 1: Initialiseren**

```bash
supabase --version
supabase init
supabase migration new bestellingen
```

- [ ] **Step 2: Migratie schrijven**

In het nieuw gemaakte bestand onder `supabase/migrations/`:
```sql
-- Producten en bestellingen. Alleen de Edge Functions (service_role) komen erbij;
-- anon en authenticated hebben geen rechten en RLS staat aan zonder policies.
-- Grants staan er expliciet: nieuwe tabellen worden niet meer automatisch aan de Data API gegeven.

create table public.producten (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,60}$'),
  naam text not null,
  soort text not null check (soort in ('scan', 'thema')),
  prijs_centen integer not null check (prijs_centen > 0),
  actief boolean not null default true
);

create table public.bestellingen (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.producten (slug),
  naam text not null,
  email text not null,
  bedrijf text,
  website text,
  bedrag_centen integer not null check (bedrag_centen > 0),
  status text not null default 'open'
    check (status in ('open', 'betaald', 'mislukt', 'verlopen', 'geannuleerd')),
  mollie_id text unique,
  aangemaakt_op timestamptz not null default now(),
  betaald_op timestamptz,
  gemaild_op timestamptz
);

alter table public.producten enable row level security;
alter table public.bestellingen enable row level security;

revoke all on table public.producten, public.bestellingen from anon, authenticated;
grant select on table public.producten to service_role;
grant select, insert, update on table public.bestellingen to service_role;

insert into public.producten (slug, naam, soort, prijs_centen)
values ('snelle-scan', 'Snelle scan', 'scan', 2400);
```

- [ ] **Step 3: Functie-instellingen**

Voeg onderaan `supabase/config.toml` toe (alle vier worden zonder Supabase-JWT aangeroepen: door een gewoon formulier of door Mollie):
```toml
[functions.terugbellen]
verify_jwt = false

[functions.bestelling-starten]
verify_jwt = false

[functions.bestelling-terug]
verify_jwt = false

[functions.mollie-webhook]
verify_jwt = false
```

- [ ] **Step 4: Lokaal controleren (Docker moet draaien)**

```bash
supabase start
supabase db reset
supabase status
```
Neem uit `supabase status` de API-URL en de anon/publishable key, en controleer dat anon niets mag:
```bash
curl -s "http://127.0.0.1:54321/rest/v1/bestellingen?select=id" -H "apikey: <anon-of-publishable-key>"
```
Expected: een foutmelding (permission denied of 401), geen rijen.
Controleer met service-role dat het product er is:
```bash
curl -s "http://127.0.0.1:54321/rest/v1/producten?select=slug,prijs_centen" -H "apikey: <service-role-of-secret-key>" -H "Authorization: Bearer <service-role-of-secret-key>"
```
Expected: `[{"slug":"snelle-scan","prijs_centen":2400}]`.
Draai, als de CLI het kent, `supabase db advisors` en los meldingen over deze twee tabellen op.

- [ ] **Step 5: Commit**

```bash
git add supabase/config.toml supabase/migrations
git commit -m "feat: Supabase-tabellen voor producten en bestellingen"
```

---

### Task 9: Gedeelde logica van de Edge Functions, met tests (Sonnet 5.5, review: Sonnet high)

**Files:**
- Create in `supabase/functions/_shared/`: `html.ts`, `http.ts`, `validatie.ts`, `mollie.ts`, `brevo.ts`, `mails.ts`, `terugbellen.ts`, `bestellen.ts`, `betaling.ts`
- Test: `tests/unit/` `http.test.ts`, `validatie.test.ts`, `mollie.test.ts`, `mails.test.ts`, `terugbellen.test.ts`, `bestellen.test.ts`, `betaling.test.ts`

**Interfaces:**
- Produces (gebruikt door taak 10): `verwerkTerugbelverzoek(form, deps): Promise<string>`, `startBestelling(form, deps): Promise<string>`, `verwerkBetaling(mollieId, deps): Promise<Bestelstatus>`, `paginaVoorStatus(status)`, `origineToegestaan`, `leesToegestaneOrigins`, `doorsturen`, `stuurViaBrevo`, `maakMollieBetaling`, `haalMollieBetaling`, `isMollieId`, `isUuid`, plus de types `Mail`, `Product`, `Bestelgegevens`, `Bestelstatus`, `BestellingVoorMail`, `BetaalDeps`, `BestelDeps`, `TerugbelDeps`.
- Regel: deze bestanden gebruiken geen `Deno`-globals en geen `npm:`/`jsr:`-imports, zodat Vitest ze kan laden. Onderlinge imports met `.ts`-extensie (Deno eist dat).

Werk test-eerst per bestand: test schrijven → `npm test` (FAIL) → implementatie → `npm test` (PASS).

- [ ] **Step 1: html.ts en http.ts**

`supabase/functions/_shared/html.ts`:
```ts
const TEKENS: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(tekst: string): string {
  return tekst.replace(/[&<>"']/g, (t) => TEKENS[t]);
}
```

`supabase/functions/_shared/http.ts`:
```ts
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
```

`tests/unit/http.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { doorsturen, isUuid, leesToegestaneOrigins, origineToegestaan } from '../../supabase/functions/_shared/http.ts';

const verzoek = (origin?: string) =>
  new Request('https://x.supabase.co/functions/v1/terugbellen', { method: 'POST', headers: origin ? { origin } : {} });

describe('origins', () => {
  const lijst = leesToegestaneOrigins('https://bureauvandockum.nl/', 'http://127.0.0.1:4321, https://preview.vercel.app');
  it('neemt de site en de extra origins op', () => {
    expect(lijst).toEqual(['https://bureauvandockum.nl', 'http://127.0.0.1:4321', 'https://preview.vercel.app']);
  });
  it('laat een post van de eigen site door', () => expect(origineToegestaan(verzoek('https://bureauvandockum.nl'), lijst)).toBe(true));
  it('weigert een post van een andere site', () => expect(origineToegestaan(verzoek('https://kwaad.example'), lijst)).toBe(false));
  it('weigert een post zonder Origin', () => expect(origineToegestaan(verzoek(), lijst)).toBe(false));
});

describe('doorsturen en isUuid', () => {
  it('stuurt door met 303', () => {
    const r = doorsturen('https://bureauvandockum.nl/terugbellen/verzonden/');
    expect(r.status).toBe(303);
    expect(r.headers.get('location')).toBe('https://bureauvandockum.nl/terugbellen/verzonden/');
  });
  it('herkent een uuid', () => {
    expect(isUuid('3f1c2a7e-9b4d-4c3a-8f2e-1d2c3b4a5f6e')).toBe(true);
    expect(isUuid('1 or 1=1')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});
```

- [ ] **Step 2: validatie.ts**

`supabase/functions/_shared/validatie.ts`:
```ts
export type Veldfouten = Record<string, string>;
export type Resultaat<T> = { ok: true; waarde: T } | { ok: false; fouten: Veldfouten };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG = /^[a-z0-9-]{1,60}$/;
export const ONDERWERPEN = ['toegankelijke-website', 'advies', 'ux-testing', 'thema', 'anders'] as const;
export const DAGEN = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'maakt-niet-uit'] as const;
export const DAGDELEN = ['ochtend', 'middag', 'maakt-niet-uit'] as const;

export type Terugbelverzoek = {
  naam: string; email: string; telefoon: string;
  onderwerp: (typeof ONDERWERPEN)[number]; dag: (typeof DAGEN)[number]; dagdeel: (typeof DAGDELEN)[number];
  vraag: string;
};
export type Bestelgegevens = { product: string; naam: string; email: string; bedrijf: string; website: string | null };

function tekst(form: FormData, veld: string, max: number): string {
  const waarde = form.get(veld);
  return typeof waarde === 'string' ? waarde.trim().slice(0, max) : '';
}

function eenVan<T extends readonly string[]>(lijst: T, waarde: string): waarde is T[number] {
  return (lijst as readonly string[]).includes(waarde);
}

// Lokveld: onzichtbaar voor mensen, bots vullen het in.
export function isSpam(form: FormData): boolean {
  return tekst(form, 'adres2', 200) !== '';
}

export function normaliseerWebsite(invoer: string): string | null {
  if (!invoer) return null;
  try {
    const url = new URL(invoer.includes('://') ? invoer : `https://${invoer}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function valideerTerugbelverzoek(form: FormData): Resultaat<Terugbelverzoek> {
  const fouten: Veldfouten = {};
  const naam = tekst(form, 'naam', 120);
  const email = tekst(form, 'email', 200);
  const telefoon = tekst(form, 'telefoon', 40);
  const onderwerp = tekst(form, 'onderwerp', 40);
  const dag = tekst(form, 'dag', 20);
  const dagdeel = tekst(form, 'dagdeel', 20);
  const vraag = tekst(form, 'vraag', 2000);

  if (!naam) fouten.naam = 'Vul uw naam in.';
  if (!EMAIL.test(email)) fouten.email = 'Vul een geldig e-mailadres in, zoals naam@voorbeeld.nl.';
  if (telefoon.replace(/\D/g, '').length < 10) fouten.telefoon = 'Vul een telefoonnummer in van minstens tien cijfers.';
  if (!eenVan(ONDERWERPEN, onderwerp)) fouten.onderwerp = 'Kies waar het over gaat.';
  if (!eenVan(DAGEN, dag)) fouten.dag = 'Kies een dag.';
  if (!eenVan(DAGDELEN, dagdeel)) fouten.dagdeel = 'Kies ochtend, middag of maakt niet uit.';

  if (Object.keys(fouten).length > 0) return { ok: false, fouten };
  return {
    ok: true,
    waarde: { naam, email, telefoon, onderwerp: onderwerp as Terugbelverzoek['onderwerp'], dag: dag as Terugbelverzoek['dag'], dagdeel: dagdeel as Terugbelverzoek['dagdeel'], vraag },
  };
}

export function valideerBestelling(form: FormData): Resultaat<Bestelgegevens> {
  const fouten: Veldfouten = {};
  const product = tekst(form, 'product', 60);
  const naam = tekst(form, 'naam', 120);
  const email = tekst(form, 'email', 200);
  const bedrijf = tekst(form, 'bedrijf', 120);
  const websiteInvoer = tekst(form, 'website', 300);
  const website = normaliseerWebsite(websiteInvoer);

  if (!SLUG.test(product)) fouten.product = 'Onbekend product.';
  if (!naam) fouten.naam = 'Vul uw naam in.';
  if (!EMAIL.test(email)) fouten.email = 'Vul een geldig e-mailadres in, zoals naam@voorbeeld.nl.';
  if (product === 'snelle-scan' && !website) fouten.website = 'Vul het webadres in dat we scannen, zoals www.uwpraktijk.nl.';
  if (websiteInvoer && !website) fouten.website = 'Dit webadres klopt niet. Vul het in zoals www.uwpraktijk.nl.';
  if (tekst(form, 'akkoord', 10) !== 'ja') fouten.akkoord = 'Ga akkoord met de voorwaarden om te bestellen.';

  if (Object.keys(fouten).length > 0) return { ok: false, fouten };
  return { ok: true, waarde: { product, naam, email, bedrijf, website } };
}
```

`tests/unit/validatie.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { isSpam, normaliseerWebsite, valideerBestelling, valideerTerugbelverzoek } from '../../supabase/functions/_shared/validatie.ts';

function formulier(velden: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(velden)) f.set(k, v);
  return f;
}

const terugbel = { naam: 'Anna de Vries', email: 'anna@praktijk.nl', telefoon: '06 12345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: '' };
const bestelling = { product: 'snelle-scan', naam: 'Anna de Vries', email: 'anna@praktijk.nl', bedrijf: '', website: 'www.praktijk.nl', akkoord: 'ja' };

describe('valideerTerugbelverzoek', () => {
  it('accepteert een volledig ingevuld formulier', () => {
    expect(valideerTerugbelverzoek(formulier(terugbel)).ok).toBe(true);
  });
  it('geeft per verplicht veld een fout bij een leeg formulier', () => {
    const r = valideerTerugbelverzoek(formulier({}));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fouten).sort()).toEqual(['dag', 'dagdeel', 'email', 'naam', 'onderwerp', 'telefoon']);
  });
  it('accepteert een internationaal nummer', () => {
    expect(valideerTerugbelverzoek(formulier({ ...terugbel, telefoon: '+31 6 1234 5678' })).ok).toBe(true);
  });
  it('weigert een onbekend onderwerp', () => {
    const r = valideerTerugbelverzoek(formulier({ ...terugbel, onderwerp: 'iets' }));
    expect(r.ok).toBe(false);
  });
  it('kapt een te lange vraag af op 2000 tekens', () => {
    const r = valideerTerugbelverzoek(formulier({ ...terugbel, vraag: 'a'.repeat(5000) }));
    expect(r.ok && r.waarde.vraag.length).toBe(2000);
  });
});

describe('valideerBestelling', () => {
  it('vult https:// aan bij een webadres zonder schema', () => {
    const r = valideerBestelling(formulier(bestelling));
    expect(r.ok && r.waarde.website).toBe('https://www.praktijk.nl/');
  });
  it('eist een webadres bij de snelle scan', () => {
    const r = valideerBestelling(formulier({ ...bestelling, website: '' }));
    expect(!r.ok && r.fouten.website).toBeTruthy();
  });
  it('weigert javascript: als webadres', () => {
    expect(normaliseerWebsite('javascript:alert(1)')).toBeNull();
  });
  it('eist akkoord met de voorwaarden', () => {
    const r = valideerBestelling(formulier({ ...bestelling, akkoord: '' }));
    expect(!r.ok && r.fouten.akkoord).toBeTruthy();
  });
  it('weigert een productnaam met vreemde tekens', () => {
    const r = valideerBestelling(formulier({ ...bestelling, product: '../x' }));
    expect(!r.ok && r.fouten.product).toBeTruthy();
  });
});

describe('isSpam', () => {
  it('herkent een ingevuld lokveld', () => {
    expect(isSpam(formulier({ adres2: 'http://spam' }))).toBe(true);
    expect(isSpam(formulier({}))).toBe(false);
  });
});
```

- [ ] **Step 3: mollie.ts**

`supabase/functions/_shared/mollie.ts`:
```ts
export const MOLLIE_API = 'https://api.mollie.com/v2';
export type Bestelstatus = 'open' | 'betaald' | 'mislukt' | 'verlopen' | 'geannuleerd';

export type BetaalVerzoek = {
  amount: { currency: 'EUR'; value: string };
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: { bestelling: string };
  locale: 'nl_NL';
};

export function centenNaarBedrag(centen: number): string {
  if (!Number.isInteger(centen) || centen <= 0) throw new Error(`Ongeldig bedrag: ${centen}`);
  return (centen / 100).toFixed(2);
}

// Mollie-status naar onze status. 'pending' en 'authorized' zijn nog niet af.
export function naarBestelstatus(mollieStatus: string): Bestelstatus {
  switch (mollieStatus) {
    case 'paid': return 'betaald';
    case 'failed': return 'mislukt';
    case 'expired': return 'verlopen';
    case 'canceled': return 'geannuleerd';
    default: return 'open';
  }
}

// De terugkeer-URL bouwen we zelf; nooit uit invoer van de bezoeker (geen open redirect).
export function maakBetaalVerzoek(a: { bestellingId: string; productNaam: string; centen: number; functionsUrl: string }): BetaalVerzoek {
  return {
    amount: { currency: 'EUR', value: centenNaarBedrag(a.centen) },
    description: `${a.productNaam} — Bureau van Dockum`,
    redirectUrl: `${a.functionsUrl}/bestelling-terug?bestelling=${encodeURIComponent(a.bestellingId)}`,
    webhookUrl: `${a.functionsUrl}/mollie-webhook`,
    metadata: { bestelling: a.bestellingId },
    locale: 'nl_NL',
  };
}

export function isMollieId(waarde: string | null): waarde is string {
  return waarde !== null && /^tr_[A-Za-z0-9]+$/.test(waarde);
}

export async function maakMollieBetaling(verzoek: BetaalVerzoek, apiKey: string, doeFetch: typeof fetch = fetch): Promise<{ id: string; checkoutUrl: string }> {
  const res = await doeFetch(`${MOLLIE_API}/payments`, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(verzoek),
  });
  if (!res.ok) throw new Error(`Mollie ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const checkoutUrl = data?._links?.checkout?.href;
  if (typeof data?.id !== 'string' || typeof checkoutUrl !== 'string') throw new Error('Onverwacht antwoord van Mollie');
  return { id: data.id, checkoutUrl };
}

// De webhook vertelt alleen een id; de echte status halen we altijd zelf op.
export async function haalMollieBetaling(id: string, apiKey: string, doeFetch: typeof fetch = fetch): Promise<{ status: string }> {
  const res = await doeFetch(`${MOLLIE_API}/payments/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Mollie ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (typeof data?.status !== 'string') throw new Error('Onverwacht antwoord van Mollie');
  return { status: data.status };
}
```

`tests/unit/mollie.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { centenNaarBedrag, haalMollieBetaling, isMollieId, maakBetaalVerzoek, maakMollieBetaling, naarBestelstatus } from '../../supabase/functions/_shared/mollie.ts';

const nepFetch = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

describe('bedragen', () => {
  it('zet centen om naar een Mollie-bedrag', () => {
    expect(centenNaarBedrag(2400)).toBe('24.00');
    expect(centenNaarBedrag(1999)).toBe('19.99');
  });
  it('weigert nul en negatieve bedragen', () => {
    expect(() => centenNaarBedrag(0)).toThrow();
    expect(() => centenNaarBedrag(-5)).toThrow();
  });
});

describe('statussen', () => {
  it.each([
    ['paid', 'betaald'], ['failed', 'mislukt'], ['expired', 'verlopen'], ['canceled', 'geannuleerd'],
    ['open', 'open'], ['pending', 'open'], ['authorized', 'open'],
  ])('%s wordt %s', (mollie, ons) => expect(naarBestelstatus(mollie)).toBe(ons));
});

describe('betaalverzoek', () => {
  const v = maakBetaalVerzoek({ bestellingId: 'abc-123', productNaam: 'Snelle scan', centen: 2400, functionsUrl: 'https://x.supabase.co/functions/v1' });
  it('stuurt terug via onze eigen functie', () => {
    expect(v.redirectUrl).toBe('https://x.supabase.co/functions/v1/bestelling-terug?bestelling=abc-123');
    expect(v.webhookUrl).toBe('https://x.supabase.co/functions/v1/mollie-webhook');
    expect(v.amount).toEqual({ currency: 'EUR', value: '24.00' });
  });
});

describe('Mollie-API', () => {
  it('geeft id en checkout-URL terug', async () => {
    const r = await maakMollieBetaling(maakBetaalVerzoek({ bestellingId: 'a', productNaam: 'p', centen: 100, functionsUrl: 'https://f' }), 'test_x',
      nepFetch(201, { id: 'tr_abc', _links: { checkout: { href: 'https://www.mollie.com/checkout/x' } } }));
    expect(r).toEqual({ id: 'tr_abc', checkoutUrl: 'https://www.mollie.com/checkout/x' });
  });
  it('gooit een fout bij een foutstatus', async () => {
    await expect(haalMollieBetaling('tr_abc', 'test_x', nepFetch(500, {}))).rejects.toThrow('Mollie 500');
  });
  it('herkent een Mollie-id', () => {
    expect(isMollieId('tr_WDqYK6vllg')).toBe(true);
    expect(isMollieId('tr_../x')).toBe(false);
    expect(isMollieId(null)).toBe(false);
  });
});
```

- [ ] **Step 4: brevo.ts en mails.ts**

`supabase/functions/_shared/brevo.ts`:
```ts
export type Mail = { aan: { email: string; naam?: string }; onderwerp: string; html: string; tekst: string; antwoordAan?: string };

export function brevoBody(mail: Mail, afzender: string) {
  return {
    sender: { name: 'Bureau van Dockum', email: afzender },
    to: [{ email: mail.aan.email, ...(mail.aan.naam ? { name: mail.aan.naam } : {}) }],
    subject: mail.onderwerp,
    htmlContent: mail.html,
    textContent: mail.tekst,
    ...(mail.antwoordAan ? { replyTo: { email: mail.antwoordAan } } : {}),
  };
}

export async function stuurViaBrevo(mail: Mail, cfg: { apiKey: string; afzender: string }, doeFetch: typeof fetch = fetch): Promise<void> {
  const res = await doeFetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': cfg.apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(brevoBody(mail, cfg.afzender)),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}
```

`supabase/functions/_shared/mails.ts`:
```ts
import { escapeHtml } from './html.ts';
import type { Mail } from './brevo.ts';
import type { Terugbelverzoek } from './validatie.ts';

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
```

`tests/unit/mails.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { bestelMailVoorKlant, terugbelMailVoorBezoeker, terugbelMailVoorOns } from '../../supabase/functions/_shared/mails.ts';
import { brevoBody } from '../../supabase/functions/_shared/brevo.ts';
import type { Terugbelverzoek } from '../../supabase/functions/_shared/validatie.ts';

const v: Terugbelverzoek = { naam: 'Anna', email: 'anna@praktijk.nl', telefoon: '0612345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: 'Kunt u helpen?' };
const scan = { id: 'b1', naam: 'Anna', email: 'anna@praktijk.nl', website: 'https://www.praktijk.nl/', product: { naam: 'Snelle scan', soort: 'scan' as const } };

describe('mails', () => {
  it('escapet HTML uit de invoer', () => {
    const m = terugbelMailVoorOns({ ...v, naam: '<script>x</script>', vraag: '<img src=x onerror=alert(1)>' }, 'ons@bureau.nl');
    expect(m.html).toContain('&lt;script&gt;');
    expect(m.html).not.toContain('<script>');
    expect(m.html).not.toContain('<img');
  });
  it('zet de bezoeker als antwoordadres in de mail aan ons', () => {
    expect(terugbelMailVoorOns(v, 'ons@bureau.nl').antwoordAan).toBe('anna@praktijk.nl');
  });
  it('noemt dag en dagdeel in de bevestiging', () => {
    expect(terugbelMailVoorBezoeker(v).tekst).toContain('op dinsdag, in de ochtend');
  });
  it('bevestigt de snelle scan met webadres en levertijd', () => {
    const m = bestelMailVoorKlant(scan);
    expect(m.tekst).toContain('https://www.praktijk.nl/');
    expect(m.tekst).toContain('vijf werkdagen');
  });
  it('weigert een themamail zolang levering niet gebouwd is', () => {
    expect(() => bestelMailVoorKlant({ ...scan, product: { naam: 'X', soort: 'thema' } })).toThrow();
  });
  it('bouwt een geldig Brevo-verzoek', () => {
    const body = brevoBody(terugbelMailVoorOns(v, 'ons@bureau.nl'), 'noreply@bureau.nl');
    expect(body.sender.email).toBe('noreply@bureau.nl');
    expect(body.replyTo).toEqual({ email: 'anna@praktijk.nl' });
    expect(body.to).toEqual([{ email: 'ons@bureau.nl' }]);
  });
});
```

- [ ] **Step 5: terugbellen.ts, bestellen.ts, betaling.ts**

`supabase/functions/_shared/terugbellen.ts`:
```ts
import type { Mail } from './brevo.ts';
import { terugbelMailVoorBezoeker, terugbelMailVoorOns } from './mails.ts';
import { isSpam, valideerTerugbelverzoek } from './validatie.ts';

export type TerugbelDeps = { stuurMail(mail: Mail): Promise<void>; mailAan: string; siteUrl: string };

// Geeft de URL terug waar de bezoeker heen moet.
export async function verwerkTerugbelverzoek(form: FormData, deps: TerugbelDeps): Promise<string> {
  const gelukt = `${deps.siteUrl}/terugbellen/verzonden/`;
  const mislukt = `${deps.siteUrl}/terugbellen/niet-verzonden/`;
  if (isSpam(form)) return gelukt;

  const r = valideerTerugbelverzoek(form);
  if (!r.ok) return mislukt;

  try {
    await deps.stuurMail(terugbelMailVoorOns(r.waarde, deps.mailAan));
  } catch (fout) {
    console.error('Terugbelverzoek niet bij ons aangekomen', fout);
    return mislukt;
  }
  try {
    await deps.stuurMail(terugbelMailVoorBezoeker(r.waarde));
  } catch (fout) {
    // Wij hebben de aanvraag; alleen de bevestiging ontbreekt. Niet opnieuw laten versturen.
    console.error('Bevestiging aan bezoeker mislukt', fout);
  }
  return gelukt;
}
```

`supabase/functions/_shared/bestellen.ts`:
```ts
import { maakBetaalVerzoek, type BetaalVerzoek } from './mollie.ts';
import { isSpam, valideerBestelling, type Bestelgegevens } from './validatie.ts';

export type Product = { slug: string; naam: string; soort: 'scan' | 'thema'; prijs_centen: number };

export type BestelDeps = {
  zoekProduct(slug: string): Promise<Product | null>;
  maakBestelling(gegevens: Bestelgegevens, product: Product): Promise<string>;
  maakBetaling(verzoek: BetaalVerzoek): Promise<{ id: string; checkoutUrl: string }>;
  koppelBetaling(bestellingId: string, mollieId: string): Promise<void>;
  markeerMislukt(bestellingId: string): Promise<void>;
  siteUrl: string;
  functionsUrl: string;
};

// Geeft de URL terug: de betaalpagina van Mollie, of onze foutpagina.
export async function startBestelling(form: FormData, deps: BestelDeps): Promise<string> {
  const mislukt = `${deps.siteUrl}/bestellen/mislukt/`;
  if (isSpam(form)) return mislukt;

  const r = valideerBestelling(form);
  if (!r.ok) return mislukt;

  const product = await deps.zoekProduct(r.waarde.product);
  if (!product) return mislukt;

  const id = await deps.maakBestelling(r.waarde, product);
  try {
    const betaling = await deps.maakBetaling(
      maakBetaalVerzoek({ bestellingId: id, productNaam: product.naam, centen: product.prijs_centen, functionsUrl: deps.functionsUrl }),
    );
    await deps.koppelBetaling(id, betaling.id);
    return betaling.checkoutUrl;
  } catch (fout) {
    console.error('Betaling starten mislukt', fout);
    await deps.markeerMislukt(id);
    return mislukt;
  }
}
```

`supabase/functions/_shared/betaling.ts`:
```ts
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
```

`tests/unit/terugbellen.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { verwerkTerugbelverzoek } from '../../supabase/functions/_shared/terugbellen.ts';
import type { Mail } from '../../supabase/functions/_shared/brevo.ts';

const velden = { naam: 'Anna', email: 'anna@praktijk.nl', telefoon: '0612345678', onderwerp: 'advies', dag: 'dinsdag', dagdeel: 'ochtend', vraag: '' };
const formulier = (extra: Record<string, string> = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries({ ...velden, ...extra })) f.set(k, v);
  return f;
};

function deps(faalOp?: 'ons' | 'bezoeker') {
  const verstuurd: Mail[] = [];
  return {
    verstuurd,
    deps: {
      mailAan: 'ons@bureau.nl',
      siteUrl: 'https://site.nl',
      stuurMail: async (m: Mail) => {
        const isOns = m.aan.email === 'ons@bureau.nl';
        if ((faalOp === 'ons' && isOns) || (faalOp === 'bezoeker' && !isOns)) throw new Error('Brevo plat');
        verstuurd.push(m);
      },
    },
  };
}

describe('verwerkTerugbelverzoek', () => {
  it('stuurt eerst ons een mail, dan de bezoeker', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier(), d.deps)).toBe('https://site.nl/terugbellen/verzonden/');
    expect(d.verstuurd.map((m) => m.aan.email)).toEqual(['ons@bureau.nl', 'anna@praktijk.nl']);
  });
  it('stuurt niets bij ongeldige invoer', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier({ email: 'geen' }), d.deps)).toBe('https://site.nl/terugbellen/niet-verzonden/');
    expect(d.verstuurd).toHaveLength(0);
  });
  it('doet bij spam alsof het gelukt is, zonder te mailen', async () => {
    const d = deps();
    expect(await verwerkTerugbelverzoek(formulier({ adres2: 'x' }), d.deps)).toBe('https://site.nl/terugbellen/verzonden/');
    expect(d.verstuurd).toHaveLength(0);
  });
  it('meldt mislukt als de mail aan ons niet lukt', async () => {
    expect(await verwerkTerugbelverzoek(formulier(), deps('ons').deps)).toBe('https://site.nl/terugbellen/niet-verzonden/');
  });
  it('meldt gelukt als alleen de bevestiging niet lukt', async () => {
    expect(await verwerkTerugbelverzoek(formulier(), deps('bezoeker').deps)).toBe('https://site.nl/terugbellen/verzonden/');
  });
});
```

`tests/unit/bestellen.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { startBestelling, type BestelDeps } from '../../supabase/functions/_shared/bestellen.ts';

const formulier = (extra: Record<string, string> = {}) => {
  const f = new FormData();
  const velden = { product: 'snelle-scan', naam: 'Anna', email: 'anna@praktijk.nl', website: 'www.praktijk.nl', akkoord: 'ja', ...extra };
  for (const [k, v] of Object.entries(velden)) f.set(k, v);
  return f;
};

function maak(opties: { product?: boolean; mollieFaalt?: boolean } = {}) {
  const log: string[] = [];
  const deps: BestelDeps = {
    siteUrl: 'https://site.nl',
    functionsUrl: 'https://f.supabase.co/functions/v1',
    zoekProduct: async (slug) => (opties.product === false ? null : { slug, naam: 'Snelle scan', soort: 'scan', prijs_centen: 2400 }),
    maakBestelling: async () => { log.push('bestelling'); return 'b1'; },
    maakBetaling: async (v) => {
      if (opties.mollieFaalt) throw new Error('Mollie plat');
      log.push(`betaling ${v.amount.value} ${v.redirectUrl}`);
      return { id: 'tr_1', checkoutUrl: 'https://www.mollie.com/checkout/1' };
    },
    koppelBetaling: async (id, mollieId) => { log.push(`koppel ${id} ${mollieId}`); },
    markeerMislukt: async (id) => { log.push(`mislukt ${id}`); },
  };
  return { deps, log };
}

describe('startBestelling', () => {
  it('maakt een bestelling, start de betaling en stuurt naar Mollie', async () => {
    const { deps, log } = maak();
    expect(await startBestelling(formulier(), deps)).toBe('https://www.mollie.com/checkout/1');
    expect(log).toEqual(['bestelling', 'betaling 24.00 https://f.supabase.co/functions/v1/bestelling-terug?bestelling=b1', 'koppel b1 tr_1']);
  });
  it('stuurt naar de foutpagina bij een onbekend product', async () => {
    const { deps, log } = maak({ product: false });
    expect(await startBestelling(formulier(), deps)).toBe('https://site.nl/bestellen/mislukt/');
    expect(log).toEqual([]);
  });
  it('markeert de bestelling als mislukt als Mollie niet reageert', async () => {
    const { deps, log } = maak({ mollieFaalt: true });
    expect(await startBestelling(formulier(), deps)).toBe('https://site.nl/bestellen/mislukt/');
    expect(log).toEqual(['bestelling', 'mislukt b1']);
  });
  it('maakt niets aan bij ongeldige invoer of spam', async () => {
    const { deps, log } = maak();
    await startBestelling(formulier({ akkoord: '' }), deps);
    await startBestelling(formulier({ adres2: 'x' }), deps);
    expect(log).toEqual([]);
  });
});
```

`tests/unit/betaling.test.ts`:
```ts
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
```

- [ ] **Step 6: Alles draaien**

Run: `npm test`
Expected: alle unit-tests PASS (zeven bestanden plus `leestijd`).
Run: `deno check supabase/functions/_shared/*.ts`
Expected: geen fouten.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_shared tests/unit
git commit -m "feat: gedeelde logica voor terugbellen, bestellen en betalen, met tests"
```

---

### Task 10: Edge Functions koppelen (Sonnet 5.5, review: Sonnet high)

**Files:**
- Create: `supabase/functions/_shared/omgeving.ts`, `supabase/functions/_shared/opslag.ts`, `supabase/functions/terugbellen/index.ts`, `supabase/functions/bestelling-starten/index.ts`, `supabase/functions/bestelling-terug/index.ts`, `supabase/functions/mollie-webhook/index.ts`, `supabase/functions/.env.example`

**Interfaces:**
- Consumes: alles uit taak 9; tabellen uit taak 8.
- Secrets (via `supabase secrets set`): `MOLLIE_API_KEY`, `BREVO_API_KEY`, `MAIL_VAN` (in Brevo geverifieerde afzender), `MAIL_AAN` (onze inbox), `SITE_URL`, optioneel `TOEGESTANE_ORIGINS` (komma-lijst, bijv. voor Vercel-previews) en `FUNCTIONS_URL` (alleen lokaal). `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` zet Supabase zelf.

- [ ] **Step 1: Versie van supabase-js vastzetten**

Run: `npm view @supabase/supabase-js version` en gebruik die exacte versie hieronder in plaats van `<versie>`.

- [ ] **Step 2: omgeving.ts en opslag.ts (alleen Deno)**

`supabase/functions/_shared/omgeving.ts`:
```ts
import { leesToegestaneOrigins } from './http.ts';

function verplicht(naam: string): string {
  const waarde = Deno.env.get(naam);
  if (!waarde) throw new Error(`Omgevingsvariabele ${naam} ontbreekt`);
  return waarde;
}

export function site() {
  const siteUrl = verplicht('SITE_URL').replace(/\/$/, '');
  const functionsUrl = (Deno.env.get('FUNCTIONS_URL') ?? `${verplicht('SUPABASE_URL')}/functions/v1`).replace(/\/$/, '');
  return { siteUrl, functionsUrl, origins: leesToegestaneOrigins(siteUrl, Deno.env.get('TOEGESTANE_ORIGINS')) };
}

export function mail() {
  return { apiKey: verplicht('BREVO_API_KEY'), afzender: verplicht('MAIL_VAN'), aan: verplicht('MAIL_AAN') };
}

export function mollieKey(): string {
  return verplicht('MOLLIE_API_KEY');
}
```

`supabase/functions/_shared/opslag.ts`:
```ts
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@<versie>';
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
```

- [ ] **Step 3: De vier functies**

`supabase/functions/terugbellen/index.ts`:
```ts
import { stuurViaBrevo } from '../_shared/brevo.ts';
import { doorsturen, origineToegestaan } from '../_shared/http.ts';
import { mail, site } from '../_shared/omgeving.ts';
import { verwerkTerugbelverzoek } from '../_shared/terugbellen.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const { siteUrl, origins } = site();
  if (!origineToegestaan(req, origins)) return new Response('Verboden', { status: 403 });

  const cfg = mail();
  const naar = await verwerkTerugbelverzoek(await req.formData(), {
    mailAan: cfg.aan,
    siteUrl,
    stuurMail: (m) => stuurViaBrevo(m, cfg),
  });
  return doorsturen(naar);
});
```

`supabase/functions/bestelling-starten/index.ts`:
```ts
import { startBestelling } from '../_shared/bestellen.ts';
import { doorsturen, origineToegestaan } from '../_shared/http.ts';
import { maakMollieBetaling } from '../_shared/mollie.ts';
import { mollieKey, site } from '../_shared/omgeving.ts';
import { bestelOpslag, maakDb } from '../_shared/opslag.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const { siteUrl, functionsUrl, origins } = site();
  if (!origineToegestaan(req, origins)) return new Response('Verboden', { status: 403 });

  try {
    const key = mollieKey();
    const naar = await startBestelling(await req.formData(), {
      ...bestelOpslag(maakDb()),
      maakBetaling: (verzoek) => maakMollieBetaling(verzoek, key),
      siteUrl,
      functionsUrl,
    });
    return doorsturen(naar);
  } catch (fout) {
    console.error('Bestelling starten mislukt', fout);
    return doorsturen(`${siteUrl}/bestellen/mislukt/`);
  }
});
```

`supabase/functions/mollie-webhook/index.ts`:
```ts
import { verwerkBetaling } from '../_shared/betaling.ts';
import { stuurViaBrevo } from '../_shared/brevo.ts';
import { bestelMailVoorKlant, bestelMailVoorOns } from '../_shared/mails.ts';
import { haalMollieBetaling, isMollieId } from '../_shared/mollie.ts';
import { mail, mollieKey } from '../_shared/omgeving.ts';
import { betaalOpslag, maakDb } from '../_shared/opslag.ts';

// Mollie stuurt alleen `id=tr_...` (form-encoded), zonder Supabase-JWT.
Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Methode niet toegestaan', { status: 405 });
  const id = (await req.formData()).get('id');
  // Onbekende of rare id's: 200, zodat Mollie niet blijft herhalen en we niets prijsgeven.
  if (typeof id !== 'string' || !isMollieId(id)) return new Response('ok');

  try {
    const key = mollieKey();
    const cfg = mail();
    await verwerkBetaling(id, {
      ...betaalOpslag(maakDb()),
      haalBetaling: (mollieId) => haalMollieBetaling(mollieId, key),
      stuurMails: async (b) => {
        await stuurViaBrevo(bestelMailVoorOns(b, cfg.aan), cfg);
        await stuurViaBrevo(bestelMailVoorKlant(b), cfg);
      },
    });
    return new Response('ok');
  } catch (fout) {
    // 500: Mollie probeert het later opnieuw.
    console.error('Webhook mislukt', fout);
    return new Response('Fout', { status: 500 });
  }
});
```

`supabase/functions/bestelling-terug/index.ts`:
```ts
import { paginaVoorStatus, verwerkBetaling } from '../_shared/betaling.ts';
import { stuurViaBrevo } from '../_shared/brevo.ts';
import { doorsturen, isUuid } from '../_shared/http.ts';
import { bestelMailVoorKlant, bestelMailVoorOns } from '../_shared/mails.ts';
import { haalMollieBetaling } from '../_shared/mollie.ts';
import { mail, mollieKey, site } from '../_shared/omgeving.ts';
import { betaalOpslag, maakDb, zoekMollieId } from '../_shared/opslag.ts';

// Mollie stuurt de klant hierheen terug. Wij kijken de status na en sturen door naar een vaste pagina.
Deno.serve(async (req) => {
  const { siteUrl } = site();
  const naar = (pagina: string) => doorsturen(`${siteUrl}/bestellen/${pagina}/`);
  const bestellingId = new URL(req.url).searchParams.get('bestelling');
  if (!isUuid(bestellingId)) return naar('mislukt');

  try {
    const db = maakDb();
    const mollieId = await zoekMollieId(db, bestellingId);
    if (!mollieId) return naar('mislukt');
    const key = mollieKey();
    const cfg = mail();
    const status = await verwerkBetaling(mollieId, {
      ...betaalOpslag(db),
      haalBetaling: (id) => haalMollieBetaling(id, key),
      stuurMails: async (b) => {
        await stuurViaBrevo(bestelMailVoorOns(b, cfg.aan), cfg);
        await stuurViaBrevo(bestelMailVoorKlant(b), cfg);
      },
    });
    return naar(paginaVoorStatus(status));
  } catch (fout) {
    // Status onbekend: de webhook maakt het af. De klant ziet 'bezig' en krijgt mail zodra het binnen is.
    console.error('Terugkeer na betaling', fout);
    return naar('bezig');
  }
});
```

`supabase/functions/.env.example`:
```
MOLLIE_API_KEY=test_xxx
BREVO_API_KEY=xkeysib-xxx
MAIL_VAN=noreply@bureauvandockum.nl
MAIL_AAN=hallo@bureauvandockum.nl
SITE_URL=http://127.0.0.1:4321
TOEGESTANE_ORIGINS=http://localhost:4321
# Lokaal kan Mollie de webhook niet bereiken; gebruik voor een echte test de gedeployde functies.
FUNCTIONS_URL=http://127.0.0.1:54321/functions/v1
```

- [ ] **Step 4: Typecontrole en lokale rooktest**

Run: `deno check supabase/functions/*/index.ts`
Expected: geen fouten.

Lokaal (Docker draait, `supabase start` gedaan):
```bash
supabase functions serve --env-file supabase/functions/.env
curl -i -X POST http://127.0.0.1:54321/functions/v1/terugbellen -H "Origin: https://kwaad.example" -d "naam=x"
```
Expected: `HTTP/1.1 403`.
```bash
curl -i "http://127.0.0.1:54321/functions/v1/bestelling-terug?bestelling=geen-uuid"
```
Expected: `303` met `location: http://127.0.0.1:4321/bestellen/mislukt/`.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions
git commit -m "feat: Edge Functions voor terugbellen, bestellen, terugkeer en Mollie-webhook"
```

---

### Task 11: Formulierpagina’s en bevestigingspagina’s (Sonnet 5.5, review: Sonnet high)

**Files:**
- Create: `src/scripts/formulier.ts`, `src/pages/terugbellen/index.astro`, `src/pages/terugbellen/verzonden.astro`, `src/pages/terugbellen/niet-verzonden.astro`, `src/pages/bestellen/snelle-scan.astro`, `src/pages/bestellen/gelukt.astro`, `src/pages/bestellen/bezig.astro`, `src/pages/bestellen/mislukt.astro`, `tests/e2e/formulieren.spec.ts`
- Modify: `src/styles/basis.css` (formulierstijlen), `tests/e2e/routes.ts`

**Interfaces:**
- Consumes: `FUNCTIONS_URL` en `bedrijf` uit `src/lib/bedrijf.ts`. Veldnamen en waarden exact zoals in `validatie.ts` (taak 9): `naam`, `email`, `telefoon`, `onderwerp` (`toegankelijke-website|advies|ux-testing|thema|anders`), `dag` (`maandag…vrijdag|maakt-niet-uit`), `dagdeel` (`ochtend|middag|maakt-niet-uit`), `vraag`, lokveld `adres2`; bij bestellen `product`, `naam`, `email`, `bedrijf`, `website`, `akkoord=ja`.

- [ ] **Step 1: Failing e2e-tests**

`tests/e2e/formulieren.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

const FUNCTIONS = 'http://127.0.0.1:54321/functions/v1';

test('leeg terugbelformulier toont een foutoverzicht met links naar de velden', async ({ page }) => {
  await page.goto('/terugbellen/');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht).toBeVisible();
  await expect(overzicht).toBeFocused();
  await expect(overzicht.getByRole('link', { name: 'Vul uw naam in.' })).toBeVisible();
  await expect(page.getByLabel('Naam', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await overzicht.getByRole('link', { name: 'Vul uw naam in.' }).click();
  await expect(page.getByLabel('Naam', { exact: true })).toBeFocused();
});

test('ingevuld terugbelformulier gaat naar de functie en daarna naar de bevestiging', async ({ page }) => {
  await page.route(`${FUNCTIONS}/terugbellen`, (route) =>
    route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/terugbellen/verzonden/' } }));
  await page.goto('/terugbellen/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna de Vries');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Telefoonnummer').fill('06 12345678');
  await page.getByLabel('Waar gaat het over?').selectOption('advies');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/terugbellen\/verzonden\/$/);
  await expect(page.locator('h1')).toContainText('We bellen u terug');
});

test('bestelformulier eist akkoord en een webadres', async ({ page }) => {
  await page.goto('/bestellen/snelle-scan/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByRole('button', { name: 'Bestellen en betalen' }).click();
  const overzicht = page.locator('.foutoverzicht');
  await expect(overzicht.getByRole('link', { name: /webadres/ })).toBeVisible();
  await expect(overzicht.getByRole('link', { name: /voorwaarden/ })).toBeVisible();
});

test('ingevuld bestelformulier gaat naar de functie', async ({ page }) => {
  let ontvangen = '';
  await page.route(`${FUNCTIONS}/bestelling-starten`, async (route) => {
    ontvangen = route.request().postData() ?? '';
    await route.fulfill({ status: 303, headers: { location: 'http://127.0.0.1:4321/bestellen/bezig/' } });
  });
  await page.goto('/bestellen/snelle-scan/');
  await page.getByLabel('Naam', { exact: true }).fill('Anna');
  await page.getByLabel('E-mailadres').fill('anna@praktijk.nl');
  await page.getByLabel('Webadres van uw site').fill('www.praktijk.nl');
  await page.getByLabel(/akkoord met de voorwaarden/).check();
  await page.getByRole('button', { name: 'Bestellen en betalen' }).click();
  await expect(page).toHaveURL(/\/bestellen\/bezig\/$/);
  expect(ontvangen).toContain('product=snelle-scan');
  expect(ontvangen).toContain('akkoord=ja');
});
```
Run: `npm run test:e2e -- formulieren` → FAIL.

Volgt Chromium in deze Playwright-versie de 303 uit `route.fulfill` niet bij een navigatie, laat dan de URL-controle vallen en controleer alleen dat het verzoek de functie bereikte (de POST-data, zoals in de bestel-test). Meld dat in de taakrapportage.

- [ ] **Step 2: Validatiescript**

`src/scripts/formulier.ts`:
```ts
// Controleert het formulier vóór verzenden en toont een foutoverzicht.
// Zonder JavaScript doen de browser (required) en de server de controle.
type Veld = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isVeld(el: Element): el is Veld {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

function zetFout(veld: Veld, tekst: string | null): void {
  const melding = document.getElementById(`${veld.id}-fout`);
  if (melding) {
    melding.textContent = tekst ?? '';
    melding.hidden = !tekst;
  }
  if (tekst) veld.setAttribute('aria-invalid', 'true');
  else veld.removeAttribute('aria-invalid');
}

export function koppelFormulier(form: HTMLFormElement): void {
  const overzicht = form.querySelector<HTMLElement>('.foutoverzicht');
  const lijst = overzicht?.querySelector('ul');
  if (!overzicht || !lijst) return;
  form.noValidate = true;

  form.addEventListener('submit', (e) => {
    const fouten: { veld: Veld; tekst: string }[] = [];
    for (const el of Array.from(form.elements)) {
      if (!isVeld(el) || !el.id || el.closest('[aria-hidden="true"]')) continue;
      const tekst = el.validity.valid ? null : (el.dataset.fout ?? 'Dit veld is niet goed ingevuld.');
      zetFout(el, tekst);
      if (tekst) fouten.push({ veld: el, tekst });
    }
    if (fouten.length === 0) {
      overzicht.hidden = true;
      return;
    }
    e.preventDefault();
    lijst.replaceChildren(...fouten.map(({ veld, tekst }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${veld.id}`;
      a.textContent = tekst;
      a.addEventListener('click', (klik) => { klik.preventDefault(); veld.focus(); });
      li.append(a);
      return li;
    }));
    overzicht.hidden = false;
    overzicht.focus();
  });
}

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-controleer]')) koppelFormulier(form);
```

- [ ] **Step 3: Terugbelformulier**

`src/pages/terugbellen/index.astro`: `Basis` met titel “Plan een terugbelafspraak”. h1 “Plan een terugbelafspraak”. Lead: “Laat uw gegevens achter. Binnen één werkdag mailen we u een moment om te bellen.” Daarna:
```astro
<form class="formulier" method="post" action={`${FUNCTIONS_URL}/terugbellen`} data-controleer>
  <div class="foutoverzicht" tabindex="-1" hidden>
    <h2>Controleer deze velden</h2>
    <ul></ul>
  </div>
  <div class="veld">
    <label for="naam">Naam</label>
    <input id="naam" name="naam" autocomplete="name" required maxlength="120" aria-describedby="naam-fout" data-fout="Vul uw naam in." />
    <p class="veldfout" id="naam-fout" hidden></p>
  </div>
  <!-- e-mail: id="email", type="email", autocomplete="email", label "E-mailadres", data-fout zoals in validatie.ts -->
  <!-- telefoon: id="telefoon", type="tel", autocomplete="tel", label "Telefoonnummer", pattern="[0-9+ ()-]{10,}", data-fout "Vul een telefoonnummer in van minstens tien cijfers." -->
  <!-- onderwerp: <select id="onderwerp" required> met lege eerste optie "Kies een onderwerp" en de vijf waarden; label "Waar gaat het over?" -->
  <!-- dag: <select id="dag"> met "Maakt niet uit" als standaard; label "Welke dag past het best?" -->
  <!-- dagdeel: <fieldset> met <legend>Welk dagdeel?</legend> en drie radio's (ochtend, middag, maakt niet uit — die laatste checked) -->
  <!-- vraag: <textarea id="vraag" maxlength="2000">, label "Uw vraag (niet verplicht)" -->
  <div class="lokveld" aria-hidden="true">
    <label for="adres2">Laat dit veld leeg</label>
    <input id="adres2" name="adres2" tabindex="-1" autocomplete="off" />
  </div>
  <button class="knop knop-primair" type="submit">Verstuur aanvraag</button>
  <p>Liever zelf mailen? <a href={`mailto:${bedrijf.email}`}>{bedrijf.email}</a></p>
</form>
<script>import '../../scripts/formulier';</script>
```
Schrijf de als commentaar aangegeven velden volledig uit, in hetzelfde patroon (label, veld met `aria-describedby`, `<p class="veldfout">`). Elk verplicht veld krijgt `required` en een `data-fout` met dezelfde tekst als in `validatie.ts`.

CSS in `basis.css`: `.formulier` max. 36rem; labels vet en boven het veld; velden min. 2.75rem hoog, rand 1px `var(--ink)`, radius 6px; `[aria-invalid="true"]` rand 2px; `.veldfout` met een tekstteken (“Fout:” via een verborgen span of zichtbaar woord), zodat het niet alleen aan kleur hangt; `.foutoverzicht` met rand 2px `var(--ink)`, padding; `.lokveld { position: absolute; left: -9999px; }`.

- [ ] **Step 4: Bestelformulier**

`src/pages/bestellen/snelle-scan.astro`: h1 “Snelle scan bestellen”. Korte uitleg: wat we bekijken, levering binnen vijf werkdagen, prijs “€ 24, inclusief btw”, “U betaalt via Mollie: iDEAL, creditcard of Bancontact.” Formulier `action={`${FUNCTIONS_URL}/bestelling-starten`}` met `data-controleer`, foutoverzicht en velden in hetzelfde patroon: `<input type="hidden" name="product" value="snelle-scan">`, naam (`autocomplete="name"`), e-mailadres (`type="email"`), bedrijfsnaam (niet verplicht, `autocomplete="organization"`), “Webadres van uw site” (`id="website"`, `type="text"`, `inputmode="url"`, `autocomplete="url"`, required, data-fout “Vul het webadres in dat we scannen, zoals www.uwpraktijk.nl.”), checkbox `id="akkoord"` `name="akkoord"` `value="ja"` required met label “Ik ga akkoord met de <a href="/voorwaarden/">voorwaarden</a>” en data-fout “Ga akkoord met de voorwaarden om te bestellen.”, lokveld, knop “Bestellen en betalen”.

- [ ] **Step 5: Bevestigings- en foutpagina’s**

Elk met één `h1`, korte tekst en een link verder:
- `terugbellen/verzonden`: h1 “We bellen u terug”, “Dank u wel. U krijgt een bevestiging per e-mail. Binnen één werkdag mailen we u een moment om te bellen.” Link naar Info.
- `terugbellen/niet-verzonden`: h1 “Uw aanvraag is niet verstuurd”, “Er ging iets mis. Probeer het opnieuw, of mail ons op {bedrijf.email}.” Link terug naar het formulier.
- `bestellen/gelukt`: h1 “Bedankt voor uw bestelling”, “Uw betaling is gelukt. U krijgt een bevestiging per e-mail en het rapport binnen vijf werkdagen.”
- `bestellen/bezig`: h1 “Uw betaling wordt verwerkt”, “Dat duurt soms even. Zodra de betaling binnen is, krijgt u een bevestiging per e-mail. U hoeft niets te doen. Geen mail binnen een uur? Mail ons op {bedrijf.email}.”
- `bestellen/mislukt`: h1 “De bestelling is niet gelukt”, “Er is niets afgeschreven, of de betaling is afgebroken. Probeer het opnieuw, of mail ons op {bedrijf.email}.” Knop “Opnieuw bestellen” → `/bestellen/snelle-scan/`.

- [ ] **Step 6: Routes en alle tests**

Voeg toe aan `routes.ts`: `'/terugbellen/'`, `'/terugbellen/verzonden/'`, `'/terugbellen/niet-verzonden/'`, `'/bestellen/snelle-scan/'`, `'/bestellen/gelukt/'`, `'/bestellen/bezig/'`, `'/bestellen/mislukt/'`.
Run: `npm test && npm run test:e2e`
Expected: alles PASS.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "feat: terugbel- en bestelformulier met foutoverzicht en bevestigingspagina's"
```

---

### Task 12: Supabase wakker houden, beveiligingsheaders en deploy-instructies (Haiku 5.5)

**Files:**
- Create: `.github/workflows/supabase-wakker.yml`, `vercel.json`, `docs/deploy.md`

- [ ] **Step 1: Dagelijkse aanroep**

`.github/workflows/supabase-wakker.yml` (bouwplan, besluit 6: een gratis Supabase-project pauzeert na een week zonder activiteit):
```yaml
name: Supabase wakker houden
on:
  schedule:
    - cron: '17 6 * * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Aanroep naar de database
        run: |
          curl -sf "${{ secrets.SUPABASE_URL }}/rest/v1/producten?select=slug&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" > /dev/null
```

- [ ] **Step 2: Beveiligingsheaders**

`vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

- [ ] **Step 3: Deploy-instructies voor Stefan**

`docs/deploy.md` met deze stappen, in deze volgorde:
1. **Supabase**: project aanmaken (regio Europa), dan `supabase link --project-ref <ref>`, `supabase db push`, `supabase secrets set MOLLIE_API_KEY=test_… BREVO_API_KEY=… MAIL_VAN=… MAIL_AAN=… SITE_URL=https://<vercel-domein> TOEGESTANE_ORIGINS=…`, `supabase functions deploy` (leest `verify_jwt = false` uit `config.toml`). Controleer in het dashboard dat alle vier functies ‘Verify JWT’ uit hebben.
2. **Brevo**: afzenderdomein verifiëren (SPF/DKIM) en de API-sleutel maken.
3. **Mollie**: eerst met de testsleutel. Betaalmethoden (iDEAL, creditcard, Bancontact) aanzetten in het dashboard.
4. **Vercel**: repository koppelen, framework Astro, env-variabelen `PUBLIC_FUNCTIONS_URL=https://<ref>.supabase.co/functions/v1` en `SITE_URL`. Let op: Hobby is volgens de voorwaarden niet-commercieel; stap naar Pro vóór de eerste echte verkoop (besluit 5).
5. **GitHub**: secrets `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` voor de wakker-workflow.
6. **Testbestelling**: snelle scan bestellen met Mollie-testmodus, ‘paid’ kiezen, dan controleren: pagina ‘gelukt’, twee mails (ons en klant), in de tabel `status = betaald` en `gemaild_op` gevuld. Herhaal met ‘canceled’ → pagina ‘mislukt’, geen mail.
7. **Livegang**: `npm run controle:livegang` moet slagen; dan de Mollie-livesleutel zetten.

- [ ] **Step 4: Commit**

```bash
git add .github vercel.json docs/deploy.md
git commit -m "chore: Supabase wakker houden, beveiligingsheaders en deploy-instructies"
```

---

### Task 13: Eindcontrole en review (orkestrator, eindreview Opus 5.5 high)

- [ ] **Step 1: Alles draaien**

```bash
npm test
npm run test:e2e
deno check supabase/functions/*/index.ts
npm run build
```
Expected: alles groen. `npm run controle:livegang` mag nog falen op de bekende invulplekken (KvK, btw, adres, TIJDELIJK, CONCEPT); niets anders.

- [ ] **Step 2: Eindreview**

Laat één reviewer op Opus 5.5 (effort high) de hele branch bekijken tegen `docs/project/bouwplan.html` en dit plan, met nadruk op: de betaalstroom (dubbele meldingen, terugkeer vóór webhook, mislukte mails), het escapen in mails, de origin-controle, RLS en grants, en toegankelijkheid van de formulieren.

- [ ] **Step 3: Bevindingen verwerken en afsluiten**

Verwerk bevindingen met prioriteit hoog en midden. Gebruik daarna superpowers:finishing-a-development-branch.
