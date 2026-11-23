# CadaGota v15 — Consum d’aigua estimat

## On es veu
`/pages/control.html` → inicia sessió amb el teu compte d’administradora → apartat **Consum d’aigua**.

## Funcionalitats
- Consulta només de la taula `public.esdeveniments_reg` amb autenticació existent i RLS.
- Filtres: dades de prova / dades Arduino, 24 hores / 7 dies / 30 dies, jardineres 1 / 2 / ambdues.
- Indicadors: litres estimats, regs registrats i segons de funcionament.
- Gràfica temporal i comparació de litres per jardinera.
- Tractament de registres sense cabal, selecció buida i límit de 1.000 files.

## Instal·lació
No cal SQL addicional: utilitza `esdeveniments_reg` i les polítiques RLS creades al pas anterior.
Substitueix els fitxers de la web per aquesta versió i fes commit i push amb GitHub Desktop.

## Important
Els registres etiquetats `prova` no són mesures físiques. Aquest panell només llegeix registres i no envia ordres de reg. El consum és una estimació basada en el cabal constant que consta a cada esdeveniment.
