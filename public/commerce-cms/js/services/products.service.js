/**
 * products.service.js — CRUD de la tabla `products`.
 *
 * Única puerta de entrada a la tabla `products`. Las páginas piden datos aquí;
 * nunca construyen consultas por su cuenta.
 *
 * Las imágenes viven en la tabla `product_images` y tienen su propio servicio
 * (product-images.service.js): cada servicio toca solo su tabla.
 */

import {
  buildSearchFilter,
  countRows,
  deleteById,
  insertOne,
  pageResult,
  selectById,
  selectMany,
  selectPage,
  updateById,
  withEmbedFallback,
} from './repository.js';
import { listBrands } from './brands.service.js';
import { slugify } from '../core/format.js';
import { getStoreId } from '../core/session.js';
import {
  oneOf,
  optionalId,
  optionalText,
  requiredBoolean,
  requiredId,
  requiredPrice,
  requiredText,
} from '../core/validate.js';

const TABLE = 'products';

/** Columnas propias de la tabla. */
const BASE_COLUMNS =
  'id, name, slug, reference, description, price, condition, available, category_id, brand_id, created_at';

/**
 * Con marca, categoría e imágenes en la misma petición.
 * Son lecturas embebidas para componer la vista del producto; el CRUD de
 * `product_images` sigue estando solo en su propio servicio.
 */
const COLUMNS_WITH_RELATIONS =
  `${BASE_COLUMNS}, categories ( id, name ), brands ( id, name ),` +
  ' product_images ( image_url, sort_order )';

const SEARCH_COLUMNS = ['name', 'reference', 'description'];

/** Cuántas marcas como máximo entran en el filtro de búsqueda por marca. */
const BRAND_MATCH_LIMIT = 50;

/** Cuántos slugs de la misma familia se traen para buscar uno libre. */
const SLUG_LOOKUP_LIMIT = 200;

/** Valores admitidos en la columna `condition`. */
export const PRODUCT_CONDITIONS = ['Tipo A', 'Tipo B'];

/**
 * Listado de productos con su marca y categoría, sin paginar.
 * Uso interno: las pantallas usan listProductsPage o listLatestProducts.
 * @param {{search?: string, limit?: number, offset?: number,
 *          categoryId?: string|number, brandId?: string|number,
 *          orderBy?: string, ascending?: boolean}} [options]
 * @returns {Promise<Array<object>>}
 */
async function listProducts(options = {}) {
  const {
    search = '',
    limit,
    offset,
    categoryId,
    brandId,
    orderBy = 'created_at',
    ascending = false,
  } = options;

  const query = (columns) =>
    selectMany(TABLE, {
      columns,
      orderBy,
      ascending,
      search,
      searchColumns: SEARCH_COLUMNS,
      limit,
      offset,
      filters: {
        store_id: getStoreId(),
        category_id: categoryId,
        brand_id: brandId,
      },
    });

  const rows = await withEmbedFallback(
    () => query(COLUMNS_WITH_RELATIONS),
    () => query(BASE_COLUMNS),
  );

  return rows.map(normalize);
}

/** Los últimos productos agregados (dashboard). */
export function listLatestProducts(limit = 5) {
  return listProducts({ limit, orderBy: 'created_at', ascending: false });
}

/**
 * Listado paginado para la tabla del módulo de productos.
 * La búsqueda cubre nombre, referencia y marca.
 *
 * @param {{search?: string, page?: number, pageSize?: number,
 *          categoryId?: string|number, brandId?: string|number}} [options]
 * @returns {Promise<{items: object[], total: number, page: number,
 *                    pageSize: number, totalPages: number}>}
 */
export async function listProductsPage(options = {}) {
  const { search = '', page = 1, pageSize = 10, categoryId, brandId } = options;

  const orFilter = await buildProductSearchFilter(search);

  const query = (columns) =>
    selectPage(TABLE, {
      columns,
      orderBy: 'created_at',
      ascending: false,
      page,
      pageSize,
      orFilter,
      filters: {
        store_id: getStoreId(),
        category_id: categoryId,
        brand_id: brandId,
      },
    });

  const { rows, total } = await withEmbedFallback(
    () => query(COLUMNS_WITH_RELATIONS),
    () => query(BASE_COLUMNS),
  );

  return pageResult(rows, normalize, { total, page, pageSize });
}

/**
 * Construye el filtro de búsqueda.
 *
 * El nombre de la marca vive en otra tabla, y PostgREST no permite mezclar en
 * un mismo `or` columnas propias y columnas embebidas. La solución es resolver
 * primero qué marcas coinciden —reutilizando brands.service, no consultando la
 * tabla por nuestra cuenta— y filtrar por sus ids.
 *
 * @returns {Promise<string>} expresión `or` de PostgREST, o '' si no hay búsqueda.
 */
async function buildProductSearchFilter(search) {
  const own = buildSearchFilter(search, ['name', 'reference']);
  if (!own) return '';

  const brands = await listBrands({ search, limit: BRAND_MATCH_LIMIT });
  if (brands.length === 0) return own;

  return `${own},brand_id.in.(${brands.map((brand) => brand.id).join(',')})`;
}

/** Un producto por id, con marca y categoría. Lanza AppError si no existe. */
export async function getProduct(id) {
  const productId = requiredId(id, 'producto');

  const row = await withEmbedFallback(
    () => selectById(TABLE, productId, { columns: COLUMNS_WITH_RELATIONS }),
    () => selectById(TABLE, productId, { columns: BASE_COLUMNS }),
  );

  return normalize(row);
}

/** Total de productos de la tienda activa (dashboard). */
export function countProducts() {
  return countRows(TABLE, { filters: { store_id: getStoreId() } });
}

/**
 * Crea un producto.
 * @param {object} input - datos crudos del formulario.
 */
export async function createProduct(input) {
  const row = await insertOne(TABLE, await toRecord(input));
  return normalize(row);
}

/** Actualiza un producto existente. */
export async function updateProduct(id, input) {
  const productId = requiredId(id, 'producto');
  const record = await toRecord(input, { currentId: productId });

  const row = await updateById(TABLE, productId, record);
  return normalize(row);
}

/**
 * Elimina un producto.
 *
 * Ojo: no borra sus imágenes. Si la clave foránea de `product_images` no tiene
 * ON DELETE CASCADE, la página debe llamar antes a
 * `deleteImagesOfProduct(id)` del servicio de imágenes.
 */
export function deleteProduct(id) {
  return deleteById(TABLE, requiredId(id, 'producto'));
}

/* ------------------------------------------------------------------ mapeo */

/**
 * Formulario -> fila de la base de datos (valida por el camino).
 * Es asíncrona porque el slug necesita consultar los ya ocupados.
 *
 * @param {object} input
 * @param {{currentId?: string|number|null}} [options] - id del producto que se
 *        está editando, para que su propio slug no cuente como ocupado.
 */
async function toRecord(input, { currentId = null } = {}) {
  const name = requiredText(input.name, { field: 'Nombre', max: 160 });

  const record = {
    name,
    slug: await resolveSlug({ desired: input.slug, name, currentId }),
    reference: optionalText(input.reference, { field: 'Referencia', max: 80 }),
    description: optionalText(input.description, { field: 'Descripción', max: 4000 }),
    price: requiredPrice(input.price),
    available: requiredBoolean(input.available ?? true, { field: 'Disponible' }),
    category_id: optionalId(input.categoryId ?? input.category_id),
    brand_id: optionalId(input.brandId ?? input.brand_id),
    // Lo pone el servicio, nunca el formulario: un producto no puede acabar
    // en otra tienda por un descuido de la interfaz.
    store_id: getStoreId(),
  };

  // `condition` solo se valida si el formulario envía un valor.
  const condition = optionalText(input.condition, { field: 'Condición', max: 40 });
  record.condition = condition
    ? oneOf(condition, PRODUCT_CONDITIONS, { field: 'condición' })
    : null;

  return record;
}

/**
 * Decide el slug definitivo del producto.
 *
 * Prioridad: lo que el cliente escribió a mano; si lo dejó vacío, el nombre.
 * El texto se normaliza siempre (aunque venga escrito a mano) para que nunca
 * llegue a la URL pública un espacio, una tilde o un signo raro.
 *
 * @param {{desired?: string, name: string, currentId: string|number|null}} args
 * @returns {Promise<string>}
 */
async function resolveSlug({ desired, name, currentId }) {
  const base = slugify(desired) || slugify(name) || 'producto';
  return findFreeSlug(base, currentId);
}

/**
 * Busca el primer slug libre a partir de una base: `nevera`, `nevera-2`,
 * `nevera-3`…
 *
 * Se piden de una sola vez todos los slugs que empiezan por la base y se
 * decide en memoria, en lugar de consultar una vez por candidato.
 *
 * La búsqueda se limita a la tienda activa porque el slug es único POR TIENDA:
 * que Alprecio tenga `nevera-12-kg` no impide que Nicolás Pastrán la tenga.
 *
 * Esto resuelve los choques del día a día; la garantía dura la da el índice
 * único (store_id, slug) de la base de datos, que además cubre el caso de dos
 * personas guardando a la vez.
 */
async function findFreeSlug(base, currentId) {
  const rows = await selectMany(TABLE, {
    columns: 'id, slug',
    startsWith: { column: 'slug', value: base },
    orderBy: 'slug',
    ascending: true,
    limit: SLUG_LOOKUP_LIMIT,
    filters: { store_id: getStoreId() },
  });

  const taken = new Set(
    rows
      .filter((row) => String(row.id) !== String(currentId ?? ''))
      .map((row) => row.slug),
  );

  if (!taken.has(base)) return base;

  for (let suffix = 2; suffix <= SLUG_LOOKUP_LIMIT; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }

  // Salida de emergencia: con cientos de homónimos, algo irrepetible.
  return `${base}-${Date.now().toString(36)}`;
}

/** Fila de la base de datos -> objeto que consume la interfaz. */
function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    // Identificador público: es lo que la tienda usa en la URL del producto.
    slug: row.slug ?? '',
    reference: row.reference ?? '',
    description: row.description ?? '',
    price: row.price,
    condition: row.condition ?? '',
    available: Boolean(row.available),
    categoryId: row.category_id ?? null,
    brandId: row.brand_id ?? null,
    category: row.categories?.name ?? null,
    brand: row.brands?.name ?? null,
    mainImage: mainImageFrom(row),
    createdAt: row.created_at,
  };
}

/** La imagen principal es la de menor `sort_order`. */
function mainImageFrom(row) {
  const images = Array.isArray(row.product_images) ? row.product_images : [];
  if (images.length === 0) return null;

  return [...images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )[0].image_url;
}
