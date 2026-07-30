/**
 * repository.js — Infraestructura compartida de la capa de servicios.
 * =============================================================================
 * Junto con supabase/client.js, es el ÚNICO lugar que conoce la forma de
 * PostgREST (select, eq, order, range...). Los servicios de entidad describen
 * QUÉ piden; este archivo sabe CÓMO se pide.
 *
 * Gracias a esto, las cinco tablas comparten el mismo CRUD sin copiarlo cinco
 * veces, y un cambio de criterio (paginación, orden, búsqueda) se hace aquí.
 *
 * Regla: nadie fuera de js/services/ importa este archivo.
 * =============================================================================
 */

import { db } from '../../supabase/client.js';
import { AppError, unwrap } from '../core/errors.js';

/**
 * Cuenta filas sin traerlas: `head: true` pide solo la cabecera con el total.
 * @param {string} tableName
 * @param {{filters?: Record<string, unknown>}} [options]
 * @returns {Promise<number>}
 */
export async function countRows(tableName, { filters = {} } = {}) {
  let query = db().from(tableName).select('id', { count: 'exact', head: true });

  Object.entries(filters).forEach(([column, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query = query.eq(column, value);
    }
  });

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}

/**
 * Filas cuyo valor de `column` está en la lista dada.
 * Se usa para saber qué archivos siguen en uso antes de borrarlos.
 * @returns {Promise<object[]>} vacío si no se pide nada.
 */
export async function selectIn(tableName, column, values, columns = '*') {
  if (!values || values.length === 0) return [];

  return unwrap(await db().from(tableName).select(columns).in(column, values));
}

/**
 * Listado con búsqueda, orden y paginación opcionales.
 * @param {string} tableName
 * @param {{columns?: string, orderBy?: string, ascending?: boolean,
 *          limit?: number, offset?: number, search?: string,
 *          searchColumns?: string[], filters?: Record<string, unknown>,
 *          startsWith?: {column: string, value: string}}} [options]
 */
export async function selectMany(tableName, options = {}) {
  const {
    columns = '*',
    orderBy = 'created_at',
    ascending = false,
    limit,
    offset = 0,
    search = '',
    searchColumns = [],
    filters = {},
    startsWith = null,
  } = options;

  let query = db().from(tableName).select(columns);

  Object.entries(filters).forEach(([column, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query = query.eq(column, value);
    }
  });

  // Coincidencia por prefijo (`like 'valor%'`), para buscar familias de slugs.
  if (startsWith?.value) {
    query = query.like(startsWith.column, `${startsWith.value}%`);
  }

  const searchFilter = buildSearchFilter(search, searchColumns);
  if (searchFilter) query = query.or(searchFilter);

  if (orderBy) query = query.order(orderBy, { ascending });

  if (typeof limit === 'number') {
    query = offset > 0 ? query.range(offset, offset + limit - 1) : query.limit(limit);
  }

  return unwrap(await query);
}

/**
 * Igual que selectMany, pero devuelve además el total de filas que cumplen el
 * filtro. `count: 'exact'` viaja en la misma petición que los datos, así que
 * paginar no cuesta una consulta extra.
 *
 * @param {string} tableName
 * @param {{columns?: string, orderBy?: string, ascending?: boolean,
 *          page?: number, pageSize?: number, search?: string,
 *          searchColumns?: string[], filters?: Record<string, unknown>,
 *          orFilter?: string}} [options]
 *   `orFilter` permite pasar una expresión `or` ya construida, para búsquedas
 *   que no se reducen a un ilike sobre columnas propias.
 * @returns {Promise<{rows: object[], total: number}>}
 */
export async function selectPage(tableName, options = {}) {
  const {
    columns = '*',
    orderBy = 'created_at',
    ascending = false,
    page = 1,
    pageSize = 10,
    search = '',
    searchColumns = [],
    filters = {},
    orFilter = '',
  } = options;

  const start = Math.max(0, (page - 1) * pageSize);

  let query = db().from(tableName).select(columns, { count: 'exact' });

  Object.entries(filters).forEach(([column, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query = query.eq(column, value);
    }
  });

  const expression = orFilter || buildSearchFilter(search, searchColumns);
  if (expression) query = query.or(expression);

  const { data, error, count } = await query
    .order(orderBy, { ascending })
    .range(start, start + pageSize - 1);

  if (error) throw error;

  return { rows: data ?? [], total: count ?? 0 };
}

/**
 * Da forma al resultado paginado que consumen las páginas.
 * Centraliza el cálculo de `totalPages` para que los tres listados con
 * paginación no lo repitan (ni discrepen).
 *
 * @param {object[]} rows
 * @param {(row: object) => object} mapper - normalizador de cada servicio.
 * @param {{total: number, page: number, pageSize: number}} meta
 */
export function pageResult(rows, mapper, { total, page, pageSize }) {
  return {
    items: rows.map(mapper),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Una fila por id.
 * @param {{required?: boolean}} [options] - si `required`, lanza cuando no existe.
 * @returns {Promise<object|null>}
 */
export async function selectById(tableName, id, { columns = '*', required = true } = {}) {
  const row = unwrap(
    await db().from(tableName).select(columns).eq('id', id).maybeSingle(),
  );

  if (!row && required) {
    throw new AppError('No se encontró el registro. Puede que ya haya sido eliminado.');
  }

  return row;
}

/** Inserta y devuelve la fila creada (con su id y created_at). */
export async function insertOne(tableName, values) {
  return unwrap(await db().from(tableName).insert(values).select().single());
}

/** Actualiza por id y devuelve la fila resultante. */
export async function updateById(tableName, id, values) {
  const row = unwrap(
    await db().from(tableName).update(values).eq('id', id).select().maybeSingle(),
  );

  if (!row) {
    throw new AppError('No se pudo actualizar: el registro ya no existe.');
  }

  return row;
}

/**
 * Elimina por id. Se pide `select('id')` para distinguir "borrado" de
 * "no existía": PostgREST no falla al borrar cero filas.
 */
export async function deleteById(tableName, id) {
  const rows = unwrap(await db().from(tableName).delete().eq('id', id).select('id'));

  if (!rows || rows.length === 0) {
    throw new AppError('No se pudo eliminar: el registro ya no existe.');
  }

  return true;
}

/** Elimina todas las filas que apuntan a un valor (ej. imágenes de un producto). */
export async function deleteWhere(tableName, column, value) {
  unwrap(await db().from(tableName).delete().eq(column, value).select('id'));
  return true;
}

/**
 * Construye el filtro `or` de PostgREST para una búsqueda por texto.
 *
 * Dos cuidados que evitan errores 400 y búsquedas alteradas:
 *  - los caracteres con significado propio en la expresión (`,` `%` `*` `"`
 *    y paréntesis) se eliminan del término;
 *  - el patrón va entre comillas dobles, porque un término con espacios
 *    ("nevera grande") rompe la expresión si va suelto.
 *
 * @returns {string} vacío si no hay nada que buscar.
 */
export function buildSearchFilter(term, columns) {
  const clean = String(term ?? '')
    .trim()
    .replace(/[,%()*"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean || columns.length === 0) return '';

  return columns.map((column) => `${column}.ilike."%${clean}%"`).join(',');
}

/**
 * Ejecuta una consulta con relaciones embebidas y, si PostgREST no puede
 * resolver el embed (claves foráneas no declaradas en la base de datos),
 * reintenta sin ellas.
 *
 * Evita que el panel se quede en blanco por un detalle del esquema.
 *
 * @param {() => Promise<any>} withEmbed
 * @param {() => Promise<any>} withoutEmbed
 */
export async function withEmbedFallback(withEmbed, withoutEmbed) {
  try {
    return await withEmbed();
  } catch (error) {
    console.warn(
      '[commerce-cms] no se pudieron embeber las relaciones; se reintenta sin ellas.',
      error,
    );
    return withoutEmbed();
  }
}
