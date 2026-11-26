
/*
 * CadaGota — Gestió de l'equip
 * Només les administradores principals poden convidar.
 * La validació definitiva es fa a l'Edge Function.
 */

(() => {
  'use strict';

  const URL_SUPABASE =
    'https://zkzppfkjprwqdlyqkavt.supabase.co';

  const KEY =
    'sb_publishable_L0fopg_qzpYaeOstUIIK-Q_muX1VMhp';

  const privatePanel = document.getElementById('auth-private');

  if (!privatePanel) return;

  const section = document.createElement('section');
  section.className = 'cada-settings-history';
  section.hidden = true;

  section.innerHTML = `
    <p class="kicker">GESTIÓ DE L'EQUIP</p>

    <h2>Equip CadaGota</h2>

    <p>
      Convida persones perquè puguin modificar les
      plantes i la configuració del reg.
      Només les administradores principals poden
      enviar invitacions.
    </p>

    <form id="cg-team-form" class="cada-auth-form"
      style="max-width:600px">
      <label for="cg-team-email">
        Correu electrònic de la persona
      </label>

      <input
        id="cg-team-email"
        type="email"
        autocomplete="email"
        placeholder="persona@exemple.com"
        required
      >

      <button id="cg-team-send" type="submit">
        Enviar invitació
      </button>
    </form>

    <p id="cg-team-message"
      class="cada-auth-message"
      role="status"
      aria-live="polite"
    ></p>

    <h3>Invitacions enviades</h3>
    <div id="cg-team-list"></div>
  `;

  const backLink = privatePanel.querySelector(
    '.cada-auth-back'
  );

  if (backLink) {
    backLink.before(section);
  } else {
    privatePanel.append(section);
  }

  const form = section.querySelector('#cg-team-form');
  const emailInput = section.querySelector('#cg-team-email');
  const sendButton = section.querySelector('#cg-team-send');
  const message = section.querySelector('#cg-team-message');
  const list = section.querySelector('#cg-team-list');

  let client = null;
  let isPrincipal = false;

  function inform(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('is-error', isError);
  }

  async function checkPermissions() {
    if (!client) return;

    section.hidden = true;
    isPrincipal = false;

    const {data: userResult, error: userError} =
      await client.auth.getUser();

    if (userError || !userResult?.user) return;

    const {data, error} = await client
      .from('administradores')
      .select('es_principal')
      .eq('user_id', userResult.user.id)
      .maybeSingle();

    if (error || data?.es_principal !== true) return;

    isPrincipal = true;
    section.hidden = false;

    await loadInvitations();
  }

  function renderInvitation(invitation) {
    const item = document.createElement('article');
    item.className = 'cada-activity-item';
    const email = document.createElement('strong');
    email.textContent = invitation.email;
    const status = document.createElement('p');
    const date = new Date(invitation.created_at).toLocaleDateString('ca-ES');
    status.textContent = `${invitation.estat} · ${date}`;
    item.append(email, status);
    return item;
  }

  async function loadInvitations() {
    if (!isPrincipal) return;
    await window.cadaGotaRecentList(list, (start, end) =>
      client.from('invitacions_administradors')
        .select('email,estat,created_at')
        .order('created_at', {ascending: false})
        .order('email', {ascending: true})
        .range(start, end),
      renderInvitation,
      {
        key: 'invitacions',
        loading: 'Carregant les invitacions…',
        error: 'No s’han pogut consultar les invitacions.',
        empty: 'Encara no has enviat cap invitació.',
        more: 'Veure totes les invitacions'
      });
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!isPrincipal || !client) return;

    const email = emailInput.value.trim();

    if (!email) return;

    sendButton.disabled = true;
    inform('Enviant invitació…');

    try {
      const {data: userResult, error: authError} =
        await client.auth.getUser();

      if (authError || !userResult?.user) {
        throw new Error(
          'La sessió ha caducat. Torna a iniciar sessió.'
        );
      }

      const {data, error} = await client.functions.invoke(
        'convidar-administrador',
        {
          body: {email}
        }
      );

      if (error) {
        let detail = error.message;

        if (error.context?.json) {
          const body = await error.context.json()
            .catch(() => null);

          detail = body?.error || detail;
        }

        throw new Error(detail);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      inform('Invitació enviada correctament!');
      emailInput.value = '';

      await loadInvitations();

    } catch (error) {
      inform(
        'No s’ha pogut enviar la invitació: ' +
        error.message,
        true
      );

    } finally {
      sendButton.disabled = false;
    }
  });

  async function init() {
    if (!window.supabase?.createClient) return;

    client = window.supabase.createClient(
      URL_SUPABASE,
      KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      }
    );

    await checkPermissions();

    client.auth.onAuthStateChange(() => {
      // Evitar consultes immediates dins del callback
      // d'autenticació de Supabase.
      setTimeout(checkPermissions, 0);
    });
  }

  init();

})();
