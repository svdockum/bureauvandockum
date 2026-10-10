---
titel: "Kleurcontrast: zo controleert u het"
samenvatting: Lichtgrijze tekst op wit leest slecht, zeker buiten of voor slechtziende mensen. Welke contrastregels gelden voor tekst en knoppen, en hoe u dat zelf controleert.
groep: vormgeving
volgorde: 1
gepubliceerd: 2026-10-10
gecontroleerd: 2026-10-10
wcag:
  - { nummer: "1.4.3", naam: "Contrast (minimum)", url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" }
  - { nummer: "1.4.11", naam: "Contrast van niet-tekstuele content", url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" }
verwijzing: { tekst: "Vraag een toegankelijkheidsscan aan", href: "/scan-aanvragen/" }
---
Een mooie kleur is niet altijd een leesbare kleur. Lichtgrijze tekst op een witte achtergrond ziet er rustig uit. Maar veel mensen kunnen die tekst nauwelijks lezen. Dat geldt voor mensen die slecht zien. Het geldt ook voor iedereen die op een zonnig terras naar een telefoon kijkt.

Het verschil tussen de kleur van de tekst en de kleur van de achtergrond heet contrast. Hoe groter het verschil, hoe makkelijker het te lezen is.

## Wat vraagt WCAG?

WCAG is een reeks internationale regels voor toegankelijke websites. Twee succescriteria gaan over contrast.

### Tekst: criterium 1.4.3

Succescriterium 1.4.3, Contrast (minimum), gaat over tekst. Het vraagt dat gewone tekst een contrastverhouding heeft van minstens 4,5 op 1 met de achtergrond. Voor grote tekst is minstens 3 op 1 genoeg. Grote tekst is in WCAG bijvoorbeeld tekst van 18 punt of meer, of vette tekst van 14 punt of meer.

Een contrastverhouding is een getal dat het verschil in helderheid uitdrukt. Zwart op wit is het hoogste. Twee gelijke kleuren geven het laagste. U hoeft het niet zelf uit te rekenen. Er zijn gratis hulpmiddelen die het voor u doen.

Er zijn uitzonderingen. Tekst die alleen versiering is, of tekst in een logo, hoeft er niet aan te voldoen. Ook knoppen die niet te gebruiken zijn (uitgeschakeld) vallen erbuiten.

### Knoppen en andere onderdelen: criterium 1.4.11

Succescriterium 1.4.11, Contrast van niet-tekstuele content, gaat over wat geen tekst is, maar wel nodig is om de pagina te begrijpen of te bedienen. Hier is een verhouding van minstens 3 op 1 nodig. Denk aan:

- de rand van een invulveld;
- het icoon van een knop, als dat de enige uitleg is;
- de ring die om een veld verschijnt als u het kiest;
- onderdelen van een grafiek die u moet kunnen onderscheiden.

Dit criterium gaat dus over de randen en de vormen, niet over de tekst zelf. Een invulveld met een bijna witte rand op een witte pagina valt hierdoor af. Bezoekers zien dan niet eens waar ze moeten typen.

## Zo controleert u het

U hebt hiervoor geen speciale kennis nodig.

### Stap 1: zoek de kleuren

Kijk welke kleur de tekst heeft, en welke de achtergrond. In het ontwerp of in de stijl van uw site staan de kleurcodes. Een kleurcode ziet er zo uit: #767676.

### Stap 2: gebruik een contrastchecker

Een contrastchecker is een gratis hulpmiddel op internet. U vult twee kleurcodes in. Het hulpmiddel zegt dan of de combinatie goed genoeg is voor gewone tekst, grote tekst en onderdelen. Veel browsers hebben zoiets ook ingebouwd in de ontwikkelaarsgereedschappen.

### Stap 3: kijk ook naar de lastige plekken

Contrast gaat vaak mis op plaatsen waar u het niet verwacht:

- tekst over een foto of een kleurverloop;
- grijze hulptekst in formulieren, zoals een voorbeeld in een leeg veld;
- links binnen een alinea;
- tekst op knoppen, ook als u er met de muis overheen gaat;
- foutmeldingen in rood op een gekleurde achtergrond.

Bij tekst over een foto is één meting niet genoeg. De achtergrond verandert per plek. Kies een egale laag onder de tekst, of zet de tekst op een vlak.

## Alleen kleur is niet genoeg

Een ander punt hoort hier ook bij. Gebruik kleur nooit als het enige teken. Een foutmelding die alleen rood is, ziet iemand met kleurenblindheid misschien niet. Voeg er dan een tekst of een icoon aan toe. Zo ook voor links: onderstreep ze, of maak ze op een andere manier duidelijk, zodat ze opvallen zonder kleur.

## Tips voor het ontwerp

Kies uw kleuren liever in het begin dan achteraf. Zo houdt u het mooi én leesbaar.

- Begin met een donkere tekstkleur op een lichte achtergrond, of andersom.
- Kies voor uw merkkleur een donkere variant voor tekst, en bewaar de lichte variant voor vlakken.
- Test niet alleen de hoofdkleuren, maar ook de grijstinten.
- Vraag een collega of klant om het scherm op een zonnige plek te bekijken.

Dat laatste klinkt simpel, maar het werkt. Wat u op een goed scherm in een donkere kamer leest, kan buiten verdwijnen.

## Wat een scan wel en niet vindt

Een scanprogramma kan veel contrastproblemen vinden, omdat het de kleurcodes kan lezen. Het kan echter niet alles. Tekst over een foto of een kleurverloop is voor een programma lastig te meten. Ook kan een programma niet zeggen of een icoon begrijpelijk is. Daarom raden we aan om altijd ook zelf te kijken.

## Zelf controleren

1. **Meet de kleuren van uw gewone tekst.** Haalt die minstens 4,5 op 1 tegen de achtergrond?
2. **Meet de grote koppen.** Haalt grote tekst minstens 3 op 1?
3. **Kijk naar invulvelden en knoppen.** Is de rand of het icoon duidelijk genoeg zichtbaar, minstens 3 op 1?
4. **Zoek tekst over foto's.** Is die op elke plek goed leesbaar?
5. **Haal de kleur weg.** Zet uw scherm in grijstinten. Ziet u nog steeds wat een link, een knop en een foutmelding is?
