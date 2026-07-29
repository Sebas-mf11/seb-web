/**
 * client.js — Instancia única (singleton) del cliente de Supabase.
 * =============================================================================
 * La librería se importa como ES Module desde CDN con la versión FIJADA, para
 * que una actualización remota no rompa el panel en producción.
 *
 * Ningún otro archivo debe llamar a createClient(): todos pasan por db(),
 * auth() o storage(). Un solo punto de configuración, un solo punto de fallo.
 * =============================================================================
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.111.0/+esm';
import { CONFIG_ERROR, SUPABASE_CONFIG, isConfigured } from './config.js';

/**
 * Cliente de Supabase, o null si el CMS todavía no tiene credenciales.
 * Se deja en null (en vez de reventar al importar) para poder mostrar una
 * pantalla de ayuda en lugar de una página en blanco.
 */
export const supabase = isConfigured()
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        // La sesión sobrevive a recargas y cierres de pestaña (localStorage).
        persistSession: true,
        // Renueva el access token antes de expirar, de forma transparente.
        autoRefreshToken: true,
        // Necesario para links por correo (invitación / recuperación).
        detectSessionInUrl: true,
        // Namespace propio: evita choques con otras apps del mismo dominio.
        storageKey: 'commerce-cms.auth',
        flowType: 'pkce',
      },
      global: {
        headers: { 'x-client-info': 'commerce-cms/1.0' },
      },
    })
  : null;

/** Acceso a la base de datos. Falla ruidosamente si falta configuración. */
export function db() {
  if (!supabase) throw new Error(CONFIG_ERROR);
  return supabase;
}

/** Acceso al módulo de autenticación. */
export function auth() {
  return db().auth;
}

/** Acceso a Storage. */
export function storage() {
  return db().storage;
}
