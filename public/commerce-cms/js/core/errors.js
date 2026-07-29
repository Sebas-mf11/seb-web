/**
 * errors.js — Traducción de errores técnicos a mensajes para el cliente.
 * El usuario del CMS no es técnico: nunca debe ver "AuthApiError" ni un código
 * de PostgREST. Cada capa lanza su error; aquí se decide qué se muestra.
 */

/** Error de negocio con mensaje ya apto para mostrar en pantalla. */
export class AppError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'AppError';
  }
}

/** Mensajes de Supabase Auth -> español. */
const AUTH_MESSAGES = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed':
    'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.',
  'User not found': 'No existe una cuenta con ese correo.',
  'Email rate limit exceeded':
    'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'Password should be at least 6 characters':
    'La contraseña debe tener al menos 6 caracteres.',
  'Signups not allowed for this instance':
    'El registro está deshabilitado. Pide acceso al administrador.',
};

/** Códigos de Postgres/PostgREST -> español. */
const DB_MESSAGES = {
  '23505': 'Ya existe un registro con ese valor. Usa uno diferente.',
  '23503': 'No se puede completar: el registro está vinculado a otros datos.',
  '23502': 'Faltan campos obligatorios.',
  '42501': 'No tienes permisos para realizar esta acción.',
  PGRST116: 'No se encontró el registro solicitado.',
};

/**
 * Devuelve un mensaje legible para cualquier error.
 * @param {unknown} error
 * @param {string} [fallback]
 */
export function humanizeError(error, fallback = 'Ocurrió un error inesperado.') {
  if (!error) return fallback;
  if (error instanceof AppError) return error.message;

  const code = error.code ?? error.status;
  if (code && DB_MESSAGES[code]) return DB_MESSAGES[code];

  const raw = error.message ?? String(error);
  if (AUTH_MESSAGES[raw]) return AUTH_MESSAGES[raw];

  // Coincidencia parcial: Supabase a veces añade contexto al mensaje.
  const partial = Object.keys(AUTH_MESSAGES).find((key) => raw.includes(key));
  if (partial) return AUTH_MESSAGES[partial];

  if (raw.includes('Failed to fetch') || raw.includes('NetworkError')) {
    return 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  }

  return raw || fallback;
}

/**
 * Registra el error técnico en consola (para depurar) y devuelve el mensaje
 * que sí puede ver el usuario.
 * @param {string} context - dónde ocurrió, ej. 'dashboard:contadores'
 */
export function reportError(context, error, fallback) {
  console.error(`[commerce-cms] ${context}`, error);
  return humanizeError(error, fallback);
}

/**
 * Envuelve la respuesta { data, error } de Supabase: devuelve `data` o lanza.
 * Así los servicios quedan limpios y las páginas usan try/catch normal.
 */
export function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}
