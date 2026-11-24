
/*
 * CadaGota — Avatar v2
 * Perfil integrat a la navegació superior.
 * Personalització desada a Supabase Auth.
 * No modifica el sistema de reg.
 */

(() => {
  'use strict';

  const SUPABASE_URL =
    'https://zkzppfkjprwqdlyqkavt.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';

  const COLORS = {
    blau: '#83bac7',
    turquesa: '#6eada5',
    verd: '#9ebd91',
    rosa: '#e2abc0',
    lila: '#b9add5',
    crema: '#e9c995',
    coral: '#db9988'
  };

  const ACCESSORIES = {
    seed: 'Llavor al cap',
    laptop: 'Ordinador',
    glasses: 'Ulleres',
    tshirt: 'Girls In Tech',
    paper: 'Examen amb un 10',
    bow: 'Llaç',
    bee: 'Abella',
    cloud: 'Núvol'
  };

  const FACES = {
    happy: 'Somrient',
    cute: 'Ulls tancats',
    wink: 'Picant l’ullet',
    calm: 'Tranquil·la'
  };

  const DEFAULT = {
    color: 'blau',
    face: 'happy',
    accessories: []
  };

  let client = null;
  let currentUser = null;
  let avatar = {...DEFAULT, accessories: []};

  function safeAvatar(data) {
    const source = data || {};

    return {
      color: Object.hasOwn(COLORS, source.color)
        ? source.color
        : DEFAULT.color,

      face: Object.hasOwn(FACES, source.face)
        ? source.face
        : DEFAULT.face,

      accessories: Array.isArray(source.accessories)
        ? [...new Set(source.accessories)]
            .filter(x => Object.hasOwn(ACCESSORIES, x))
        : []
    };
  }

  // ==========================================
  // DIBUIX DE LA GOTA
  // ==========================================

  function drawAvatar(data) {
    const a = safeAvatar(data);
    const color = COLORS[a.color];
    const has = name => a.accessories.includes(name);

    let face = '';

    if (a.face === 'happy') {
      face = `
        <circle cx="64" cy="85" r="3" fill="#244d56"/>
        <circle cx="96" cy="85" r="3" fill="#244d56"/>
        <path d="M70 99 Q80 109 90 99"
          stroke="#244d56" stroke-width="3"
          stroke-linecap="round" fill="none"/>
      `;
    }

    if (a.face === 'cute') {
      face = `
        <path d="M58 86 Q64 80 70 86"
          stroke="#244d56" stroke-width="3"
          fill="none" stroke-linecap="round"/>
        <path d="M90 86 Q96 80 102 86"
          stroke="#244d56" stroke-width="3"
          fill="none" stroke-linecap="round"/>
        <path d="M75 100 Q80 104 85 100"
          stroke="#244d56" stroke-width="3"
          fill="none"/>
        <ellipse cx="54" cy="95" rx="8" ry="4"
          fill="#d98c99" opacity=".7"/>
        <ellipse cx="106" cy="95" rx="8" ry="4"
          fill="#d98c99" opacity=".7"/>
      `;
    }

    if (a.face === 'wink') {
      face = `
        <circle cx="64" cy="85" r="3" fill="#244d56"/>
        <path d="M90 85 L102 85"
          stroke="#244d56" stroke-width="3"
          stroke-linecap="round"/>
        <path d="M70 99 Q82 111 93 97"
          stroke="#244d56" stroke-width="3"
          fill="none" stroke-linecap="round"/>
      `;
    }

    if (a.face === 'calm') {
      face = `
        <path d="M58 86 Q64 90 70 86"
          stroke="#244d56" stroke-width="3"
          fill="none"/>
        <path d="M90 86 Q96 90 102 86"
          stroke="#244d56" stroke-width="3"
          fill="none"/>
        <path d="M75 101 Q80 104 85 101"
          stroke="#244d56" stroke-width="3"
          fill="none"/>
      `;
    }

    const seed = has('seed') ? `
      <path d="M80 32 Q75 18 82 13"
        stroke="#547b57" stroke-width="3"
        fill="none"/>
      <path d="M81 23 Q58 7 59 25 Q69 34 81 23"
        fill="#83a984"/>
      <path d="M82 19 Q101 6 101 24 Q92 31 82 19"
        fill="#5d956f"/>
    ` : '';

    const cloud = has('cloud') ? `
      <g transform="translate(104 0)">
        <path d="M8 28 Q0 26 3 17 Q6 9 15 12
          Q20 0 33 6 Q42 3 47 14
          Q61 14 59 26 Q57 34 47 34
          H14 Q7 34 8 28 Z"
          fill="#f9f7ee" stroke="#91afb0"
          stroke-width="2"/>
      </g>
    ` : '';

    const glasses = has('glasses') ? `
      <g fill="none" stroke="#765d48" stroke-width="3">
        <circle cx="64" cy="85" r="13"/>
        <circle cx="96" cy="85" r="13"/>
        <path d="M77 83 Q80 79 83 83"/>
        <path d="M51 83 L44 79 M109 83 L116 79"/>
      </g>
    ` : '';

    const tshirt = has('tshirt') ? `
      <g>
        <path d="M54 115 L40 120 L33 133 L45 140
          L50 135 L50 151 H110 V135
          L115 140 L127 133 L120 120 L106 115 Z"
          fill="#f7efdf" stroke="#557e82"
          stroke-width="2"/>
        <text x="80" y="132" text-anchor="middle"
          font-size="8" font-weight="bold"
          fill="#326d77">Girls In</text>
        <text x="80" y="142" text-anchor="middle"
          font-size="9" font-weight="bold"
          fill="#326d77">Tech</text>
      </g>
    ` : '';

    const bow = has('bow') ? `
      <g transform="translate(105 43)">
        <path d="M0 8 Q-20 -10 -20 8 Q-20 23 0 12
          Q20 25 20 8 Q20 -10 0 8 Z"
          fill="#dd8aa6" stroke="#a65d7b"
          stroke-width="2"/>
        <circle cx="0" cy="10" r="5" fill="#b96787"/>
      </g>
    ` : '';

    const laptop = has('laptop') ? `
      <g>
        <rect x="47" y="117" width="66" height="35"
          rx="3" fill="#658a93" stroke="#345d69"
          stroke-width="2"/>
        <path d="M40 153 H120 L115 159 H45 Z"
          fill="#a1afb0" stroke="#345d69"
          stroke-width="2"/>
        <path d="M80 126 L86 134 L80 141 L74 134 Z"
          fill="#e9f1eb"/>
      </g>
    ` : '';

    const paper = has('paper') ? `
      <g transform="rotate(12 125 125)">
        <rect x="110" y="105" width="31" height="42"
          rx="2" fill="#fffdf5"
          stroke="#9c9985" stroke-width="2"/>
        <text x="125" y="129" text-anchor="middle"
          font-size="20" font-weight="bold"
          fill="#c46e52">10</text>
        <path d="M116 135 H135"
          stroke="#d5b990" stroke-width="2"/>
      </g>
    ` : '';

    const bee = has('bee') ? `
      <g transform="translate(20 65)">
        <ellipse cx="0" cy="-9" rx="7" ry="5"
          fill="#e9f2f0" stroke="#9dbfc0"/>
        <ellipse cx="9" cy="-9" rx="7" ry="5"
          fill="#e9f2f0" stroke="#9dbfc0"/>
        <ellipse cx="5" cy="3" rx="12" ry="9"
          fill="#eac568" stroke="#7e6440"/>
        <path d="M1 -5 V11 M9 -5 V11"
          stroke="#655343" stroke-width="3"/>
        <circle cx="15" cy="1" r="1.5"
          fill="#332f2c"/>
      </g>
    ` : '';

    return `
      <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 170"
        role="img"
        aria-label="Avatar de gota personalitzada">

        ${cloud}

        <path d="M80 23
          C67 46 31 72 31 105
          C31 134 53 155 80 155
          C107 155 129 134 129 105
          C129 72 93 46 80 23 Z"
          fill="${color}"
          stroke="#416d77"
          stroke-width="3"/>

        <path d="M57 77 Q64 56 73 49"
          fill="none"
          stroke="#ffffff"
          stroke-opacity=".45"
          stroke-width="6"
          stroke-linecap="round"/>

        ${face}
        ${seed}
        ${glasses}
        ${tshirt}
        ${laptop}
        ${paper}
        ${bow}
        ${bee}
      </svg>
    `;
  }

  function drawGuestAvatar() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 170"
        role="img"
        aria-label="Gota grisa, sessió no iniciada">

        <path d="M80 23
          C67 46 31 72 31 105
          C31 134 53 155 80 155
          C107 155 129 134 129 105
          C129 72 93 46 80 23 Z"
          fill="#bcc5c3"
          stroke="#687c7e"
          stroke-width="3"/>

        <path d="M57 77 Q64 56 73 49"
          fill="none"
          stroke="#ffffff"
          stroke-opacity=".45"
          stroke-width="6"
          stroke-linecap="round"/>

        <circle cx="64" cy="87" r="3" fill="#647578"/>
        <circle cx="96" cy="87" r="3" fill="#647578"/>

        <path d="M73 104 Q80 99 87 104"
          fill="none"
          stroke="#647578"
          stroke-width="3"
          stroke-linecap="round"/>

        <circle cx="115" cy="127" r="18"
          fill="#f7eee2"
          stroke="#a16c6c"
          stroke-width="3"/>

        <path d="M108 120 L122 134
          M122 120 L108 134"
          stroke="#ae6b6b"
          stroke-width="4"
          stroke-linecap="round"/>
      </svg>
    `;
  }

  // ==========================================
  // ESTILS
  // ==========================================

  const style = document.createElement('style');

  style.textContent = `
    /* Perfil dins la mateixa barra blava */

    .site-header .cg-profile-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 9px;
      flex-shrink: 0;
      margin-left: 5px;
      color: var(--paper, #f6efdb);
    }

    .site-header .cg-profile-name {
      font: inherit;
      font-size: .85rem;
      font-weight: 600;
      color: inherit;
      background: transparent;
      border: 0;
      padding: 6px 2px;
      cursor: pointer;
      white-space: nowrap;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .site-header .cg-avatar-button {
      width: 44px;
      height: 44px;
      padding: 2px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.65);
      background: rgba(255,255,255,.12);
      cursor: pointer;
      flex-shrink: 0;
      overflow: hidden;
    }

    .site-header .cg-avatar-button svg {
      width: 100%;
      height: 100%;
    }

    .site-header .cg-avatar-button:hover,
    .site-header .cg-profile-name:hover {
      opacity: .8;
    }

    .site-header .main-nav {
      margin-left: auto;
    }

    /* Editor de l'avatar */

    .cg-avatar-dialog {
      width: min(620px, calc(100vw - 32px));
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid #98b2ae;
      background: #fffaf0;
      color: #28525b;
      padding: clamp(18px, 4vw, 32px);
      box-sizing: border-box;
    }

    .cg-avatar-dialog::backdrop {
      background: rgba(19,51,60,.55);
    }

    .cg-avatar-dialog h2 {
      font-family: Georgia, serif;
      font-size: clamp(1.6rem,4vw,2.2rem);
      margin: 0 0 8px;
    }

    .cg-avatar-preview {
      width: 190px;
      max-width: 100%;
      margin: 14px auto;
    }

    .cg-avatar-preview svg {
      display: block;
      width: 100%;
    }

    .cg-username-label {
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-weight: 700;
      margin: 18px 0;
    }

    .cg-username-label input {
      width: 100%;
      font: inherit;
      padding: 11px 12px;
      border: 1px solid #94aaa9;
      color: #244c55;
      background: #fffdf7;
    }

    .cg-avatar-field {
      border: 0;
      border-top: 1px solid #d4ded7;
      margin: 15px 0 0;
      padding: 14px 0 0;
    }

    .cg-avatar-field legend {
      font-weight: bold;
      padding-right: 10px;
    }

    .cg-avatar-options {
      display: flex;
      gap: 9px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    .cg-avatar-options label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      background: #f0ecdf;
      border: 1px solid #d7dbd0;
      cursor: pointer;
      font-size: .88rem;
    }

    .cg-avatar-options input {
      accent-color: #3d8291;
    }

    .cg-avatar-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 22px;
    }

    .cg-avatar-actions button {
      font: inherit;
      padding: 10px 17px;
      cursor: pointer;
      border: 1px solid #356976;
      color: #356976;
      background: transparent;
    }

    .cg-avatar-actions .cg-avatar-save {
      color: #fffaf0;
      background: #285c69;
    }

    .cg-avatar-actions button:disabled {
      opacity: .55;
      cursor: wait;
    }

    .cg-avatar-feedback {
      min-height: 1.5em;
      font-size: .85rem;
      margin-top: 10px;
    }

    /* Adaptació a tauletes i mòbils */

    @media (max-width: 930px) {
      .site-header .cg-profile-bar {
        margin-left: auto;
      }

      .site-header .menu-toggle {
        order: 3;
      }

      .site-header .main-nav {
        order: 4;
        margin-left: 0;
      }
    }

    @media (max-width: 550px) {
      .site-header .cg-profile-name {
        max-width: 95px;
        font-size: .75rem;
      }

      .site-header .cg-avatar-button {
        width: 36px;
        height: 36px;
      }

      .site-header .header-inner {
        gap: 8px;
      }
    }

    @media (max-width: 390px) {
      .site-header .cg-profile-name {
        max-width: 67px;
      }
    }
  `;

  document.head.append(style);

  // ==========================================
  // PERFIL A LA CAPÇALERA
  // ==========================================

  const headerInner =
    document.querySelector('.site-header .header-inner');

  if (!headerInner) return;

  const bar = document.createElement('div');
  bar.className = 'cg-profile-bar';

  const profileName = document.createElement('button');
  profileName.type = 'button';
  profileName.className = 'cg-profile-name';
  profileName.textContent = 'Iniciar sessió';

  const avatarButton = document.createElement('button');
  avatarButton.type = 'button';
  avatarButton.className = 'cg-avatar-button';

  bar.append(profileName, avatarButton);
  headerInner.append(bar);

  // ==========================================
  // EDITOR DE PERFIL
  // ==========================================

  const dialog = document.createElement('dialog');
  dialog.className = 'cg-avatar-dialog';

  const heading = document.createElement('h2');
  heading.textContent = 'La teva gota';

  const description = document.createElement('p');
  description.textContent =
    'Tria el teu nom d’usuari i personalitza la gota. ' +
    'Pots combinar diversos complements.';

  const usernameLabel = document.createElement('label');
  usernameLabel.className = 'cg-username-label';
  usernameLabel.textContent = 'Nom d’usuari';

  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.maxLength = 30;
  usernameInput.placeholder = 'Ex.: GotaCientifica';
  usernameInput.autocomplete = 'nickname';

  usernameLabel.append(usernameInput);

  const preview = document.createElement('div');
  preview.className = 'cg-avatar-preview';

  const form = document.createElement('form');

  form.addEventListener('submit', event => {
    event.preventDefault();
  });

  function fieldset(title) {
    const field = document.createElement('fieldset');
    field.className = 'cg-avatar-field';

    const legend = document.createElement('legend');
    legend.textContent = title;

    const options = document.createElement('div');
    options.className = 'cg-avatar-options';

    field.append(legend, options);
    form.append(field);

    return options;
  }

  // Colors

  const colorOptions = fieldset('Color de la gota');

  for (const [name, color] of Object.entries(COLORS)) {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = 'cg-avatar-color';
    input.value = name;

    const sample = document.createElement('span');
    sample.textContent =
      name.charAt(0).toUpperCase() + name.slice(1);

    sample.style.borderLeft = `6px solid ${color}`;
    sample.style.paddingLeft = '7px';

    label.append(input, sample);
    colorOptions.append(label);
  }

  // Expressions

  const faceOptions = fieldset('Expressió de la cara');

  for (const [name, text] of Object.entries(FACES)) {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = 'cg-avatar-face';
    input.value = name;

    label.append(input, text);
    faceOptions.append(label);
  }

  // Complements

  const accessoryOptions = fieldset('Complements');

  for (const [name, text] of Object.entries(ACCESSORIES)) {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'checkbox';
    input.value = name;
    input.dataset.avatarAccessory = name;

    label.append(input, text);
    accessoryOptions.append(label);
  }

  const feedback = document.createElement('p');
  feedback.className = 'cg-avatar-feedback';
  feedback.setAttribute('role', 'status');

  const actions = document.createElement('div');
  actions.className = 'cg-avatar-actions';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel·lar';

  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'cg-avatar-save';
  save.textContent = 'Desar el meu perfil';

  actions.append(cancel, save);
  form.append(actions, feedback);

  dialog.append(
    heading,
    description,
    usernameLabel,
    preview,
    form
  );

  document.body.append(dialog);

  // ==========================================
  // LECTURA I PREVISUALITZACIÓ
  // ==========================================

  function readForm() {
    return safeAvatar({
      color: form.querySelector(
        'input[name="cg-avatar-color"]:checked'
      )?.value,

      face: form.querySelector(
        'input[name="cg-avatar-face"]:checked'
      )?.value,

      accessories: [
        ...form.querySelectorAll(
          '[data-avatar-accessory]:checked'
        )
      ].map(input => input.value)
    });
  }

  function updatePreview() {
    preview.innerHTML = drawAvatar(readForm());
  }

  function fillForm(data) {
    const a = safeAvatar(data);

    const color = form.querySelector(
      `input[name="cg-avatar-color"][value="${a.color}"]`
    );

    const face = form.querySelector(
      `input[name="cg-avatar-face"][value="${a.face}"]`
    );

    if (color) color.checked = true;
    if (face) face.checked = true;

    form.querySelectorAll(
      '[data-avatar-accessory]'
    ).forEach(input => {
      input.checked = a.accessories.includes(input.value);
    });

    usernameInput.value =
      currentUser?.user_metadata?.cadagota_username || '';

    updatePreview();
  }

  form.addEventListener('change', updatePreview);

  // ==========================================
  // OBRIR PERFIL O INICIAR SESSIÓ
  // ==========================================

  function openProfile() {
    if (!currentUser) {
      // GitHub Pages publica el projecte a /cada-gota/.
      const rootLink = document.querySelector('.identity');
      const base = rootLink?.href || window.location.origin + '/';

      window.location.href =
        new URL('pages/control.html', base).href;

      return;
    }

    fillForm(avatar);
    feedback.textContent = '';

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  avatarButton.addEventListener('click', openProfile);
  profileName.addEventListener('click', openProfile);

  cancel.addEventListener('click', () => {
    dialog.close();
  });

  // ==========================================
  // DESAR PERFIL A SUPABASE AUTH
  // ==========================================

  save.addEventListener('click', async () => {
    if (!currentUser || !client) return;

    const username = usernameInput.value.trim();

    if (username.length < 2 || username.length > 30) {
      feedback.textContent =
        'El nom d’usuari ha de tenir entre 2 i 30 caràcters.';
      return;
    }

    const next = readForm();

    save.disabled = true;
    feedback.textContent = 'Desant el perfil…';

    try {
      const {data, error} = await client.auth.updateUser({
        data: {
          cadagota_avatar: next,
          cadagota_username: username
        }
      });

      if (error) throw error;

      currentUser = data.user || currentUser;
      avatar = next;

      profileName.textContent = username;
      avatarButton.innerHTML = drawAvatar(avatar);

      dialog.close();

    } catch (error) {
      feedback.textContent =
        'No s’ha pogut desar: ' +
        (error?.message || 'Error desconegut');

    } finally {
      save.disabled = false;
    }
  });

  // ==========================================
  // ESTAT DE LA SESSIÓ
  // ==========================================

  function showUser(user) {
    currentUser = user || null;

    if (!currentUser) {
      profileName.textContent = 'Iniciar sessió';
      profileName.title = 'Iniciar sessió';

      avatarButton.innerHTML = drawGuestAvatar();
      avatarButton.title = 'Iniciar sessió';

      avatarButton.setAttribute(
        'aria-label',
        'Iniciar sessió a CadaGota'
      );

      return;
    }

    avatar = safeAvatar(
      currentUser.user_metadata?.cadagota_avatar
    );

    const username =
      currentUser.user_metadata?.cadagota_username?.trim();

    profileName.textContent =
      username || 'El meu perfil';

    profileName.title =
      'Personalitzar el meu perfil';

    avatarButton.innerHTML = drawAvatar(avatar);
    avatarButton.title = 'Personalitzar avatar';

    avatarButton.setAttribute(
      'aria-label',
      'Personalitzar el meu perfil de CadaGota'
    );
  }

  // Mostrar la gota grisa mentre es consulta la sessió.
  showUser(null);

  // ==========================================
  // AUTENTICACIÓ SUPABASE
  // ==========================================

  async function init() {
    if (!window.supabase?.createClient) {
      console.warn(
        'CadaGota: no s’ha pogut carregar Supabase Auth.'
      );
      return;
    }

    client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }
    );

    const {data, error} = await client.auth.getSession();

    if (error) {
      console.warn(
        'No s’ha pogut recuperar la sessió:',
        error.message
      );
    }

    showUser(data?.session?.user || null);

    client.auth.onAuthStateChange((_event, session) => {
      showUser(session?.user || null);
    });
  }

  init();

})();

