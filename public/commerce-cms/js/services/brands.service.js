/**
 * brands.service.js — CRUD de la tabla `brands`.
 *
 * Mismo contrato que el resto de servicios: única puerta de entrada a la tabla,
 * sin DOM, validando antes de escribir.
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
import { requiredId, requiredText } from '../core/validate.js';

const TABLE = 'brands';
const COLUMNS = 'id, name, created_at';
const SEARCH_COLUMNS = ['name'];

/**
 * Listado de marcas, alfabético.
 * @param {{search?: string, limit?: number, offset?: number}} [options]
 * @returns {Promise<Array<{id, name, createdAt}>>}
 */
export async function listBrands({ search = '', limit, offset } = {}) {
  const rows = await selectMany(TABLE, {
    columns: COLUMNS,
    orderBy: 'name',
    ascending: true,
    search,
    searchColumns: SEARCH_COLUMNS,
    limit,
    offset,
  });

  return rows.map(normalize);
}

/**
 * Listado paginado para la tabla del módulo de marcas.
 * @param {{search?: string, page?: number, pageSize?: number}} [options]
 * @returns {Promise<{items: object[], total: number, page: number,
 *                    pageSize: number, totalPages: number}>}
 */
export async function listBrandsPage({ search = '', page = 1, pageSize = 10 } = {}) {
  const { rows, total } = await selectPage(TABLE, {
    columns: COLUMNS,
    orderBy: 'name',
    ascending: true,
    page,
    pageSize,
    search,
    searchColumns: SEARCH_COLUMNS,
  });

  return pageResult(rows, normalize, { total, page, pageSize });
}

/** Total de marcas (dashboard). */
export function countBrands() {
  return countRows(TABLE);
}

/** @param {{name: string}} input */
export async function createBrand(input) {
  const row = await insertOne(TABLE, toRecord(input));
  return normalize(row);
}

/** @param {{name: string}} input */
export async function updateBrand(id, input) {
  const row = await updateById(TABLE, requiredId(id, 'marca'), toRecord(input));
  return normalize(row);
}

/** Elimina una marca. Falla si tiene productos asociados (código 23503). */
export function deleteBrand(id) {
  return deleteById(TABLE, requiredId(id, 'marca'));
}

/* ------------------------------------------------------------------ mapeo */

function toRecord({ name }) {
  return { name: requiredText(name, { field: 'Nombre', max: 120 }) };
}

function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}
