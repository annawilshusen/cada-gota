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

  const show = (element, visible) => { element.hidden = !visible; };
  const inform = (text, error = false) => {
    message.textContent = text;
    message.classList.toggle('is-error', error);
  };
  const signedOut = () => {
    show(form, true); show(privateArea, false); show(noAccess, false);
    password.value = '';
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
