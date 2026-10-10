---
titel: Alt-teksten schrijven voor afbeeldingen
samenvatting: Een alt-tekst vertelt wat een afbeelding betekent voor wie hem niet kan zien. Wanneer u er een nodig hebt, wanneer niet, en hoe u een goede schrijft.
groep: tekst-en-inhoud
volgorde: 4
gepubliceerd: 2026-10-10
gecontroleerd: 2026-10-10
wcag:
  - { nummer: "1.1.1", naam: "Niet-tekstuele content", url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html" }
verwijzing: { tekst: "Meer over toegankelijke websites", href: "/toegankelijke-website/" }
---
Niet iedereen ziet de afbeeldingen op uw site. Iemand die blind is, hoort de pagina voorlezen door een schermlezer. Een schermlezer is een programma dat de tekst op het scherm hardop uitspreekt. Bij een afbeelding zonder beschrijving zegt zo'n programma weinig of niets. De bezoeker mist dan een deel van uw verhaal.

De oplossing heet een alt-tekst. Alt is de afkorting van "alternatieve tekst". Het is een korte tekst die in de code bij de afbeelding staat. Bezoekers zien hem niet, tenzij de afbeelding niet laadt. Een schermlezer leest hem wel voor.

## Wat zegt WCAG hierover?

WCAG is een reeks internationale regels voor toegankelijke websites. Succescriterium 1.1.1, Niet-tekstuele content, vraagt dat afbeeldingen die iets betekenen een tekstalternatief hebben. Dat alternatief moet hetzelfde doel dienen als de afbeelding. Afbeeldingen die alleen versiering zijn, moeten zo gemaakt zijn dat een schermlezer ze kan overslaan.

Dat is dus geen vraag om elke afbeelding vol te schrijven. Het gaat om de vraag: wat doet deze afbeelding hier?

## Eerst de vraag: wat doet de afbeelding?

Voordat u schrijft, kijkt u naar het doel van de afbeelding. Er zijn grofweg vier soorten.

### Informatieve afbeeldingen

De afbeelding vertelt iets wat in de tekst niet staat. Denk aan een foto van uw product of een schema. Beschrijf dan wat iemand moet weten.

Voorbeeld: bij een foto van een rode fiets met mand schrijft u: "Rode damesfiets met een rieten mand voor op het stuur".

### Afbeeldingen die iets doen

Een afbeelding kan ook een knop of link zijn. Denk aan een logo dat naar de homepage leidt, of een vergrootglas om te zoeken. Beschrijf dan niet het plaatje, maar wat er gebeurt als u klikt.

Voorbeeld: bij het vergrootglas schrijft u "Zoeken". Bij het logo schrijft u "Naar de homepage".

### Decoratieve afbeeldingen

Sommige afbeeldingen zijn alleen versiering. Een sierlijn, een abstract patroon of een sfeerfoto die niets toevoegt. Zo'n afbeelding krijgt een lege alt-tekst. Dat schrijft u als `alt=""`. Een schermlezer slaat hem dan over. Laat het alt-attribuut niet helemaal weg, want dan lezen sommige programma's de bestandsnaam voor.

### Afbeeldingen met tekst

Staat er tekst in de afbeelding? Dan komt dezelfde tekst in de alt-tekst. Gebruik bij voorkeur gewone tekst op de pagina in plaats van een plaatje met letters. Gewone tekst is beter leesbaar, schaalt mee met inzoomen en is makkelijker te vertalen.

## Zo schrijft u een goede alt-tekst

Een paar vuistregels helpen.

- **Wees kort.** Een zin is meestal genoeg. Is er meer uitleg nodig, zet die dan in de gewone tekst bij de afbeelding.
- **Begin niet met "afbeelding van".** Een schermlezer zegt al dat het een afbeelding is.
- **Schrijf wat ertoe doet.** Een foto van een team op de contactpagina? Dan is "Het team van de werkplaats voor de deur" beter dan een lijst met kleuren van truien.
- **Let op de context.** Dezelfde foto kan op twee pagina's een andere alt-tekst nodig hebben, omdat het doel anders is.
- **Gebruik geen opvulwoorden.** Zet er geen zoekwoorden in om beter gevonden te worden. Dat helpt niemand en het stoort wie het hoort.

### Wat u beter niet doet

Neem niet zomaar de bestandsnaam over, zoals "IMG_4821.jpg". Laat ook niet automatisch een programma een beschrijving verzinnen zonder dat iemand die leest. Zo'n beschrijving klopt vaak niet. Alleen een mens kan beoordelen of de beschrijving past bij uw bedoeling.

## Grafieken, schema's en kaarten

Soms is een afbeelding te ingewikkeld voor één zin. Een grafiek bijvoorbeeld. Zet dan een korte alt-tekst bij de afbeelding, zoals "Grafiek van de bezoekersaantallen per maand". Geef de uitleg of de gegevens ook als gewone tekst of tabel op de pagina. Zo kan iedereen erbij.

## Waarom het ook u helpt

Een goede alt-tekst helpt meer mensen dan alleen schermlezergebruikers. Als een afbeelding niet laadt, zien bezoekers uw tekst. Zoekmachines gebruiken de tekst ook om de afbeelding te begrijpen. En als u bij elke afbeelding nadenkt over het doel, wordt uw pagina vaak duidelijker.

Het kost weinig tijd. Het is een kwestie van er bij elke nieuwe afbeelding even bij stilstaan. Maak er een vaste stap van in de manier waarop u pagina's plaatst. Dan hoeft u later niet alles in één keer te herstellen.

## Zelf controleren

1. **Loop uw belangrijkste pagina's langs.** Heeft elke afbeelding die iets betekent een alt-tekst?
2. **Controleer de knoppen en links met een plaatje.** Beschrijft de tekst wat er gebeurt, en niet hoe het plaatje eruitziet?
3. **Kijk naar de versiering.** Hebben die afbeeldingen een lege alt-tekst, zodat ze worden overgeslagen?
4. **Lees de teksten hardop.** Snapt iemand die de foto niet ziet, waar het over gaat?
5. **Zoek tekst in afbeeldingen.** Kan die tekst ook als gewone tekst op de pagina staan?
