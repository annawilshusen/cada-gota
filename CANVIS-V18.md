# CadaGota v18 — noms, calibració d'humitat i gràfiques

1. Executa `supabase/plantes-i-calibracio-v18.sql` al SQL Editor de Supabase. El fitxer fa servir `SET LOCAL ROLE postgres` com en les versions anteriors. Cal tenir aplicada la v17.
2. Publica el contingut del ZIP a GitHub Pages amb GitHub Desktop.
3. Al panell privat configura `Lectura RAW en sec` i `Lectura RAW en humit` per a la jardinera 01 (sensor A0). Les dues lectures han de ser diferents almenys en 20 unitats. Fins que no hi hagi calibració, el panell públic mostra RAW, no percentatges ficticis.
4. `Índex d'humitat relatiu (%) = 100 × (lectura - RAW_sec)/(RAW_humit - RAW_sec)`, limitat entre 0% i 100%. Funciona encara que el sensor doni lectures inferiors quan el sòl està humit. Això no mesura la humitat volumètrica absoluta ni canvia el llindar de reg del microcontrolador.
5. Els noms de les plantes es consulten des de Supabase i es mostren al panell públic (tant targetes històriques com selector de l'historial), sense revelar la resta de la configuració privada. L'únic sensor Arduino A0 s'identifica amb la jardinera 01, sense suposar que hi hagi un segon sensor físic.
6. Gràfiques: 10 min, 1 hora, 24 hores, 7 dies i 30 dies. Als intervals superiors a una hora no es dibuixen punts sobre les lectures; la línia es conserva.
7. Les dades de prova `lectures_humitat` continuen separades de les lectures físiques `telemetria_arduino`. El comptador de 1.000 mostres limita el que s'observa en períodes llargs.

No cal modificar l'sketch de l'Arduino ni habilitar cap actuació física.
