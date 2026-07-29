/**
 * storage.service.js — Subida y borrado de archivos en Supabase Storage.
 *
 * Storage no es una tabla, pero sí es acceso a datos remotos: por eso vive en
 * la capa de servicios y es el único sitio que llama a `storage()`.
 *
 * Reparto de responsabilidades con product-images.service.js:
 *   - aquí         -> el ARCHIVO (subir al bucket, borrar del bucket)
 *   - allí         -> el REGISTRO en la tabla `product_images` (la URL)
 */

import { storage } from '../../supabase/client.js';
import { STORAGE_CONFIG } from '../../supabase/config.js';
import { AppError } from '../core/errors.js';

const { bucket, maxFileSizeMB, allowedTypes } = STORAGE_CONFIG;
const MAX_BYTES = maxFileSizeMB * 1024 * 1024;

/** Fragmento fijo de las URLs públicas del bucket. */
const PUBLIC_MARKER = `/storage/v1/object/public/${bucket}/`;

/**
 * Valida un archivo antes de gastar ancho de banda subiéndolo.
 * @param {File} file
 * @throws {AppError} con un mensaje ya listo para mostrar.
 */
export function assertValidImage(file) {
  if (!file) throw new AppError('No se seleccionó ningún archivo.');

  if (!allowedTypes.includes(file.type)) {
    const formats = allowedTypes.map((type) => type.replace('image/', '')).join(', ');
    throw new AppError(`"${file.name}" no es una imagen válida. Formatos: ${formats}.`);
  }

  if (file.size > MAX_BYTES) {
    throw new AppError(`"${file.name}" pesa más de ${maxFileSizeMB} MB.`);
  }

  return true;
}

/**
 * Sube una imagen de producto al bucket.
 * El archivo se guarda en `<productId>/<marca-de-tiempo>-<aleatorio>.<ext>`:
 * agrupa por producto y evita colisiones de nombre.
 *
 * @param {File} file
 * @param {{productId: string|number}} context
 * @returns {Promise<{path: string, url: string}>}
 */
export async function uploadProductImage(file, { productId }) {
  assertValidImage(file);

  const path = buildPath(file, productId);

  const { error } = await storage()
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  return { path, url: getPublicUrl(path) };
}

/** URL pública de un archivo del bucket. */
function getPublicUrl(path) {
  const { data } = storage().from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Borra archivos del bucket.
 * No lanza si falla: el registro de la tabla ya se eliminó y un archivo
 * huérfano no debe impedir que el cliente continúe. Queda avisado en consola.
 *
 * @param {string[]} paths
 */
export async function removeFiles(paths) {
  const valid = paths.filter(Boolean);
  if (valid.length === 0) return true;

  const { error } = await storage().from(bucket).remove(valid);

  if (error) {
    console.warn('[commerce-cms] no se pudieron borrar archivos del bucket', error);
    return false;
  }

  return true;
}

/**
 * Deduce la ruta interna del bucket a partir de una URL pública guardada en
 * `product_images.image_url`.
 * @returns {string|null} null si la URL no pertenece a este bucket.
 */
export function pathFromPublicUrl(url) {
  const raw = String(url ?? '');
  const index = raw.indexOf(PUBLIC_MARKER);

  if (index === -1) return null;

  return decodeURIComponent(raw.slice(index + PUBLIC_MARKER.length).split('?')[0]);
}

/* ------------------------------------------------------------------ interno */

function buildPath(file, productId) {
  const extension = (file.name.split('.').pop() || 'jpg')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5);

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${productId}/${unique}.${extension || 'jpg'}`;
}
