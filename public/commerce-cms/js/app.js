/**
 * app.js — Arranque común de las páginas privadas del CMS.
 *
 * Toda página protegida hace lo mismo en el mismo orden:
 *   1. aplicar la marca del cliente
 *   2. verificar que hay credenciales de Supabase
 *   3. exigir sesión (o redirigir al login)
 *   4. montar el shell (sidebar + barra superior)
 *   5. revelar la interfaz
 *
 * Ese guion vive aquí una sola vez. Cada página solo aporta su contenido.
 */

import { CONFIG_ERROR, applyBranding, isConfigured } from '../supabase/config.js';
import { requireSession, watchAuth } from './auth.js';
import { fatalScreen, revealApp } from './core/ui.js';
import { renderShell } from './ui/layout.js';

/**
 * @param {{active: string, title: string, subtitle?: string,
 *          actions?: (Node|string)[]}} options
 * @returns {Promise<{session: object, user: object}|null>}
 *          null si la página no debe continuar (sin sesión o sin configurar).
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

  renderShell({ active, user: session.user, title, subtitle, actions });
  watchAuth();
  revealApp();

  return { session, user: session.user };
}
