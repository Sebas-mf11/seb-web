/**
 * crud-page.js — Vista de tabla CRUD reutilizable.
 * =============================================================================
 * Categorías y Marcas son la misma pantalla con distintos datos: listar,
 * buscar, paginar, crear, editar y eliminar. En lugar de escribir dos
 * controladores casi idénticos, la mecánica vive aquí y cada módulo aporta
 * solo su configuración (columnas, campos, servicio y textos).
 *
 * No conoce Supabase: recibe el servicio ya construido.
 *
 * El HTML de la página debe declarar estos identificadores:
 *   #search  #result-count  #create  #crud-head  #crud-body  #pagination
 * =============================================================================
 */

import { initPage } from '../app.js';
import { $, debounce, delegate, el } from '../core/dom.js';
import { reportError } from '../core/errors.js';
import {
  confirmDialog,
  emptyState,
  formDialog,
  notify,
  skeletonRows,
  tableMessage,
} from '../core/ui.js';
import { icon, paintIcons } from './icons.js';
import { renderPagination } from './pagination.js';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * @param {{
 *   active: string, title: string, subtitle: string, emptyIcon: string,
 *   columns: Array<{header: string, className?: string, render: (item: object) => Node|string}>,
 *   fields: Array<object>,
 *   toFormValues: (item: object) => Record<string, string>,
 *   service: {listPage: Function, create: Function, update: Function, remove: Function},
 *   texts: Record<string, any>
 * }} config
 * @returns {() => Promise<void>} función de arranque de la página.
 */
export function createCrudPage(config) {
  const { columns, texts, service } = config;

  /** +1 por la columna de acciones. */
  const columnCount = columns.length + 1;

  const state = {
    search: '',
    page: 1,
    total: 0,
    totalPages: 1,
    /** Última página cargada, para resolver el item al editar o borrar. */
    items: [],
  };

  /* ------------------------------------------------------------- arranque */

  async function start() {
    const context = await initPage({
      active: config.active,
      title: config.title,
      subtitle: config.subtitle,
    });

    if (!context) return;

    paintIcons();
    renderHead();

    const search = $('#search');
    if (search) search.placeholder = texts.searchPlaceholder;

    const createLabel = $('#create-label');
    if (createLabel) createLabel.textContent = texts.new;

    wireSearch();
    wireCreate();
    wireRowActions();

    await load();
  }

  /* ---------------------------------------------------------------- carga */

  async function load() {
    const body = $('#crud-body');
    if (!body) return;

    body.replaceChildren(skeletonRows(Math.min(PAGE_SIZE, 6), columnCount));

    try {
      const result = await service.listPage({
        search: state.search,
        page: state.page,
        pageSize: PAGE_SIZE,
      });

      state.total = result.total;
      state.totalPages = result.totalPages;
      state.items = result.items;

      // Si se borró el último elemento de la página, retrocede en vez de
      // dejar una tabla vacía con paginación por delante.
      if (result.items.length === 0 && state.page > 1) {
        state.page -= 1;
        await load();
        return;
      }

      renderRows(result.items);
    } catch (error) {
      // Se limpia el estado para no dejar un contador ni una paginación que
      // describan datos que ya no están en pantalla.
      state.items = [];
      state.total = 0;
      state.totalPages = 1;

      body.replaceChildren(
        tableMessage(
          columnCount,
          emptyState({
            iconName: 'alert',
            title: texts.loadError,
            text: reportError(`${config.active}:listar`, error),
          }),
        ),
      );
    }

    renderCount();
    renderPagination($('#pagination'), {
      page: state.page,
      totalPages: state.totalPages,
      total: state.total,
      pageSize: PAGE_SIZE,
      onChange: (page) => {
        state.page = page;
        load();
      },
    });
  }

  /* -------------------------------------------------------------- pintado */

  function renderHead() {
    const head = $('#crud-head');
    if (!head) return;

    head.replaceChildren(
      ...columns.map((column) =>
        el('th', { scope: 'col', class: column.className ?? null, text: column.header }),
      ),
      el('th', { scope: 'col', class: 'table__right', text: 'Acciones' }),
    );
  }

  function renderRows(items) {
    const body = $('#crud-body');

    if (items.length === 0) {
      body.replaceChildren(
        tableMessage(
          columnCount,
          state.search
            ? emptyState({
                iconName: 'search',
                title: 'Sin resultados',
                text: texts.searchEmpty(state.search),
              })
            : emptyState({
                iconName: config.emptyIcon,
                title: texts.empty.title,
                text: texts.empty.text,
              }),
        ),
      );
      return;
    }

    body.replaceChildren(...items.map(row));
  }

  function row(item, index) {
    const cells = columns.map((column) => {
      const content = column.render(item);
      return typeof content === 'string'
        ? el('td', { class: column.className ?? null, text: content })
        : el('td', { class: column.className ?? null }, [content]);
    });

    return el(
      'tr',
      { class: 'anim-in', style: `--i:${index}`, dataset: { id: String(item.id) } },
      [...cells, el('td', {}, [rowActions(item)])],
    );
  }

  function rowActions(item) {
    const name = config.itemLabel(item);

    return el('div', { class: 'row-actions' }, [
      el('button', {
        type: 'button',
        class: 'btn btn--icon',
        title: 'Editar',
        'aria-label': `Editar ${name}`,
        dataset: { action: 'edit' },
        html: icon('edit', { size: 17 }),
      }),
      el('button', {
        type: 'button',
        class: 'btn btn--icon is-danger',
        title: 'Eliminar',
        'aria-label': `Eliminar ${name}`,
        dataset: { action: 'delete' },
        html: icon('trash', { size: 17 }),
      }),
    ]);
  }

  function renderCount() {
    const node = $('#result-count');
    if (!node) return;

    node.textContent = state.total === 0 ? '' : texts.count(state.total);
  }

  /* ------------------------------------------------------------- búsqueda */

  function wireSearch() {
    const input = $('#search');
    if (!input) return;

    const run = debounce(() => {
      state.search = input.value.trim();
      state.page = 1;
      load();
    }, SEARCH_DEBOUNCE_MS);

    input.addEventListener('input', run);
  }

  /* --------------------------------------------------------- alta/edición */

  function wireCreate() {
    $('#create')?.addEventListener('click', async () => {
      const saved = await formDialog({
        title: texts.new,
        fields: config.fields,
        submitText: 'Crear',
        onSubmit: (values) => service.create(values),
      });

      if (!saved) return;

      notify.success(texts.created);
      state.page = 1;
      await load();
    });
  }

  function wireRowActions() {
    const body = $('#crud-body');

    delegate(body, 'click', '[data-action="edit"]', (event, button) => {
      const item = findItem(button.closest('tr')?.dataset.id);
      if (item) handleEdit(item);
    });

    delegate(body, 'click', '[data-action="delete"]', (event, button) => {
      const item = findItem(button.closest('tr')?.dataset.id);
      if (item) handleDelete(item);
    });
  }

  async function handleEdit(item) {
    const saved = await formDialog({
      title: texts.edit,
      fields: config.fields,
      values: config.toFormValues(item),
      submitText: 'Guardar cambios',
      onSubmit: (values) => service.update(item.id, values),
    });

    if (!saved) return;

    notify.success(texts.updated);
    await load();
  }

  async function handleDelete(item) {
    const name = config.itemLabel(item);

    const confirmed = await confirmDialog({
      title: texts.deleteTitle,
      message: texts.deleteMessage(name),
      confirmText: 'Sí, eliminar',
    });

    if (!confirmed) return;

    try {
      await service.remove(item.id);
      notify.success(texts.deleted(name));
      await load();
    } catch (error) {
      notify.error(reportError(`${config.active}:eliminar`, error));
    }
  }

  /** Los ids pueden ser uuid o número: se comparan como texto. */
  function findItem(id) {
    return state.items.find((item) => String(item.id) === String(id)) ?? null;
  }

  return start;
}
