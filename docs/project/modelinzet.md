# Welk model doet wat: de bouw van Bureau van Dockum

Een overzicht van welk Claude-model ik waar inzet bij dit project, en waarom. Bedoeld als bouwsteen voor een blogpost op skillstacking.

## De modellen en wat ze kosten

Prijzen van de Anthropic-API per miljoen tokens, stand oktober 2026:

| Model | Invoer | Uitvoer | Uitvoer, vergeleken met Haiku |
|---|---|---|---|
| Haiku 5.5 | $ 0,10 | $ 0,50 | 1× |
| Sonnet 5.5 | $ 2 | $ 10 | 20× |
| Opus 5.5 | $ 4 | $ 20 | 40× |
| Fable 5.1 | $ 10 | $ 50 | 100× |

De Haiku-prijs geldt voor prompts tot 100.000 tokens. Werk je met een Claude-abonnement in Claude Code, dan betaal je niet per token. Een zwaarder model telt dan wel zwaarder mee in je gebruikslimiet. De verhouding is de les, niet het bedrag.

Fable heb ik in dit project niet gebruikt. Voor een website met een betaalstroom is Opus sterk genoeg, en Fable kost twee en een half keer zoveel.

## Wat er tot nu toe gebeurd is

Alles tot nu toe draaide in één sessie op **Opus 5.5**, zonder subagents:

1. Vragen stellen en de opdracht scherp krijgen (doelgroep, toon, hoofdactie).
2. Een stijltest met vier stijlen bouwen, en die met screenshots in de browser controleren.
3. Bijsturen: webshops erbij, een vijfde stijl op basis van een ander project, drie mixen, de keuze voor Raster en het logo.
4. Het bouwplan schrijven en twee keer aanvullen (Drupal, advies, artikelen, betalen).
5. Het uitvoeringsplan schrijven, met alle code voor de betaalstroom en de tests.

**Waarom Opus hier:** dit was ontwerpwerk. Welke vraag stel je, welke kleur haalt het contrast, waar zit het risico in een betaalstroom. Een fout in deze fase werkt door in alles wat erna komt. Een concreet voorbeeld: Opus rekende het contrast na en ontdekte dat het groen uit ‘Wat als ik later dood ben?’ (#19A85A) op de achtergrond van dat project maar 2,75:1 haalt. Te weinig voor tekst.

**Waar Opus te zwaar was:** screenshots maken, een servertje starten, bestanden opruimen. Dat had Haiku gekund. Ik deed het toch zelf, omdat elke overdracht naar een ander model ook tokens kost. Je moet uitleggen wat er moet gebeuren, en het resultaat terug lezen. Voor korte stappen midden in een ontwerpgesprek weegt dat niet op.

**Effort:** die heb ik in deze sessie niet aangepast; Claude Code bepaalde hem.

## Hoe de bouw verdeeld wordt

Uit `docs/superpowers/plans/2026-10-10-eigen-website.md`:

| Werk | Model | Effort | Waarom |
|---|---|---|---|
| De uitvoering aansturen | Sonnet 5.5, in een nieuwe sessie | medium | Het plan bevat het ontwerp al. Aansturen is volgen en controleren, geen ontwerpen. |
| Projectopzet, config, workflowbestand | Haiku 5.5 | medium | Mechanisch werk met een vaste uitkomst. |
| Pagina’s, artikelen, formulieren, Edge Functions | Sonnet 5.5 | medium | Code en goed Nederlands op B1-niveau. Sonnet kan dat prima vanuit een precies plan. |
| Review van database, betaallogica, functies en formulieren | Sonnet 5.5 | high | Hier kost een fout geld of vertrouwen. |
| Review van stijl- en tekstwerk | geen aparte reviewer | — | Automatische tests (axe, Playwright, Vitest) zijn hier de poort. |
| Eindreview van alles | Opus 5.5 | high | Eén keer het sterkste model over het geheel, vooral over de betaalstroom. |

## De principes erachter

1. **Oordeel duur, uitvoering goedkoop.** Opus voor beslissingen waar een fout doorwerkt: ontwerp, architectuur, de eindreview. Sonnet voor het schrijven van code en tekst volgens een plan. Haiku voor werk zonder keuzes.
2. **Het plan draagt het ontwerp.** Hoe preciezer het plan, met code, tests en vaste namen, hoe goedkoper het model dat het kan uitvoeren. Opus besteedt één keer veel tokens aan het plan, zodat twaalf taken op Sonnet en Haiku kunnen draaien.
3. **Context is de verborgen kostenpost.** Bij elke stap leest het model het hele gesprek opnieuw. Gecachet is dat goedkoper, maar niet gratis. Een lang ontwerpgesprek doortrekken naar de bouw is duur. Daarom start de bouw in een nieuwe sessie, en daarom zijn subagents goedkoop: die beginnen met een schone context.
4. **Review waar een fout geld kost.** De betaalstroom krijgt per taak een reviewer en aan het eind nog één. Stijl en tekst niet: daar vangen tests de fouten.
5. **Tests als goedkope poort.** Een axe-scan of een unit-test kost bijna niets en draait elke keer. Een reviewer kost een volle modelaanroep. Waar een test het risico afdekt, laat je de reviewer weg.
6. **Effort is de tweede knop.** Medium voor routinewerk, high voor reviews. Max alleen als je hebt gemeten dat het verschil maakt.

## Wat ik achteraf anders zou doen

- De visuele controles (screenshots, de check op 320px breed) direct aan een Haiku-subagent geven. Die zijn mechanisch en gingen vaak mis door een cache of een padfout. Daar ging onnodig Opus-tijd in zitten.
- Na de stijlkeuze een nieuwe sessie starten voor het bouwplan. Het ontwerpgesprek was toen al lang.

## Zelf instellen in Claude Code

- Het model van je sessie kies je met `/model`.
- Een subagent krijgt een eigen model, in de definitie van de agent (`model:` in `.claude/agents/<naam>.md`) of per aanroep.
- Start voor een nieuwe fase een nieuwe sessie, en geef die het plan als startpunt mee.
