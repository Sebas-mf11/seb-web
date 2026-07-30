/**
 * layout.js — Shell compartido del panel: sidebar + barra superior.
 * Las páginas HTML solo declaran los contenedores vacíos; este módulo los
 * rellena. Añadir un módulo nuevo al CMS = añadir una entrada en NAV_ITEMS.
 */

import { BRANDING, ROUTES } from '../../supabase/config.js';
import { $, el } from '../core/dom.js';
import { initials } from '../core/format.js';
import {
  getActiveStore,
  getStores,
  isSuperAdmin,
  setActiveStore,
} from '../core/session.js';
import { notify, setLoading } from '../core/ui.js';
import { signOut } from '../auth.js';
import { icon } from './icons.js';

/**
 * Menú lateral. Añadir un módulo al CMS es añadir una entrada aquí.
 * `ready: false` deja el módulo visible pero deshabilitado, para anunciar algo
 * que aún no existe sin llevar a un 404.
 *
 * El alcance del producto es este y no crece: el diseño de la tienda no se
 * administra desde el panel.
 */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: ROUTES.dashboard, icon: 'dashboard', group: 'General', ready: true },
  { id: 'products', label: 'Productos', href: ROUTES.products, icon: 'box', group: 'Catálogo', ready: true },
  { id: 'categories', label: 'Categorías', href: ROUTES.categories, icon: 'tag', group: 'Catálogo', ready: true },
  { id: 'brands', label: 'Marcas', href: ROUTES.brands, icon: 'award', group: 'Catálogo', ready: true },
];

/**
 * Monta el shell completo.
 * @param {{active: string, user: object|null, title: string, subtitle?: string,
 *          actions?: (Node|string)[]}} options
 */
export function renderShell({ active, user, title, subtitle = '', actions = [] }) {
  buildSidebar(active, user);
  buildTopbar({ title, subtitle, actions });
  wireSidebarToggle();
}

/* ---------------------------------------------------------------- sidebar */

function buildSidebar(active, user) {
  const sidebar = $('#sidebar');
  if (!sidebar) return;

  sidebar.replaceChildren(
    brandBlock(),
    navBlock(active),
    el('div', { class: 'sidebar__footer' }, [userChip(user), logoutButton()]),
  );
}

function brandBlock() {
  // Debajo del nombre del panel va la tienda en la que se está trabajando:
  // es el dato que evita editar el catálogo equivocado.
  const store = getActiveStore();

  return el('div', { class: 'sidebar__brand' }, [
    el('span', {
      class: 'sidebar__mark',
      text: BRANDING.appName.slice(0, 1).toUpperCase() || 'C',
      'aria-hidden': 'true',
    }),
    el('span', { class: 'sidebar__brand-text' }, [
      el('strong', { class: 'sidebar__name', text: BRANDING.appName }),
      el('span', {
        class: 'sidebar__role u-truncate',
        text: store?.name ?? BRANDING.clientName,
        title: store?.name ?? '',
      }),
    ]),
  ]);
}

function navBlock(active) {
  const nav = el('nav', { class: 'sidebar__nav', 'aria-label': 'Menú principal' });
  let lastGroup = null;

  NAV_ITEMS.forEach((item) => {
    if (item.group !== lastGroup) {
      nav.append(el('p', { class: 'sidebar__section', text: item.group }));
      lastGroup = item.group;
    }
    nav.append(navItem(item, active));
  });

  return nav;
}

function navItem(item, active) {
  const isActive = item.id === active;
  const content = [
    el('span', { class: 'u-row', html: icon(item.icon, { size: 18 }) }),
    el('span', { text: item.label }),
  ];

  // Módulo aún no construido: no es un enlace, es un aviso.
  if (!item.ready) {
    return el(
      'span',
      { class: 'nav-item is-locked', title: 'Disponible próximamente' },
      [...content, el('span', { class: 'nav-item__tag', text: 'Pronto' })],
    );
  }

  return el(
    'a',
    {
      class: `nav-item${isActive ? ' is-active' : ''}`,
      href: item.href,
      'aria-current': isActive ? 'page' : null,
    },
    content,
  );
}

function userChip(user) {
  const email = user?.email ?? '—';

  return el('div', { class: 'user-chip' }, [
    el('span', { class: 'avatar', text: initials(email), 'aria-hidden': 'true' }),
    el('span', { class: 'user-chip__meta' }, [
      el('span', { class: 'user-chip__name u-truncate', text: email, title: email }),
      el('span', { class: 'user-chip__role', text: 'Administrador' }),
    ]),
  ]);
}

function logoutButton() {
  const button = el('button', {
    type: 'button',
    class: 'btn btn--subtle btn--block',
    html: `${icon('logout', { size: 17 })}<span>Cerrar sesión</span>`,
    style: 'justify-content:flex-start;margin-top:.35rem',
  });

  button.addEventListener('click', async () => {
    setLoading(button, true);
    try {
      await signOut();
    } catch (error) {
      console.error('[commerce-cms] error al cerrar sesión', error);
      notify.error('No se pudo cerrar la sesión. Inténtalo de nuevo.');
      setLoading(button, false);
    }
  });

  return button;
}

/* ----------------------------------------------------------------- topbar */

function buildTopbar({ title, subtitle, actions }) {
  const topbar = $('#topbar');
  if (!topbar) return;

  const toggle = el('button', {
    type: 'button',
    class: 'topbar__toggle',
    'aria-label': 'Abrir menú',
    'aria-expanded': 'false',
    'data-sidebar-toggle': '',
    html: icon('menu', { size: 20 }),
  });

  const heading = el('div', { class: 'topbar__heading' }, [
    el('h1', { class: 'topbar__title', text: title }),
    ...(subtitle ? [el('p', { class: 'topbar__subtitle', text: subtitle })] : []),
  ]);

  const actionsBox = el('div', { class: 'topbar__actions' }, [
    ...storeSwitcher(),
    ...actions,
  ]);

  topbar.replaceChildren(toggle, heading, actionsBox);

  const store = getActiveStore();
  document.title = store
    ? `${title} · ${store.name}`
    : `${title} · ${BRANDING.appName}`;
}

/**
 * Selector de tienda: solo para el super_admin, y solo si administra más de
 * una. Un admin normal no lo ve porque no tiene nada que elegir.
 *
 * Al cambiar se recarga la página: es la forma más simple y segura de que
 * todas las pantallas y consultas partan de la nueva tienda, sin dejar restos
 * del catálogo anterior en memoria.
 */
function storeSwitcher() {
  if (!isSuperAdmin()) return [];

  const stores = getStores();
  if (stores.length <= 1) return [];

  const select = el(
    'select',
    { class: 'select select--compact', 'aria-label': 'Tienda que estás administrando' },
    stores.map((store) => el('option', { value: store.id, text: store.name })),
  );

  select.value = getActiveStore()?.id ?? '';

  select.addEventListener('change', () => {
    if (setActiveStore(select.value)) window.location.reload();
  });

  return [select];
}

/* ------------------------------------------------------ sidebar en móvil */

function wireSidebarToggle() {
  const body = document.body;

  const close = () => {
    body.classList.remove('sidebar-open');
    $('[data-sidebar-toggle]')?.setAttribute('aria-expanded', 'false');
  };

  $('[data-sidebar-toggle]')?.addEventListener('click', (event) => {
    const open = !body.classList.contains('sidebar-open');
    body.classList.toggle('sidebar-open', open);
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });

  $('[data-sidebar-close]')?.addEventListener('click', close);

  // Navegar dentro del menú lo cierra; Escape también.
  $('#sidebar')?.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}
