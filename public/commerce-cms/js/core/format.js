/**
 * format.js — Formato de precios, fechas y números.
 * Un solo lugar decide cómo se ve un valor en TODO el panel; cambiar de país
 * o de moneda es cambiar LOCALE_CONFIG en config.js.
 */

import { LOCALE_CONFIG } from '../../supabase/config.js';

const { locale, currency, timeZone } = LOCALE_CONFIG;

// Los formateadores de Intl son caros de crear: se instancian una sola vez.
const currencyFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat(locale);

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone,
});

const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

/** 1250000 -> "$ 1.250.000" */
export function formatCurrency(value) {
  const number = Number(value);
  return Number.isFinite(number) ? currencyFormatter.format(number) : '—';
}

/** 1250 -> "1.250" */
export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? numberFormatter.format(number) : '—';
}

/** ISO -> "28 jul 2026" */
export function formatDate(value) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : '—';
}

/** ISO -> "hace 3 días" (cae a fecha absoluta si pasó más de un mes). */
export function formatRelative(value) {
  const date = toDate(value);
  if (!date) return '—';

  const diffSeconds = (date.getTime() - Date.now()) / 1000;
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  if (Math.abs(diffSeconds) > 2592000) return formatDate(value);

  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return 'hace un momento';
}

/** Iniciales para el avatar: "sebas@correo.com" -> "SE" */
export function initials(value) {
  const source = String(value ?? '').trim();
  if (!source) return '?';

  const name = source.split('@')[0];
  const parts = name.split(/[.\-_\s]+/).filter(Boolean);

  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

/** Convierte a Date de forma segura. @returns {Date|null} */
function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
