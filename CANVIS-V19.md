# CadaGota v19 — reparació de telemetria

- Correcció definitiva de la consulta REST: `URLSearchParams` ara es converteix a text explícitament i es passa el nom de la taula per separat.
- Els errors HTTP i de Supabase ara es mostren al panell sense quedar amagats per «Sense lectures rebudes».
- `pages/panell.html` utilitza `?v=19` per evitar que Safari i GitHub Pages reutilitzin JavaScript antic en memòria cau.
- No requereix cap migració SQL ni canvis a l'Arduino. Manté els gràfics, els noms de plantes i la calibració.
