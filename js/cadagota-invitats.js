/* CadaGota — Menú d'avatar, mode invitat i tancament de sessió.
 * Complementa cadagota-avatar.js sense alterar l'editor ni el control privat.
 */
(() => {
  'use strict';
  const profileName = document.querySelector('.cg-profile-name');
  const avatarButton = document.querySelector('.cg-avatar-button');
  const dialog = document.querySelector('.cg-avatar-dialog');
  if (!profileName || !avatarButton || !dialog) return;

  const URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const home = document.querySelector('.identity')?.href || location.origin + '/cada-gota/';
  const link = p => new URL(p, home).href;
  let client = null;
  let loggedIn = false;
  let guest = sessionStorage.getItem('cadagota_guest') === '1';
  let busy = false;

  const style = document.createElement('style');
  style.textContent = `
    .cg-profile-bar{position:relative}
    .cg-account-menu{position:absolute;top:calc(100% + 12px);right:0;z-index:101;width:min(265px,88vw);padding:7px;border:1px solid #b8cbc5;background:#fffaf0;color:#28525b;box-shadow:0 12px 30px #173a4933}
    .cg-account-menu[hidden]{display:none!important}
    .cg-account-menu button{font:inherit;font-size:.89rem;display:block;width:100%;text-align:left;color:#28525b;background:transparent;border:0;padding:12px;cursor:pointer}
    .cg-account-menu button:hover,.cg-account-menu button:focus-visible{background:#e7eee7}
    .cg-avatar-button{position:relative;overflow:visible!important}
    .cg-guest-tag{position:absolute;bottom:-8px;right:-11px;font:bold 8px Arial,sans-serif;letter-spacing:.04em;color:#52676a;background:#fffaf0;border:1px solid #8ea3a1;padding:2px 4px;white-space:nowrap;border-radius:2px}
    .cg-avatar-signout{margin-right:auto!important;border-color:#ad857c!important;color:#8e4c3e!important}
  `;
  document.head.append(style);
  const menu = document.createElement('div');
  menu.className = 'cg-account-menu';
  menu.hidden = true;
  avatarButton.parentElement.append(menu);

  function makeGuest() {
    if (!guest) return;
    profileName.textContent = 'Invitat';
    avatarButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170" role="img" aria-label="Gota invitat">
      <path d="M80 23 C67 46 31 72 31 105 C31 134 53 155 80 155 C107 155 129 134 129 105 C129 72 93 46 80 23 Z" fill="#bdc8c5" stroke="#718486" stroke-width="3"/>
      <circle cx="64" cy="85" r="3" fill="#596b6e"/><circle cx="96" cy="85" r="3" fill="#596b6e"/>
      <path d="M70 102 Q80 110 90 102" fill="none" stroke="#596b6e" stroke-width="3"/>
    </svg><span class="cg-guest-tag">INVITAT</span>`;
    avatarButton.title = 'Mode invitat · només lectura';
  }
  function add(label, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {menu.hidden = true;action();});
    menu.append(button);
  }
  function openEditor() {
    if (!loggedIn || guest) return;
    // Fer servir l'esdeveniment original: omple el formulari amb les dades desades.
    profileName.click();
  }
  async function signOut(destination = 'pages/control.html') {
    if (busy || !client) return;
    busy = true;
    try {
      const {error} = await client.auth.signOut();
      if (error) throw error;
      sessionStorage.removeItem('cadagota_guest');
      guest = false;
      dialog.close();
      location.href = link(destination);
    } catch(e) {
      alert('No s’ha pogut tancar sessió: ' + (e?.message || 'Error desconegut'));
    } finally {busy = false;}
  }
  // Canvi de rol segur, evitant una sessió d'administració en paral·lel.
  async function switchGuest() {
    if (busy) return;
    if (!loggedIn) {
      sessionStorage.setItem('cadagota_guest','1');
      location.href = link('pages/invitat.html');
      return;
    }
    busy = true;
    try {
      const {error} = await client.auth.signOut();
      if (error) throw error;
      sessionStorage.setItem('cadagota_guest','1');
      location.href = link('pages/invitat.html');
    } catch(e) {
      alert('No s’ha pogut canviar al mode invitat: '+(e?.message || 'Error desconegut'));
    } finally {busy = false;}
  }
  function refreshMenu() {
    menu.replaceChildren();
    if (guest) {
      add('Continuar com a invitat',()=>{location.href=link('pages/invitat.html');});
      add('Iniciar sessió',()=>{sessionStorage.removeItem('cadagota_guest');location.href=link('pages/control.html');});
      add('Sortir del mode invitat',()=>{sessionStorage.removeItem('cadagota_guest');location.href=link('');});
    } else if (loggedIn) {
      add('Personalitzar perfil',openEditor);
      add('Veure com a invitat',switchGuest);
      add('Tancar sessió',()=>signOut());
    } else {
      add('Iniciar sessió',()=>{location.href=link('pages/control.html');});
      add('Entrar com a invitat',switchGuest);
    }
  }
  avatarButton.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    refreshMenu();
    menu.hidden = !menu.hidden;
  },true);
  document.addEventListener('click',event=>{
    if (!event.target.closest('.cg-profile-bar')) menu.hidden = true;
  });
  document.addEventListener('keydown',event=>{
    if (event.key==='Escape') menu.hidden=true;
  });

  // Botó directament DINS de la finestra de personalització de l'avatar.
  const actions = dialog.querySelector('.cg-avatar-actions');
  if (actions) {
    const signoutButton = document.createElement('button');
    signoutButton.type = 'button';
    signoutButton.className = 'cg-avatar-signout';
    signoutButton.textContent = 'Tancar sessió';
    signoutButton.addEventListener('click',()=>signOut());
    actions.prepend(signoutButton);
  }

  async function init() {
    if (!window.supabase?.createClient) return;
    client = window.supabase.createClient(URL,KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
    });
    const {data} = await client.auth.getSession();
    loggedIn = Boolean(data?.session?.user);
    if (loggedIn && guest) {guest=false;sessionStorage.removeItem('cadagota_guest');}
    if (guest) makeGuest();
    client.auth.onAuthStateChange((_event,session)=>{
      loggedIn=Boolean(session?.user);
      if (loggedIn && guest) {guest=false;sessionStorage.removeItem('cadagota_guest');}
      else if (guest) makeGuest();
      menu.hidden=true;
    });
  }
  init();
})();
