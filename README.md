# CadaGota — Web (fase 1)

Web del treball de recerca **Consciència a cada gota**.

## Què inclou aquesta versió

- Menú principal: **Inici**, **El projecte** i **Panell de reg**.
- Portada amb la dimensió ambiental primer, seguida de la tecnològica i l'educativa.
- Índex amb targetes dins de **El projecte**.
- Vuit pàgines temàtiques amb índex lateral, preparades per incorporar el text original del TDR.
- PDF provisional (`assets/documents/tdr-provisional.pdf`) consultable i descarregable.
- Pàgina **Qui som** accessible clicant els noms al peu de pàgina.
- Ticker dels 31 missatges i estil corporatiu conservats.
- Panell de reg: **només dades simulades**; no permet activar el reg.

**IMPORTANT:** Aquesta és la **fase 1 (arquitectura)**. Les pàgines dels capítols NO contenen encara el text íntegre del PDF ni les figures. El contingut original es consulta al PDF. No publiquis els marcadors de transcripció com si fossin text final.

## Estructura

- `_layouts/`: plantilles de pàgina; qualsevol canvi comú es fa una sola vegada.
- `_includes/`: menú i peu de pàgina compartits.
- `_data/chapters.yml`: títols, descripcions i subapartats de l'índex.
- `capitols/*.md`: pàgines dels temes; els textos es poden editar amb Markdown.
- `pages/qui-som.html`: presentacions personals, història i motivacions.
- `css/styles.css`: estil de tota la web.
- `js/main.js`: menú mòbil i ticker (31 missatges).
- `assets/documents/tdr-provisional.pdf`: document original pendent de finalitzar.

## Publicació a GitHub Pages

La web fa servir **Jekyll**, compatible amb GitHub Pages. Mantén la configuració de GitHub Pages que publica la branca `main` des de l'arrel (`/`). GitHub Pages compilarà automàticament els fitxers amb front matter YAML i les plantilles. **No afegeixis un arxiu `.nojekyll`.**

Els fitxers Jekyll no es visualitzen correctament obrint `index.html` directament amb Finder: cal veure la web publicada (o executar Jekyll localment).

## Edicions futures

- Textos del TDR: substituir els marcadors de `capitols/*.md` per **transcripció literal**, amb figures i bibliografia verificades.
- No inventar resultats del treball de camp incomplet.
- Enllaçar les referències numèriques a les fonts del PDF quan s'incorporin els capítols.
- El PDF provisional és públic: es pot descarregar sense iniciar sessió.

## Actualització amb GitHub Desktop

1. Fes `Fetch origin` i, si escau, `Pull origin`.
2. Copia **tot el contingut** d'aquesta carpeta sobre la carpeta local `cada-gota`.
3. Revisa els canvis a GitHub Desktop, fes `Commit to main` i després `Push origin`.
4. Comprova `https://annawilshusen.github.io/cada-gota/`.
