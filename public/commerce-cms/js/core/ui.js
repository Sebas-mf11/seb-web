/**
 * ui.js — Retroalimentación visual compartida: toasts, estados de carga,
 * esqueletos y pantalla de error bloqueante.
 * Ningún módulo debe inventar su propio sistema de avisos: todo pasa por aquí.
 */

import { $, el } from './dom.js';
import { humanizeError } from './errors.js';
import { icon } from '../ui/icons.js';

const TOAST_ICONS = {
  success: 'checkCircle',
  error: 'alert',
  info: 'info',
};

/**
 * Muestra un aviso flotante temporal.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type]
 * @param {{duration?: number}} [options]
 */
function toast(message, type = 'info', { duration = 4200 } = {}) {
  const container = getToastContainer();

  const node = el('div', {
    class: `toast toast--${type}`,
    role: type === 'error' ? 'alert' : 'status',
    html: `${icon(TOAST_ICONS[type] ?? 'info', { size: 18 })}<span></span>`,
  });

  // El mensaje va como texto, nunca como HTML: puede venir del servidor.
  node.querySelector('span').textContent = message;
  container.append(node);

  const remove = () => {
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  };

  const timer = setTimeout(remove, duration);
  node.addEventListener('click', () => {
    clearTimeout(timer);
    remove();
  });

  return node;
}

/** Atajos legibles. */
export const notify = {
  success: (message, options) => toast(message, 'success', options),
  error: (message, options) => toast(message, 'error', options),
  info: (message, options) => toast(message, 'info', options),
};

/**
 * Activa/desactiva el estado de carga de un botón (spinner + bloqueo).
 * Evita el doble envío de formularios.
 */
export function setLoading(button, isLoading) {
  if (!button) return;
  button.classList.toggle('is-loading', isLoading);
  button.disabled = isLoading;
  button.setAttribute('aria-busy', String(isLoading));
}

/** Quita la pantalla de arranque y revela el panel ya autenticado. */
export function revealApp() {
  document.body.classList.remove('is-booting');
}

/**
 * Muestra u oculta una alerta en línea dentro de un contenedor.
 * @param {HTMLElement} container
 * @param {string|null} message - null oculta la alerta.
 */
export function setInlineAlert(container, message, type = 'danger') {
  if (!container) return;

  if (!message) {
    container.replaceChildren();
    container.hidden = true;
    return;
  }

  container.hidden = false;
  container.replaceChildren(
    el('div', {
      class: `alert alert--${type}`,
      role: 'alert',
      html: `${icon(type === 'danger' ? 'alert' : 'info', { size: 17 })}<span></span>`,
    }),
  );
  container.querySelector('span').textContent = message;
}

/** Bloques grises animados mientras llegan los datos. */
export function skeletonRows(count = 4, columns = 4) {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < count; row += 1) {
    const tr = el('tr');
    for (let col = 0; col < columns; col += 1) {
      tr.append(
        el('td', {}, [
          el('div', {
            class: 'skeleton skeleton--text',
            style: `width:${col === 0 ? 70 : 45 + ((row * 7 + col * 11) % 30)}%`,
          }),
        ]),
      );
    }
    fragment.append(tr);
  }

  return fragment;
}

/**
 * Fila que ocupa toda la tabla, para mostrar un estado vacío o un error
 * dentro del <tbody> sin romper la rejilla de columnas.
 */
export function tableMessage(columns, node) {
  return el('tr', {}, [el('td', { colspan: String(columns) }, [node])]);
}

/** Estado vacío reutilizable (sin datos todavía / búsqueda sin resultados). */
export function emptyState({ iconName = 'box', title, text, action = null }) {
  const node = el('div', { class: 'empty' }, [
    el('div', { class: 'empty__icon', html: icon(iconName, { size: 22 }) }),
    el('p', { class: 'empty__title', text: title }),
  ]);

  if (text) node.append(el('p', { class: 'empty__text', text }));
  if (action) node.append(action);

  return node;
}

/**
 * Diálogo de confirmación para acciones destructivas.
 * Usa el elemento <dialog> nativo: el foco atrapado, el cierre con Escape y el
 * fondo modal los aporta el navegador, sin código propio que mantener.
 *
 * @param {{title: string, message: string, confirmText?: string,
 *          cancelText?: string, tone?: 'danger'|'primary'}} options
 * @returns {Promise<boolean>} true si el usuario confirmó.
 */
export function confirmDialog({
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  tone = 'danger',
} = {}) {
  return new Promise((resolve) => {
    const cancelButton = el('button', {
      type: 'submit',
      value: 'cancel',
      class: 'btn btn--ghost',
      text: cancelText,
    });

    const confirmButton = el('button', {
      type: 'submit',
      value: 'confirm',
      class: `btn ${tone === 'danger' ? 'btn--danger-strong' : 'btn--primary'}`,
      text: confirmText,
    });

    // <form method="dialog"> cierra el diálogo con el `value` del botón pulsado.
    const dialog = el('dialog', { class: 'modal' }, [
      el('form', { method: 'dialog', class: 'modal__box' }, [
        el('span', {
          class: `modal__icon modal__icon--${tone}`,
          html: icon(tone === 'danger' ? 'alert' : 'info', { size: 20 }),
        }),
        el('h2', { class: 'modal__title', text: title }),
        el('p', { class: 'modal__text', text: message }),
        el('div', { class: 'modal__actions' }, [cancelButton, confirmButton]),
      ]),
    ]);

    // Escape cierra sin returnValue, que equivale a cancelar.
    dialog.addEventListener('close', () => {
      const confirmed = dialog.returnValue === 'confirm';
      dialog.remove();
      resolve(confirmed);
    });

    // Clic en el fondo = cancelar.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close('cancel');
    });

    document.body.append(dialog);
    dialog.showModal();
    cancelButton.focus();
  });
}

/**
 * Diálogo con formulario, para altas y ediciones de pocos campos
 * (categorías y marcas). Para algo más grande existe una pantalla propia.
 *
 * El diálogo NO se cierra si `onSubmit` falla: el error se muestra dentro y el
 * cliente conserva lo que había escrito.
 *
 * @param {{title: string, description?: string, submitText?: string,
 *          fields: Array<{name: string, label: string, type?: 'text'|'textarea',
 *                         placeholder?: string, required?: boolean,
 *                         maxLength?: number, hint?: string}>,
 *          values?: Record<string, string>,
 *          onSubmit: (values: Record<string, string>) => Promise<void>}} options
 * @returns {Promise<boolean>} true si se guardó.
 */
export function formDialog({
  title,
  description = '',
  submitText = 'Guardar',
  fields,
  values = {},
  onSubmit,
}) {
  return new Promise((resolve) => {
    const alertBox = el('div', { hidden: true, style: 'margin-bottom:1rem' });
    const controls = new Map();

    const fieldNodes = fields.map((field) => {
      const id = `field-${field.name}`;

      const control =
        field.type === 'textarea'
          ? el('textarea', { class: 'input textarea textarea--compact', id, rows: '3' })
          : el('input', { class: 'input', type: 'text', id });

      control.value = values[field.name] ?? '';
      if (field.placeholder) control.placeholder = field.placeholder;
      if (field.maxLength) control.maxLength = field.maxLength;
      if (field.required) control.required = true;

      controls.set(field.name, control);

      return el('div', { class: 'field' }, [
        el('label', {
          class: 'field__label',
          for: id,
          text: field.required ? `${field.label} *` : field.label,
        }),
        control,
        ...(field.hint ? [el('span', { class: 'field__hint', text: field.hint })] : []),
      ]);
    });

    const cancel = el('button', {
      type: 'button',
      class: 'btn btn--ghost',
      text: 'Cancelar',
    });

    const submit = el('button', {
      type: 'submit',
      class: 'btn btn--primary',
      text: submitText,
    });

    const form = el('form', { class: 'modal__box', novalidate: true }, [
      el('h2', { class: 'modal__title', text: title }),
      ...(description ? [el('p', { class: 'modal__text', text: description })] : []),
      alertBox,
      el('div', { class: 'modal__fields' }, fieldNodes),
      el('div', { class: 'modal__actions' }, [cancel, submit]),
    ]);

    const dialog = el('dialog', { class: 'modal' }, [form]);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setInlineAlert(alertBox, null);
      setLoading(submit, true);

      const payload = Object.fromEntries(
        [...controls].map(([name, control]) => [name, control.value]),
      );

      try {
        await onSubmit(payload);
        dialog.close('saved');
      } catch (error) {
        console.error('[commerce-cms] formDialog', error);
        setInlineAlert(alertBox, humanizeError(error));
        setLoading(submit, false);
      }
    });

    cancel.addEventListener('click', () => dialog.close('cancel'));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close('cancel');
    });

    dialog.addEventListener('close', () => {
      const saved = dialog.returnValue === 'saved';
      dialog.remove();
      resolve(saved);
    });

    document.body.append(dialog);
    dialog.showModal();
    controls.values().next().value?.focus();
  });
}

/**
 * Error irrecuperable (falta configuración, por ejemplo): cubre la pantalla
 * con una explicación accionable en vez de dejar la página en blanco.
 */
export function fatalScreen({ title, message, hint = '' }) {
  document.body.classList.remove('is-booting');

  const screen = el('div', { class: 'fatal' }, [
    el('div', { class: 'fatal__box' }, [
      el('h2', { text: title }),
      el('p', { text: message }),
      ...(hint ? [el('code', { text: hint })] : []),
    ]),
  ]);

  document.body.append(screen);
  return screen;
}

/** Contenedor de toasts: se crea una sola vez, al primer aviso. */
function getToastContainer() {
  let container = $('#toasts');

  if (!container) {
    container = el('div', {
      id: 'toasts',
      class: 'toasts',
      'aria-live': 'polite',
      'aria-atomic': 'false',
    });
    document.body.append(container);
  }

  return container;
}
