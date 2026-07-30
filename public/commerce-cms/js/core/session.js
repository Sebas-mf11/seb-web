/**
 * session.js — Contexto de la sesión: quién entró y en qué tienda trabaja.
 * =============================================================================
 * Lo rellena app.js al arrancar cada página, y lo consultan los servicios para
 * filtrar por tienda y para sellar las altas con el `store_id` correcto.
 *
 * Ojo con el reparto de responsabilidades: esto NO es el mecanismo de
 * seguridad. El aislamiento real lo imponen las políticas RLS de la base de
 * datos; aquí solo se guarda con qué tienda se está trabajando, que es lo que
 * el super_admin puede cambiar.
 * =============================================================================
 */

const ACTIVE_STORE_KEY = 'commerce-cms.active-store';

const state = {
  user: null,
  profile: null,
  /** Tiendas a las que este usuario tiene acceso. */
  stores: [],
  activeStoreId: null,
};

/**
 * @param {{user: object, profile: {role: string, storeId: string|null},
 *          stores: Array<{id: string, name: string, slug: string}>}} context
 */
export function setSessionContext({ user, profile, stores }) {
  state.user = user;
  state.profile = profile;
  state.stores = stores;
  state.activeStoreId = resolveActiveStore(profile, stores);
}

export function isSuperAdmin() {
  return state.profile?.role === 'super_admin';
}

/** Id de la tienda con la que se está trabajando. */
export function getStoreId() {
  return state.activeStoreId;
}

/** Tienda activa completa (id, nombre, slug). */
export function getActiveStore() {
  return state.stores.find((store) => store.id === state.activeStoreId) ?? null;
}

/** Tiendas disponibles: una para un admin, todas para el super_admin. */
export function getStores() {
  return state.stores;
}

/**
 * Cambia de tienda. Solo tiene sentido para el super_admin; para un admin la
 * lista tiene una única entrada.
 * La elección se recuerda entre páginas y recargas.
 */
export function setActiveStore(storeId) {
  if (!state.stores.some((store) => store.id === storeId)) return false;

  state.activeStoreId = storeId;
  remember(storeId);
  return true;
}

/* ------------------------------------------------------------------ interno */

/**
 * Un admin trabaja siempre en su tienda. El super_admin retoma la última que
 * usó; si ya no existe o es la primera vez, entra en la primera de la lista.
 */
function resolveActiveStore(profile, stores) {
  if (stores.length === 0) return null;

  if (profile?.role !== 'super_admin') {
    return profile?.storeId ?? stores[0].id;
  }

  const remembered = recall();
  const isValid = remembered && stores.some((store) => store.id === remembered);

  return isValid ? remembered : stores[0].id;
}

function remember(storeId) {
  try {
    window.localStorage.setItem(ACTIVE_STORE_KEY, storeId);
  } catch {
    // Modo privado o almacenamiento lleno: no es motivo para romper el panel.
  }
}

function recall() {
  try {
    return window.localStorage.getItem(ACTIVE_STORE_KEY);
  } catch {
    return null;
  }
}
