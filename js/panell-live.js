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
        response = await fetch(`${SUPABASE_URL}/rest/v1/lectures_humitat?select=jardinera,humitat,bomba_activa,diposit_ok,created_at&order=created_at.desc&limit=200`,{
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
      status.textContent = rows.length ? 'Connectat a Supabase · Dades de prova' : 'Connectat · Sense lectures';
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

  refresh.addEventListener('click',load);
  load();
  setInterval(() => {if (!document.hidden) load();},POLL_MS);
})();
