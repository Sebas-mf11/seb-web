/**
 * validate.js — Validación y normalización de datos de entrada.
 *
 * Se usa en la capa de servicios (antes de escribir en Supabase) y en los
 * formularios. Lanza AppError, cuyo mensaje ya está listo para mostrarse.
 * No conoce Supabase ni el DOM: son funciones puras.
 */

import { AppError } from './errors.js';

/**
 * Texto obligatorio, recortado.
 * @param {unknown} value
 * @param {{field: string, max?: number, min?: number}} options
 * @returns {string}
 */
export function requiredText(value, { field, max = 160, min = 1 }) {
  const text = String(value ?? '').trim();

  if (text.length < min) {
    throw new AppError(`El campo "${field}" es obligatorio.`);
  }
  if (text.length > max) {
    throw new AppError(`"${field}" no puede superar los ${max} caracteres.`);
  }

  return text;
}

/**
 * Texto opcional: devuelve null cuando viene vacío, para no guardar cadenas
 * vacías en la base de datos.
 * @returns {string|null}
 */
export function optionalText(value, { field = 'campo', max = 2000 } = {}) {
  const text = String(value ?? '').trim();
  if (!text) return null;

  if (text.length > max) {
    throw new AppError(`"${field}" no puede superar los ${max} caracteres.`);
  }

  return text;
}

/** Identificador obligatorio (uuid o número). */
export function requiredId(value, field = 'registro') {
  if (value === null || value === undefined || value === '') {
    throw new AppError(`Falta el identificador del ${field}.`);
  }
  return value;
}

/** Precio: número no negativo. Acepta "1.250.000" y "1250000,50". */
export function requiredPrice(value, { field = 'precio' } = {}) {
  const number = toNumber(value);

  if (number === null) throw new AppError(`El ${field} debe ser un número.`);
  if (number < 0) throw new AppError(`El ${field} no puede ser negativo.`);

  return number;
}

/** Entero no negativo (existencias). */
export function requiredInteger(value, { field = 'valor' } = {}) {
  const number = toNumber(value);

  if (number === null || !Number.isInteger(number)) {
    throw new AppError(`El ${field} debe ser un número entero.`);
  }
  if (number < 0) throw new AppError(`El ${field} no puede ser negativo.`);

  return number;
}

/**
 * Booleano. Acepta lo que puede llegar de un formulario o de la base de datos
 * (checkbox, 'true'/'false', 1/0) y falla ante cualquier otra cosa en lugar de
 * convertirla en silencio.
 */
export function requiredBoolean(value, { field = 'valor' } = {}) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;

  throw new AppError(`El campo "${field}" debe ser Sí o No.`);
}

/** Valor dentro de una lista cerrada. */
export function oneOf(value, allowed, { field = 'valor' } = {}) {
  if (!allowed.includes(value)) {
    throw new AppError(`El ${field} debe ser uno de: ${allowed.join(', ')}.`);
  }
  return value;
}

/** Referencia opcional a otra tabla: '' se convierte en null (sin relación). */
export function optionalId(value) {
  return value === '' || value === undefined ? null : value;
}

/**
 * Convierte a número tolerando el formato local ("1.250.000,50").
 * @returns {number|null} null si no es convertible.
 */
function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const raw = String(value ?? '').trim();
  if (!raw) return null;

  // Quita separadores de miles y normaliza la coma decimal.
  const normalized = raw.replace(/\s/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}
