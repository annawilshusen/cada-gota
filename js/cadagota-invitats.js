
/*
 * CadaGota — Menú de perfil i mode invitat
 * Complement del fitxer cadagota-avatar.js.
 */

(() => {
  'use strict';

  const URL = 'https://zkzppfkjprwqdlyqkavt.supabase.co';
  const KEY = 'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';

  const nameButton = document.querySelector('.cg-profile-name');
  const avatarButton = document.querySelector('.cg-avatar-button');

  if (!nameButton || !avatarButton) return;

  const home = document.querySelector('.identity')?.href ||
    `${location.origin}/cada-gota/`;

  const page = path => new URL(path, home).href;
  const guestPage = page('pages/invitat.html');
  const loginPage = page('pages/control.html');

  const style = document.createElement('style');
  style.textContent = `
    .cg-profile-bar { position: relative; }

    .cg-account-menu {
      position: absolute;
      top: calc(100% + 14px);
      right: 0;
      z-index: 100;
      width: min(245px, 86vw);
      padding: 7px;
      background: #fffaf0;
      color: #28525b;
      border: 1px solid #b6cac2;
      box-shadow: 0 12px 30px rgba(15,55,61,.2);
    }

    .cg-account-menu[hidden] {
      display: none !important;
    }

    .cg-account-menu button,
    .cg-account-menu a {
      display: block;
      width: 100%;
      padding: 11px 12px;
      color: #28525b;
      background: transparent;
      border: 0;
      text-align: left;
      text-decoration: none;
      font: inherit;
      font-size: .88rem;
      cursor: pointer;
    }

    .cg-account-menu button:hover,
    .cg-account-menu a:hover {
      background: #e8eee7;
      opacity: 1;
    }

    .cg-account-menu .cg-account-divider {
      border-top: 1px solid #d5ded7;
      margin-top: 5px;
      padding-top: 12px;
    }

    .cg-guest-label {
      position: absolute;
      right: -7px;
      bottom: -8px;
      font-size: 8px;
      letter-spacing: .04em;
      font-weight: bold;
      background: #f7eee1;
      color: #536568;
      padding: 2px 4px;
      border: 1px solid #8ea3a1;
      border-radius: 3px;
    }

    .cg-avatar-button {
      position: relative;
      overflow: visible !important;
    }
  `;
  document.head.append(style);

  const menu = document.createElement('div');
  menu.className = 'cg-account-menu';
  menu.hidden = true;

  avatarButton.parentElement.append(menu);

  let client = null;
  let loggedIn = false;
  let guestMode = sessionStorage.getItem('cadagota_guest') === '1';

  function addAction(label, callback, extraClass = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (extraClass) button.className = extraClass;

    button.addEventListener('click', () => {
      menu.hidden = true;
      callback();
    });

    menu.append(button);
  }

  function openOriginalEditor() {
    // L'editor existent continua funcionant
    // quan el nom d'usuari és clicat des del menú.
    nameButton.click();
  }

  function drawGuest() {
    avatarButton.innerHTML = `
      <svg viewBox="0 0 160 170"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Avatar invitat">
        <path d="M80 23 C67 46 31 72 31 105
          C31 134 53 155 80 155
          C107 155 129 134 129 105
          C129 72 93 46 80 23 Z"
          fill="#bdc8c5"
          stroke="#718486"
          stroke-width="3"/>
        <circle cx="64" cy="86" r="3" fill="#596b6e"/>
        <circle cx="96" cy="86" r="3" fill="#596b6e"/>
        <path d="M70 102 Q80 109 90 102"
          fill="none" stroke="#596b6e"
          stroke-width="3"/>
      </svg>
      <span class="cg-guest-label">INVITAT</span>
    `;
    nameButton.textContent = 'Invitat';
  }

  function refreshMenu() {
    menu.replaceChildren();

    if (loggedIn) {
      addAction('Personalitzar el meu perfil', () => {
        // S'obre l'editor existent sense canviar el codi.
        const dialog = document.querySelector('.cg-avatar-dialog');
        if (dialog && !dialog.open) {
          dialog.showModal();
          // Per mantenir el formulari actualitzat,
          // el botó original també es pot utilitzar.
        }
      });

      addAction('Veure com a invitat', async () => {
        await enterGuest();
      });

      addAction('Tancar sessió', async () => {
        await signOut(false);
      }, 'cg-account-divider');

    } else {
      addAction('Iniciar sessió', () => {
        location.href = loginPage;
      });

      addAction('Entrar com a invitat', () => {
        guestMode = true;
        sessionStorage.setItem('cadagota_guest', '1');
        location.href = guestPage;
      });
    }
  }

  async function signOut(asGuest) {
    if (!client) return;

    const {error} = await client.auth.signOut();

    if (error) {
      alert('No s’ha pogut tancar la sessió.');
      return;
    }

    if (asGuest) {
      sessionStorage.setItem('cadagota_guest', '1');
      location.href = guestPage;
    } else {
      sessionStorage.removeItem('cadagota_guest');
      location.href = loginPage;
    }
  }

  async function enterGuest() {
    await signOut(true);
  }

  function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    refreshMenu();
    menu.hidden = !menu.hidden;
  }

  // Captura els clics abans del gestor anterior.
  avatarButton.addEventListener('click', toggleMenu, true);

  document.addEventListener('click', event => {
    if (!event.target.closest('.cg-profile-bar')) {
      menu.hidden = true;
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menu.hidden = true;
    }
  });

  async function init() {
    if (!window.supabase?.createClient) return;

    client = window.supabase.createClient(URL, KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });

    const {data} = await client.auth.getSession();

    loggedIn = Boolean(data?.session?.user);

    if (loggedIn) {
      sessionStorage.removeItem('cadagota_guest');
      guestMode = false;
    } else if (guestMode) {
      drawGuest();
    }

    client.auth.onAuthStateChange((_event, session) => {
      loggedIn = Boolean(session?.user);

      if (loggedIn) {
        guestMode = false;
        sessionStorage.removeItem('cadagota_guest');
      } else if (guestMode) {
        drawGuest();
      }

      menu.hidden = true;
    });
  }

  init();

})();
