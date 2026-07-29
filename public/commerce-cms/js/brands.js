/**
 * brands.js — Controlador de brands.html.
 *
 * Solo configuración: la mecánica de la tabla CRUD vive en ui/crud-page.js,
 * y el acceso a datos en services/brands.service.js.
 */

import {
  createBrand,
  deleteBrand,
  listBrandsPage,
  updateBrand,
} from './services/brands.service.js';
import { el } from './core/dom.js';
import { formatDate } from './core/format.js';
import { createCrudPage } from './ui/crud-page.js';

const start = createCrudPage({
  active: 'brands',
  title: 'Marcas',
  subtitle: 'Los fabricantes que vendes en tu tienda',
  emptyIcon: 'award',

  columns: [
    {
      header: 'Nombre',
      render: (item) => el('span', { class: 'table__primary', text: item.name }),
    },
    {
      header: 'Creada',
      className: 'table__num u-muted',
      render: (item) => formatDate(item.createdAt),
    },
  ],

  fields: [
    {
      name: 'name',
      label: 'Nombre',
      required: true,
      maxLength: 120,
      placeholder: 'Samsung',
    },
  ],

  toFormValues: (item) => ({ name: item.name }),
  itemLabel: (item) => item.name,

  service: {
    listPage: listBrandsPage,
    create: createBrand,
    update: updateBrand,
    remove: deleteBrand,
  },

  texts: {
    new: 'Nueva marca',
    edit: 'Editar marca',
    created: 'Marca creada.',
    updated: 'Marca actualizada.',
    deleted: (name) => `"${name}" se eliminó.`,
    deleteTitle: 'Eliminar marca',
    deleteMessage: (name) =>
      `Se eliminará la marca "${name}". Esta acción no se puede deshacer.`,
    loadError: 'No se pudieron cargar las marcas',
    searchPlaceholder: 'Buscar por nombre…',
    searchEmpty: (term) => `No encontramos marcas para "${term}".`,
    empty: {
      title: 'Aún no tienes marcas',
      text: 'Crea la primera para asignarla a tus productos.',
    },
    count: (total) => (total === 1 ? '1 marca' : `${total} marcas`),
  },
});

start();
