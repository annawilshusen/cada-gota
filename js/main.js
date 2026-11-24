// Comportament de navegació comú. El panell encara no es connecta a l'Arduino.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}


// Missatges de la franja inferior — edita'ls aquí sense tocar l'HTML.
const tickerMessages = [

const tickerMessages = [
  "No et mullis!",
  "No t’ofeguis en un got d’aigua.",
  "Quan no et sentis inspirat, prova de fer una pluja d’idees.",
  "Si aquesta frase no et fa gràcia, prova-ho un altre cop i, a més, revisa la teva petjada hídrica.",
  "No deixis per demà l’aigua que pots estalviar avui.",
  "Saps què és realment estressant? Quedar-se sense aigua a mitja dutxa.",
  "Aquest missatge no consumeix aigua directament, però la infraestructura digital que el mostra pot tenir una petjada hídrica.",
  "Les plantes no tenen Wi-Fi. Per això els n’hem posat nosaltres.",
  "Aixeca la mà si t’agraden els dies de pluja. A nosaltres també.",
  "Has begut aigua avui? I les teves plantes?",
  "Un sensor d’humitat sap quan la terra està seca. Tant de bo sabés com serà el nostre proper examen.",
  "Les plantes fan la fotosíntesi. Nosaltres fem el que podem.",
  "Cada gota compta. Cada pàgina del TDR, també.",
  "Aquesta frase ha estat aprovada per una gota d’aigua.",
  "Si l’aigua cau del cel, per què no cauen també les respostes dels exàmens?",
  "Si alguna cosa no funciona, prova d’apagar-la i tornar-la a encendre. Excepte les plantes.",
  "Una gota no fa un oceà, però moltes gotes poden fer un bon problema de matemàtiques (una picada d’ullet a Navier-Stokes).",
  "Sabies que l’aigua cobreix aproximadament el 71% de la superfície terrestre? Ei, però això no vol dir que ens en sobri. Si no, no estaríem fent aquest TDR. Creu-me que som les primeres a voler-ho.",
  "Que ningú afegeixi al nostre recompte l’aigua que vam beure durant les jornades de conscienciació (la gola s’asseca fent presentacions).",
  "Una gota d’aigua no té forma de llàgrima quan cau: la tensió superficial i l’aire en determinen la forma. Independentment de la forma, cada gota és cada gota, i les has de cuidar totes.",
  "La Terra és coneguda com el planeta blau. Nosaltres hem intentat que la web sigui blava, però si ho fos tota, pensaries que ja no és gaire bonica. Per això tens tonalitats beix.",
  "Sabies que el nostre projecte ha arribat a més de 360 estudiants?",
  "Si estàs llegint tots aquests missatges, potser hauries de tornar a mirar si t’has deixat l’aixeta oberta.",
  "La humitat relativa no mesura com de relativa és la teva motivació per estudiar.",
  "Els núvols no tenen un botó per fer ploure. Però podríem fer que fos una ampliació futura.",
  "L’Arduino no té sentiments. Tot i així, ens preocupem quan deixa de respondre.",
  "Estalviar aigua no hauria de ser una gota en un oceà d’excuses.",
  "Hi ha persones que veuen el got mig ple. Nosaltres volem reutilitzar aquella aigua per posar-la al dipòsit.",
  "Ens agradaria tenir les idees tan clares com l’aigua.",
  "Ens vam plantejar fer entrevistes per al nostre TDR, però l’aigua no parla.",
  "Si una gota pogués parlar, probablement ens demanaria que deixéssim d’escriure frases sobre ella.",
  "Si aquest acudit és dolent, el pots deixar en remull fins que millori.",
  "El gel flota perquè és menys dens que l’aigua líquida. De fet, aproximadament un 8% del volum d’un iceberg sobresurt de l’aigua. La resta prefereix mantenir un perfil baix.",
  "Si augmentes la temperatura, les molècules es mouen més de pressa. Amb les dates d’entrega passa alguna cosa semblant.",
  "El nombre de molècules d’aigua en una sola gota és immens. El nombre de vegades que hem revisat aquest projecte comença a semblar-s’hi.",
  "Fins i tot l’aire que sembla sec pot contenir vapor d’aigua. El no-res ja és una altra qüestió.",
  "Netegem les nostres dades d’outliers. Amb aigua, evidentment.",
  "Les nostres llàgrimes abans de l’entrega no estan incloses a l’anàlisi.",
  "Si una planta pot sobreviure a una sequera, nosaltres podem sobreviure a segon de batxillerat. Esperem.",
  "Una línia de codi pot traduir-se en una tarda entretinguda.",
  "Tenim un sistema de reg intel·ligent amb sensors per a cada planta. Elles encara no saben la sort que tenen.",
  "Sí, aquesta web té frases que es mouen per sota. No, no era imprescindible per al TDR.",
  "Si has llegit tres missatges seguits, revisa que no t’hagis deixat l’aixeta oberta.",
  "Si trobes una errada ortogràfica, és una oportunitat per posar en pràctica el pensament crític."
];

];
const ticker = document.querySelector('.news-ticker');
if (ticker) {
  const text = ticker.querySelector('.ticker-message');
  const viewport = ticker.querySelector('.ticker-viewport');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queue = [];
  let last = -1;
  function shuffle() {
    queue = tickerMessages.map((_, index) => index);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    if (queue.length > 1 && queue[queue.length - 1] === last) {
      [queue[0], queue[queue.length - 1]] = [queue[queue.length - 1], queue[0]];
    }
  }
  function nextMessage() {
    if (!queue.length) shuffle();
    last = queue.pop();
    text.classList.remove('is-running');
    text.textContent = tickerMessages[last];
    if (reducedMotion.matches) return;
    const px = viewport.clientWidth + text.scrollWidth;
    text.style.setProperty('--ticker-duration', `${Math.max(10, px / 95)}s`);
    void text.offsetWidth; // reinicia l'animació
    text.classList.add('is-running');
  }
  text.addEventListener('animationend', nextMessage);
  reducedMotion.addEventListener('change', nextMessage);
  nextMessage();
}


// V5 · Submenú del projecte: ratolí, teclat i pantalla tàctil.
document.querySelectorAll('[data-nav-dropdown]').forEach(group => {
  const btn = group.querySelector('.dropdown-trigger');
  if (!btn) return;
  const close = () => { group.classList.remove('is-expanded'); btn.setAttribute('aria-expanded','false'); };
  btn.addEventListener('click', () => {
    const next = !group.classList.contains('is-expanded');
    group.classList.toggle('is-expanded',next);
    btn.setAttribute('aria-expanded',String(next));
  });
  group.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.focus();}});
  document.addEventListener('click',e=>{if(!group.contains(e.target))close();});
  group.querySelectorAll('.dropdown-menu a').forEach(a=>a.addEventListener('click',close));
});

// V6 — comparativa de petjada hídrica (exemples documentats al TDR).
const waterSelect=document.getElementById('water-select');
if(waterSelect){
 const entries=[['Vedella (1 kg)',15000],['Samarreta de cotó',2700],['Hamburguesa',2400],['Texans (1 parell)',10000]];
 const container=document.getElementById('water-bars');
 const result=document.getElementById('water-result');
 const render=()=>{let selected=Number(waterSelect.value);result.textContent=`${selected.toLocaleString('ca-ES')} litres d’aigua estimats.`;container.innerHTML='';entries.forEach(([label,value])=>{let row=document.createElement('div');row.className='comp-row';const t=document.createElement('span');t.textContent=label;const bar=document.createElement('div');bar.className='comp-track';let fill=document.createElement('div');fill.className='comp-fill';fill.style.width=`${value/15000*100}%`;bar.appendChild(fill);let num=document.createElement('span');num.textContent=value.toLocaleString('ca-ES')+' L';if(value===selected){row.style.fontWeight='bold';fill.style.background='#bb8f23';}row.append(t,bar,num);container.appendChild(row);});};
 waterSelect.addEventListener('change',render);render();
}
// Exemple de control per histèresi (sense connexió al reg real).
const humidity=document.getElementById('soil-humidity');
if(humidity){let on=false;const output=document.getElementById('soil-state');const value=document.getElementById('soil-value');const render=()=>{const h=Number(humidity.value);value.textContent=`${h}%`;if(h<30)on=true;else if(h>55)on=false;output.textContent='Estat del reg simulat: '+(on?'ACTIVAT':'desactivat');output.style.color=on?'#a65d12':'#204c55';};humidity.addEventListener('input',render);render();}


// ODS: gir amb hover al ratolí; toc o teclat per girar i tornar.
// Els clics de ratolí no deixen una targeta girada permanentment.
document.querySelectorAll('.ods-card').forEach(card => {
  card.addEventListener('click', event => {
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!coarse && event.detail !== 0) return;
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      card.classList.remove('is-flipped');
      card.setAttribute('aria-pressed', 'false');
    }
  });
});

// Comparativa didàctica de les estimacions del TDR, mai lectures reals.
const productA=document.querySelector('#footprint-a');
const productB=document.querySelector('#footprint-b');
if(productA && productB){
  productA.selectedIndex=0;productB.selectedIndex=6;
  const result=document.querySelector('#footprint-result');
  function renderFootprint(){
    const a=Number(productA.value),b=Number(productB.value),max=Math.max(a,b,1);
    const fa=(a/max*100).toFixed(1),fb=(b/max*100).toFixed(1);
    const nf=new Intl.NumberFormat('ca-ES');
    result.innerHTML=`<p><strong>${nf.format(a)} L</strong> i <strong>${nf.format(b)} L</strong></p><div class="compare-meter"><span style="width:${fa}%"></span></div><div class="compare-meter"><span style="width:${fb}%;background:#e3b43d"></span></div>`;
  }
  productA.addEventListener('change',renderFootprint);
  productB.addEventListener('change',renderFootprint);renderFootprint();
}
