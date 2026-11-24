/** CadaGota v16: telemetria de l'Arduino, lectura pública i només GET. */
(() => {
  'use strict';
  const url = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const key = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const root = document.getElementById('reg-telemetry');
  if (!root) return;
  const el = id => document.getElementById(id);
  const status = el('telemetry-status');
  const historyStatus = el('telemetry-history-status');
  const chart = el('telemetry-chart');
  const summary = el('telemetry-summary');
  const refresh = el('telemetry-refresh');
  const buttons = [...root.querySelectorAll('[data-telemetry-hours]')];
  const formatTime = value => new Intl.DateTimeFormat('ca-ES', {dateStyle:'short',timeStyle:'short'}).format(new Date(value));
  const formatNum = value => Number(value).toLocaleString('ca-ES',{maximumFractionDigits:1});
  let hours = 24;
  let loading = false;
  let lastRecord = null;
  let calibration = null;
  const percent = raw => {
    if (!calibration) return null;
    const value=100*(Number(raw)-calibration.raw_sec)/(calibration.raw_humit-calibration.raw_sec);
    return Math.max(0,Math.min(100,value));
  };
  async function loadCalibration() {
    try {
      const params=new URLSearchParams({select:'nom_planta,raw_sec,raw_humit',jardinera:'eq.1',limit:'1'});
      const rows=await readRows(`configuracio_reg?${params}`);
      const c=rows[0];
      if (!c) return;
      const name=(c.nom_planta || '').trim();
      el('telemetry-plant-label').textContent=name || 'Jardinera 01';
      if(Number.isInteger(c.raw_sec)&&Number.isInteger(c.raw_humit)&&Math.abs(c.raw_sec-c.raw_humit)>=20) {
        calibration=c;
        el('telemetry-calibration-note').textContent=`Índex d’humitat relatiu segons calibració: sec = ${c.raw_sec} RAW (0%), humit = ${c.raw_humit} RAW (100%). El valor pot no correspondre a la humitat volumètrica del sòl.`;
      } else {
        calibration=null;
        el('telemetry-calibration-note').textContent='Per obtenir un percentatge, configura la lectura RAW en sec i en humit per a la jardinera 01 al control privat. Sense calibració, mostrem les lectures RAW.';
      }
    } catch(e) {
      calibration=null;
      el('telemetry-calibration-note').textContent='No s’ha pogut consultar la calibració. Es mostren valors RAW.';
    }
  }

  async function readRows(query) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 12000);
    try {
      const result = await fetch(`${url}/rest/v1/${query.startsWith("configuracio_reg?") ? query : "telemetria_arduino?"+query}`, {
        headers:{apikey:key,Accept:'application/json'},
        cache:'no-store', signal:abort.signal
      });
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      const data = await result.json();
      if (!Array.isArray(data)) throw new Error('Resposta inesperada');
      return data;
    } finally {clearTimeout(timer);}
  }

  function renderLatest(row) {
    lastRecord = row;
    if (!row) {
      el('telemetry-raw').textContent = '—';
      el('telemetry-tank').textContent = '—';
      el('telemetry-pump').textContent = '—';
      el('telemetry-last').textContent = '—';
      el('telemetry-age').textContent = 'Encara no hi ha lectures de l’Arduino.';
      status.textContent = 'Sense lectures rebudes';
      status.dataset.state = 'empty';
      return;
    }
    const value = Number(row.humitat_raw);
    const p=percent(value);
    el('telemetry-raw').textContent = Number.isInteger(value) && value>=0 && value<=4095 ? (p===null ? String(value) + ' RAW' : `${formatNum(p)} %`) : '—';
    el('telemetry-raw-detail').textContent=p===null ? 'Calibració pendent · 0–4095 RAW' : `${value} RAW · Índex relatiu calibrat`;

    el('telemetry-tank').textContent = row.diposit_ok === true ? 'Aigua suficient' : row.diposit_ok === false ? 'Nivell insuficient' : 'Desconegut';
    el('telemetry-pump').textContent = row.bomba_activa === true ? 'Activada (declarat)' : row.bomba_activa === false ? 'Aturada (declarat)' : 'Desconegut';
    const date = new Date(row.created_at);
    el('telemetry-last').textContent = isNaN(date.getTime()) ? 'Data invàlida' : formatTime(row.created_at);
    updateFreshness();
  }

  function updateFreshness() {
    if (!lastRecord) return;
    const age = Date.now() - new Date(lastRecord.created_at).getTime();
    if (!Number.isFinite(age)) { status.textContent='Data de recepció invàlida'; status.dataset.state='error'; return; }
    const ageSeconds = Math.max(0,Math.floor(age/1000));
    const readable = ageSeconds<60 ? `Fa ${ageSeconds} segons` : ageSeconds<3600 ? `Fa ${Math.floor(ageSeconds/60)} minuts` : `Fa ${Math.floor(ageSeconds/3600)} h`;
    el('telemetry-age').textContent = `Última recepció: ${readable}.`;
    // No es pot provar una connexió Wi-Fi amb una fila de BD;
    // només detectar telemetria recent.
    if (age >= -30000 && age <= 90000) {
      status.textContent = 'Rebent dades recents de l’Arduino';
      status.dataset.state = 'recent';
    } else {
      status.textContent = 'Sense comunicació recent de l’Arduino';
      status.dataset.state = 'stale';
    }
  }

  function node(tag, attrs={}, text) {
    const element=document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs).forEach(([k,v])=>element.setAttribute(k,String(v)));
    if(text !== undefined) element.textContent=text;
    return element;
  }

  function stat(label,value) {
    const box=document.createElement('div');box.className='reg-history-stat';
    const a=document.createElement('span');a.textContent=label;
    const b=document.createElement('strong');b.textContent=value;
    box.append(a,b);return box;
  }

  function renderChart(rows,period) {
    chart.replaceChildren();summary.replaceChildren();
    const data=rows.map(row=>({time:new Date(row.created_at).getTime(), value:Number(row.humitat_raw)}))
      .filter(row=>Number.isFinite(row.time)&&Number.isInteger(row.value)&&row.value>=0&&row.value<=4095)
      .sort((a,b)=>a.time-b.time);
    if (!data.length) {
      const empty=document.createElement('p');empty.className='reg-empty';empty.textContent='No hi ha lectures en aquest període.';
      chart.append(empty);return;
    }
    for(const point of data) point.value = calibration ? percent(point.value) : point.value;
    const isPercent=Boolean(calibration);
    const unit=isPercent ? '%' : 'RAW';
    const min=Math.min(...data.map(d=>d.value));
    const max=Math.max(...data.map(d=>d.value));
    const pad=isPercent ? Math.max(5,(max-min)*0.15) : Math.max(30,(max-min)*0.15);
    const low=isPercent ? 0 : Math.max(0,Math.floor((min-pad)/10)*10);
    const high=isPercent ? 100 : Math.min(4095,Math.max(low+1,Math.ceil((max+pad)/10)*10));
    const plot={left:61,top:18,width:735,height:240};
    const now=Date.now();const start=now-period*3600000;
    const x=time=>plot.left+Math.max(0,Math.min(1,(time-start)/(now-start)))*plot.width;
    const y=val=>plot.top+plot.height-(val-low)/(high-low)*plot.height;
    const svg=node('svg',{viewBox:'0 0 830 310',role:'img','aria-label':`Lectures analògiques RAW de l’Arduino, de ${min} a ${max}, ${data.length} mostres`});
    svg.append(node('title',{},isPercent ? 'Evolució de la humitat relativa calibrada del sensor A0 (%)' : 'Evolució RAW del sensor A0, valors ADC de 0 a 4095'));
    for(let i=0;i<=4;i++) {
      const value=low+(high-low)*i/4;
      const yy=y(value);
      svg.append(node('line',{x1:plot.left,x2:plot.left+plot.width,y1:yy,y2:yy,stroke:'#d6deda','stroke-width':1}));
      svg.append(node('text',{x:plot.left-9,y:yy+5,'text-anchor':'end',class:'axis-label'},`${formatNum(value)}${isPercent ? '%' : ''}`));
    }
    const fmt=new Intl.DateTimeFormat('ca-ES',period<=24?{hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'short'});
    for(let i=0;i<=4;i++) {
      const time=start+(now-start)*i/4;
      svg.append(node('text',{x:x(time),y:plot.top+plot.height+27,'text-anchor':i===0?'start':i===4?'end':'middle',class:'axis-label'},fmt.format(new Date(time))));
    }
    if(data.length>1) svg.append(node('polyline',{points:data.map(d=>`${x(d.time).toFixed(2)},${y(d.value).toFixed(2)}`).join(' '),fill:'none',stroke:'#407e8c','stroke-width':3,'stroke-linejoin':'round','stroke-linecap':'round'}));
    const stride=Math.max(1,Math.ceil(data.length/130));
    for(let i=0;i<data.length && period<=1;i++) {
      if(i%stride!==0 && i!==data.length-1) continue;
      const d=data[i];const point=node('circle',{cx:x(d.time),cy:y(d.value),r:3.5,fill:'#407e8c',stroke:'#fffaf0','stroke-width':1});
      point.append(node('title',{},`${formatTime(new Date(d.time))} · ${formatNum(d.value)} ${unit}`));svg.append(point);
    }
    chart.append(svg);
    const sum=data.reduce((acc,d)=>acc+d.value,0);
    summary.append(stat('Lectures',String(data.length)),stat(`Mínim ${unit}`,`${formatNum(min)} ${unit}`),stat(`Màxim ${unit}`,`${formatNum(max)} ${unit}`),stat(`Mitjana ${unit}`,`${formatNum(sum/data.length)} ${unit}`));
  }

  async function load() {
    if(loading) return;
    loading=true;refresh.disabled=true;
    historyStatus.textContent='Carregant evolució…';
    try {
      const start=new Date(Date.now()-hours*3600000).toISOString();
      const recentQuery=new URLSearchParams({select:'humitat_raw,diposit_ok,bomba_activa,created_at',order:'created_at.desc',limit:'1'});
      const graphQuery=new URLSearchParams({select:'humitat_raw,created_at',created_at:`gte.${start}`,order:'created_at.desc',limit:'1000'});
      await loadCalibration();
      const [recent,history]=await Promise.all([readRows(recentQuery),readRows(graphQuery)]);
      renderLatest(recent[0]??null);
      renderChart(history,hours);
      historyStatus.textContent=history.length ? `${history.length} lectures reals · ${calibration ? 'percentatge relatiu calibrat' : 'RAW'} del sensor A0${history.length>=1000?' · Mostres limitades a les 1.000 més recents del període':''}` : 'Sense dades per al període seleccionat.';
    } catch(e) {
      status.textContent=`No s’ha pogut consultar la telemetria (${e.message}).`;
      status.dataset.state='error';
      historyStatus.textContent='No es pot carregar la gràfica. Comprova la connexió i els permisos de lectura de Supabase.';
      if(!lastRecord) renderLatest(null);
    } finally { loading=false;refresh.disabled=false; }
  }
  refresh.addEventListener('click',load);
  buttons.forEach(button=>button.addEventListener('click',()=>{
    hours=Number(button.dataset.telemetryHours);
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    load();
  }));
  load();
  setInterval(()=>{ if(!document.hidden) load(); },30000);
  setInterval(()=>{ if(!document.hidden) updateFreshness(); },15000);
})();
