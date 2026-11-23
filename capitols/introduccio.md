---
layout: capitol
title: Introducció
nav: projecte
section: '1'
description: Context, justificació, problema, objectius, hipòtesi, metodologia i motivació personal.
pdf_start: 7
sections:
- id: sec-1-1
  title: Context general del treball
- id: sec-1-2
  title: Justificació i rellevància del tema
- id: sec-1-3
  title: Plantejament del problema
- id: sec-1-4
  title: Objectius del treball
- id: sec-1-5
  title: Hipòtesi de recerca
- id: sec-1-6
  title: Metodologia general
- id: sec-1-6-1
  title: Fase teòrica
- id: sec-1-6-2
  title: Fase tècnica
- id: sec-1-6-3
  title: Fase educativa
- id: sec-1-7
  title: Motivació personal
---
<section class="science-feature" aria-labelledby="project-steps-title">
<p class="feature-eyebrow">COM S'ARTICULA EL TREBALL</p><h2 id="project-steps-title">Tres fases, un mateix objectiu</h2>
<div class="step-tabs" data-demo="project-steps" role="group" aria-label="Fases del projecte"><button type="button" data-step="0" aria-pressed="true">01 · Teoria</button><button type="button" data-step="1" aria-pressed="false">02 · Tècnica</button><button type="button" data-step="2" aria-pressed="false">03 · Educació</button></div>
<div class="step-display"><span class="step-count" data-step-count>01 / 03</span><p class="step-output" aria-live="polite" data-step-output>Estudiar l’aigua, els sistemes de reg i els fonaments tecnològics abans de construir el prototip.</p></div><p class="figure-caption">Esquema de les tres fases descrites a l'apartat 1.6.</p></section>
<h2 id="sec-1-1" class="chapter-heading"><span class="section-number">1.1</span> Context general del treball</h2>
<p>La disponibilitat d’aigua no depèn únicament de la quantitat existent, sinó també de la manera com es gestiona. Davant d’un recurs limitat i de gran importància, reduir-ne el malbaratament implica revisar activitats quotidianes en què es consumeix aigua sense conèixer amb precisió si és necessària.</p>
<p>El reg n’és un exemple. En molts entorns, l’aportació d’aigua a les plantes sovint depèn de l’observació humana o de sistemes temporitzats que actuen segons una programació fixa. Aquests mètodes no necessàriament tenen en compte l’estat real del sòl en el moment de regar, però la tecnologia permet fer un ús eficient de l’aigua mitjançant un sistema intel·ligent per així controlar cada gota, idea de la qual neix el nom del nostre equip: “CADA”.</p>
<p>Aquest treball trasllada aquest principi al nostre centre educatiu mitjançant el disseny i la construcció d’un sistema de reg automàtic. El projecte conviu amb dues finalitats: d’una banda, automatitzar una tasca que actualment requereix intervenció humana i, de l’altra, estudiar si aquesta automatització permet reduir l’ús de l’aigua.</p>
<p>El fet de desenvolupar el projecte dins d’una escola obre una segona dimensió. Com a estudiants, tenim l’oportunitat d’aplicar la tecnologia per donar resposta a un problema del nostre entorn i, alhora, compartir el procés i els coneixements adquirits amb la resta de l’alumnat. Per aquest motiu, aquest projecte combina el sistema de reg amb una iniciativa educativa de conscienciació sobre l’ús responsable de l’aigua.</p>
<h2 id="sec-1-2" class="chapter-heading"><span class="section-number">1.2</span> Justificació i rellevància del tema</h2>
<p>Una part important del consum d’aigua és fàcilment perceptible: veiem l’aigua que surt d’una aixeta, de la dutxa, o la que fem servir en el reg manual d’una planta. Tanmateix, una altra part queda oculta als productes i serveis que formen part de la vida quotidiana. Aquesta diferència entre el consum d’aigua que percebem i el que realment generem dificulta prendre consciència de la nostra petjada hídrica (la quantitat total d’aigua associada al nostre consum) i, en conseqüència, limita la nostra capacitat de prendre decisions ben informades.</p>
<p>Aquesta manca de percepció converteix la gestió de l’aigua en un problema que no es pot abordar únicament des de la tecnologia. La repercussió d’una solució tècnica és limitada si qui utilitza els recursos desconeix el problema a resoldre. Per aquest motiu, considerem que l’eficiència del treball s’assoleix en la combinació de tecnologia i conscienciació.</p>
<p>L’àmbit escolar, a més, ofereix un entorn especialment adequat per posar en pràctica aquesta idea. És en aquest espai on els joves, com a generacions futures, adquireixen els coneixements i els hàbits que aplicaran al llarg de la seva vida.</p>
<p>La justificació de la rellevància de l’aigua se sintetitza al nostre lema, que diu:</p>
<p>“Si vita flumen, cuida cada gota”.</p>
<p>L’expressió llatina vita flumen compara la vida amb un riu. Al treball, relacionem aquest riu amb l’aigua que sosté la nostra vida i, per tant, entenem que cada gota la representa. Així, volem transmetre que, per cuidar la vida, és necessari cuidar i valorar cada gota d’aigua.</p>
<h2 id="sec-1-3" class="chapter-heading"><span class="section-number">1.3</span> Plantejament del problema</h2>
<p>El problema no és només l’escassetat de l’aigua, sinó la seva mala gestió per part dels usuaris, i en el cas d’estudi del treball, la falta de precisió en el reg de plantes. A més, un altre problema és el poc interès envers la gestió de l’aigua per part de la societat, ja que sense aquest, no es pot garantir l’assoliment de l’objectiu de reduir-ne el consum.</p>
<h2 id="sec-1-4" class="chapter-heading"><span class="section-number">1.4</span> Objectius del treball</h2>
<p>L’objectiu principal del treball és dissenyar i implementar un sistema de reg automàtic sostenible basat en sensors d’humitat per reduir el consum d’aigua a l’escola destinat al reg de plantes, alhora que es fomenta la conscienciació mediambiental sobre l’ús responsable dels recursos hídrics entre l’alumnat.</p>
<p class="list-intro">Objectius específics:</p>
<ul class="droplet-list">
<li>Analitzar la problemàtica de l’escassetat i la gestió de l’aigua, especialment en relació amb el reg i el consum urbà.</li>
<li>Estudiar el funcionament dels principals sistemes de reg i seleccionar els components més adequats per al projecte.</li>
<li>Dissenyar i construir un prototip funcional, modular i ampliable d’un reg automàtic.</li>
<li>Calibrar els sensors d’humitat i establir uns llindars de funcionament adequats per a les plantes estudiades.</li>
<li>Comprovar el funcionament i la fiabilitat del sistema en condicions reals.</li>
<li>Mesurar el consum d’aigua del sistema automàtic i comparar-lo amb un sistema de reg temporitzat o manual.</li>
<li>Realitzar jornades de conscienciació adreçades a l’alumnat i avaluar l’impacte de les activitats mitjançant enquestes realitzades abans i després de la jornada.</li>
<li>Difondre el procés i els resultats del projecte per promoure la sostenibilitat i el consum responsable d’aigua dins de la comunitat educativa.</li>
</ul>
<h2 id="sec-1-5" class="chapter-heading"><span class="section-number">1.5</span> Hipòtesi de recerca</h2>
<p>La hipòtesi principal del treball planteja que un sistema de reg automàtic basat en sensors d’humitat permetrà reduir el consum innecessari d’aigua respecte d’un sistema de reg manual, mantenint unes condicions d’humitat adequades per a les plantes i reduint la necessitat d’intervenció humana.</p>
<p>Com a hipòtesi complementària, es considera que la realització d’una jornada de conscienciació sobre l’aigua permetrà que l’alumnat adopti hàbits de consum més responsables envers aquest recurs.</p>
<h2 id="sec-1-6" class="chapter-heading"><span class="section-number">1.6</span> Metodologia general</h2>
<p>La metodologia del nostre projecte es basa en tres fases que defineixen el desenvolupament del treball: una fase teòrica per entendre el problema, una fase tècnica per dissenyar i muntar el sistema de reg, i una fase educativa per compartir-lo amb l’escola.</p>
<h3 id="sec-1-6-1" class="chapter-heading"><span class="section-number">1.6.1</span> Fase teòrica</h3>
<p>En aquesta fase es busca i s’analitza informació sobre sostenibilitat, gestió de l’aigua, ODS i problemàtiques ambientals, així com els fonaments de l’electrònica i altres aspectes tecnològics. L’objectiu és construir una base que justifiqui el projecte i proporcioni una base de coneixements per la confecció del projecte tecnològic.</p>
<h3 id="sec-1-6-2" class="chapter-heading"><span class="section-number">1.6.2</span> Fase tècnica</h3>
<p>Aquesta es dividirà en el disseny i la confecció del sistema de reg mateix. En la primera part, es decidiran els components, s’organitzaran i es dissenyarà el funcionament del sistema, a partir de la recerca teòrica. En la segona part, es documentarà la construcció del disseny final, tot indicant els errors, els passos seguits i la implementació de solucions. També es farà consciència de propostes de millora i de les possibilitats d’escalar el projecte.</p>
<h3 id="sec-1-6-3" class="chapter-heading"><span class="section-number">1.6.3</span> Fase educativa</h3>
<p>Es preparen activitats de conscienciació per a l’alumnat del nostre centre educatiu. Després es presenten a cadascun dels cursos de l’ESO per fomentar l’interès en la sostenibilitat, concretament en l’aigua, tot mostrant el prototip del sistema de reg i explicant, de forma bàsica, els principis darrere la tecnologia.</p>
<h2 id="sec-1-7" class="chapter-heading"><span class="section-number">1.7</span> Motivació personal</h2>
<p>Quan cursàvem 4t d’ESO, el nostre professor de tecnologia ens va comentar que volia instal·lar un sistema de reg automàtic a l’escola i que necessitava voluntaris per tirar-lo endavant. Les dues ens vam oferir i ens va dir que el projecte començaria el curs següent.</p>
<p>En començar primer de batxillerat, ens vam reunir amb els tres professors del claustre que formen part de Nazaret Cuida, inclòs el professor de tecnologia, i ens van proposar desenvolupar el sistema de reg automàtic com a treball de recerca de batxillerat. A partir d’aquí, vam decidir ampliar el projecte incorporant-hi també una dimensió social i educativa, per tal que no fos només una proposta tècnica, sinó una iniciativa amb impacte real dins la comunitat escolar.</p>
<section id="bibliografia" class="bibliografia chapter-bib"><p class="intro-label">FONTS DEL CAPÍTOL</p><h2>Bibliografia</h2><p class="bibliography-context">Referències utilitzades al capítol. La numeració segueix el treball original; els enllaços s’han recuperat del fitxer bibliogràfic facilitat per les autores.</p><ol class="bib-list">

</ol></section>