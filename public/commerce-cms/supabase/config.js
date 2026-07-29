/**
 * config.js — Configuración del tenant (cliente).
 * =============================================================================
 * ESTE ES EL ÚNICO ARCHIVO QUE SE MODIFICA AL INSTALAR EL CMS EN UN CLIENTE NUEVO.
 *
 * Cada cliente tiene su propio proyecto de Supabase, así sus datos quedan
 * completamente aislados sin necesidad de lógica multi-tenant en el código.
 *
 * La `anonKey` es PÚBLICA por diseño (viaja al navegador). La seguridad real la
 * dan las políticas RLS de la base de datos: ver `supabase/schema-rls.sql`.
 * =============================================================================
 */

/**
 * Credenciales del proyecto Supabase. Panel > Project Settings > API.
 *
 * `anonKey` admite los dos formatos que entrega Supabase:
 *   - Publishable key nueva: 'sb_publishable_...'
 *   - Anon key clásica (JWT): 'eyJhbGciOi...'
 * Ambas son públicas y están pensadas para el navegador. NUNCA poner aquí la
 * `service_role`: esa salta las políticas RLS y da acceso total.
 */
export const SUPABASE_CONFIG = {
  // URL base del proyecto, SIN "/rest/v1" al final: supabase-js añade solo la
  // ruta de cada servicio (/rest, /auth, /storage).
  url: 'https://oirsvaofqsymrctxbxfh.supabase.co',
  anonKey: 'sb_publishable_QBJepdQLEESkPHzR8g6JIg_2Rz-gyBT',
};

/** Almacenamiento de imágenes (Supabase Storage). */
export const STORAGE_CONFIG = {
  bucket: 'product-images',
  maxFileSizeMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};

/**
 * Marca blanca: identidad visual del panel para este cliente.
 * `accent` se inyecta como variable CSS en runtime (ver applyBranding), así se
 * rebrandea el CMS completo sin tocar una sola línea de CSS.
 */
export const BRANDING = {
  appName: 'Commerce CMS',
  clientName: 'Tu tienda',
  tagline: 'Administra tu catálogo sin tocar código',
  vendorName: 'SEB', // quién construye la plataforma (pie de página)
  vendorUrl: 'https://sebweb.co',
  logoUrl: '', // opcional: 'assets/logo.png'
  accent: '#111827',
  accentStrong: '#0b1220',
};

/** Formato regional para precios y fechas. */
export const LOCALE_CONFIG = {
  locale: 'es-CO',
  currency: 'COP',
  timeZone: 'America/Bogota',
};

/** Rutas internas del panel. Centralizadas para no repetir strings sueltos. */
export const ROUTES = {
  login: 'index.html',
  dashboard: 'dashboard.html',
  products: 'products.html',
  productForm: 'product-form.html',
  categories: 'categories.html',
  brands: 'brands.html',
};

/** Mensaje único para el caso "el CMS todavía no tiene credenciales". */
export const CONFIG_ERROR =
  'Supabase no está configurado. Abre supabase/config.js y completa "url" y "anonKey".';

/** @returns {boolean} true si ya se cargaron las credenciales de Supabase. */
export function isConfigured() {
  return Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
}

/**
 * Vuelca la identidad del cliente en variables CSS y en los nodos marcados
 * con `data-brand`. Se llama una sola vez al arrancar cada página.
 */
export function applyBranding() {
  const root = document.documentElement;
  root.style.setProperty('--c-accent', BRANDING.accent);
  root.style.setProperty('--c-accent-strong', BRANDING.accentStrong);

  const text = {
    'app-name': BRANDING.appName,
    'client-name': BRANDING.clientName,
    tagline: BRANDING.tagline,
    'vendor-name': BRANDING.vendorName,
  };

  Object.entries(text).forEach(([key, value]) => {
    document.querySelectorAll(`[data-brand="${key}"]`).forEach((node) => {
      node.textContent = value;
    });
  });

  document.querySelectorAll('[data-brand="vendor-url"]').forEach((node) => {
    node.setAttribute('href', BRANDING.vendorUrl);
  });
}
