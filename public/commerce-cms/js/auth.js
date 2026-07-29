/**
 * auth.js — Sesión del cliente: login, logout y protección de páginas.
 * Único punto del CMS que habla con Supabase Auth.
 *
 * La sesión la persiste supabase-js en localStorage (ver client.js), así que
 * sobrevive a recargas y cierres de pestaña, y el token se renueva solo.
 */

import { auth, supabase } from '../supabase/client.js';
import { ROUTES } from '../supabase/config.js';
import { AppError } from './core/errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Sesión activa, o null. Uso interno: las páginas llaman a requireSession. */
async function getSession() {
  const { data, error } = await auth().getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Inicia sesión con correo y contraseña.
 * Valida en cliente antes de gastar una petición de red.
 * @param {{email: string, password: string}} credentials
 */
export async function signIn({ email, password }) {
  const cleanEmail = String(email ?? '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new AppError('Escribe tu correo y tu contraseña.');
  }
  if (!EMAIL_RE.test(cleanEmail)) {
    throw new AppError('El correo no tiene un formato válido.');
  }

  const { data, error } = await auth().signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) throw error;
  return data.session;
}

/** Cierra la sesión y devuelve al login. */
export async function signOut({ redirect = true } = {}) {
  const { error } = await auth().signOut();
  if (error) throw error;
  if (redirect) goToLogin();
}

/**
 * Guardia de páginas privadas: si no hay sesión, redirige al login.
 * @returns {Promise<Session|null>} null cuando ya se disparó la redirección.
 */
export async function requireSession() {
  try {
    const session = await getSession();
    if (!session) {
      goToLogin();
      return null;
    }
    return session;
  } catch (error) {
    console.error('[commerce-cms] no se pudo leer la sesión', error);
    goToLogin();
    return null;
  }
}

/** Para el login: si ya hay sesión activa, entra directo al panel. */
export async function redirectIfAuthenticated() {
  try {
    const session = await getSession();
    if (session) {
      goToDashboard();
      return true;
    }
  } catch (error) {
    // Sin sesión válida: se queda en el login, que es el comportamiento correcto.
    console.warn('[commerce-cms] sesión no válida', error);
  }
  return false;
}

/**
 * Reacciona a cambios de sesión en caliente (logout en otra pestaña, token
 * revocado, contraseña cambiada). Sin esto, el usuario seguiría viendo el panel
 * con una sesión que ya no sirve.
 */
export function watchAuth() {
  if (!supabase) return () => {};

  const { data } = auth().onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
      goToLogin();
    }
  });

  return () => data.subscription.unsubscribe();
}

/** `replace` en vez de `href`: el botón "atrás" no vuelve a una página privada. */
function goToLogin() {
  if (!window.location.pathname.endsWith(ROUTES.login)) {
    window.location.replace(ROUTES.login);
  }
}

export function goToDashboard() {
  window.location.replace(ROUTES.dashboard);
}
