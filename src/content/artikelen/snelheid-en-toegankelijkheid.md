---
titel: Een snelle site is een toegankelijke site
samenvatting: Een trage pagina is voor iedereen vervelend. Voor sommige bezoekers betekent het dat ze afhaken. Waarom snelheid bij toegankelijkheid hoort, en hoe u het zelf meet.
groep: testen-en-onderhoud
volgorde: 2
gepubliceerd: 2026-10-11
gecontroleerd: 2026-10-11
wcag: []
verwijzing: { tekst: "Lees hoe wij toegankelijke websites bouwen", href: "/toegankelijke-website/" }
---
Bij een toegankelijke site denkt u misschien aan goede kleuren, duidelijke teksten en bediening met het toetsenbord. Maar er is nog iets wat vaak vergeten wordt: snelheid. Een site die lang laadt, sluit mensen buiten.

## Waarom snelheid bij toegankelijkheid hoort

[WCAG](/info/wat-is-wcag/), de internationale regels voor toegankelijke websites, heeft geen eis voor snelheid. Toch maakt snelheid voor veel bezoekers het verschil tussen wel en niet kunnen gebruiken.

### Niet iedereen heeft een nieuwe telefoon

Een site die op uw computer snel is, kan op een oudere telefoon traag zijn. Veel mensen gebruiken een telefoon van een paar jaar oud. Of ze hebben een kleine databundel. Een zware pagina kost hen dan tijd én geld.

### Niet overal is het internet snel

In de trein, op het platteland of in een gebouw met dikke muren is de verbinding vaak zwak. Elke extra seconde laden is dan een kans dat iemand afhaakt.

### Hulpmiddelen hebben ook tijd nodig

Een schermlezer leest de pagina voor. Daarvoor moet hij de pagina eerst doorlopen. Bij een zware pagina met veel code kan dat traag worden. De bezoeker drukt op een toets, en er gebeurt even niets.

### Verspringen leidt tot fouten

Soms verschuift een pagina tijdens het laden. Er komt een afbeelding of een melding bij, en de tekst springt naar beneden. Wie net wilde klikken, drukt dan op de verkeerde knop. Dat is lastig voor iedereen. Voor iemand met trillende handen, of iemand die ver inzoomt, is het extra lastig.

### Wachten kost aandacht

Wie moeite heeft met concentreren, raakt bij wachten sneller de draad kwijt. En wie niet ziet dat de pagina nog laadt, denkt al snel dat de site stuk is.

## Wat maakt een site traag?

Vaak zijn het dezelfde boosdoeners:

- **Grote afbeeldingen.** Een foto van vijf megabyte, terwijl het scherm hem maar klein toont.
- **Veel scripts.** Elke plugin, slider, chatknop of [overlay](/info/overlays-en-plugins-afgeraden/) laadt extra code.
- **Code van andere partijen.** Denk aan trackers, advertenties en ingesloten video's. Die komen van een andere server en vertragen de pagina.
- **Lettertypes van buiten.** Een lettertype dat van een andere server komt, laat de tekst soms even op zich wachten.

## Hoe meet u snelheid?

Google gebruikt drie getallen om te laten zien hoe snel een pagina voelt. Samen heten ze de Core Web Vitals.

- **Laden (LCP).** Hoe snel staat het grootste deel van de pagina in beeld? Goed is binnen 2,5 seconde.
- **Reageren (INP).** Hoe snel reageert de pagina als u ergens op klikt of tikt? Goed is binnen 0,2 seconde.
- **Stilstaan (CLS).** Hoeveel verspringt de pagina tijdens het laden? Goed is een score van 0,1 of lager.

Google kijkt ook naar deze getallen bij de volgorde van de zoekresultaten. Een snelle site helpt dus ook bij uw vindbaarheid.

## Wat wij doen

Wij optimaliseren elke site op snelheid. Dat betekent onder meer:

- afbeeldingen in een licht formaat, en niet groter dan nodig;
- afbeeldingen verderop op de pagina laden pas als u erheen scrolt;
- vaste ruimte voor afbeeldingen, zodat de pagina niet verspringt;
- zo weinig mogelijk scripts, en geen overlays of zware plugins;
- geen tracking van derden;
- lettertypes op de eigen server, alleen in de diktes die de site gebruikt.

Daarna meten we. Op een gewone telefoon, en niet alleen op een snelle computer.

## Zelf controleren

1. **Meet uw site.** Ga naar [PageSpeed Insights](https://pagespeed.web.dev/) en vul uw webadres in. Kijk vooral naar de uitslag voor mobiel.
2. **Zet uw wifi uit.** Open uw site op uw telefoon, via mobiel internet. Hoe lang duurt het voordat u kunt lezen?
3. **Let op verspringen.** Laad een pagina en kijk goed. Springt de tekst weg terwijl de pagina nog laadt?
