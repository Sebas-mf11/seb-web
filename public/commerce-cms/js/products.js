/**
 * products.js — Controlador de products.html (listado del catálogo).
 *
 * Búsqueda, paginación, edición y borrado. Toda la comunicación con Supabase
 * pasa por js/services/: aquí no hay ni una consulta.
 */

import { initPage } from './app.js';
import { deleteProduct, listProductsPage } from './services/products.service.js';
import {
  deleteImagesOfProduct,
  findUnreferencedUrls,
  listImagesOfProduct,
} from './services/product-images.service.js';
import { pathFromPublicUrl, removeFiles } from './services/storage.service.js';
import { ROUTES } from '../supabase/config.js';
import { $, debounce, delegate, el } from './core/dom.js';
import { reportError } from './core/errors.js';
import { formatCurrency, formatDate } from './core/format.js';
import {
  confirmDialog,
  emptyState,
  notify,
  skeletonRows,
  tableMessage,
} from './core/ui.js';
import { icon, paintIcons } from './ui/icons.js';
import { renderPagination } from './ui/pagination.js';

const PAGE_SIZE = 10;
const TABLE_COLUMNS = 8;
const SEARCH_DEBOUNCE_MS = 350;

/** Estado de la vista. Único sitio donde se guarda qué se está mostrando. */
const state = {
  search: '',
  page: 1,
  total: 0,
  totalPages: 1,
};

async function main() {
  const context = await initPage({
    active: 'products',
    title: 'Productos',
    subtitle: 'Gestiona el catálogo de tu tienda',
  });

  if (!context) return;

  paintIcons();
  wireSearch();
  wireRowActions();

  await loadProducts();
}

/* ------------------------------------------------------------------ carga */

async function loadProducts() {
  const body = $('#products-body');
  if (!body) return;

  body.replaceChildren(skeletonRows(Math.min(PAGE_SIZE, 6), TABLE_COLUMNS));

  try {
    const result = await listProductsPage({
      search: state.search,
      page: state.page,
      pageSize: PAGE_SIZE,
    });

    state.total = result.total;
    state.totalPages = result.totalPages;

    // Si se borró el último elemento de la página, retrocede en vez de dejar
    // la tabla vacía con paginación por delante.
    if (result.items.length === 0 && state.page > 1) {
      state.page -= 1;
      await loadProducts();
      return;
    }

    renderRows(result.items);
    renderCount();
    paintPagination();
  } catch (error) {
    const message = reportError('productos:listar', error);

    // Se limpia el estado para no dejar un contador ni una paginación que
    // describan datos que ya no están en pantalla.
    state.total = 0;
    state.totalPages = 1;

    showTableMessage(
      emptyState({
        iconName: 'alert',
        title: 'No se pudieron cargar los productos',
        text: message,
      }),
    );
    renderCount();
    paintPagination();
  }
}

/* --------------------------------------------------------------- listado */

function renderRows(products) {
  const body = $('#products-body');

  if (products.length === 0) {
    showTableMessage(
      state.search
        ? emptyState({
            iconName: 'search',
            title: 'Sin resultados',
            text: `No encontramos productos para "${state.search}". Prueba con otro nombre, referencia o marca.`,
          })
        : emptyState({
            iconName: 'box',
            title: 'Aún no tienes productos',
            text: 'Crea el primero y aparecerá en el catálogo de tu tienda.',
            action: el('a', {
              class: 'btn btn--primary',
              href: ROUTES.productForm,
              text: 'Nuevo producto',
              style: 'margin-top:.9rem',
            }),
          }),
    );
    return;
  }

  body.replaceChildren(...products.map(productRow));
}

function productRow(product, index) {
  return el('tr', { class: 'anim-in', style: `--i:${index}`, dataset: { id: product.id } }, [
    el('td', {}, [thumbnail(product)]),

    el('td', {}, [
      el('div', { class: 'table__primary u-truncate', text: product.name }),
      el('div', { class: 'table__sub', text: product.reference || 'Sin referencia' }),
    ]),

    el('td', { class: 'u-soft', text: product.brand || '—' }),
    el('td', { class: 'u-soft', text: product.category || '—' }),
    el('td', { class: 'table__num', text: formatCurrency(product.price) }),

    el('td', {}, [
      el('span', {
        class: `badge ${product.available ? 'badge--success' : 'badge--danger'}`,
        text: product.available ? 'Sí' : 'No',
      }),
    ]),

    el('td', { class: 'table__num u-muted', text: formatDate(product.createdAt) }),

    el('td', {}, [
      el('div', { class: 'row-actions' }, [
        el('a', {
          class: 'btn btn--icon',
          href: `${ROUTES.productForm}?id=${encodeURIComponent(product.id)}`,
          title: 'Editar',
          'aria-label': `Editar ${product.name}`,
          html: icon('edit', { size: 17 }),
        }),
        el('button', {
          type: 'button',
          class: 'btn btn--icon is-danger',
          title: 'Eliminar',
          'aria-label': `Eliminar ${product.name}`,
          dataset: { action: 'delete', name: product.name },
          html: icon('trash', { size: 17 }),
        }),
      ]),
    ]),
  ]);
}

function thumbnail(product) {
  if (!product.mainImage) {
    return el('span', {
      class: 'thumb',
      title: 'Sin imagen',
      html: icon('image', { size: 18 }),
    });
  }

  return el('span', { class: 'thumb' }, [
    el('img', {
      src: product.mainImage,
      alt: product.name,
      loading: 'lazy',
      decoding: 'async',
    }),
  ]);
}

/* ------------------------------------------------------------- búsqueda */

function wireSearch() {
  const input = $('#search');
  if (!input) return;

  // Se espera a que el cliente deje de teclear: una consulta por búsqueda,
  // no una por letra.
  const run = debounce(() => {
    state.search = input.value.trim();
    state.page = 1;
    loadProducts();
  }, SEARCH_DEBOUNCE_MS);

  input.addEventListener('input', run);
}

function renderCount() {
  const node = $('#result-count');
  if (!node) return;

  if (state.total === 0) {
    node.textContent = '';
    return;
  }

  const label = state.total === 1 ? '1 producto' : `${state.total} productos`;
  node.textContent = state.search ? `${label} encontrados` : label;
}

/* ------------------------------------------------------------ paginación */

function paintPagination() {
  renderPagination($('#pagination'), {
    page: state.page,
    totalPages: state.totalPages,
    total: state.total,
    pageSize: PAGE_SIZE,
    onChange: (page) => {
      state.page = page;
      loadProducts();
    },
  });
}

/* --------------------------------------------------------------- borrado */

function wireRowActions() {
  // Delegación: un único listener atiende a filas que se crean y destruyen.
  delegate($('#products-body'), 'click', '[data-action="delete"]', (event, button) => {
    const row = button.closest('tr');
    handleDelete(row?.dataset.id, button.dataset.name ?? 'este producto');
  });
}

async function handleDelete(id, name) {
  if (!id) return;

  const confirmed = await confirmDialog({
    title: 'Eliminar producto',
    message: `Se eliminará "${name}" junto con sus imágenes. Esta acción no se puede deshacer.`,
    confirmText: 'Sí, eliminar',
  });

  if (!confirmed) return;

  try {
    // Orden importante: primero los registros de imagen, después los archivos
    // que queden sin dueño, y al final el producto.
    //
    // Los archivos se borran DESPUÉS de quitar las filas y solo si ya no los
    // usa nadie: dos tiendas que copiaron el mismo catálogo comparten las
    // mismas imágenes en Storage, y borrarlas sin mirar dejaría a la otra
    // tienda con las fotos rotas.
    const images = await listImagesOfProduct(id);

    if (images.length > 0) {
      await deleteImagesOfProduct(id);

      const huerfanas = await findUnreferencedUrls(images.map((image) => image.url));
      await removeFiles(huerfanas.map(pathFromPublicUrl));
    }

    await deleteProduct(id);

    notify.success(`"${name}" se eliminó del catálogo.`);
    await loadProducts();
  } catch (error) {
    notify.error(reportError('productos:eliminar', error));
  }
}

/* ---------------------------------------------------------------- apoyo */

/** Coloca un bloque (vacío o de error) ocupando toda la tabla. */
function showTableMessage(node) {
  $('#products-body')?.replaceChildren(tableMessage(TABLE_COLUMNS, node));
}

main();
