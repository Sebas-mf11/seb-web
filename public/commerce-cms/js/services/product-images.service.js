/**
 * product-images.service.js — CRUD de la tabla `product_images`.
 *
 * Se separa de products.service.js porque es otra tabla: cada servicio toca
 * únicamente la suya. La subida del archivo a Supabase Storage se hará en su
 * propio servicio (storage) cuando se construya el módulo de productos; aquí
 * solo se guarda la URL resultante.
 */

import {
  deleteById,
  deleteWhere,
  insertOne,
  selectIn,
  selectMany,
  updateById,
} from './repository.js';
import { requiredId, requiredInteger, requiredText } from '../core/validate.js';

const TABLE = 'product_images';
const COLUMNS = 'id, product_id, image_url, sort_order, created_at';

/**
 * Imágenes de un producto, en el orden definido por el cliente.
 * @param {string|number} productId
 * @returns {Promise<Array<{id, productId, url, sortOrder, createdAt}>>}
 */
export async function listImagesOfProduct(productId) {
  const rows = await selectMany(TABLE, {
    columns: COLUMNS,
    orderBy: 'sort_order',
    ascending: true,
    filters: { product_id: requiredId(productId, 'producto') },
  });

  return rows.map(normalize);
}

/**
 * Registra una imagen ya subida a Storage.
 * @param {{productId: string|number, url: string, sortOrder?: number}} input
 */
export async function addProductImage({ productId, url, sortOrder = 0 }) {
  const row = await insertOne(TABLE, {
    product_id: requiredId(productId, 'producto'),
    image_url: requiredText(url, { field: 'URL de la imagen', max: 1000 }),
    sort_order: requiredInteger(sortOrder, { field: 'orden' }),
  });

  return normalize(row);
}

/** Cambia la posición de una imagen en la galería. */
export async function updateImageOrder(id, sortOrder) {
  const row = await updateById(TABLE, requiredId(id, 'imagen'), {
    sort_order: requiredInteger(sortOrder, { field: 'orden' }),
  });

  return normalize(row);
}

/** Elimina una imagen concreta. */
export function deleteProductImage(id) {
  return deleteById(TABLE, requiredId(id, 'imagen'));
}

/**
 * Elimina todas las imágenes de un producto.
 * Se usa antes de borrar el producto cuando la clave foránea no tiene
 * ON DELETE CASCADE.
 */
export function deleteImagesOfProduct(productId) {
  return deleteWhere(TABLE, 'product_id', requiredId(productId, 'producto'));
}

/**
 * De una lista de URLs, devuelve las que ya no usa ningún producto.
 *
 * Existe porque varias tiendas pueden apuntar al mismo archivo: cuando una
 * tienda copió su catálogo de otra, las dos comparten las mismas imágenes en
 * Storage. Borrar el archivo al eliminar un producto dejaría a la otra tienda
 * con las fotos rotas.
 *
 * Se llama SIEMPRE después de haber borrado las filas, nunca antes.
 *
 * @param {string[]} urls
 * @returns {Promise<string[]>} solo las que ya nadie referencia.
 */
export async function findUnreferencedUrls(urls) {
  const candidatas = [...new Set((urls ?? []).filter(Boolean))];
  if (candidatas.length === 0) return [];

  const enUso = await selectIn(TABLE, 'image_url', candidatas, 'image_url');
  const ocupadas = new Set(enUso.map((row) => row.image_url));

  return candidatas.filter((url) => !ocupadas.has(url));
}

/* ------------------------------------------------------------------ mapeo */

function normalize(row) {
  return {
    id: row.id,
    productId: row.product_id,
    url: row.image_url,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}
