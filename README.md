# CADA GOTA — Web del Treball de Recerca

## Contingut
- `index.html`: portada.
- `pages/`: sis apartats HTML independents (inclosa la portada).
- `css/styles.css`: tota la identitat gràfica compartida.
- `js/main.js`: menú mòbil.
- `assets/logos/`: logotips a partir dels arxius de referència proporcionats.

## Publicació a GitHub Pages
Puja **el contingut** d’aquesta carpeta (no una carpeta addicional) a l’arrel de `annawilshusen/cada-gota`, branca `main`. A Settings → Pages, configura `Deploy from a branch`, `main`, `/ (root)`.

## Estat del panell
El panell conté dades de demostració. No connecta amb Arduino, no permet autenticar-se ni enviar ordres. No incloguis contrasenyes, claus Wi-Fi ni tokens dins del repositori públic. Una fase futura necessitarà un servei segur de comunicació i autenticació, així com bloquejos locals de seguretat.

## Identitat
Colors: blau corporatiu `#407e8c`, crema `#f6efdb`, or `#e3b43d`, blau fosc `#204c55`. El títol destaca `ciència` en blau fosc sobre una petita franja crema per mantenir el contrast a la portada blava.


## Versió 2 — portada i missatges
- Portada sense isotip central: títol gran, «ciència» en groc i sense requadre.
- Les pàgines de fons beix arriben fins a la vora de la finestra.
- Menú superior fix mentre es fa scroll.
- 31 missatges al peu de totes les pàgines. Per modificar-los, edita `tickerMessages` dins de `js/main.js`.
- La franja es pausa en passar-hi el cursor o amb el botó «Pausa».
- El panell continua amb dades simulades; encara no hi ha control remot real.
