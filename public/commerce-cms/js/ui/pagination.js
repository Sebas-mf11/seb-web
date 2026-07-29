/**
 * pagination.js — Controles de paginación compartidos.
 *
 * Lo usan todas las tablas del panel: el formato del contador y el
 * comportamiento de los botones se definen una sola vez.
 */

import { el } from '../core/dom.js';
import { icon } from './icons.js';

/**
 * Pinta (u oculta) la paginación de una tabla.
 *
 * @param {HTMLElement} container
 * @param {{page: number, totalPages: number, total: number, pageSize: number,
 *          onChange: (page: number) => void}} options
 */
export function renderPagination(container, { page, totalPages, total, pageSize, onChange }) {
  if (!container) return;

  // Con una sola página los controles sobran.
  if (total <= pageSize) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  container.hidden = false;
  container.replaceChildren(
    el('span', {
      class: 'pagination__info',
      text: `${first}–${last} de ${total} · página ${page} de ${totalPages}`,
    }),
    el('div', { class: 'pagination__nav' }, [
      pageButton('chevronLeft', 'Página anterior', page - 1, page <= 1, onChange),
      pageButton('chevronRight', 'Página siguiente', page + 1, page >= totalPages, onChange),
    ]),
  );
}

function pageButton(iconName, label, targetPage, disabled, onChange) {
  const button = el('button', {
    type: 'button',
    class: 'btn btn--ghost btn--icon',
    'aria-label': label,
    title: label,
    disabled,
    html: icon(iconName, { size: 17 }),
  });

  if (!disabled) {
    button.addEventListener('click', () => {
      onChange(targetPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return button;
}
