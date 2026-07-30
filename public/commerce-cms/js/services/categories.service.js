/**
 * categories.service.js — CRUD de la tabla `categories`.
 *
 * Contrato de la capa de servicios:
 *   - Es el único lugar del CMS que consulta la tabla `categories`.
 *   - Recibe y devuelve objetos planos; no toca el DOM ni muestra mensajes.
 *   - Valida antes de escribir y lanza AppError con texto listo para el usuario.
 */

import {
  countRows,
  deleteById,
  insertOne,
  pageResult,
  selectMany,
  selectPage,
  updateById,
} from './repository.js';
import { optionalText, requiredId, requiredText } from '../core/validate.js';
import { getStoreId } from '../core/session.js';

const TABLE = 'categories';
const COLUMNS = 'id, name, description, created_at';
const SEARCH_COLUMNS = ['name', 'description'];

/**
 * Listado de categorías.
 * @param {{search?: string, limit?: number, offset?: number}} [options]
 * @returns {Promise<Array<{id, name, description, createdAt}>>}
 */
export async function listCategories({ search = '', limit, offset } = {}) {
  const rows = await selectMany(TABLE, {
    columns: COLUMNS,
    orderBy: 'name',
    ascending: true,
    search,
    searchColumns: SEARCH_COLUMNS,
    limit,
    offset,
    filters: { store_id: getStoreId() },
  });

  return rows.map(normalize);
}

/**
 * Listado paginado para la tabla del módulo de categorías.
 * @param {{search?: string, page?: number, pageSize?: number}} [options]
 * @returns {Promise<{items: object[], total: number, page: number,
 *                    pageSize: number, totalPages: number}>}
 */
export async function listCategoriesPage({ search = '', page = 1, pageSize = 10 } = {}) {
  const { rows, total } = await selectPage(TABLE, {
    columns: COLUMNS,
    orderBy: 'name',
    ascending: true,
    page,
    pageSize,
    search,
    searchColumns: SEARCH_COLUMNS,
    filters: { store_id: getStoreId() },
  });

  return pageResult(rows, normalize, { total, page, pageSize });
}

/** Total de categorías de la tienda activa (dashboard). */
export function countCategories() {
  return countRows(TABLE, { filters: { store_id: getStoreId() } });
}

/**
 * Crea una categoría.
 * @param {{name: string, description?: string}} input
 */
export async function createCategory(input) {
  const row = await insertOne(TABLE, toRecord(input));
  return normalize(row);
}

/**
 * Actualiza una categoría existente.
 * @param {string|number} id
 * @param {{name: string, description?: string}} input
 */
export async function updateCategory(id, input) {
  const row = await updateById(TABLE, requiredId(id, 'categoría'), toRecord(input));
  return normalize(row);
}

/**
 * Elimina una categoría.
 * Si tiene productos asociados, la base de datos rechaza el borrado y
 * core/errors.js traduce el código 23503 a un mensaje comprensible.
 */
export function deleteCategory(id) {
  return deleteById(TABLE, requiredId(id, 'categoría'));
}

/* ------------------------------------------------------------------ mapeo */

/**
 * Formulario -> fila de la base de datos (valida por el camino).
 * El `store_id` lo pone el servicio, nunca el formulario: así una categoría no
 * puede acabar en otra tienda por un descuido de la interfaz.
 */
function toRecord({ name, description }) {
  return {
    name: requiredText(name, { field: 'Nombre', max: 120 }),
    description: optionalText(description, { field: 'Descripción', max: 500 }),
    store_id: getStoreId(),
  };
}

/** Fila de la base de datos -> objeto que consume la interfaz. */
function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    createdAt: row.created_at,
  };
}
