/**
 * CadaGota — Panell de monitoratge de només lectura.
 * Les dades de Supabase són de prova fins a integrar l'Arduino.
 * La publishable key és pública; els permisos de lectura/escriptura els aplica RLS.
 */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const POLL_MS = 30000;
  const root = document.getElementById('irrigation-dashboard');
  if (!root) return;
  const status = document.getElementById('reg-status');
  const updated = document.getElementById('reg-updated');
  const zones = document.getElementById('reg-zones');
  const tank = document.getElementById('reg-tank');
  const tankNote = document.getElementById('reg-tank-note');
  const refresh = document.getElementById('reg-refresh');
  const historyZone = document.getElementById('reg-history-zone');
  const historyChart = document.getElementById('reg-history-chart');
  const historyStatus = document.getElementById('reg-history-status');
  const historySummary = document.getElementById('reg-history-summary');
  const historyButtons = [...document.querySelectorAll('[data-hours]')];
  let historyHours = 24;
  let historyVersion = 0;
  let busy = false;
  let lastReadings = [];

  const formatNumber = (n) => new Intl.NumberFormat('ca-ES',{maximumFractionDigits:1}).format(n);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Data desconeguda' : new Intl.DateTimeFormat('ca-ES',{dateStyle:'medium',timeStyle:'short'}).format(date);
  };
  const make = (tag, klass, value) => {
    const node = document.createElement(tag);
    if (klass) node.className = klass;
    if (value !== undefined) node.textContent = value;
    return node;
  };

  function render(readings) {
    zones.replaceChildren();
    if (!readings.length) {
      zones.append(make('p','reg-empty','Encara no hi ha lectures disponibles a Supabase.'));
      tank.textContent = '—';
      tankNote.textContent = 'Sense dades';
      return;
    }
    const latest = new Map();
    for (const row of readings) {
      const number = Number(row.jardinera);
      if (Number.isInteger(number) && number > 0 && !latest.has(number)) latest.set(number,row);
    }
    for (const [number,row] of [...latest.entries()].sort((a,b)=>a[0]-b[0])) {
      const panel = make('article','panel');
      panel.append(make('p','kicker',`JARDINERA ${String(number).padStart(2,'0')}`));
      panel.append(make('h3','', 'Humitat del sòl'));
      const humidity = Number(row.humitat);
      const valid = Number.isFinite(humidity) && humidity >= 0 && humidity <= 100;
      panel.append(make('span','data-value',valid ? `${formatNumber(humidity)} %` : '—'));
      if (valid) {
        const meter = make('div','meter');
        meter.setAttribute('role','progressbar');
        meter.setAttribute('aria-label',`Humitat de la jardinera ${number}`);
        meter.setAttribute('aria-valuemin','0');
        meter.setAttribute('aria-valuemax','100');
        meter.setAttribute('aria-valuenow',String(humidity));
        const bar = make('span');
        bar.style.width = `${humidity}%`;
        meter.append(bar);
        panel.append(meter);
      }
      panel.append(make('p','muted',`Bomba: ${row.bomba_activa ? 'activada' : 'aturada'}`));
      panel.append(make('p','muted',`Última lectura: ${formatDate(row.created_at)}`));
      zones.append(panel);
    }
    const tankReading = readings[0];
    tank.textContent = tankReading.diposit_ok === true ? 'Nivell suficient' : tankReading.diposit_ok === false ? 'Nivell baix' : '—';
    tankNote.textContent = 'Flotador: detecció puntual, no percentatge del dipòsit.';
    const latestDate = readings[0]?.created_at;
    updated.textContent = `Última lectura rebuda: ${formatDate(latestDate)}.`;
  }

  async function load() {
    if (busy) return;
    busy = true;
    refresh.disabled = true;
    status.textContent = 'Actualitzant lectures…';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let response;
      try {
        // La consulta demana fins a 200 lectures recents i mostra l'última de cada jardinera.
        response = await fetch(`${SUPABASE_URL}/rest/v1/lectures_humitat?select=jardinera,humitat,bomba_activa,diposit_ok,origen,created_at&order=created_at.desc&limit=200`,{
          method:'GET',
          headers:{'apikey':PUBLISHABLE_KEY,'Accept':'application/json'},
          signal:controller.signal,
          cache:'no-store'
        });
      } finally {clearTimeout(timeout);}
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Resposta inesperada');
      lastReadings = rows;
      render(rows);
      const hasReal = rows.some(row => row.origen === 'arduino');
      const hasTest = rows.some(row => row.origen !== 'arduino');
      status.textContent = !rows.length ? 'Connectat · Sense lectures' : hasReal && hasTest ? 'Connectat · Dades reals i de prova' : hasReal ? 'Connectat · Lectures de l’Arduino' : 'Connectat a Supabase · Dades de prova';
      document.getElementById('reg-source').textContent = hasReal ? 'Lectures rebudes de Supabase. Les dades amb origen «prova» no són mesures reals.' : 'Dades de prova de Supabase. L’Arduino encara no està connectat.';
    } catch(error) {
      status.textContent = 'No s’han pogut consultar les lectures';
      if (!lastReadings.length) {
        zones.replaceChildren(make('p','reg-empty', 'No es poden carregar les dades. Comprova les polítiques de lectura de Supabase i la connexió a internet.'));
        tank.textContent = '—';
        tankNote.textContent = 'Sense connexió';
      } else {
        updated.textContent = `Mostrant les últimes dades carregades. Error de connexió: ${error.message}`;
      }
    } finally {
      busy = false;
      refresh.disabled = false;
    }
  }

  function addStat(label, value) {
    const panel = make('div', 'reg-history-stat');
    panel.append(make('span', '', label), make('strong', '', value));
    return panel;
  }

  function renderHistory(rows, hours) {
    historyChart.replaceChildren();
    historySummary.replaceChildren();
    const data = rows.map(row => ({
      time: new Date(row.created_at).getTime(),
      humidity: Number(row.humitat),
      pump: row.bomba_activa === true,
      origin: row.origen || 'prova'
    })).filter(row => Number.isFinite(row.time) && Number.isFinite(row.humidity) && row.humidity >= 0 && row.humidity <= 100)
      .sort((a, b) => a.time - b.time);
    if (!data.length) {
      historyChart.append(make('p', 'reg-empty', 'No hi ha lectures en aquest període per a aquesta jardinera.'));
      return;
    }
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 830 310');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Evolució de la humitat de la jardinera ${historyZone.value}, amb ${data.length} lectures`);
    const svgEl = (tag, attrs = {}, content) => {
      const elem = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) elem.setAttribute(key, String(value));
      if (content !== undefined) elem.textContent = content;
      return elem;
    };
    const title = svgEl('title', {}, `Historial d'humitat · jardinera ${historyZone.value}`);
    svg.append(title);
    const plot = {left:53, top:16, width:755, height:245};
    const end = Date.now();
    const start = end - hours * 3600 * 1000;
    const x = time => plot.left + Math.max(0, Math.min(1, (time - start) / (end - start))) * plot.width;
    const y = humidity => plot.top + plot.height - (humidity / 100) * plot.height;
    for (let v = 0; v <= 100; v += 25) {
      const yy = y(v);
      svg.append(svgEl('line', {x1:plot.left,y1:yy,x2:plot.left+plot.width,y2:yy,stroke:'#d6deda','stroke-width':1}));
      svg.append(svgEl('text', {x:plot.left-12,y:yy+5,'text-anchor':'end',class:'axis-label'}, `${v}%`));
    }
    const fmt = new Intl.DateTimeFormat('ca-ES', hours === 24 ? {hour:'2-digit',minute:'2-digit'} : {day:'2-digit',month:'short'});
    for (let i=0; i<=4; i++) {
      const ts = start + (end-start)*i/4;
      const xx = x(ts);
      svg.append(svgEl('text',{x:xx,y:plot.top+plot.height+28,'text-anchor':i===0?'start':i===4?'end':'middle',class:'axis-label'},fmt.format(new Date(ts))));
    }
    if (data.length > 1) {
      svg.append(svgEl('polyline', {points:data.map(row=>`${x(row.time).toFixed(2)},${y(row.humidity).toFixed(2)}`).join(' '),fill:'none',stroke:'#407e8c','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}));
    }
    const tooltipTime = new Intl.DateTimeFormat('ca-ES',{dateStyle:'medium',timeStyle:'short'});
    const stride = Math.max(1, Math.ceil(data.length / 150));
    data.forEach((row,index) => {
      if (index % stride !== 0 && !row.pump && index !== data.length-1) return;
      const point = svgEl('circle',{cx:x(row.time),cy:y(row.humidity),r:row.pump?6:4,fill:row.pump?'#e3b43d':'#407e8c',stroke:row.pump?'#9a6a1c':'#fffaf0','stroke-width':2});
      point.append(svgEl('title',{},`${tooltipTime.format(new Date(row.time))} · ${formatNumber(row.humidity)} % · Bomba ${row.pump?'activada':'aturada'} · ${row.origin}`));
      svg.append(point);
    });
    historyChart.append(svg);
    const latest = data[data.length-1];
    const min = Math.min(...data.map(row=>row.humidity));
    const max = Math.max(...data.map(row=>row.humidity));
    historySummary.append(addStat('Lectures',String(data.length)),addStat('Humitat mínima',`${formatNumber(min)} %`),addStat('Humitat màxima',`${formatNumber(max)} %`),addStat('Última lectura',`${formatNumber(latest.humidity)} %`));
  }

  async function loadHistory() {
    const requestVersion = ++historyVersion;
    const zone = Number(historyZone.value);
    const hours = historyHours;
    historyStatus.textContent = 'Actualitzant l’historial…';
    const startIso = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const query = new URLSearchParams({
      select:'jardinera,humitat,bomba_activa,origen,created_at',
      jardinera:`eq.${zone}`,
      created_at:`gte.${startIso}`,
      order:'created_at.asc',
      limit:'1000'
    });
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 12000);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/lectures_humitat?${query}`, {
        headers:{apikey:PUBLISHABLE_KEY,Accept:'application/json'},
        signal:abort.signal,
        cache:'no-store'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      if (!Array.isArray(rows)) throw new Error('Resposta inesperada');
      if (requestVersion !== historyVersion) return;
      renderHistory(rows,hours);
      const test = rows.some(row => row.origen !== 'arduino');
      historyStatus.textContent = rows.length === 0 ? 'Sense lectures disponibles.' : `${rows.length} lectures · ${test ? 'Inclou dades de prova' : 'Dades de l’Arduino'}${rows.length >= 1000 ? ' · Límit de 1.000 lectures: el gràfic pot no incloure tot el període' : ''}`;
    } catch (error) {
      if (requestVersion !== historyVersion) return;
      historyStatus.textContent = 'No s’ha pogut carregar l’historial. Revisa la connexió i els permisos de Supabase.';
      historyChart.replaceChildren();
      historySummary.replaceChildren();
    } finally { clearTimeout(timeout); }
  }

  refresh.addEventListener('click', () => { load(); loadHistory(); });
  historyZone.addEventListener('change', loadHistory);
  historyButtons.forEach(button => button.addEventListener('click', () => {
    historyHours = Number(button.dataset.hours);
    historyButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    loadHistory();
  }));
  load();
  loadHistory();
  setInterval(() => { if (!document.hidden) { load(); loadHistory(); } }, POLL_MS);
})();
