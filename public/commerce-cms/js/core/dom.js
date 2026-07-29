/**
 * dom.js — Utilidades mínimas de DOM.
 * Evita repetir querySelector/createElement por todo el proyecto.
 * No conoce Supabase ni la lógica de negocio.
 */

/** Primer elemento que coincide con el selector. */
export const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Crea un elemento con atributos e hijos en una sola expresión.
 * @param {string} tag
 * @param {Object} [props] - `class`, `text`, `html`, `dataset`, o cualquier atributo.
 * @param {(Node|string)[]} [children]
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;

    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  });

  children.forEach((child) => {
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  });

  return node;
}

/**
 * Delegación de eventos: un único listener en el contenedor atiende a
 * elementos que aún no existen (filas creadas dinámicamente, por ejemplo).
 */
export function delegate(root, event, selector, handler) {
  if (!root) return;
  root.addEventListener(event, (ev) => {
    const target = ev.target.closest(selector);
    if (target && root.contains(target)) handler(ev, target);
  });
}

/**
 * Retrasa la ejecución hasta que dejan de llegar llamadas.
 * En los buscadores evita una consulta por cada tecla pulsada.
 */
export function debounce(fn, delay = 300) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
