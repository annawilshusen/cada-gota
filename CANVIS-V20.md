# CadaGota v20 — Calibració guiada

- Captura amb mitjana de fins a sis lectures recents del sensor A0 (jardinera 1).
- Mínim quatre lectures dels últims tres minuts, l’última de fa menys de 90 s i variació màxima de 30 RAW.
- Captura separada de referència seca i humida, previsualització de percentatge i desament independent a `configuracio_reg`.
- Edició manual de valors RAW preservada.
- No requereix SQL nou ni canvis al firmware; la jardinera 2 no captura dades d'A0.
- Versió de recursos afegida per evitar JavaScript en memòria cau.
- Les dues referències són punts operatius del substrat, no una mesura volumètrica absoluta.
