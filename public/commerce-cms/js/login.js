/**
 * login.js — Controlador de index.html (pantalla de acceso).
 *
 * Solo interfaz: la lógica de sesión vive en auth.js.
 */

import { CONFIG_ERROR, applyBranding, isConfigured } from '../supabase/config.js';
import { goToDashboard, redirectIfAuthenticated, signIn } from './auth.js';
import { $ } from './core/dom.js';
import { reportError } from './core/errors.js';
import { fatalScreen, revealApp, setInlineAlert, setLoading } from './core/ui.js';
import { icon, paintIcons } from './ui/icons.js';

async function main() {
  applyBranding();
  paintIcons();

  if (!isConfigured()) {
    fatalScreen({
      title: 'Falta conectar Supabase',
      message: CONFIG_ERROR,
      hint: 'commerce-cms/supabase/config.js',
    });
    return;
  }

  // Si la sesión sigue viva, no tiene sentido pedir la contraseña otra vez.
  const redirected = await redirectIfAuthenticated();
  if (redirected) return;

  revealApp();
  wireForm();
  wirePasswordToggle();
  $('#email')?.focus();
}

function wireForm() {
  const form = $('#login-form');
  const alertBox = $('#login-alert');
  const submit = $('#login-submit');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setInlineAlert(alertBox, null);
    setLoading(submit, true);

    try {
      await signIn({
        email: $('#email').value,
        password: $('#password').value,
      });

      // No se quita el loading a propósito: la página se está reemplazando.
      goToDashboard();
    } catch (error) {
      const message = reportError('login', error, 'No se pudo iniciar sesión.');
      setInlineAlert(alertBox, message);
      setLoading(submit, false);

      $('#password').value = '';
      $('#password').focus();
    }
  });
}

/** Ojo para mostrar/ocultar la contraseña. */
function wirePasswordToggle() {
  const button = $('#toggle-password');
  const input = $('#password');
  if (!button || !input) return;

  button.addEventListener('click', () => {
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.innerHTML = icon(visible ? 'eye' : 'eyeOff', { size: 17 });
    button.setAttribute(
      'aria-label',
      visible ? 'Mostrar contraseña' : 'Ocultar contraseña',
    );
    input.focus();
  });
}

main();
