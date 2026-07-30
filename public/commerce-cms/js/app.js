/**
 * app.js — Arranque común de las páginas privadas del CMS.
 *
 * Toda página protegida hace lo mismo en el mismo orden:
 *   1. aplicar la marca del cliente
 *   2. verificar que hay credenciales de Supabase
 *   3. exigir sesión (o redirigir al login)
 *   4. cargar el perfil y decidir en qué tienda se trabaja
 *   5. montar el shell (sidebar + barra superior)
 *   6. revelar la interfaz
 *
 * Ese guion vive aquí una sola vez. Cada página solo aporta su contenido.
 */

import { CONFIG_ERROR, applyBranding, isConfigured } from '../supabase/config.js';
import { requireSession, watchAuth } from './auth.js';
import { reportError } from './core/errors.js';
import { setSessionContext } from './core/session.js';
import { fatalScreen, revealApp } from './core/ui.js';
import { fetchProfile, listStores } from './services/profile.service.js';
import { renderShell } from './ui/layout.js';

/**
 * @param {{active: string, title: string, subtitle?: string,
 *          actions?: (Node|string)[]}} options
 * @returns {Promise<{session: object, user: object}|null>}
 *          null si la página no debe continuar (sin sesión, sin configurar o
 *          sin tienda asignada).
 */
export async function initPage({ active, title, subtitle = '', actions = [] }) {
  applyBranding();

  if (!isConfigured()) {
    fatalScreen({
      title: 'Falta conectar Supabase',
      message: CONFIG_ERROR,
      hint: 'commerce-cms/supabase/config.js',
    });
    return null;
  }

  const session = await requireSession();
  if (!session) return null; // requireSession ya redirigió al login

  const workspace = await loadWorkspace(session.user);
  if (!workspace) return null; // loadWorkspace ya explicó por qué

  renderShell({ active, user: session.user, title, subtitle, actions });
  watchAuth();
  revealApp();

  return { session, user: session.user };
}

/**
 * Averigua quién entró y en qué tienda va a trabajar.
 *
 * Una cuenta sin perfil es un estado real: alguien creó el usuario en Supabase
 * y olvidó asignarle tienda. Se explica en pantalla en lugar de dejar un panel
 * vacío que parece roto.
 *
 * @returns {Promise<boolean>} false si la página no debe continuar.
 */
async function loadWorkspace(user) {
  try {
    const profile = await fetchProfile(user.id);

    if (!profile) {
      fatalScreen({
        title: 'Tu cuenta aún no tiene acceso',
        message:
          'El usuario existe pero no está asignado a ninguna tienda. Pide al administrador que complete el alta.',
        hint: user.email ?? '',
      });
      return false;
    }

    // Un admin trabaja en su tienda; el super_admin elige entre todas.
    const stores =
      profile.role === 'super_admin'
        ? await listStores()
        : [profile.store].filter(Boolean);

    if (stores.length === 0) {
      fatalScreen({
        title: 'No hay ninguna tienda disponible',
        message:
          'Tu cuenta no tiene una tienda asociada, o la tienda fue eliminada. Contacta al administrador.',
        hint: user.email ?? '',
      });
      return false;
    }

    setSessionContext({ user, profile, stores });
    return true;
  } catch (error) {
    fatalScreen({
      title: 'No se pudo cargar tu cuenta',
      message: reportError('app:perfil', error),
    });
    return false;
  }
}
