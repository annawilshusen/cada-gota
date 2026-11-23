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
    async function loadSettings() {
      currentConfig=null;show(configForm,false);settingsInfo('Carregant la configuració…');
      const {data,error}=await client.from('configuracio_reg').select('jardinera,humitat_minima,humitat_maxima,mode_automatic,temps_maxim_segons').eq('jardinera',zoneNumber()).maybeSingle();
      if(error||!data){settingsInfo('No es pot consultar la configuració. Executa primer supabase/configuracio-reg-v14.sql al SQL Editor.',true);return;}
      currentConfig=data;
      minInput.value=data.humitat_minima;maxInput.value=data.humitat_maxima;
      durationInput.value=data.temps_maxim_segons;autoInput.checked=data.mode_automatic;
      show(configForm,true);settingsInfo('Configuració carregada de Supabase.');
      await loadActivity();
    }
    configForm.addEventListener('submit',async ev=>{
      ev.preventDefault();if(!currentConfig)return;
      const min=Number(minInput.value),max=Number(maxInput.value),secs=Number(durationInput.value);
      if(!Number.isInteger(min)||min<5||min>80||!Number.isInteger(max)||max>95||max<min+5||!Number.isInteger(secs)||secs<5||secs>120){settingsInfo('Comprova els llindars i el temps màxim.',true);return;}
      saveBtn.disabled=true;settingsInfo('Desant els canvis…');
      try{
        if(!(await hasAccess())){settingsInfo('La sessió ja no és vàlida o no tens permisos.',true);return;}
        const {data,error}=await client.from('configuracio_reg').update({humitat_minima:min,humitat_maxima:max,mode_automatic:autoInput.checked,temps_maxim_segons:secs}).eq('jardinera',zoneNumber()).select('jardinera,humitat_minima').maybeSingle();
        if(error||!data){settingsInfo('No s’han pogut desar els canvis. Comprova els permisos RLS.',true);return;}
        settingsInfo('Configuració desada correctament a Supabase.');
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
        await loadSettings();
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
