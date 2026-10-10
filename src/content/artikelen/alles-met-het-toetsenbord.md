---
titel: Alles met het toetsenbord
samenvatting: Veel mensen gebruiken geen muis. Kan iemand uw hele site bedienen met alleen de Tab-toets, en ziet die persoon steeds waar hij is? Zo controleert u dat.
groep: bediening
volgorde: 1
gepubliceerd: 2026-10-10
gecontroleerd: 2026-10-10
wcag:
  - { nummer: "2.1.1", naam: "Toetsenbord", url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html" }
  - { nummer: "2.4.7", naam: "Focus zichtbaar", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html" }
  - { nummer: "2.4.11", naam: "Focus niet bedekt (minimum)", url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html" }
verwijzing: { tekst: "Laat uw site testen door echte bezoekers", href: "/ux-testing/" }
---
Niet iedereen gebruikt een muis. Mensen met een motorische beperking werken vaak met alleen het toetsenbord. Blinde mensen doen dat ook, samen met een schermlezer. En ook wie een muis heeft, gebruikt soms alleen het toetsenbord, bijvoorbeeld om snel een formulier in te vullen.

Een toegankelijke site werkt dus zonder muis. In dit artikel leest u wat dat inhoudt en hoe u het in vijf minuten test.

## Zo werkt een toetsenbord op een site

Met de Tab-toets springt u van het ene bedienbare onderdeel naar het volgende. Met Shift en Tab samen gaat u terug. Bedienbare onderdelen zijn bijvoorbeeld links, knoppen en invulvelden. Met Enter activeert u een link of knop. Met de spatiebalk drukt u op een knop of vinkt u een vakje aan. Met de pijltjestoetsen kiest u een optie in een lijst.

De plek waar u op dat moment bent, heet de focus. De site laat die plek meestal zien met een rand of een kleur. Die zichtbare markering heet de focusring.

## Wat vraagt WCAG?

WCAG is een reeks internationale regels voor toegankelijke websites. Drie succescriteria gaan hierover.

### Criterium 2.1.1: Toetsenbord

Alles wat u met een muis kunt doen, moet u ook met het toetsenbord kunnen doen. Dat geldt voor links, knoppen, menu's, formulieren en alles wat uitklapt. Een uitzondering is iets wat echt afhangt van de beweging van de hand, zoals vrij tekenen.

Een bekend probleem is een menu dat alleen opent als u er met de muis overheen gaat. Iemand zonder muis komt er dan nooit in.

### Criterium 2.4.7: Focus zichtbaar

Als u het toetsenbord gebruikt, moet u kunnen zien waar de focus is. Veel ontwerpers halen de focusring weg omdat hij er onverzorgd uitziet. Dan raakt een toetsenbordgebruiker de weg kwijt. Het is alsof u een muis gebruikt waarvan de pijl onzichtbaar is.

### Criterium 2.4.11: Focus niet bedekt (minimum)

Dit criterium is nieuw in WCAG 2.2. Het vraagt dat het onderdeel met de focus niet helemaal verborgen raakt achter iets anders. Denk aan een balk die vastzit aan de bovenkant of onderkant van het scherm, of een cookiemelding. Springt u met Tab naar een link, en ligt die volledig onder zo'n balk, dan ziet u niet waar u bent. Het minimum is dat het onderdeel niet helemaal bedekt wordt.

## Test het zelf in vijf minuten

Leg uw muis weg. Open uw site en gebruik alleen het toetsenbord.

1. **Druk op Tab.** Vaak verschijnt er eerst een link "Naar de inhoud". Dat is een sneltoets-link waarmee bezoekers het menu overslaan. Het is handig, maar niet verplicht.
2. **Loop door de hele pagina.** Komt u bij alle links, knoppen en velden?
3. **Let op de volgorde.** Gaat de focus in een logische volgorde, van boven naar beneden en van links naar rechts? Springt hij niet ineens rond?
4. **Let op de focusring.** Ziet u steeds duidelijk waar u bent?
5. **Open een menu.** Lukt dat met Enter of de spatiebalk? Kunt u het ook weer sluiten, meestal met Escape?
6. **Vul een formulier in.** Kunt u kiezen, typen en versturen?
7. **Open een venster.** Valt de focus erin, en komt u er weer uit? Een venster dat de focus vasthoudt zonder uitgang is een val voor de bezoeker.

### Dingen die vaak misgaan

- Een klikbare afbeelding of tekst die in de code geen echte knop of link is. Die wordt door Tab overgeslagen.
- Een uitklapmenu dat alleen reageert op de muis.
- Een datumkiezer of schuifregelaar die u niet met toetsen kunt bedienen.
- Een vastgezette balk die de focus bedekt.
- Een focusring die op sommige plekken is uitgezet.

## Hoe maakt u het goed?

De beste oplossing is eenvoudig. Gebruik de ingebouwde onderdelen van HTML, de taal van websites. Een echte knop is een knop-element. Een echte link is een link-element. Die werken vanzelf met het toetsenbord en worden door schermlezers goed begrepen. Bouwt u zelf iets na met een gewoon vak, dan moet u alles zelf toevoegen. Dat gaat vaak mis.

Haal de focusring niet weg. Wilt u hem mooier maken? Maak hem dan dikker of geef hem een duidelijke kleur, maar laat hem zichtbaar. Zorg ook dat vastgezette balken genoeg ruimte laten, zodat een onderdeel niet helemaal verdwijnt als het de focus krijgt.

## Waarom het ook u helpt

Toetsenbordgebruik helpt meer mensen dan u denkt. Denk aan iemand met een gebroken pols, of aan iemand die snel door een formulier wil. Het is ook een goede test voor de kwaliteit van de code. Een site die goed met het toetsenbord werkt, is vaak ook netjes gebouwd.

## Zelf controleren

1. **Bedien uw hele site met alleen Tab, Shift+Tab, Enter en de spatiebalk.** Lukt dat voor alle belangrijke acties, zoals zoeken, bestellen of contact opnemen?
2. **Kijk of u steeds de focusring ziet.** Raakt u nergens kwijt waar u bent?
3. **Controleer de volgorde.** Klopt die met wat u op het scherm ziet?
4. **Test vastgezette balken en meldingen.** Verdwijnt een onderdeel met de focus nooit helemaal erachter?
5. **Open en sluit menu's en vensters.** Kunt u er ook weer uit komen met het toetsenbord?
