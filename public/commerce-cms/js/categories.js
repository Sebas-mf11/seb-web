/**
 * categories.js — Controlador de categories.html.
 *
 * Solo configuración: la mecánica de la tabla CRUD vive en ui/crud-page.js,
 * y el acceso a datos en services/categories.service.js.
 */

import {
  createCategory,
  deleteCategory,
  listCategoriesPage,
  updateCategory,
} from './services/categories.service.js';
import { el } from './core/dom.js';
import { formatDate } from './core/format.js';
import { createCrudPage } from './ui/crud-page.js';

const start = createCrudPage({
  active: 'categories',
  title: 'Categorías',
  subtitle: 'Organiza tu catálogo por tipo de producto',
  emptyIcon: 'tag',

  columns: [
    {
      header: 'Nombre',
      render: (item) => el('span', { class: 'table__primary', text: item.name }),
    },
    {
      header: 'Descripción',
      className: 'u-soft',
      render: (item) =>
        el('span', { class: 'cell-clamp', text: item.description || '—' }),
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
      placeholder: 'Neveras',
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      maxLength: 500,
      placeholder: 'Opcional: en qué consiste esta categoría',
    },
  ],

  toFormValues: (item) => ({ name: item.name, description: item.description }),
  itemLabel: (item) => item.name,

  service: {
    listPage: listCategoriesPage,
    create: createCategory,
    update: updateCategory,
    remove: deleteCategory,
  },

  texts: {
    new: 'Nueva categoría',
    edit: 'Editar categoría',
    created: 'Categoría creada.',
    updated: 'Categoría actualizada.',
    deleted: (name) => `"${name}" se eliminó.`,
    deleteTitle: 'Eliminar categoría',
    deleteMessage: (name) =>
      `Se eliminará la categoría "${name}". Esta acción no se puede deshacer.`,
    loadError: 'No se pudieron cargar las categorías',
    searchPlaceholder: 'Buscar por nombre o descripción…',
    searchEmpty: (term) => `No encontramos categorías para "${term}".`,
    empty: {
      title: 'Aún no tienes categorías',
      text: 'Crea la primera para agrupar tus productos por tipo.',
    },
    count: (total) => (total === 1 ? '1 categoría' : `${total} categorías`),
  },
});

start();
