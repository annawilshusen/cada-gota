/**
 * CadaGota — inici de sessió i comprovació d'administradora.
 * Cap ordre de reg disponible. Permisos reals: Supabase RLS, NO aquest HTML.
 * La publishable key és pública. Mai no incloguis una secret key ni service_role.
 */
(() => {
  'use strict';
  const URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const root = document.getElementById('cada-auth');
  if (!root) return;
  const message = document.getElementById('auth-message');
  const form = document.getElementById('auth-form');
  const noAccess = document.getElementById('auth-no-access');
  const privateArea = document.getElementById('auth-private');
  const account = document.getElementById('auth-account');
  const submit = document.getElementById('auth-submit');
  const email = document.getElementById('auth-email');
  const password = document.getElementById('auth-password');
  let busy = false;
  let currentConfig = null;
  const configForm = document.getElementById('cada-settings-form');
  const configMsg = document.getElementById('cada-config-message');
  const zoneSel = document.getElementById('cada-zone');
  const historyRoot = document.getElementById('cada-activity');
  const saveBtn = document.getElementById('cada-save');
  const requestForm = document.getElementById('cada-request-form');
  const requestBtn = document.getElementById('cada-request-submit');
  const minInput = document.getElementById('cada-min');
  const maxInput = document.getElementById('cada-max');
  const durationInput = document.getElementById('cada-duration');
  const autoInput = document.getElementById('cada-auto');
  const plantNameInput = document.getElementById('cada-plant-name');
  const plantSpeciesInput = document.getElementById('cada-plant-species');
  const plantDateInput = document.getElementById('cada-plant-date');
  const plantNotesInput = document.getElementById('cada-plant-notes');
  const dryRawInput = document.getElementById('cada-raw-sec');
  const wetRawInput = document.getElementById('cada-raw-humit');
  const plantLabels = {1: 'Jardinera 01', 2: 'Jardinera 02'};
  function updatePlantLabels() {
    for (const select of [zoneSel, document.getElementById('cada-consumption-zone')]) {
      if (!select) continue;
      for (const option of select.options) {
        if (option.value === '1' || option.value === '2') {
          option.textContent = plantLabels[Number(option.value)];
        }
      }
    }
  }

  const settingsInfo = (s, error = false) => {configMsg.textContent=s;configMsg.classList.toggle('is-error',error);};

  const show = (element, visible) => { element.hidden = !visible; };
  const inform = (text, error = false) => {
    message.textContent = text;
    message.classList.toggle('is-error', error);
  };
  const signedOut = () => {
    show(form, true); show(privateArea, false); show(noAccess, false);
    password.value = '';
    show(configForm,false);
    inform('Inicia sessió amb el compte autoritzat de CadaGota.');
  };

  async function init() {
    if (!window.supabase?.createClient) {
      inform('No s’ha pogut carregar el sistema d’autenticació. Comprova la connexió a internet i torna a carregar la pàgina.', true);
      return;
    }
    const client = window.supabase.createClient(URL, KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });

    const hasAccess = async () => {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData?.user) return false;
      const {data, error} = await client.from('administradores').select('user_id').eq('user_id',userData.user.id).maybeSingle();
      return !error && Boolean(data);
    };
    const zoneNumber = () => Number(zoneSel.value);
    const fmtDate = v => new Intl.DateTimeFormat('ca-ES',{dateStyle:'short',timeStyle:'short'}).format(new Date(v));
    const activity = (label, date, detail) => {
      const div = document.createElement('article'); div.className='cada-activity-item';
      const header=document.createElement('strong');header.textContent=label;
      const small=document.createElement('time');small.textContent=fmtDate(date);
      const p=document.createElement('p');p.textContent=detail;
      div.append(header,small,p);return div;
    };
    async function loadActivity() {
      const zone=zoneNumber();
      historyRoot.replaceChildren();
      const [edits,requests]=await Promise.all([
        client.from('historial_configuracio_reg').select('created_at,humitat_minima_nova,humitat_maxima_nova,mode_automatic_nou,temps_maxim_segons_nou').eq('jardinera',zone).order('created_at',{ascending:false}).limit(15),
        client.from('solicituds_reg_prova').select('created_at,durada_segons,estat').eq('jardinera',zone).order('created_at',{ascending:false}).limit(15)
      ]);
      if(edits.error||requests.error){historyRoot.textContent='No es pot carregar l’historial. Revisa el SQL i els permisos.';return;}
      const all=[...(edits.data||[]).map(r=>({date:r.created_at,node:activity('Configuració modificada',r.created_at,`Llindars ${r.humitat_minima_nova}–${r.humitat_maxima_nova} %, mode ${r.mode_automatic_nou?'automàtic':'manual'}, màxim ${r.temps_maxim_segons_nou} s.`)})),...(requests.data||[]).map(r=>({date:r.created_at,node:activity('Sol·licitud simulada',r.created_at,`${r.durada_segons} segons; no enviada a l’Arduino.`)}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20);
      if(!all.length){historyRoot.textContent='Encara no hi ha activitat registrada.';return;}
      for(const item of all)historyRoot.append(item.node);
    }
    async function loadPlantLabels() {
      const {data,error} = await client.from('configuracio_reg').select('jardinera,nom_planta').in('jardinera',[1,2]);
      if (error) return;
      for (const item of data || []) {
        const name = (item.nom_planta || '').trim();
        plantLabels[item.jardinera] = name || `Jardinera ${String(item.jardinera).padStart(2,'0')}`;
      }
      updatePlantLabels();
    }
    async function loadSettings() {
      currentConfig=null;show(configForm,false);settingsInfo('Carregant la configuració…');
      const {data,error}=await client.from('configuracio_reg').select('jardinera,humitat_minima,humitat_maxima,mode_automatic,temps_maxim_segons,nom_planta,especie,data_plantacio,observacions,raw_sec,raw_humit').eq('jardinera',zoneNumber()).maybeSingle();
      if(error||!data){settingsInfo('No es pot consultar la configuració. Comprova que hagis executat supabase/plantes-editables-v17.sql i que tens permisos.',true);return;}
      currentConfig=data;
      minInput.value=data.humitat_minima;maxInput.value=data.humitat_maxima;
      durationInput.value=data.temps_maxim_segons;autoInput.checked=data.mode_automatic;
      plantNameInput.value=data.nom_planta ?? '';
      plantSpeciesInput.value=data.especie ?? '';
      plantDateInput.value=data.data_plantacio ?? '';
      plantNotesInput.value=data.observacions ?? '';
      dryRawInput.value=data.raw_sec ?? '';
      wetRawInput.value=data.raw_humit ?? '';
      show(configForm,true);settingsInfo('Configuració carregada de Supabase.');
      await loadActivity();
    }
    // v15 — Anàlisi privada dels esdeveniments de reg (només lectura, protegida per RLS).
    // El registre de sol·licituds de prova no és el mateix que un reg executat.
    const consumption = {
      root: document.getElementById('cada-consumption-results'),
      message: document.getElementById('cada-consumption-message'),
      source: document.getElementById('cada-consumption-source'),
      period: document.getElementById('cada-consumption-period'),
      zone: document.getElementById('cada-consumption-zone'),
      chart: document.getElementById('cada-consumption-chart'),
      comparison: document.getElementById('cada-consumption-comparison'),
      note: document.getElementById('cada-consumption-note'),
      refresh: document.getElementById('cada-consumption-refresh')
    };
    let consumptionRequest = 0;
    const formatLitres = value => value.toLocaleString('ca-ES', {minimumFractionDigits: 2, maximumFractionDigits: 3});
    const formatNumber = value => value.toLocaleString('ca-ES');
    const dayKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const hourKey = date => `${dayKey(date)}-${String(date.getHours()).padStart(2,'0')}`;
    const makeNode = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text !== undefined) el.textContent = text;
      return el;
    };
    function makeBar(parent,label,litres,max,kind) {
      const item=makeNode('div',kind==='chart'?'cada-consumption-column':'cada-consumption-compare-row');
      const bar=makeNode('div','cada-consumption-bar');
      const fill=makeNode('span','cada-consumption-bar-fill');
      fill.style.setProperty('--fill',`${max>0 ? Math.max(0,Math.min(100,litres/max*100)) : 0}%`);
      bar.append(fill);
      const amount=makeNode('span','cada-consumption-bar-value',`${formatLitres(litres)} L`);
      const name=makeNode('span','cada-consumption-bar-label',label);
      if(kind==='chart')item.append(amount,bar,name);
      else item.append(name,bar,amount);
      parent.append(item);
    }
    async function loadConsumption() {
      const ticket=++consumptionRequest;
      consumption.root.hidden=true;
      consumption.message.textContent='Consultant els esdeveniments de reg…';
      consumption.message.classList.remove('is-error');
      consumption.refresh.disabled=true;
      const period=consumption.period.value;
      const now=new Date();
      const start=new Date(now);
      if(period==='24')start.setHours(start.getHours()-24);
      else start.setDate(start.getDate()-Number(period));
      try {
        let query=client.from('esdeveniments_reg')
          .select('jardinera,inici,durada_segons,cabal_l_min,origen')
          .eq('origen',consumption.source.value)
          .gte('inici',start.toISOString())
          .lte('inici',now.toISOString())
          .order('inici',{ascending:false})
          .limit(1000);
        if(consumption.zone.value!=='all')query=query.eq('jardinera',Number(consumption.zone.value));
        const {data,error}=await query;
        if(ticket!==consumptionRequest)return;
        if(error)throw error;
        const rows=data||[];
        let total=0, valid=0, seconds=0;
        const zones=new Map([[1,0],[2,0]]);
        const daily=new Map();
        const buckets=[];
        if(period==='24') {
          for(let n=23;n>=0;n--){const d=new Date(now);d.setHours(d.getHours()-n,0,0,0);buckets.push({key:hourKey(d),label: n%3===0 || n===0 ? `${String(d.getHours()).padStart(2,'0')} h` : '·'});}
        } else {
          for(let n=Number(period)-1;n>=0;n--){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()-n);buckets.push({key:dayKey(d),label:period==='30'?`${d.getDate()}`:`${d.getDate()}/${d.getMonth()+1}`});}
        }
        for(const r of rows){
          const secs=Number(r.durada_segons);
          const flow=r.cabal_l_min===null?NaN:Number(r.cabal_l_min);
          seconds+=secs;
          if(!Number.isFinite(flow)||flow<=0)continue;
          const litres=flow*secs/60;
          if(!Number.isFinite(litres))continue;
          valid++;total+=litres;
          const zone=Number(r.jardinera);
          zones.set(zone,(zones.get(zone)||0)+litres);
          const time=new Date(r.inici);
          const key=period==='24'?hourKey(time):dayKey(time);
          daily.set(key,(daily.get(key)||0)+litres);
        }
        document.getElementById('cada-litres').textContent=formatLitres(total);
        document.getElementById('cada-events').textContent=formatNumber(rows.length);
        document.getElementById('cada-runtime').textContent=formatNumber(seconds);
        consumption.chart.replaceChildren();
        const max=Math.max(...buckets.map(b=>daily.get(b.key)||0),0);
        for(const b of buckets)makeBar(consumption.chart,b.label,daily.get(b.key)||0,max,'chart');
        consumption.chart.classList.toggle('is-month',period==='30');
        consumption.chart.setAttribute('aria-label',`Consum estimat de ${formatLitres(total)} litres durant el període seleccionat`);
        consumption.comparison.replaceChildren();
        const selection=consumption.zone.value;
        const selected=selection==='all'?[1,2]:[Number(selection)];
        const maxZone=Math.max(...selected.map(z=>zones.get(z)||0),0);
        for(const z of selected)makeBar(consumption.comparison,plantLabels[z] || `Jardinera ${String(z).padStart(2,'0')}`,zones.get(z)||0,maxZone,'compare');
        const missing=rows.length-valid;
        consumption.note.textContent=(consumption.source.value==='prova'
          ? 'Dades simulades: els litres no representen consum físic. '
          : 'Registres etiquetats com a Arduino: comprova’n l’origen i el cabal calibrat. ')
          +(missing?`${missing} esdeveniment(s) sense cabal vàlid no s’han inclòs al volum. `:'')
          +(rows.length===1000?'S’han recuperat com a màxim 1.000 registres; els totals poden ser incomplets. ':'')
          +'El volum és estimat: cabal × durada / 60.';
        consumption.message.textContent=rows.length
          ? 'Dades carregades correctament.'
          : 'No hi ha esdeveniments en aquesta selecció; el consum es mostra com a zero.';
        consumption.root.hidden=false;
      } catch(err) {
        if(ticket!==consumptionRequest)return;
        console.error('CadaGota: error consultant esdeveniments_reg',err);
        consumption.message.textContent='No es pot consultar el consum. Comprova la connexió i les polítiques RLS de la taula esdeveniments_reg.';
        consumption.message.classList.add('is-error');
      } finally {
        if(ticket===consumptionRequest)consumption.refresh.disabled=false;
      }
    }
    consumption.refresh.addEventListener('click',loadConsumption);
    [consumption.source,consumption.period,consumption.zone].forEach(sel=>sel.addEventListener('change',loadConsumption));
    configForm.addEventListener('submit',async ev=>{
      ev.preventDefault();if(!currentConfig)return;
      const min=Number(minInput.value),max=Number(maxInput.value),secs=Number(durationInput.value);
      if(!Number.isInteger(min)||min<5||min>80||!Number.isInteger(max)||max>95||max<min+5||!Number.isInteger(secs)||secs<5||secs>120){settingsInfo('Comprova els llindars i el temps màxim.',true);return;}
      saveBtn.disabled=true;settingsInfo('Desant els canvis…');
      try{
        if(!(await hasAccess())){settingsInfo('La sessió ja no és vàlida o no tens permisos.',true);return;}
        const name=plantNameInput.value.trim();
        const species=plantSpeciesInput.value.trim();
        const notes=plantNotesInput.value.trim();
        if (name.length>80 || species.length>120 || notes.length>1000) {
          settingsInfo('La fitxa de la planta supera la longitud permesa.', true); return;
        }
        const dryText=dryRawInput.value.trim(),wetText=wetRawInput.value.trim();
        if(Boolean(dryText)!==Boolean(wetText)) {
          settingsInfo('Cal introduir tant la lectura en sec com la lectura en humit.', true); return;
        }
        const rawSec=dryText ? Number(dryText) : null;
        const rawHumit=wetText ? Number(wetText) : null;
        if (rawSec!==null && (!Number.isInteger(rawSec)||!Number.isInteger(rawHumit)||rawSec<0||rawSec>4095||rawHumit<0||rawHumit>4095||Math.abs(rawSec-rawHumit)<20)) {
          settingsInfo('Calibració invàlida: valors de 0 a 4095 amb una diferència mínima de 20.', true);return;
        }
        const payload={
          humitat_minima:min,humitat_maxima:max,
          mode_automatic:autoInput.checked,temps_maxim_segons:secs,
          nom_planta:name || null,especie:species || null,
          data_plantacio:plantDateInput.value || null,
          observacions:notes || null,
          raw_sec:rawSec,raw_humit:rawHumit
        };
        const {data,error}=await client.from('configuracio_reg').update(payload).eq('jardinera',zoneNumber()).select('jardinera,humitat_minima').maybeSingle();
        if(error||!data){settingsInfo('No s’han pogut desar els canvis. Comprova els permisos RLS.',true);return;}
        settingsInfo('Configuració desada correctament a Supabase.');
        await loadPlantLabels();
        await loadSettings();
      }catch(e){settingsInfo('Problema de connexió en desar la configuració.',true);}finally{saveBtn.disabled=false;}
    });
    requestForm.addEventListener('submit',async ev=>{
      ev.preventDefault();const secs=Number(document.getElementById('cada-request-seconds').value);
      if(!Number.isInteger(secs)||secs<1||secs>30){settingsInfo('La durada de prova ha de ser entre 1 i 30 segons.',true);return;}
      requestBtn.disabled=true;settingsInfo('Registrant simulació…');
      try{
        if(!(await hasAccess())){settingsInfo('No tens una sessió d’administradora vàlida.',true);return;}
        const {error}=await client.from('solicituds_reg_prova').insert({jardinera:zoneNumber(),durada_segons:secs});
        if(error){settingsInfo('No s’ha pogut registrar la prova. Revisa el SQL de configuració.',true);return;}
        settingsInfo('Sol·licitud simulada registrada. No s’ha enviat cap ordre a la bomba.');
        await loadActivity();
      }catch(e){settingsInfo('Error de connexió en registrar la prova.',true);}finally{requestBtn.disabled=false;}
    });
    zoneSel.addEventListener('change',loadSettings);
    document.getElementById('cada-reload').addEventListener('click',loadSettings);

    async function verify() {
      show(form, false); show(privateArea, false); show(noAccess, false);
      inform('Comprovant la sessió i els permisos…');
      try {
        // getUser valida el JWT amb el servidor, no confia només en l'emmagatzematge local.
        const { data: userResult, error: userError } = await client.auth.getUser();
        if (userError || !userResult?.user) { signedOut(); return; }
        const user = userResult.user;
        const { data: member, error: memberError } = await client
          .from('administradores')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (memberError) {
          inform('No s’han pogut comprovar els permisos. Revisa la taula administradores i les polítiques RLS.', true);
          return;
        }
        if (!member) {
          inform('No tens permís d’administració amb aquest compte.', true);
          show(noAccess, true);
          return;
        }
        account.textContent = user.email || 'Compte autoritzat';
        inform('Accés verificat correctament.');
        show(privateArea, true);
        await loadPlantLabels();
        await Promise.all([loadSettings(),loadConsumption()]);
      } catch (e) {
        inform('Error de connexió amb Supabase. Torna-ho a provar més tard.', true);
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      busy = true;
      submit.disabled = true;
      inform('Iniciant sessió…');
      try {
        const { error } = await client.auth.signInWithPassword({
          email: email.value.trim(), password: password.value
        });
        password.value = '';
        if (error) {
          inform('No s’ha pogut iniciar sessió. Comprova el correu i la contrasenya (i que el compte estigui confirmat).', true);
        } else {
          await verify();
        }
      } catch (e) {
        inform('No es pot contactar amb Supabase en aquest moment.', true);
      } finally {
        busy = false;
        submit.disabled = false;
      }
    });

    root.querySelectorAll('[data-signout]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          const { error } = await client.auth.signOut();
          if (error) throw error;
          signedOut();
        } catch (e) {
          inform('No s’ha pogut tancar la sessió. Torna-ho a provar.', true);
        } finally { button.disabled = false; }
      });
    });
    await verify();
  }
  init();
})();
