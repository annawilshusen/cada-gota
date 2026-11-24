/* CadaGota v24 — insígnies, rols decoratius i complements desbloquejables.
 * Els rols decoratius MAI concedeixen permisos Supabase.
 * Cor de CadaGota: només auth.app_metadata (servidor), no user_metadata.
 */
(() => {
  'use strict';
  const URL_SUPABASE='https://zkzppfkjprwqdlyqkavt.supabase.co';
  const KEY='sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const dialog=document.querySelector('.cg-avatar-dialog');
  const avatar=document.querySelector('.cg-avatar-button');
  const name=document.querySelector('.cg-profile-name');
  if(!dialog||!avatar||!name)return;
  const ROLES=['Administradora','Col·laborador','Col·laboradora','Professorat','Alumnat','Invitat'];
  const BADGES=[
    {id:'primera',name:'Primera gota',desc:'Has desat la teva primera gota personalitzada.',mode:'auto',gift:'Un petit brillant al costat de la gota'},
    {id:'projecte',name:'Descobrint CadaGota',desc:'Has visitat l’índex del projecte.',mode:'auto',gift:'Fons d’estrelles'},
    {id:'panell',name:'Observadora de dades',desc:'Has visitat el panell de reg real.',mode:'auto',gift:'Un distintiu d’observació'},
    {id:'girls',name:'Girls in Tech',desc:'Formes part de Girls in Tech o t’identifiques amb la seva missió.',mode:'claim',gift:'Samarreta Girls In Tech'},
    {id:'tdr',name:'He ajudat al TDR',desc:'Has ajudat en la recerca o el desenvolupament del treball.',mode:'claim',gift:'Ordinador i full amb un 10'},
    {id:'jornades',name:'Jornades de conscienciació',desc:'Has participat en les jornades de conscienciació.',mode:'claim',gift:'Núvol i flor'},
    {id:'nazaret',name:'Nazaret Cuida',desc:'Formes part de Nazaret Cuida.',mode:'claim',gift:'Abella'},
    {id:'tecnologia',name:'Entenc la tecnologia',desc:'Coneixes el funcionament del muntatge, l’Arduino i els sensors.',mode:'claim',gift:'Ulleres de científica'},
    {id:'teoria',name:'Entenc la teoria',desc:'Coneixes el marc teòric i els objectius del projecte.',mode:'claim',gift:'Llavor germinant'},
    {id:'cor',name:'Cor de CadaGota',desc:'Distinció especial concedida exclusivament per l’equip CadaGota.',mode:'team',gift:'Corona vegetal especial'}
  ];
  const UNLOCK={tshirt:'girls',laptop:'tdr',paper:'tdr',cloud:'jornades',bee:'nazaret',glasses:'tecnologia',seed:'teoria'};
  let client=null,user=null,saving=false,awarding=false;
  const own =()=>Array.isArray(user?.user_metadata?.cadagota_badges)?user.user_metadata.cadagota_badges.filter(id=>BADGES.some(b=>b.id===id&&b.mode!=='team')):[];
  const teamHeart=()=>user?.app_metadata?.cadagota_cor === true;
  const earned=()=>new Set([...own(),...(teamHeart()?['cor']:[])]);
  const badge=id=>BADGES.find(b=>b.id===id);
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function notify(title,detail){
    let host=document.getElementById('cg-badge-notifications');
    if(!host){host=el('div',undefined,'cg-badge-notifications');host.id='cg-badge-notifications';host.setAttribute('aria-live','polite');document.body.append(host);}
    const toast=el('div',undefined,'cg-badge-toast');const text=el('div');text.append(el('strong',title),el('p',detail));
    const close=el('button','×');close.type='button';close.setAttribute('aria-label','Tancar notificació');close.addEventListener('click',()=>toast.remove());toast.append(text,close);host.append(toast);
    // Sense notificacions externes, només a la web oberta.
    setTimeout(()=>toast.remove(),8000);
  }
  const css=document.createElement('style');css.textContent=`
    .cg-badges-dialog{width:min(700px,calc(100vw - 24px));max-height:88vh;overflow:auto;padding:clamp(20px,4vw,32px);border:1px solid #96b4ae;color:#244f58;background:#fffaf0;box-shadow:0 15px 44px #12334233}
    .cg-badges-dialog::backdrop{background:#12344388}
    .cg-badges-dialog h2{font:normal 2rem Georgia,serif;margin:0 0 8px}
    .cg-badges-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px 0}
    .cg-badge-card{border:1px solid #bed0c8;background:#f7f4ea;padding:14px;display:flex;flex-direction:column;gap:7px}
    .cg-badge-card strong{color:#275b64}.cg-badge-card p{margin:0;font-size:.88rem}.cg-badge-card small{color:#526c6d}
    .cg-badge-card button,.cg-badges-close,.cg-role-save{font:inherit;font-size:.86rem;padding:9px 12px;border:1px solid #386b76;background:#e6ede6;color:#28525b;cursor:pointer}
    .cg-badge-card button:disabled{opacity:.65;cursor:default}
    .cg-badge-card.is-earned{border-color:#739e89;background:#eef4e9}
    .cg-badge-notifications{position:fixed;right:18px;top:93px;z-index:9999;display:grid;gap:10px;width:min(350px,calc(100vw - 32px));pointer-events:none}
    .cg-badge-toast{pointer-events:auto;display:flex;justify-content:space-between;align-items:flex-start;gap:15px;padding:16px;border-left:4px solid #739e89;background:#fffaf0;color:#244f58;box-shadow:0 8px 28px #173a4933}
    .cg-badge-toast p{margin:4px 0 0;font-size:.85rem}.cg-badge-toast button{border:0;background:none;color:#244f58;font-size:1.3rem;cursor:pointer}
    .cg-role-field{display:grid;gap:7px;font-weight:700;margin:14px 0}
    .cg-role-field select{width:100%;padding:10px;border:1px solid #9fbab2;background:#fffdf7;font:inherit;color:#244f58}
    .cg-decor-field{border-top:1px solid #d3ded7;margin:15px 0 0;padding:13px 0 0;display:grid;gap:8px}
    .cg-decor-field label{display:flex;gap:8px;align-items:center;font-size:.88rem}
    .cg-avatar-options label.cg-locked{opacity:.6}
    .cg-profile-decoration{pointer-events:none}
    @media(max-width:550px){.cg-badges-list{grid-template-columns:1fr}.cg-badge-notifications{top:76px;right:10px}}
  `;document.head.append(css);

  // Modal independent del personalitzador.
  const badgesDialog=el('dialog',undefined,'cg-badges-dialog');
  badgesDialog.append(el('h2','Les meves insígnies'),el('p','Guanya o reclama insígnies, i desbloqueja complements per a la teva gota. Les insígnies reclamades per tu mateix no estan verificades per l’escola.'));
  const badgesList=el('div',undefined,'cg-badges-list');badgesDialog.append(badgesList);
  const badgesFeedback=el('p','');badgesFeedback.setAttribute('role','status');badgesDialog.append(badgesFeedback);
  const badgesClose=el('button','Tancar','cg-badges-close');badgesClose.type='button';badgesClose.addEventListener('click',()=>badgesDialog.close());badgesDialog.append(badgesClose);document.body.append(badgesDialog);
  function renderBadges(){
    badgesList.replaceChildren();const unlocked=earned();
    for(const b of BADGES){
      const card=el('article',undefined,'cg-badge-card'+(unlocked.has(b.id)?' is-earned':''));
      card.append(el('strong',b.name),el('p',b.desc),el('small','Desbloqueja: '+b.gift));
      const button=el('button',unlocked.has(b.id)?'Aconseguida':b.mode==='claim'?'Reclamar insígnia':b.mode==='team'?'Només equip CadaGota':'Automàtica');
      button.type='button';button.disabled=unlocked.has(b.id)||b.mode!=='claim'||saving||!user;
      if(!button.disabled)button.addEventListener('click',()=>claim(b.id));
      card.append(button);badgesList.append(card);
    }
  }
  window.addEventListener('cg:badges-open',()=>{if(!user)return;renderBadges();badgesFeedback.textContent='';if(!badgesDialog.open)badgesDialog.showModal();});
  async function updateMetadata(patch){if(!client||!user)throw Error('No tens una sessió iniciada');const {data,error}=await client.auth.updateUser({data:patch});if(error)throw error;user=data.user||user;return user;}
  async function claim(id){if(!user||saving||badge(id)?.mode!=='claim'||earned().has(id))return;
    saving=true;badgesFeedback.textContent='Desant la insígnia…';
    try{await updateMetadata({cadagota_badges:[...new Set([...own(),id])]});badgesFeedback.textContent='Insígnia aconseguida!';notify('Insígnia desbloquejada: '+badge(id).name,badge(id).gift);renderBadges();updateLocked();}
    catch(e){badgesFeedback.textContent='No s’ha pogut desar: '+(e?.message||'Error');}
    finally{saving=false;renderBadges();}
  }
  async function autoAward(){
    if(!user||awarding||saving)return;
    const current=earned(),add=[];
    if(user.user_metadata?.cadagota_avatar&&!current.has('primera'))add.push('primera');
    if(location.pathname.endsWith('/pages/projecte.html')&&!current.has('projecte'))add.push('projecte');
    if(location.pathname.endsWith('/pages/panell.html')&&!current.has('panell'))add.push('panell');
    if(!add.length)return;
    awarding=true;
    try{await updateMetadata({cadagota_badges:[...new Set([...own(),...add])]});for(const id of add)notify('Nova insígnia: '+badge(id).name,badge(id).gift);updateLocked();}
    catch(e){console.warn('CadaGota: no es poden desar les insígnies automàtiques',e);}
    finally{awarding=false;}
  }
  // Etiqueta de rol triada per la persona: només decorativa; no altera permisos RLS.
  const roleLabel=el('label','Etiqueta de rol (descriptiva, no dona permisos)','cg-role-field');
  const roleSelect=el('select');for(const role of ROLES){const opt=el('option',role);opt.value=role;roleSelect.append(opt);}roleLabel.append(roleSelect);
  const username=document.querySelector('.cg-username-label');if(username)username.after(roleLabel);
  // Més decoracions en ranures fixes: una opció al cap i una al voltant.
  const deco=el('fieldset',undefined,'cg-decor-field');const legend=el('legend','Decoracions especials (sense superposicions)');deco.append(legend);
  const headLabel=el('label','Complement al cap');const headSelect=el('select');
  for(const [value,label] of [['','Cap'],['flower','Flor · Jornades de conscienciació'],['crown','Corona vegetal · Cor de CadaGota']]){const o=el('option',label);o.value=value;headSelect.append(o);}headLabel.append(headSelect);deco.append(headLabel);
  const backLabel=el('label','Al voltant');const backSelect=el('select');
  for(const [value,label] of [['','Cap'],['stars','Petites estrelles · Descobrint CadaGota']]){const o=el('option',label);o.value=value;backSelect.append(o);}backLabel.append(backSelect);deco.append(backLabel);
  const options=dialog.querySelector('.cg-avatar-field:last-of-type');if(options)options.after(deco);else dialog.querySelector('form')?.append(deco);
  const form=dialog.querySelector('form');const saveButton=dialog.querySelector('.cg-avatar-save');const inputName=dialog.querySelector('input[autocomplete="nickname"]');
  const stateDecor=()=>({head:headSelect.value,around:backSelect.value});
  function validDecor(raw){const d=raw||{};const unlocked=earned();return {head:d.head==='crown'&&unlocked.has('cor')?'crown':d.head==='flower'&&unlocked.has('jornades')?'flower':'',around:d.around==='stars'&&unlocked.has('projecte')?'stars':''};}
  function renderDecoration(svgNode,decor){
    if(!svgNode)return;const d=validDecor(decor);const sign=`${d.head}:${d.around}`;
    const old=svgNode.querySelector('[data-cg-decor]');if(old?.getAttribute('data-sign')===sign)return;
    if(old)old.remove();
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('data-cg-decor','1');g.setAttribute('data-sign',sign);g.setAttribute('class','cg-profile-decoration');
    let code='';
    if(d.around==='stars')code+='<path d="M19 36 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z M137 63 l2 5 6 1 -4 4 1 6 -5 -3 -5 3 1 -6 -4 -4 6 -1z" fill="#e3b43d"/>';
    if(d.head==='flower')code+='<g transform="translate(82 24)"><path d="M0 0 C-20 -18 -25 0 -10 5 C-28 16 -8 28 0 12 C9 29 27 17 12 5 C29 -8 11 -17 0 0Z" fill="#efc1b1" stroke="#b9828a" stroke-width="1.4"/><circle cx="1" cy="6" r="6" fill="#e3b43d"/></g>';
    if(d.head==='crown')code+='<path d="M55 44 L56 25 L68 32 L81 13 L94 32 L106 25 L106 44Z" fill="#b9a96b" stroke="#71875f" stroke-width="2"/><circle cx="81" cy="29" r="4" fill="#f3e5b6"/>';
    g.innerHTML=code;svgNode.append(g);
  }
  let selectedDecor={head:'',around:''};
  function decorateCurrent(){
    const preview=dialog.querySelector('.cg-avatar-preview svg');renderDecoration(preview,stateDecor());
    renderDecoration(avatar.querySelector('svg'),selectedDecor);
  }
  headSelect.addEventListener('change',decorateCurrent);backSelect.addEventListener('change',decorateCurrent);
  const previewRoot=dialog.querySelector('.cg-avatar-preview');
  if(previewRoot){new MutationObserver(decorateCurrent).observe(previewRoot,{childList:true,subtree:false});}
  new MutationObserver(decorateCurrent).observe(avatar,{childList:true,subtree:false});
  function updateLocked(){
    const unlocked=earned();
    for(const [accessory,need] of Object.entries(UNLOCK)){
      const input=dialog.querySelector(`[data-avatar-accessory="${accessory}"]`);if(!input)continue;
      const allowed=unlocked.has(need);
      input.disabled=!allowed;
      if(!allowed)input.checked=false;
      const label=input.closest('label');if(label){label.classList.toggle('cg-locked',!allowed);label.title=allowed?'':`Es desbloqueja amb: ${badge(need).name}`;}
    }
    for(const opt of headSelect.options)opt.disabled=(opt.value==='flower'&&!unlocked.has('jornades'))||(opt.value==='crown'&&!unlocked.has('cor'));
    for(const opt of backSelect.options)opt.disabled=opt.value==='stars'&&!unlocked.has('projecte');
    selectedDecor=validDecor(user?.user_metadata?.cadagota_decoration);
    if(!dialog.open){headSelect.value=selectedDecor.head;backSelect.value=selectedDecor.around;}
    decorateCurrent();
  }
  // En obrir la personalització, carregar el rol i decoracions actuals.
  const originalShow=()=>{
    roleSelect.value=ROLES.includes(user?.user_metadata?.cadagota_role)?user.user_metadata.cadagota_role:'Alumnat';
    selectedDecor=validDecor(user?.user_metadata?.cadagota_decoration);
    headSelect.value=selectedDecor.head;backSelect.value=selectedDecor.around;updateLocked();
  };
  const openObserver=new MutationObserver(()=>{if(dialog.open)originalShow();});
  openObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
  // Protegir les peces bloquejades en guardar, encara que s'hagin alterat en DevTools.
  // La seguretat dels distintius especials és al servidor; els altres es poden reclamar.
  if(saveButton){saveButton.addEventListener('click',async event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(!user||saving)return;
    const usernameValue=(inputName?.value||'').trim();
    const feedback=dialog.querySelector('.cg-avatar-feedback');
    if(usernameValue.length<2||usernameValue.length>30){if(feedback)feedback.textContent='El nom d’usuari ha de tenir entre 2 i 30 caràcters.';return;}
    saving=true;saveButton.disabled=true;
    try{
      const color=form.querySelector('input[name="cg-avatar-color"]:checked')?.value||'blau';
      const face=form.querySelector('input[name="cg-avatar-face"]:checked')?.value||'happy';
      const extras=[...form.querySelectorAll('[data-avatar-accessory]:checked')].filter(i=>!i.disabled&&(!UNLOCK[i.value]||earned().has(UNLOCK[i.value]))).map(i=>i.value);
      // Ranura única: cabell/cap; ulleres; roba; mà; voltant.
      const slots=[['seed','bow'],['tshirt','laptop']];
      for(const group of slots){const present=group.filter(id=>extras.includes(id));for(const duplicate of present.slice(1))extras.splice(extras.indexOf(duplicate),1);}
      const next={color,face,accessories:extras};
      const hadFirst=earned().has('primera');
      const nextBadges=hadFirst?own():[...new Set([...own(),'primera'])];
      await updateMetadata({cadagota_username:usernameValue,cadagota_role:roleSelect.value,cadagota_avatar:next,cadagota_decoration:validDecor(stateDecor()),cadagota_badges:nextBadges});
      selectedDecor=validDecor(stateDecor());name.textContent=usernameValue;
      // Permetre als gestors d'auth ja existents refrescar l'avatar desat.
      if(dialog.open)dialog.close();
      if(!hadFirst)notify('Nova insígnia: Primera gota','Has personalitzat la teva primera gota.');
      updateLocked();
    }catch(e){if(feedback)feedback.textContent='No s’ha pogut desar el perfil: '+(e?.message||'Error');}
    finally{saving=false;saveButton.disabled=false;}
  },true);}
  async function init(){
    if(!window.supabase?.createClient)return;
    client=window.supabase.createClient(URL_SUPABASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data}=await client.auth.getSession();user=data?.session?.user||null;updateLocked();if(user)autoAward();
    client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;updateLocked();if(user)queueMicrotask(autoAward);else if(badgesDialog.open)badgesDialog.close();});
  }
  init();
})();
