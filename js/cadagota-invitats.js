/* CadaGota v23 — menú d'usuari, sortida segura i accés d'invitat.
 * Complement de cadagota-avatar.js. Sense permisos d'escriptura addicionals.
 */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';
  const profileName = document.querySelector('.cg-profile-name');
  const avatarButton = document.querySelector('.cg-avatar-button');
  const dialog = document.querySelector('.cg-avatar-dialog');
  const profileBar = document.querySelector('.cg-profile-bar');
  if (!profileName || !avatarButton || !dialog || !profileBar) return;

  const home = document.querySelector('.identity')?.href ||
    `${location.origin}/cada-gota/`;
  // Important: no anomenar cap constant URL; necessitem el constructor natiu.
  const link = path => new URL(path, home).href;
  const loginPage = link('pages/control.html');
  const guestPage = link('pages/invitat.html');
  const isGuestPage = location.pathname.endsWith('/pages/invitat.html');

  let client = null;
  let loggedIn = false;
  let busy = false;
  let allowOriginalClick = false;

  const style = document.createElement('style');
  style.textContent = `
    .site-header .cg-profile-bar {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0;
      margin-left: 5px;
      padding: 2px 5px 2px 10px;
      border: 1px solid transparent;
      border-radius: 28px;
      transition: background-color .15s ease, border-color .15s ease;
      cursor: pointer;
    }
    .site-header .cg-profile-bar:hover,
    .site-header .cg-profile-bar:focus-within {
      background: rgba(255,255,255,.17);
      border-color: rgba(255,255,255,.28);
    }
    .site-header .cg-profile-bar:hover .cg-profile-name,
    .site-header .cg-profile-bar:hover .cg-avatar-button,
    .site-header .cg-profile-bar:focus-within .cg-profile-name,
    .site-header .cg-profile-bar:focus-within .cg-avatar-button {
      filter: brightness(1.16);
      opacity: 1;
    }
    .site-header .cg-profile-name {
      margin-right: 8px;
      transition: filter .15s ease;
    }
    .site-header .cg-avatar-button {
      position: relative;
      overflow: visible !important;
      transition: filter .15s ease;
    }
    .cg-account-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      z-index: 101;
      width: min(235px, 86vw);
      padding: 6px;
      background: #fffaf0;
      color: #28525b;
      border: 1px solid #b8cbc5;
      box-shadow: 0 12px 30px #173a4933;
      cursor: default;
    }
    .cg-account-menu[hidden] { display: none !important; }
    .cg-account-menu button {
      display: block;
      width: 100%;
      text-align: left;
      font: inherit;
      font-size: .89rem;
      color: #28525b;
      background: transparent;
      border: none;
      padding: 12px;
      cursor: pointer;
    }
    .cg-account-menu button:hover,
    .cg-account-menu button:focus-visible { background: #e7eee7; }
    .cg-guest-tag {
      position: absolute;
      bottom: -8px;
      right: -11px;
      font: bold 8px Arial,sans-serif;
      letter-spacing: .04em;
      color: #52676a;
      background: #fffaf0;
      border: 1px solid #8ea3a1;
      padding: 2px 4px;
      white-space: nowrap;
      border-radius: 2px;
    }
    .cg-avatar-signout {
      margin-right: auto !important;
      border-color: #ad857c !important;
      color: #8e4c3e !important;
    }
    @media (max-width: 640px) {
      /* En pantalles estretes, identitat visual i botons han de cabre. */
      .site-header .identity span { display: none !important; }
      .site-header .cg-profile-name { display: none !important; }
      .site-header .cg-profile-bar {
        margin-left: auto;
        padding: 2px;
      }
      .site-header .header-inner { gap: 9px; }
      .site-header .menu-toggle { order: 3; }
      .site-header .cg-avatar-button { width: 39px; height: 39px; }
    }
    @media (max-width: 380px) {
      .site-header .header-inner { padding-left: 12px; padding-right: 12px; gap: 5px; }
      .site-header .identity img { width: 36px; height: 36px; }
      .site-header .cg-avatar-button { width: 34px; height: 34px; }
    }
  `;
  document.head.append(style);

  const menu = document.createElement('div');
  menu.className = 'cg-account-menu';
  menu.hidden = true;
  profileBar.append(menu);

  const guestSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 170"
    role="img" aria-label="Gota grisa de mode invitat">
    <path d="M80 23 C67 46 31 72 31 105 C31 134 53 155 80 155 C107 155 129 134 129 105 C129 72 93 46 80 23 Z"
      fill="#bdc8c5" stroke="#718486" stroke-width="3"/>
    <circle cx="64" cy="85" r="3" fill="#596b6e"/>
    <circle cx="96" cy="85" r="3" fill="#596b6e"/>
    <path d="M70 102 Q80 110 90 102" fill="none" stroke="#596b6e" stroke-width="3"/>
  </svg><span class="cg-guest-tag">INVITAT</span>`;

  function drawGuestIfNeeded() {
    if (!isGuestPage || loggedIn) return;
    profileName.textContent = 'Invitat';
    avatarButton.innerHTML = guestSvg;
    avatarButton.title = 'Mode invitat · només lectura';
    avatarButton.setAttribute('aria-label', 'Iniciar sessió');
  }

  function addAction(label, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', event => {
      event.stopPropagation();
      menu.hidden = true;
      callback();
    });
    menu.append(button);
  }

  function openOriginalEditor() {
    // Reutilitza el gestor original per carregar les preferències desades.
    allowOriginalClick = true;
    try {
      avatarButton.click();
    } finally {
      allowOriginalClick = false;
    }
  }

  async function signOut() {
    if (busy || !client) return;
    busy = true;
    menu.hidden = true;
    const signoutButton = dialog.querySelector('.cg-avatar-signout');
    if (signoutButton) signoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      sessionStorage.removeItem('cadagota_guest');
      if (dialog.open) dialog.close();
      // Una navegació real evita que el panell privat quedi visible amb dades antigues.
      location.replace(loginPage);
    } catch (error) {
      const feedback = dialog.querySelector('.cg-avatar-feedback');
      if (feedback && dialog.open) {
        feedback.textContent = 'No s’ha pogut tancar la sessió. Torna-ho a provar.';
      } else {
        console.error('CadaGota: error tancant sessió', error);
      }
    } finally {
      busy = false;
      if (signoutButton) signoutButton.disabled = false;
    }
  }

  function refreshMenu() {
    menu.replaceChildren();
    // No oferir mode invitat al perfil: només des de l'accés al control privat.
    if (loggedIn) {
      addAction('Personalitzar perfil', openOriginalEditor);
      addAction('Tancar sessió', signOut);
    }
  }

  // Un sol comportament per a nom i avatar, amb hover compartit.
  function onProfileClick(event) {
    if (allowOriginalClick) return;
    if (event.target.closest('.cg-account-menu')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (!loggedIn) {
      location.assign(loginPage);
      return;
    }
    const wasOpen = !menu.hidden;
    refreshMenu();
    menu.hidden = wasOpen;
  }
  profileName.addEventListener('click', onProfileClick, true);
  avatarButton.addEventListener('click', onProfileClick, true);
  document.addEventListener('click', event => {
    if (!profileBar.contains(event.target)) menu.hidden = true;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menu.hidden = true;
  });

  // Tancar sessió directament dins del diàleg de personalització.
  const actions = dialog.querySelector('.cg-avatar-actions');
  if (actions && !actions.querySelector('.cg-avatar-signout')) {
    const signoutButton = document.createElement('button');
    signoutButton.type = 'button';
    signoutButton.className = 'cg-avatar-signout';
    signoutButton.textContent = 'Tancar sessió';
    signoutButton.addEventListener('click', signOut);
    actions.prepend(signoutButton);
  }

  async function init() {
    if (!window.supabase?.createClient) return;
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    const { data, error } = await client.auth.getSession();
    if (error) console.warn('CadaGota: no es pot llegir la sessió', error);
    loggedIn = Boolean(data?.session?.user);
    drawGuestIfNeeded();
    client.auth.onAuthStateChange((_event, session) => {
      loggedIn = Boolean(session?.user);
      drawGuestIfNeeded();
      menu.hidden = true;
    });
  }
  init();
})();
