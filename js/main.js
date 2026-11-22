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
  "No et mullis!",
  "No t’ofeguis en un got d’aigua.",
  "Quan no et sentis inspirat, prova de fer una pluja d’idees.",
  "Si aquesta frase no et fa gràcia, prova d’hidratar-te.",
  "No deixis per demà l’aigua que pots estalviar avui.",
  "Saps què és realment estressant? Quedar-te sense aigua a mitja dutxa.",
  "Aquest missatge no consumeix aigua directament, però la infraestructura digital que el mostra pot tenir una petjada hídrica.",
  "Les plantes no tenen Wi-Fi. Per això els n’hem posat nosaltres.",
  "Portem mesos parlant d’aigua i encara no hem après a caminar-hi per sobre.",
  "Aixeca la mà si t’agraden els dies de pluja. A nosaltres també.",
  "Has begut aigua avui? Això no és un anunci. És una pregunta.",
  "Ens vam plantejar fer negocis amb la sequera, però per alguna raó no ens respon.",
  "Un sensor d’humitat sap quan la terra està seca. Tant de bo sabés com serà el nostre proper examen.",
  "Les plantes fan la fotosíntesi. Nosaltres fem el que podem.",
  "Cada gota compta. Cada pàgina del TDR, també.",
  "Aquesta frase ha estat aprovada per una gota d’aigua.",
  "Si l’aigua cau del cel, per què no cauen també les respostes dels exàmens?",
  "Si alguna cosa no funciona, prova d’apagar-la i tornar-la a encendre. Excepte les plantes.",
  "Una gota no fa un oceà, però moltes gotes poden fer un bon problema de matemàtiques (una picada d’ullet a Navier-Stokes).",
  "Sabies que l’aigua cobreix aproximadament el 71% de la superfície terrestre? Ei, però això no vol dir que ens en sobri. Si no, no estaríem fent aquest TDR. Creu-me que som les primeres a voler-ho.",
  "Que ningú afegeixi al nostre recompte l’aigua que vam beure durant les jornades de conscienciació.",
  "Una gota d’aigua no té forma de llàgrima quan cau: la tensió superficial i l’aire en determinen la forma. Independentment de la forma, cada gota és cada gota, i cuida-les totes, porfi.",
  "La Terra és coneguda com el planeta blau. Nosaltres hem intentat que la web sigui blava, però si ho fos tota pensaries que ja no és gaire bonica. Per això tens tonalitats beix.",
  "Sabies que el nostre projecte ha arribat a més de 360 estudiants?",
  "Qui rega les plantes a l’estiu, ara? Bé, ara la pregunta hauria de ser: què rega les plantes a l’estiu? El segle XXI i la tecnologia fan coses increïbles...",
  "Si estàs llegint tots aquests missatges, potser hauries de tornar a mirar si t’has deixat l’aixeta oberta.",
  "La humitat relativa no mesura com de relativa és la teva motivació per estudiar.",
  "Els núvols no tenen un botó per fer ploure. Però podríem fer que fos una ampliació futura.",
  "L’Arduino no té sentiments. Tot i així, ens preocupem quan deixa de respondre.",
  "Un litre són mil mil·lilitres. La densitat de l’aigua és aproximadament d’1 kg/L. Ho dic per si tens un examen un dia d’aquests.",
  "Estalviar aigua no hauria de ser una gota en un oceà d’excuses."
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


/* V4 — Text del peu de pàgina */

document.querySelectorAll('.footer-project').forEach(element => {
  element.textContent =
    'Consciència a cada gota · Treball de recerca';
});

