/**
 * product-form.js — Controlador de product-form.html.
 *
 * La misma pantalla sirve para crear y para editar: si la URL trae `?id=`,
 * carga el producto y actualiza; si no, crea uno nuevo.
 *
 * Las imágenes se manejan en dos planos que solo se sincronizan al guardar:
 *   - `state.media`   lo que el cliente ve, en orden (la primera es la principal)
 *   - `state.removed` lo que había guardado y decidió quitar
 * Así nada se sube ni se borra hasta que confirma, y puede cancelar sin dejar
 * archivos sueltos en el bucket.
 */

import { initPage } from './app.js';
import { ROUTES, STORAGE_CONFIG } from '../supabase/config.js';
import {
  PRODUCT_CONDITIONS,
  createProduct,
  getProduct,
  updateProduct,
} from './services/products.service.js';
import {
  addProductImage,
  deleteProductImage,
  listImagesOfProduct,
  updateImageOrder,
} from './services/product-images.service.js';
import { listBrands } from './services/brands.service.js';
import { listCategories } from './services/categories.service.js';
import {
  assertValidImage,
  pathFromPublicUrl,
  removeFiles,
  uploadProductImage,
} from './services/storage.service.js';
import { $, el } from './core/dom.js';
import { reportError } from './core/errors.js';
import { slugify } from './core/format.js';
import { notify, setInlineAlert, setLoading } from './core/ui.js';
import { icon, paintIcons } from './ui/icons.js';

/** Tope razonable de imágenes por producto. */
const MAX_IMAGES = 10;

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const isEditing = Boolean(productId);

const state = {
  /** Galería visible, en orden. La posición 0 es la imagen principal. */
  media: [],
  /** Imágenes ya guardadas que se borrarán al confirmar. */
  removed: [],
  /**
   * true cuando el slug lo decide el cliente y deja de seguir al nombre.
   * Al editar arranca en true: cambiar el enlace de un producto ya publicado
   * rompe los enlaces compartidos, así que nunca se toca por su cuenta.
   */
  slugTouched: isEditing,
  ready: false,
};

async function main() {
  const context = await initPage({
    active: 'products',
    title: isEditing ? 'Editar producto' : 'Nuevo producto',
    subtitle: isEditing
      ? 'Actualiza la información y guarda los cambios'
      : 'Completa los datos y publícalo en tu catálogo',
  });

  if (!context) return;

  paintIcons();
  $('#dropzone-hint').textContent =
    `JPG, PNG, WebP o AVIF · hasta ${STORAGE_CONFIG.maxFileSizeMB} MB por imagen`;

  wireImages();
  wireAvailableSwitch();
  wireSlug();
  wireSubmit();

  await loadInitialData();
}

/* ------------------------------------------------------------ carga inicial */

async function loadInitialData() {
  try {
    // Marcas y categorías siempre; el producto solo si estamos editando.
    const [brands, categories] = await Promise.all([listBrands(), listCategories()]);

    fillSelect('#brand', brands, 'Sin marca');
    fillSelect('#category', categories, 'Sin categoría');

    if (isEditing) {
      const [product, images] = await Promise.all([
        getProduct(productId),
        listImagesOfProduct(productId),
      ]);

      fillForm(product);
      state.media = images.map(toExistingMedia);
      renderMedia();
    }

    state.ready = true;
  } catch (error) {
    const message = reportError('producto:cargar', error);
    setInlineAlert($('#form-alert'), message);

    // Sin datos base no tiene sentido dejar guardar.
    setLoading($('#submit'), false);
    $('#submit').disabled = true;
  }
}

function fillSelect(selector, items, emptyLabel) {
  const select = $(selector);
  if (!select) return;

  select.replaceChildren(
    el('option', { value: '', text: emptyLabel }),
    ...items.map((item) => el('option', { value: String(item.id), text: item.name })),
  );
}

function fillForm(product) {
  $('#name').value = product.name ?? '';
  $('#slug').value = product.slug ?? '';
  $('#reference').value = product.reference ?? '';
  $('#price').value = product.price ?? '';
  $('#description').value = product.description ?? '';
  $('#brand').value = product.brandId ? String(product.brandId) : '';
  $('#category').value = product.categoryId ? String(product.categoryId) : '';

  const condition = PRODUCT_CONDITIONS.includes(product.condition)
    ? product.condition
    : PRODUCT_CONDITIONS[0];
  const radio = document.querySelector(`input[name="condition"][value="${condition}"]`);
  if (radio) radio.checked = true;

  $('#available').checked = product.available;
  syncAvailableLabel();
}

/* ------------------------------------------------------------------ imágenes */

function wireImages() {
  const dropzone = $('#dropzone');
  const input = $('#images');

  input.addEventListener('change', () => {
    addFiles([...input.files]);
    input.value = ''; // permite volver a elegir el mismo archivo
  });

  // Arrastrar y soltar
  ['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-over');
    });
  });

  ['dragleave', 'drop'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-over');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    const files = [...(event.dataTransfer?.files ?? [])];
    addFiles(files.filter((file) => file.type.startsWith('image/')));
  });
}

/**
 * Añade archivos a la galería tras validarlos.
 * Se valida aquí, no al guardar: el cliente se entera del problema en el
 * momento y no después de llenar todo el formulario.
 */
function addFiles(files) {
  if (files.length === 0) return;

  const space = MAX_IMAGES - state.media.length;

  if (space <= 0) {
    notify.error(`Máximo ${MAX_IMAGES} imágenes por producto.`);
    return;
  }

  files.slice(0, space).forEach((file) => {
    try {
      assertValidImage(file);
      state.media.push({
        key: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind: 'pending',
        file,
        previewUrl: URL.createObjectURL(file),
      });
    } catch (error) {
      notify.error(reportError('producto:imagen', error));
    }
  });

  if (files.length > space) {
    notify.info(`Solo se agregaron ${space}: el máximo es ${MAX_IMAGES} imágenes.`);
  }

  renderMedia();
}

function toExistingMedia(image) {
  return {
    key: `existing-${image.id}`,
    kind: 'existing',
    imageId: image.id,
    url: image.url,
    sortOrder: image.sortOrder,
  };
}

function renderMedia() {
  const grid = $('#media-grid');
  if (!grid) return;

  grid.replaceChildren(...state.media.map(mediaItem));
}

function mediaItem(item, index) {
  const isMain = index === 0;
  const source = item.kind === 'pending' ? item.previewUrl : item.url;

  const node = el(
    'figure',
    {
      class: `media-item${isMain ? ' is-main' : ''}${item.kind === 'pending' ? ' is-pending' : ''}`,
    },
    [el('img', { src: source, alt: '', loading: 'lazy' })],
  );

  if (isMain) {
    node.append(el('figcaption', { class: 'media-item__badge', text: 'Principal' }));
  }

  const tools = el('div', { class: 'media-item__tools' });

  if (!isMain) {
    const makeMain = el('button', {
      type: 'button',
      class: 'media-item__btn',
      title: 'Usar como principal',
      'aria-label': 'Usar como imagen principal',
      html: icon('star', { size: 15 }),
    });
    makeMain.addEventListener('click', () => promoteToMain(index));
    tools.append(makeMain);
  }

  const remove = el('button', {
    type: 'button',
    class: 'media-item__btn is-danger',
    title: 'Quitar imagen',
    'aria-label': 'Quitar imagen',
    html: icon('close', { size: 15 }),
  });
  remove.addEventListener('click', () => removeMedia(index));
  tools.append(remove);

  node.append(tools);
  return node;
}

/** Mueve una imagen al primer lugar: pasa a ser la principal. */
function promoteToMain(index) {
  const [item] = state.media.splice(index, 1);
  state.media.unshift(item);
  renderMedia();
}

/**
 * Quita una imagen de la galería.
 * Si ya estaba guardada, se anota para borrarla al confirmar; si era nueva,
 * se libera la vista previa y no queda rastro.
 */
function removeMedia(index) {
  const [item] = state.media.splice(index, 1);
  if (!item) return;

  if (item.kind === 'existing') {
    state.removed.push({ imageId: item.imageId, path: pathFromPublicUrl(item.url) });
  } else {
    URL.revokeObjectURL(item.previewUrl);
  }

  renderMedia();
}

/* ------------------------------------------------------------ enlace público */

/**
 * Al crear, el enlace sigue al nombre mientras el cliente no lo toque.
 * En cuanto lo edita a mano, manda lo que él escribió.
 */
function wireSlug() {
  const name = $('#name');
  const slug = $('#slug');
  if (!name || !slug) return;

  name.addEventListener('input', () => {
    if (state.slugTouched) return;
    slug.value = slugify(name.value);
  });

  slug.addEventListener('input', () => {
    state.slugTouched = true;
  });

  // Al salir del campo se normaliza lo escrito: nunca debe llegar a la URL un
  // espacio ni una tilde. Si lo dejó vacío, vuelve a seguir al nombre.
  slug.addEventListener('blur', () => {
    const clean = slugify(slug.value);

    if (!clean) {
      state.slugTouched = false;
      slug.value = slugify(name.value);
      return;
    }

    slug.value = clean;
  });
}

/* ------------------------------------------------------------ disponibilidad */

function wireAvailableSwitch() {
  $('#available')?.addEventListener('change', syncAvailableLabel);
}

function syncAvailableLabel() {
  const available = $('#available').checked;
  $('#available-state').textContent = available
    ? 'Se muestra en la tienda'
    : 'Oculto para los clientes';
}

/* -------------------------------------------------------------------- guardar */

function wireSubmit() {
  $('#product-form')?.addEventListener('submit', handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!state.ready) return;

  const alertBox = $('#form-alert');
  const submit = $('#submit');

  setInlineAlert(alertBox, null);
  setLoading(submit, true);

  try {
    const payload = readForm();

    const product = isEditing
      ? await updateProduct(productId, payload)
      : await createProduct(payload);

    await syncImages(product.id);

    notify.success(isEditing ? 'Producto actualizado.' : 'Producto creado.');
    window.location.href = ROUTES.products;
  } catch (error) {
    const message = reportError('producto:guardar', error);
    setInlineAlert(alertBox, message);
    setLoading(submit, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/** Lee el formulario. La validación de fondo la hace el servicio. */
function readForm() {
  return {
    name: $('#name').value,
    slug: $('#slug').value,
    reference: $('#reference').value,
    description: $('#description').value,
    price: $('#price').value,
    brandId: $('#brand').value,
    categoryId: $('#category').value,
    condition: document.querySelector('input[name="condition"]:checked')?.value ?? '',
    available: $('#available').checked,
  };
}

/**
 * Lleva la galería al estado que ve el cliente: borra lo quitado, sube lo
 * nuevo y renumera `sort_order` según el orden en pantalla.
 *
 * Se ejecuta después de guardar el producto porque las imágenes nuevas
 * necesitan su id para la ruta en Storage.
 */
async function syncImages(id) {
  // 1. Borrar lo que el cliente quitó (primero el registro, luego el archivo).
  for (const item of state.removed) {
    await deleteProductImage(item.imageId);
  }
  await removeFiles(state.removed.map((item) => item.path));
  state.removed = [];

  // 2. Recorrer la galería en orden: el índice es el nuevo `sort_order`.
  for (const [index, item] of state.media.entries()) {
    if (item.kind === 'existing') {
      if (item.sortOrder !== index) {
        await updateImageOrder(item.imageId, index);
        item.sortOrder = index;
      }
      continue;
    }

    const { url } = await uploadProductImage(item.file, { productId: id });
    await addProductImage({ productId: id, url, sortOrder: index });
  }
}

main();
