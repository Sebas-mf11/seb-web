# Commerce CMS · v1.0

Panel de administración de catálogo para tiendas de electrodomésticos.
HTML, CSS y JavaScript (ES Modules) puros sobre Supabase. **Sin frameworks,
sin build, sin dependencias que instalar.**

Vive dentro de `public/`, así que Next.js lo sirve tal cual:

- Local: <http://localhost:3000/commerce-cms>
- Producción: <https://seb-web.pages.dev/commerce-cms>

No comparte código, dependencias ni build con el sitio: es una carpeta
autocontenida que se puede copiar a cualquier proyecto o desplegar sola.

## Alcance

El CMS administra **el catálogo**, nada más:

| Sí hace                                   | No hace                                    |
| ----------------------------------------- | ------------------------------------------ |
| Productos, categorías, marcas e imágenes  | Editar diseño, colores, banners o páginas  |
| Acceso privado con usuario y contraseña   | Registro público de usuarios               |
| Resumen del catálogo                      | Pedidos, clientes, pagos o inventario      |

El diseño de la tienda lo desarrolla el proveedor y **nunca es editable desde
el panel**. Esa frontera es deliberada: es lo que mantiene el producto simple,
estable y barato de mantener.

---

## Puesta en marcha para un cliente nuevo

1. **Crear el proyecto en Supabase** (uno por cliente: aísla los datos sin
   escribir lógica multi-tenant).

2. **Crear las tablas**: `categories`, `brands`, `products`, `product_images`.

3. **Ejecutar `supabase/schema-rls.sql`** en el SQL Editor de Supabase.
   Activa RLS y crea el bucket de imágenes. **Paso obligatorio**: sin él, la
   clave pública permitiría escribir a cualquiera.

4. **Aplicar las migraciones** de `supabase/migrations/` en orden de fecha.

5. **Crear el usuario del cliente**: Authentication → Users → Add user
   (marcar *Auto Confirm User*). Y desactivar el registro público en
   Authentication → Sign In / Providers → Email → *Allow new users to sign up* = OFF.

6. **Completar `supabase/config.js`** con `url` y `anonKey` (Project Settings →
   API), y ajustar `BRANDING` con el nombre y color del cliente.

---

## Estructura

```
commerce-cms/
├── index.html              Login
├── dashboard.html          Panel de resumen
├── products.html           Listado del catálogo
├── product-form.html       Alta y edición de producto (la misma pantalla)
├── categories.html         Categorías
├── brands.html             Marcas
├── assets/                 Íconos e imágenes del panel
├── css/
│   ├── styles.css          Punto de entrada (importa los parciales)
│   ├── base.css            Reset + design tokens (colores, radios, sombras)
│   ├── layout.css          Login, shell, sidebar, barra superior
│   ├── components.css      Botones, tarjetas, tabla, modal, toasts...
│   └── forms.css           Controles de formulario y gestor de imágenes
├── js/
│   ├── app.js              Arranque común de las páginas privadas
│   ├── auth.js             Sesión: login, logout, guardia de rutas
│   ├── login.js            Controlador de index.html
│   ├── dashboard.js        Controlador de dashboard.html
│   ├── products.js         Controlador de products.html
│   ├── product-form.js     Controlador de product-form.html
│   ├── categories.js       Configuración de la tabla CRUD de categorías
│   ├── brands.js           Configuración de la tabla CRUD de marcas
│   ├── core/               Utilidades transversales (sin lógica de negocio)
│   │   ├── dom.js          $, el(), delegate(), debounce()
│   │   ├── format.js       Precios, fechas, números (es-CO / COP)
│   │   ├── errors.js       Traduce errores técnicos a español
│   │   ├── validate.js     Validación y normalización de formularios
│   │   └── ui.js           Toasts, carga, esqueletos, vacíos, diálogos
│   ├── services/           Acceso a datos: ÚNICA capa que consulta Supabase
│   │   ├── repository.js   Infraestructura común del CRUD (no es una entidad)
│   │   ├── storage.service.js        Archivos en Supabase Storage
│   │   ├── products.service.js
│   │   ├── product-images.service.js
│   │   ├── categories.service.js
│   │   └── brands.service.js
│   └── ui/
│       ├── icons.js        SVG en línea (sin librería de íconos)
│       ├── layout.js       Sidebar + barra superior compartidos
│       ├── pagination.js   Controles de paginación compartidos
│       └── crud-page.js    Tabla CRUD reutilizable (categorías y marcas)
└── supabase/
    ├── config.js           ÚNICO archivo a tocar por cliente
    ├── client.js           Instancia única de supabase-js
    ├── schema-rls.sql      Políticas de seguridad + Storage (instalación)
    └── migrations/         Cambios de esquema posteriores, por fecha
```

## Disponibilidad

El CMS **no gestiona inventario**. `products.available` es un `boolean` y se
guarda tal cual: el interruptor del formulario escribe `true` o `false`, y la
tabla lo lee igual. No hay conversión de por medio en ningún punto.

## Migraciones

`supabase/migrations/` guarda los cambios de esquema posteriores a la
instalación, con el formato `AAAA-MM-DD_descripcion.sql`. Se aplican en orden
de fecha desde el SQL Editor de Supabase, una vez por proyecto (por cliente).

Todos son re-ejecutables: si el cambio ya está aplicado, el script lo detecta,
no hace nada y no falla. Cada uno termina con una consulta de comprobación que
muestra cómo quedó la tabla.

| Fecha      | Cambio                                                                  |
| ---------- | ----------------------------------------------------------------------- |
| 2026-07-28 | `products`: se elimina `stock` y se añade `available` (bool)             |
| 2026-07-28 | `products`: `slug` obligatorio y con índice único (identificador público) |

## Enlace público (slug)

`products.slug` es el identificador con el que la tienda referencia cada
producto en su URL. El CMS lo trata así:

- **Se genera solo** desde el nombre mientras se crea el producto.
- **Se puede editar a mano**; lo escrito se normaliza siempre (sin tildes, sin
  espacios, sin signos), así que a la URL nunca llega algo inválido.
- **Al editar un producto ya guardado no se regenera**: cambiar el enlace de
  algo publicado rompe los enlaces compartidos, y eso debe ser una decisión
  consciente.
- **Es único** en dos niveles: el servicio busca el primer hueco libre
  (`nevera`, `nevera-2`, `nevera-3`…) y el índice único de la base de datos
  cierra la puerta a dos guardados simultáneos.

## Reglas del proyecto

- **Una tabla, un servicio.** Ningún archivo fuera de `js/services/` construye
  consultas: no hay un solo `.from()` ni `.select()` en las páginas.
- **Los servicios no tocan el DOM.** Devuelven objetos planos o lanzan errores.
- **Las páginas no consultan Supabase.** Llaman a un servicio y pintan.
- **`repository.js` es el único que conoce PostgREST.** Los servicios describen
  *qué* piden; el repositorio sabe *cómo* se pide. Así las cuatro tablas
  comparten el mismo CRUD sin copiarlo cuatro veces.
- **Se valida al entrar, se normaliza al salir.** Cada servicio tiene un
  `toRecord()` (formulario → base de datos, con validación) y un `normalize()`
  (base de datos → interfaz, en `camelCase`).
- **Todo error visible pasa por `core/errors.js`.** El cliente nunca ve un
  código de Postgres ni un `AuthApiError`.
- **Un módulo nuevo en el menú** = una entrada en `NAV_ITEMS` (`js/ui/layout.js`).
- **Un color de marca nuevo** = una línea en `BRANDING` (`supabase/config.js`).

Única excepción a la primera regla: `js/auth.js`, que habla con Supabase Auth.
No es una tabla ni acceso a datos, por eso vive fuera de `services/`.

### API de los servicios

| Servicio                    | Operaciones                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `products.service.js`       | `listProductsPage` · `listLatestProducts` · `getProduct` · `countProducts` · `createProduct` · `updateProduct` · `deleteProduct` |
| `product-images.service.js` | `listImagesOfProduct` · `addProductImage` · `updateImageOrder` · `deleteProductImage` · `deleteImagesOfProduct` |
| `categories.service.js`     | `listCategories` · `listCategoriesPage` · `countCategories` · `createCategory` · `updateCategory` · `deleteCategory` |
| `brands.service.js`         | `listBrands` · `listBrandsPage` · `countBrands` · `createBrand` · `updateBrand` · `deleteBrand`             |
| `storage.service.js`        | `uploadProductImage` · `removeFiles` · `pathFromPublicUrl` · `assertValidImage`                             |

Los `list…Page` aceptan `{ search, page, pageSize }` y devuelven
`{ items, total, page, pageSize, totalPages }`.

## Estado — v1.0

| Módulo         | Estado |
| -------------- | ------ |
| Login / Logout | Listo  |
| Dashboard      | Listo  |
| Productos      | Listo  |
| Categorías     | Listo  |
| Marcas         | Listo  |

El alcance está cerrado: estos son los módulos definitivos del producto.
