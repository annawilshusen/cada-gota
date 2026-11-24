/* CadaGota v26 — perfil unificat i mode invitat sense compte. */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const name = document.querySelector('.cg-profile-name');
  const avatar = document.querySelector('.cg-avatar-button');
  const bar = document.querySelector('.cg-profile-bar');
  const editor = document.querySelector('.cg-avatar-dialog');
  if (!name || !avatar || !bar || !editor) return;

  const home = document.querySelector('.identity')?.href || new URL('/cada-gota/',location.origin).href;
  const page = path => new URL(path,home).href;
  const login = page('pages/control.html');
  let client = null, signedIn = false, changing = false, forwardOriginal = false;
  const guestGraphic = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170" role="img" aria-label="Gota invitat"><path d="M80 23 C67 46 31 72 31 105 C31 134 53 155 80 155 C107 155 129 134 129 105 C129 72 93 46 80 23 Z" fill="#bfc9c7" stroke="#667e82" stroke-width="3"/><path d="M57 78 Q64 58 73 49" fill="none" stroke="#fff" stroke-opacity=".46" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="86" r="3" fill="#526b70"/><circle cx="96" cy="86" r="3" fill="#526b70"/><path d="M71 102 Q80 109 89 102" stroke="#526b70" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  const style = document.createElement('style');
  style.textContent = `
    .site-header .cg-profile-bar{position:relative;display:flex;align-items:center;gap:6px;margin-left:5px;padding:3px 6px 3px 11px;border:1px solid transparent;border-radius:30px;cursor:pointer;transition:background .15s,border-color .15s}
    .site-header .cg-profile-bar:hover,.site-header .cg-profile-bar:focus-within{background:rgba(255,255,255,.17);border-color:rgba(255,255,255,.32)}
    .site-header .cg-profile-bar:hover .cg-profile-name,.site-header .cg-profile-bar:hover .cg-avatar-button{filter:brightness(1.17)}
    .cg-role-small{font-size:.67rem;color:#f6efdb;opacity:.82;white-space:nowrap}
    .site-header .cg-profile-identity-stack{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:0;min-width:0;line-height:1.18}
    .site-header .cg-profile-identity-stack .cg-profile-name{padding:0;text-align:left;max-width:195px}
    .site-header .cg-profile-identity-stack .cg-role-small{display:block;font-size:.72rem;font-weight:400;line-height:1.4;color:#f6efdb;opacity:.86;max-width:195px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

    .cg-profile-menu{position:absolute;top:calc(100% + 9px);right:0;z-index:101;min-width:215px;background:#fffaf0;border:1px solid #b5c9c0;box-shadow:0 12px 30px #173a4933;padding:6px;cursor:default}
    .cg-profile-menu[hidden]{display:none!important}
    .cg-profile-menu button{display:block;width:100%;text-align:left;font:inherit;font-size:.87rem;color:#28525b;background:none;border:0;padding:12px;cursor:pointer}
    .cg-profile-menu button:hover,.cg-profile-menu button:focus-visible{background:#e7eee7}
    .cg-avatar-signout{margin-right:auto!important;color:#944c43!important;border-color:#c5a098!important}
    .site-header .cg-avatar-button{overflow:hidden!important}
    @media(max-width:1040px){.site-header .cg-profile-identity-stack .cg-role-small{display:block}}
    @media(max-width:640px){.site-header .identity span{display:none!important}.site-header .cg-profile-identity-stack{display:none!important}.site-header .cg-profile-name{display:none!important}.site-header .cg-profile-bar{margin-left:auto;padding:2px 4px}.site-header .menu-toggle{order:3}.site-header .header-inner{gap:8px}.site-header .cg-avatar-button{width:38px;height:38px}}
    @media(max-width:380px){.site-header .header-inner{padding-inline:12px;gap:5px}.site-header .identity img{width:36px;height:36px}.site-header .cg-avatar-button{width:34px;height:34px}}
  `;
  document.head.append(style);
  const menu = document.createElement('div');menu.className='cg-profile-menu';menu.hidden=true;bar.append(menu);
  // Nom i rol apilats dins del mateix control conjunt amb l'avatar.
  const identityStack=document.createElement('span');
  identityStack.className='cg-profile-identity-stack';
  name.before(identityStack);
  identityStack.append(name);
  const roleTag=document.createElement('span');
  roleTag.className='cg-role-small';
  identityStack.append(roleTag);

  function showGuest(){name.textContent='Invitat';avatar.innerHTML=guestGraphic;avatar.title='Entrar amb un compte';roleTag.textContent='';}
  function directLogin(){
    const here = location.pathname + location.search + location.hash;
    // Si ja som a la pantalla d'entrada, no cal guardar el retorn.
    if(location.pathname.endsWith('/pages/control.html')){location.assign(login);return;}
    const target = new URL(login);
    target.searchParams.set('next',here);
    location.assign(target.href);
  }
  function add(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',e=>{e.stopPropagation();menu.hidden=true;action();});menu.append(b);}
  function openEditor(){forwardOriginal=true;try{name.click();}finally{forwardOriginal=false;}}
  async function signOut(){
    if(changing || !client)return;
    changing=true;menu.hidden=true;
    try{
      const {error}=await client.auth.signOut({scope:'local'});
      if(error)throw error;
      if(editor.open)editor.close();
      showGuest();
      // Si som al control privat, sortir-ne evita mostrar dades privades en memòria.
      if(location.pathname.endsWith('/pages/control.html'))location.replace(login);
      else location.reload();
    }catch(e){const f=editor.querySelector('.cg-avatar-feedback');if(f&&editor.open)f.textContent='No s’ha pogut tancar la sessió. Torna-ho a provar.';else console.error('CadaGota: signOut',e);}
    finally{changing=false;}
  }
  function toggle(e){
    if(forwardOriginal || e.target.closest('.cg-profile-menu'))return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(!signedIn){directLogin();return;}
    const open=!menu.hidden;menu.replaceChildren();add('Personalitzar perfil',openEditor);add('Les meves insígnies',()=>window.dispatchEvent(new Event('cg:badges-open')));add('Tancar sessió',signOut);menu.hidden=open;
  }
  // Captura al contenidor: text i icona es comporten com un únic botó.
  bar.addEventListener('click',toggle,true);
  document.addEventListener('click',e=>{if(!bar.contains(e.target))menu.hidden=true;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')menu.hidden=true;});
  const actions=editor.querySelector('.cg-avatar-actions');
  if(actions&&!actions.querySelector('.cg-avatar-signout')){const b=document.createElement('button');b.type='button';b.className='cg-avatar-signout';b.textContent='Tancar sessió';b.addEventListener('click',signOut);actions.prepend(b);}
  showGuest();
  async function init(){
    if(!window.supabase?.createClient)return;
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data}=await client.auth.getSession();
    updateSession(data?.session);
    client.auth.onAuthStateChange((_event,session)=>updateSession(session));
  }
  function updateSession(session){
    signedIn=Boolean(session?.user);
    if(!signedIn)showGuest();
    else roleTag.textContent=session.user.user_metadata?.cadagota_role||'';
    menu.hidden=true;
  }
  init();
})();
