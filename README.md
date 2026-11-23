# CadaGota — web v9

Projecte de recerca «Consciència a cada gota». Web Jekyll compatible amb GitHub Pages.

## Instal·lació

Descomprimeix el ZIP, copia **tot el contingut** a l’arrel del repositori `annawilshusen/cada-gota` amb Finder, substitueix els arxius existents i, a GitHub Desktop, fes `Commit to main` i `Push origin`.

## Contingut

- Portada i accés al PDF provisional en una altra pestanya.
- Índex de «El projecte» amb desplegable, vuit capítols i índex lateral.
- Text del TDR editable en `capitols/*.md`, amb bibliografia numerada i enllaços recuperats de `Markdown pegado.md`.
- Interaccions científiques pròpies a `js/experiments.js` i `css/experiments.css`. Cada demostració és didàctica, mai una dada real del sistema.
- Figures: només un mapa mundial de disponibilitat d’aigua renovable per càpita facilitat per les autores. La distribució de l’aigua es reconstrueix com a gràfic interactiu, no com a foto del PDF.
- Imatges originals dels ODS (en castellà, tal com es va acordar).
- Panell de reg encara en mode demostració, **no connectat a Arduino**.

## Important

Llegeix `REVISIO-PENDENT.md` per a possibles incoherències de la bibliografia i dades a contrastar abans de publicar el contingut com a definitiu. Les fonts sense URL al fitxer bibliogràfic no s’han inventat.


Consulta `CANVIS-V9.md` per a les correccions de la darrera versió.


## v11 — Panell Supabase (prova)

El panell `pages/panell.html` consulta `public.lectures_humitat` amb una publishable key (pública) i RLS per a consultes anònimes. Es refresca cada 30 segons, té un botó d’actualització manual i mostra l’última lectura de cada jardinera. **Les dades encara són de prova:** no hi ha connexió amb Arduino ni control remot de la bomba. Mai no s’han d’emmagatzemar claus `sb_secret_`, `service_role` ni contrasenyes al repositori.

## v12 — Historial d'humitat

El panell incorpora gràfica SVG accessible, tria de jardinera i períodes de 24 hores, 7 dies i 30 dies, amb informació llegida directament de Supabase. Els punts daurats identifiquen lectures que declaren la bomba activa. No s'han inserit dades noves; les dades del SQL de prova conserven `origen=prova`. La taula requereix la columna `origen` creada a la fase anterior. Consulta limitada a 1.000 registres per jardinera i període, amb avís explícit si s'assoleix el límit.


## v13 — Inici de sessió del control privat
- Pàgina nova: `/pages/control.html`, accessible des del panell públic.
- Autenticació de Supabase Auth amb correu i contrasenya.
- Consulta de permisos a `public.administradores` sota RLS.
- Sense ordres a l'Arduino, activació de bomba ni edició dels llindars.
- Necessita que l'usuari ja existeixi a Authentication > Users i que consti a `public.administradores`.
- No inclou contrasenyes ni claus secretes: només la publishable key.

## v14 — Configuració persistent privada

1. Executa `supabase/configuracio-reg-v14.sql` a Supabase SQL Editor amb el projecte correcte. És necessari **abans** de fer servir els controls nous.
2. Publica el ZIP a GitHub Pages i entra a `/pages/control.html` amb el compte administrador existent.
3. Canvia un llindar, desa'l i recarrega la pàgina; el valor ha de persistir.
4. Les sol·licituds de reg són **simulacions registrades**; no hi ha cap endpoint de comandament físic. El registre d'auditoria es genera al servidor mitjançant un trigger.

**Seguretat:** Les taules noves tenen RLS i privilegis limitats. No es concedeix escriptura a `anon`. No hi ha claus secretes al frontend. Sense RLS correcte no s'ha de publicar control físic.
