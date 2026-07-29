/**
 * dashboard.js — Controlador de dashboard.html.
 *
 * Pide datos a los servicios y los pinta. No construye ni una sola consulta:
 * toda la comunicación con Supabase vive en js/services/.
 */

import { initPage } from './app.js';
import { countBrands } from './services/brands.service.js';
import { countCategories } from './services/categories.service.js';
import { countProducts, listLatestProducts } from './services/products.service.js';
import { $, el } from './core/dom.js';
import { reportError } from './core/errors.js';
import { formatCurrency, formatNumber, formatRelative } from './core/format.js';
import { emptyState, notify, skeletonRows } from './core/ui.js';
import { icon } from './ui/icons.js';

/**
 * Definición declarativa de las tarjetas: agregar una métrica es añadir una
 * entrada aquí y su función de conteo en el servicio correspondiente.
 */
const STAT_CARDS = [
  { key: 'products', label: 'Productos', icon: 'box', meta: 'en el catálogo', count: countProducts },
  { key: 'categories', label: 'Categorías', icon: 'tag', meta: 'grupos activos', count: countCategories },
  { key: 'brands', label: 'Marcas', icon: 'award', meta: 'marcas registradas', count: countBrands },
];

const LATEST_LIMIT = 5;
const TABLE_COLUMNS = 4;

async function main() {
  const context = await initPage({
    active: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Resumen general de tu tienda',
  });

  if (!context) return; // sin sesión o sin configurar: ya se redirigió

  renderGreeting(context.user);
  renderStatSkeletons();
  renderTableSkeleton();

  // Cada bloque carga y falla por separado: si una consulta se cae, el resto
  // de la pantalla sigue siendo útil.
  await Promise.all([loadStats(), loadLatestProducts()]);
}

/* ------------------------------------------------------------- bienvenida */

function renderGreeting(user) {
  const node = $('#greeting');
  if (!node) return;

  const name = (user?.email ?? '').split('@')[0];
  node.textContent = name ? `Hola, ${name}.` : 'Hola.';
}

/* ---------------------------------------------------------------- métricas */

function renderStatSkeletons() {
  const container = $('#stats');
  if (!container) return;

  container.replaceChildren(
    ...STAT_CARDS.map((card, index) =>
      el(
        'article',
        { class: 'stat anim-in', style: `--i:${index}`, dataset: { stat: card.key } },
        [
          el('div', { class: 'stat__top' }, [
            el('span', { class: 'stat__icon', html: icon(card.icon) }),
            el('span', { class: 'stat__label', text: card.label }),
          ]),
          el('div', { class: 'skeleton skeleton--value', dataset: { value: '' } }),
          el('p', { class: 'stat__meta', text: card.meta }),
        ],
      ),
    ),
  );
}

async function loadStats() {
  try {
    // Las tres consultas salen a la vez, en el orden de STAT_CARDS.
    const totals = await Promise.all(STAT_CARDS.map((card) => card.count()));

    STAT_CARDS.forEach((card, index) => {
      paintStat(card.key, formatNumber(totals[index]));
    });
  } catch (error) {
    const message = reportError('dashboard:contadores', error);

    STAT_CARDS.forEach((card) => paintStat(card.key, '—', true));
    notify.error(`No se pudieron cargar los totales. ${message}`);
  }
}

/** Sustituye el bloque gris animado por el valor real. */
function paintStat(key, value, failed = false) {
  const slot = $(`[data-stat="${key}"] [data-value]`);
  if (!slot) return;

  slot.className = failed ? 'stat__value u-muted' : 'stat__value';
  slot.textContent = value;
}

/* -------------------------------------------------------- últimos productos */

function renderTableSkeleton() {
  const body = $('#latest-body');
  if (body) body.replaceChildren(skeletonRows(LATEST_LIMIT, TABLE_COLUMNS));
}

async function loadLatestProducts() {
  const body = $('#latest-body');
  if (!body) return;

  try {
    const products = await listLatestProducts(LATEST_LIMIT);

    if (products.length === 0) {
      showTableMessage(
        body,
        emptyState({
          iconName: 'box',
          title: 'Todavía no hay productos',
          text: 'Cuando agregues tu primer producto aparecerá aquí automáticamente.',
        }),
      );
      return;
    }

    body.replaceChildren(...products.map(productRow));
  } catch (error) {
    const message = reportError('dashboard:ultimos-productos', error);

    showTableMessage(
      body,
      emptyState({
        iconName: 'alert',
        title: 'No se pudieron cargar los productos',
        text: message,
      }),
    );
  }
}

function productRow(product, index) {
  const subtitle = [product.brand, product.category].filter(Boolean).join(' · ');

  return el('tr', { class: 'anim-in', style: `--i:${index}` }, [
    el('td', {}, [
      el('div', { class: 'table__primary u-truncate', text: product.name }),
      el('div', {
        class: 'table__sub',
        text: subtitle || product.reference || 'Sin clasificar',
      }),
    ]),
    el('td', { class: 'table__num', text: product.reference || '—' }),
    el('td', { class: 'table__num', text: formatCurrency(product.price) }),
    el('td', {
      class: 'table__num table__right u-muted',
      text: formatRelative(product.createdAt),
    }),
  ]);
}

/** Coloca un bloque (vacío o de error) ocupando toda la tabla. */
function showTableMessage(body, node) {
  body.replaceChildren(
    el('tr', {}, [el('td', { colspan: String(TABLE_COLUMNS) }, [node])]),
  );
}

main();
