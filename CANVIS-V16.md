# CadaGota v16 — Telemetria de l’Arduino

## Novetats
- Panell públic `/pages/panell.html`: nova secció independent **Telemetria de l’Arduino**.
- Mostra la lectura RAW del sensor A0 (0–4095), l’estat del flotador, l’estat declarat de la bomba i la data de recepció.
- Distingeix lectures recents (menys de 90 segons) de manca de comunicació recent; no afirma que la Wi-Fi estigui connectada.
- Gràfica interactiva de dades reals RAW, amb filtres de 24 hores / 7 dies / 30 dies, mínim, màxim i mitjana.
- Autorecarrega cada 30 segons i botó d’actualització.
- Les dades reals venen exclusivament de `public.telemetria_arduino`; les dades antigues simulades de `lectures_humitat` no es barregen.

## Instal·lació
1. Extreure el ZIP i copiar-ne tot el contingut al repositori GitHub Desktop, sobre els fitxers actuals.
2. Fer commit i Push origin.
3. Obrir `/pages/panell.html` i comprovar que apareix la secció nova.

## Supabase
No cal SQL nou si `telemetria_arduino` té SELECT a `anon, authenticated` i política RLS pública de lectura, tal com s’ha configurat.

## Limitacions
- Només hi ha un sensor físic A0 enviant lectures. No atribuïm aquestes dades a una segona jardinera.
- `bomba_activa` és el camp declarat per l’Arduino; el programa actual l’envia sempre com a fals.
- El valor RAW no és un percentatge i no es pot comparar amb els llindars de percentatge.
- La taula de telemetria actual no registra explícitament quin Arduino envia les dades; aquesta versió pressuposa l’únic dispositiu actual.
- El gràfic consulta un màxim de 1000 lectures recents per període; així s’evita sobrecarregar la pàgina.
- La secció original de lectures de prova queda intacta i separada. No hi ha funcions d’escriptura ni control de bombes.
