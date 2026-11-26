/* CadaGota: renderitza el mateix panell privat com a consulta anònima.
 * NO carrega control-privat.js, NO envia cap escriptura i NO executa ordres de reg.
 * Per seguretat, RLS continua aplicant-se a totes les consultes.
 */
(() => {
  'use strict';
  const ROOT = document.getElementById('cg-guest-content');
  if (!ROOT) return;
  const STATUS = document.getElementById('cg-guest-message');
  const API = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const $ = id => ROOT.querySelector(`#${id}`);
  let configs = [];

  const setStatus = (text, isError = false) => {
    STATUS.textContent = text;
    STATUS.classList.toggle('is-error', isError);
  };
  const setValue = (id, value) => {
    const el = $(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = value === true;
    else el.value = value == null ? '' : String(value);
  };
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = String(value);
  };
  async function getPublic(table, query) {
    const response = await fetch(`${API}/rest/v1/${table}?${query}`, {
      cache: 'no-store',
      headers: { apikey: KEY, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`${table}: HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada del servidor');
    return data;
  }
  function readonlyUI() {
    // L'estructura és la del formulari privat, però no hi ha script de modificació.
    // A més s'inhabiliten físicament els camps i controls d'escriptura.
    ROOT.querySelectorAll('form').forEach(form => form.addEventListener('submit', e => e.preventDefault()));
    ROOT.querySelectorAll('input, textarea').forEach(el => {
      if (el.type === 'checkbox' || el.type === 'button' || el.type === 'submit') el.disabled = true;
      else el.readOnly = true;
      el.removeAttribute('required');
    });
    ROOT.querySelectorAll('button').forEach(button => {button.disabled = true;});
    const reload = $('cada-reload');
    if (reload) {reload.disabled = false;reload.addEventListener('click', loadConfig);}
    const calReload = $('cada-cal-refresh');
    if (calReload) {calReload.disabled = false;calReload.addEventListener('click', loadTelemetry);}
    const zone = $('cada-zone');
    if (zone) zone.addEventListener('change', () => {renderSelected();loadTelemetry();});
    // Apartats ja amagats al control privat v21: simulació i consum fictici.
    ROOT.querySelectorAll('.cada-consumption,.cada-settings-simulator').forEach(el => el.remove());
    const activity = $('cada-activity');
    if (activity) {
      activity.replaceChildren();
      const p = document.createElement('p');
      p.className = 'cg-guest-unavailable';
      p.textContent = 'L’historial intern d’edicions només està disponible per a administradores.';
      activity.append(p);
    }
    const topText = ROOT.querySelector('#cg-guest-private > .muted');
    if (topText) topText.textContent = 'Vista de només lectura. Els valors es consulten a Supabase; aquesta pàgina no pot desar canvis ni activar el relé.';
    const hint = ROOT.querySelector('#cg-guest-private .callout');
    if (hint) hint.textContent = 'Accés informatiu: cap acció d’aquesta pàgina controla el reg ni modifica la configuració.';
  }
  function renderSelected() {
    const zone = $('cada-zone');
    const selected = Number(zone?.value || 1);
    const row = configs.find(item => Number(item.jardinera) === selected);
    if (!row) {setStatus('No s’ha trobat la configuració de la jardinera seleccionada.', true);return;}
    const values = {
      'cada-plant-name': row.nom_planta,
      'cada-plant-species': row.especie,
      'cada-plant-date': row.data_plantacio,
      'cada-plant-notes': row.observacions,
      'cada-raw-sec': row.raw_sec,
      'cada-raw-humit': row.raw_humit,
      'cada-min': row.humitat_minima,
      'cada-max': row.humitat_maxima,
      'cada-duration': row.temps_maxim_segons,
      'cada-auto': row.mode_automatic
    };
    Object.entries(values).forEach(([id,v]) => setValue(id,v));
    setText('cada-config-message', 'Configuració de només lectura · dades desades a Supabase.');
    setText('cada-cal-status', 'Consultant les lectures de la jardinera…');
    setText('cada-cal-mean','— RAW');setText('cada-cal-range','—');setText('cada-cal-last','—');
    setStatus('Configuració consultada correctament. Mode invitat: només lectura.');
  }
  async function loadConfig() {
    setStatus('Actualitzant la configuració…');
    try {
      const fields = 'jardinera,nom_planta,especie,observacions,raw_sec,raw_humit,humitat_minima,humitat_maxima,mode_automatic,data_plantacio,temps_maxim_segons';
      // L'RLS/grants públics poden excloure data_plantacio i temps_maxim_segons;
      // en aquest cas es consulta una versió reduïda, sense demanar més permisos.
      try {
        configs = await getPublic('configuracio_reg', new URLSearchParams({select:fields,order:'jardinera.asc'}));
      } catch (e) {
        if (!/HTTP 40[013]/.test(e.message)) throw e;
        configs = await getPublic('configuracio_reg', new URLSearchParams({
          select:'jardinera,nom_planta,especie,observacions,raw_sec,raw_humit,humitat_minima,humitat_maxima,mode_automatic',
          order:'jardinera.asc'
        }));
      }
      const zone = $('cada-zone');
      const current = zone?.value || '1';
      if (zone) {
        zone.replaceChildren();
        for (const c of configs) {
          const option = document.createElement('option');
          option.value = String(c.jardinera);
          option.textContent = c.nom_planta?.trim() || `Jardinera ${String(c.jardinera).padStart(2,'0')}`;
          zone.append(option);
        }
        if (configs.some(c => String(c.jardinera) === current)) zone.value = current;
      }
      renderSelected();
      await loadTelemetry();
    } catch(e) {setStatus(`No s’ha pogut carregar la configuració: ${e.message}`,true);}
  }
  async function loadTelemetry() {
    const selected = Number($('cada-zone')?.value || 1);
    try {
      const rows = await getPublic('telemetria_arduino',new URLSearchParams({
        select:'humitat_raw,created_at',jardinera:`eq.${selected}`,order:'created_at.desc',limit:'20'
      }));
      if (Number($('cada-zone')?.value || 1) !== selected) return;
      const nums = rows.map(r=>r.humitat_raw).filter(v=>Number.isInteger(v) && v>=0 && v<=4095);
      if (!nums.length) {setText('cada-cal-status','No s’han trobat lectures reals.');return;}
      const mean = nums.reduce((a,b)=>a+b,0)/nums.length;
      setText('cada-cal-mean', `${mean.toFixed(1)} RAW`);
      setText('cada-cal-range',`${Math.min(...nums)}–${Math.max(...nums)} RAW`);
      const last = rows[0];
      setText('cada-cal-last',`${last.humitat_raw} RAW`);
      const date = new Date(last.created_at);
      setText('cada-cal-status',`Darrera lectura: ${Number.isFinite(date.getTime()) ? date.toLocaleString('ca-ES') : 'data desconeguda'} · dades reals, només lectura.`);
    }catch(e){setText('cada-cal-status',`La telemetria no està disponible: ${e.message}`);}
  }
  async function init() {
    try {
      // Reutilitzar l'HTML del panell administratiu garanteix la mateixa interfície.
      const response = await fetch('control.html', {cache:'no-store'});
      if (!response.ok) throw new Error(`Control privat: HTTP ${response.status}`);
      const html = new DOMParser().parseFromString(await response.text(),'text/html');
      const privateArea = html.getElementById('auth-private');
      if (!privateArea) throw new Error('No s’ha trobat l’estructura del control privat.');
      privateArea.removeAttribute('hidden');
      privateArea.id = 'cg-guest-private';
      const form = privateArea.querySelector('#cada-settings-form');
      if (form) form.removeAttribute('hidden');
      // Ja és la versió publicada de Jekyll, amb les mateixes classes i CSS.
      ROOT.append(privateArea);
      readonlyUI();
      await loadConfig();
    } catch(e) {setStatus(`No s’ha pogut preparar la vista d’invitat: ${e.message}`,true);}
  }
  init();
})();
