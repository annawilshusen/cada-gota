
/*
 * CadaGota — Avatar personalitzable
 * Guarda les preferències a Supabase Auth.
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

  const DEFAULT = {
    color: 'blau',
    face: 'happy',
    accessories: []
  };

  let client;
  let currentUser = null;
  let avatar = {...DEFAULT, accessories: []};

  function safeAvatar(data) {
    const source = data || {};

    return {
      color: COLORS[source.color]
        ? source.color
        : DEFAULT.color,

      face: ['happy', 'cute', 'wink', 'calm']
        .includes(source.face)
        ? source.face
        : DEFAULT.face,

      accessories: Array.isArray(source.accessories)
        ? [...new Set(source.accessories)]
            .filter(x => ACCESSORIES[x])
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

  // ==========================================
  // ESTILS
  // ==========================================

  const style = document.createElement('style');

  style.textContent = `
    .cg-profile-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding: 8px clamp(16px, 5vw, 65px);
      background: #e8ecdf;
      border-bottom: 1px solid #b6c9c6;
      color: #28525b;
    }

    .cg-profile-bar[hidden] {
      display: none !important;
    }

    .cg-profile-email {
      font-size: .85rem;
      overflow-wrap: anywhere;
    }

    .cg-avatar-button {
      width: 52px;
      height: 52px;
      padding: 2px;
      background: #fffaf0;
      border: 2px solid #94b6b4;
      border-radius: 50%;
      cursor: pointer;
      display: grid;
      place-items: center;
    }

    .cg-avatar-button svg {
      width: 100%;
      height: 100%;
    }

    .cg-avatar-button:hover,
    .cg-avatar-button:focus-visible {
      border-color: #286b78;
      outline-offset: 3px;
    }

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
      background: rgba(19, 51, 60, .55);
    }

    .cg-avatar-dialog h2 {
      font-family: Georgia, serif;
      font-size: clamp(1.6rem, 4vw, 2.2rem);
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

    .cg-avatar-feedback {
      min-height: 1.5em;
      font-size: .85rem;
      margin-top: 10px;
    }

    @media (max-width: 500px) {
      .cg-profile-bar {
        justify-content: center;
      }

      .cg-profile-email {
        font-size: .75rem;
      }
    }
  `;

  document.head.append(style);

  // ==========================================
  // BARRA DE PERFIL
  // ==========================================

  const header = document.querySelector('.site-header');

  if (!header) return;

  const bar = document.createElement('div');
  bar.className = 'cg-profile-bar';
  bar.hidden = true;

  const emailLabel = document.createElement('span');
  emailLabel.className = 'cg-profile-email';

  const avatarButton = document.createElement('button');
  avatarButton.type = 'button';
  avatarButton.className = 'cg-avatar-button';
  avatarButton.title = 'Personalitzar avatar';
  avatarButton.setAttribute(
    'aria-label',
    'Personalitzar avatar de CadaGota'
  );

  bar.append(emailLabel, avatarButton);
  header.insertAdjacentElement('afterend', bar);

  // ==========================================
  // EDITOR
  // ==========================================

  const dialog = document.createElement('dialog');
  dialog.className = 'cg-avatar-dialog';

  const heading = document.createElement('h2');
  heading.textContent = 'La teva gota';

  const description = document.createElement('p');
  description.textContent =
    'Personalitza la teva gota de CadaGota. ' +
    'Pots combinar diversos complements.';

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

  const faceOptions = fieldset('Expressió de la cara');

  const faces = {
    happy: 'Somrient',
    cute: 'Ulls tancats',
    wink: 'Picant l’ullet',
    calm: 'Tranquil·la'
  };

  for (const [name, text] of Object.entries(faces)) {
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.type = 'radio';
    input.name = 'cg-avatar-face';
    input.value = name;

    label.append(input, text);
    faceOptions.append(label);
  }

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
  save.textContent = 'Desar la meva gota';

  actions.append(cancel, save);
  form.append(actions, feedback);

  dialog.append(heading, description, preview, form);
  document.body.append(dialog);

  function readForm() {
    return safeAvatar({
      color:
        form.querySelector(
          'input[name="cg-avatar-color"]:checked'
        )?.value,

      face:
        form.querySelector(
          'input[name="cg-avatar-face"]:checked'
        )?.value,

      accessories: [
        ...form.querySelectorAll(
          '[data-avatar-accessory]:checked'
        )
      ].map(input => input.value)
    });
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

    updatePreview();
  }

  function updatePreview() {
    preview.innerHTML = drawAvatar(readForm());
  }

  form.addEventListener('change', updatePreview);

  avatarButton.addEventListener('click', () => {
    fillForm(avatar);
    feedback.textContent = '';
    dialog.showModal();
  });

  cancel.addEventListener('click', () => {
    dialog.close();
  });

  save.addEventListener('click', async () => {
    if (!currentUser || !client) return;

    const next = readForm();

    save.disabled = true;
    feedback.textContent = 'Desant la personalització…';

    try {
      const {data, error} = await client.auth.updateUser({
        data: {
          cadagota_avatar: next
        }
      });

      if (error) throw error;

      currentUser = data.user || currentUser;
      avatar = next;

      avatarButton.innerHTML = drawAvatar(avatar);

      feedback.textContent =
        'Avatar desat correctament!';

      dialog.close();

    } catch (error) {
      feedback.textContent =
        'No s’ha pogut desar: ' + error.message;

    } finally {
      save.disabled = false;
    }
  });

  // ==========================================
  // AUTENTICACIÓ
  // ==========================================

  function showUser(user) {
    currentUser = user || null;

    if (!user) {
      bar.hidden = true;
      return;
    }

    avatar = safeAvatar(
      user.user_metadata?.cadagota_avatar
    );

    emailLabel.textContent = user.email || 'Usuari';
    avatarButton.innerHTML = drawAvatar(avatar);

    bar.hidden = false;
  }

  async function init() {
    if (!window.supabase?.createClient) return;

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

    const {data: sessionData} =
      await client.auth.getSession();

    showUser(sessionData?.session?.user || null);

    client.auth.onAuthStateChange((_event, session) => {
      showUser(session?.user || null);
    });
  }

  init();

})();
