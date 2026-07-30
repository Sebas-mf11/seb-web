/**
 * profile.service.js — Perfil del usuario y tiendas a las que tiene acceso.
 *
 * `profiles` responde a dos preguntas: qué rol tiene quien entró y a qué tienda
 * pertenece. Es lo primero que consulta el panel al arrancar.
 */

import { db } from '../../supabase/client.js';
import { unwrap } from '../core/errors.js';
import { selectMany } from './repository.js';

const TABLE = 'profiles';
const COLUMNS = 'id, role, store_id, stores ( id, name, slug )';

/**
 * Perfil del usuario autenticado.
 *
 * Devuelve null si la cuenta existe en Supabase Auth pero nadie le asignó
 * perfil todavía: es un estado real y esperable (usuario recién creado), no un
 * error, y el panel lo trata mostrando una pantalla explicativa.
 *
 * @param {string} userId
 * @returns {Promise<{userId: string, role: string, storeId: string|null,
 *                    store: {id, name, slug}|null} | null>}
 */
export async function fetchProfile(userId) {
  const row = unwrap(
    await db().from(TABLE).select(COLUMNS).eq('id', userId).maybeSingle(),
  );

  if (!row) return null;

  return {
    userId: row.id,
    role: row.role,
    storeId: row.store_id ?? null,
    store: row.stores ?? null,
  };
}

/**
 * Todas las tiendas, para el selector del super_admin.
 * A un admin normal, RLS le devolverá solo la suya.
 */
export async function listStores() {
  const rows = await selectMany('stores', {
    columns: 'id, name, slug',
    orderBy: 'name',
    ascending: true,
  });

  return rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
}
