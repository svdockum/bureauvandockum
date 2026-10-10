---
titel: Formulieren die iedereen kan invullen
samenvatting: Een formulier is vaak het moment waarop een bezoeker klant wordt, of afhaakt. Labels, duidelijke foutmeldingen en hulp bij invullen maken het verschil.
groep: bediening
volgorde: 3
gepubliceerd: 2026-10-10
gecontroleerd: 2026-10-10
wcag:
  - { nummer: "3.3.1", naam: "Foutidentificatie", url: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html" }
  - { nummer: "3.3.2", naam: "Labels of instructies", url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html" }
  - { nummer: "1.3.5", naam: "Identificeer het doel van de input", url: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html" }
verwijzing: { tekst: "Laat uw site testen door echte bezoekers", href: "/ux-testing/" }
---
Een formulier is vaak het moment waarop een bezoeker klant wordt. Iemand vraagt een offerte aan, bestelt iets of stuurt een bericht. Loopt de bezoeker hier vast, dan raakt u hem kwijt. Daarom loont het om formulieren goed te maken voor iedereen.

Wat is er lastig? Een blinde bezoeker hoort een veld alleen als "invoerveld", zonder uitleg. Iemand met een tremor mist soms een klein vakje. Iemand die moeite heeft met lezen, snapt een foutmelding als "ongeldige invoer" niet. En iedereen baalt als een lang formulier na één fout leeg is.

## Wat vraagt WCAG?

WCAG is een reeks internationale regels voor toegankelijke websites. Drie succescriteria zijn hier belangrijk.

### Criterium 3.3.2: Labels of instructies

Elk veld heeft een label of een instructie nodig. Een label is de tekst die zegt wat u in het veld moet zetten, zoals "E-mailadres". Is er een bepaald formaat nodig, zoals een datum, dan staat dat er ook bij. Dat helpt iedereen, en zeker mensen die de pagina niet zien.

Een label hoort bij het veld. In de code koppelt u ze aan elkaar. Dan leest een schermlezer het label voor als iemand in het veld komt, en kunnen bezoekers op het label klikken om het veld te kiezen. Dat vergroot het raakvlak voor wie moeilijk mikt.

Een tekstje in het lege veld (een voorbeeld dat verdwijnt zodra u typt) is geen vervanging voor een label. Het verdwijnt, en dan weet u niet meer wat er gevraagd werd.

### Criterium 3.3.1: Foutidentificatie

Maakt een bezoeker een fout? Dan moet de site dat laten weten, in tekst. De melding vertelt welk veld fout is en wat er mis is. Alleen een rood randje is niet genoeg, want niet iedereen ziet kleur.

Een goede melding zegt wat er moet gebeuren. Vergelijk deze twee:

- Slecht: "Ongeldige invoer."
- Beter: "Vul uw e-mailadres in met een apenstaartje, bijvoorbeeld naam@voorbeeld.nl."

Zorg dat de melding ook bij een schermlezer aankomt. Zet de focus bij een fout naar de melding of naar het eerste fout veld. En zet de melding bij het veld zelf, in plaats van alleen bovenaan de pagina.

### Criterium 1.3.5: Identificeer het doel van de input

Dit gaat over velden voor persoonlijke gegevens, zoals naam, adres, e-mail en telefoonnummer. U geeft in de code aan wat voor soort gegeven het veld vraagt. Dat doet u met het attribuut `autocomplete`. Een browser of hulpprogramma kan het veld dan automatisch invullen.

Dat is een grote hulp voor mensen die moeilijk typen. Ook mensen met een geheugenprobleem hebben er baat bij. En het scheelt iedereen tijd.

## Zo bouwt u een goed formulier

Een paar vuistregels:

- **Zet het label boven het veld.** Dat leest prettig, ook op een telefoon.
- **Vraag alleen wat u nodig hebt.** Elk extra veld is een kans dat iemand afhaakt.
- **Geef aan wat verplicht is.** Doe dat met tekst, niet alleen met een sterretje of een kleur.
- **Gebruik het juiste soort veld.** Een e-mailveld toont op een telefoon een toetsenbord met een apenstaartje.
- **Maak velden groot genoeg.** Grote vakjes zijn makkelijker te raken.
- **Groepeer bij elkaar horende keuzes.** Een reeks keuzerondjes hoort onder één vraag, zodat de vraag wordt voorgelezen.

### Fouten voorkomen

Beter dan een goede foutmelding is geen fout. Laat zien welk formaat u verwacht. Pas op met strenge regels die gewone invoer afwijzen, zoals een telefoonnummer met een spatie erin. En bewaar wat de bezoeker al heeft ingevuld, zodat hij na een fout niet opnieuw hoeft te beginnen.

### Bevestiging na het versturen

Laat na het versturen duidelijk zien dat het gelukt is. Een bericht dat kort verschijnt en weer verdwijnt, mist een deel van uw bezoekers. Zet de bevestiging liever op de pagina zelf, in tekst.

## Een scan en echte bezoekers

Een scan kan zien of een veld een label heeft. Het kan niet zien of dat label ook duidelijk is. Ook weet het niet of een foutmelding iets zinnigs zegt. Daarom testen wij formulieren ook met echte bezoekers. Zij laten snel zien waar het misgaat.

## Zelf controleren

1. **Klik op een label.** Gaat de cursor dan naar het bijbehorende veld?
2. **Loop met Tab door het formulier.** Hoort bij elk veld een duidelijke naam? Kunt u alles bereiken en versturen?
3. **Verstuur het formulier leeg of met een fout.** Zegt de melding in woorden welk veld fout is en hoe u het verbetert?
4. **Controleer de verplichte velden.** Staat er in tekst bij welke dat zijn?
5. **Laat de browser invullen.** Vult hij naam, e-mail en adres goed in?
