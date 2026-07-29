# Auditoría de entrega · Commerce CMS v1.0

Fecha: 2026-07-28 · Alcance: `public/commerce-cms/` completo

---

## 1. Qué se implementó

### Módulos (alcance cerrado)

| Módulo         | Contenido                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| Login / Logout | Supabase Auth, sesión persistente con renovación automática, guardia en todas las páginas privadas, cierre de sesión |
| Dashboard      | Totales de productos, categorías y marcas + últimos 5 productos                                                     |
| Productos      | CRUD, búsqueda (nombre, referencia, marca), paginación, galería de imágenes en Storage                              |
| Categorías     | CRUD, búsqueda (nombre, descripción), paginación                                                                    |
| Marcas         | CRUD, búsqueda (nombre), paginación                                                                                 |

El panel **no administra diseño**: ni colores, ni banners, ni páginas. Esa
frontera es deliberada y está documentada en el README.

### Arquitectura

Cuatro capas con una regla verificable: **ninguna consulta a Supabase fuera de
`js/services/`**.

```
páginas (js/*.js)          orquestan: piden datos y pintan
    ↓
servicios (js/services/)   único acceso a datos; validan y normalizan
    ↓
repository.js              único que conoce PostgREST (select, eq, range…)
    ↓
supabase/client.js         instancia única de supabase-js
```

Transversales en `js/core/` (DOM, formato, errores, validación, UI) y
componentes en `js/ui/` (iconos, layout, paginación, tabla CRUD reutilizable).

### Decisiones de diseño relevantes

- **Multi-tenant por aislamiento físico**: un proyecto Supabase por cliente.
  Sin lógica de tenants en el código; `supabase/config.js` es el único archivo
  que cambia por instalación.
- **`crud-page.js`**: categorías y marcas son la misma pantalla con distintos
  datos. Una vista parametrizada en lugar de dos controladores gemelos.
- **`available` es `boolean`**: sin traducción a stock en ningún punto.
- **Errores traducidos**: el cliente nunca ve un código de Postgres.
- **Marca blanca por CSS variables**: rebrandear no toca CSS.

### Métricas

23 módulos JS · 6 páginas HTML · 5 hojas CSS · ~6.150 líneas · 0 dependencias
npm · 1 dependencia en runtime (supabase-js 2.111.0, versión fijada, vía CDN).

---

## 2. Qué fue probado

### Verificación automatizada (ejecutada, con resultado)

| Comprobación                                    | Resultado |
| ----------------------------------------------- | --------- |
| Sintaxis de los 23 módulos ES                   | OK        |
| Imports que resuelven a exports reales          | OK        |
| Imports declarados y no usados                  | 0         |
| Exports que nadie importa (código muerto)       | 0         |
| Consultas Supabase fuera de `js/services/`      | 0         |
| Clases CSS huérfanas                            | 0 reales  |
| Rutas del panel (6 páginas + redirect)          | 200       |
| Referencias locales rotas en HTML               | 0         |

### Verificación contra la base de datos real

| Comprobación                                        | Resultado                          |
| --------------------------------------------------- | ---------------------------------- |
| Columnas que consultan los servicios existen         | OK (4 tablas)                      |
| Claves foráneas declaradas (JOIN embebidos)          | OK (marca, categoría, imágenes)    |
| Paginación con total exacto (`count=exact` + Range)  | OK                                 |
| Filtro de búsqueda con términos de varias palabras   | OK                                 |
| Migración `stock` → `available` aplicada             | OK (`stock` ya no existe)          |
| RLS bloquea escritura anónima                        | OK (42501 en `categories`/`brands`) |
| Imagen subida servida públicamente                   | OK (200, image/jpeg)               |
| Contadores del dashboard                             | OK (products 1, categories 0, brands 0) |

### Prueba funcional real

Se creó un producto de punta a punta ("Nevera No Frost", TF1232, $15.050.000,
Tipo A, 1 imagen): producto en `products`, archivo en Storage y registro en
`product_images` con `sort_order` 0.

### Lo que NO se probó

**No hubo ejecución en navegador.** La verificación fue estática (sintaxis,
grafo de imports, capas, CSS) y contra la API real (esquema, RLS, forma exacta
de las consultas). No se ejecutaron clics, modales ni el ciclo de vida del DOM.

Pendiente de comprobación manual:

1. Login correcto y con credenciales erróneas (mensaje en español).
2. Crear, editar y eliminar una categoría y una marca (modal + confirmación).
3. Asignar marca y categoría a un producto y verlas en la tabla.
4. Buscar por marca en Productos (usa dos consultas encadenadas).
5. Eliminar un producto con imágenes y comprobar que el bucket queda limpio.
6. Intentar eliminar una marca en uso (debe salir el mensaje de vínculo).
7. Paginación con más de 10 registros.
8. Vista en móvil: sidebar como cajón, tablas con scroll horizontal.
9. Cerrar sesión y confirmar que el botón "atrás" no devuelve al panel.

---

## 3. Mejoras para una v2.0 (no implementadas)

### Alto valor

1. **Recuperación de contraseña self-service.** Hoy, si el cliente la olvida,
   hay que restablecerla desde el panel de Supabase. Requiere pantalla de
   solicitud + pantalla de nueva contraseña con el token del correo.
2. **Compresión de imágenes antes de subir.** Una foto de móvil pesa 3–5 MB y
   se sube tal cual. Redimensionar a ~1600 px con `canvas` antes del upload
   reduciría el almacenamiento y aceleraría la tienda.
3. **Filtros por marca y categoría en Productos.** El servicio ya los acepta
   (`listProductsPage({ categoryId, brandId })`); solo falta la interfaz.
4. **Aviso antes de borrar una marca o categoría en uso.** Hoy el cliente lo
   descubre por el error. Consultar cuántos productos la usan y decirlo en la
   confirmación es mejor experiencia.

### Robustez

5. **Vendorizar supabase-js.** Si jsDelivr falla, el panel no carga. Copiar el
   archivo a `js/vendor/` elimina la dependencia externa en runtime.
6. **Limpieza de archivos huérfanos.** Si el borrado del bucket falla, el
   registro se elimina igual y el archivo queda. Una tarea programada que
   compare bucket contra `product_images` lo resolvería.
7. **Aviso de cambios sin guardar** al salir del formulario de producto.
8. **Tests end-to-end** (Playwright) sobre los flujos críticos.

### Producto

9. Reordenar imágenes arrastrando (hoy solo "hacer principal").
10. Ordenar tablas por columna.
11. Duplicar producto.
12. Exportar catálogo a CSV.
13. Registro de auditoría (quién cambió qué y cuándo).

---

## 4. Recomendaciones para producción

### Antes de entregar a un cliente — obligatorio

1. **Desactivar el registro público**: Authentication → Sign In / Providers →
   Email → *Allow new users to sign up* = **OFF**. Sin esto, cualquiera puede
   crearse una cuenta y, al quedar autenticado, **escribir en todo el catálogo**.
2. **Ejecutar `schema-rls.sql`** y las migraciones. Verificar que la consulta
   final devuelve 4 tablas con RLS activo y 2 políticas cada una.
3. **Confirmar que en `config.js` está la clave publishable/anon**, nunca la
   `service_role`: esa salta RLS y daría acceso total desde el navegador.
4. **Contraseña fuerte** para el usuario del cliente. Supabase soporta MFA si
   el cliente maneja un catálogo sensible.
5. **Configurar Site URL y Redirect URLs** en Authentication → URL
   Configuration, con el dominio real.

### Modelo de permisos — conviene entenderlo

Cualquier usuario autenticado puede escribir en **todas** las tablas. Con un
único usuario por cliente es correcto y simple. Si algún día hay varios
usuarios, todos serán administradores totales: para roles diferenciados haría
falta una tabla de perfiles y políticas RLS por rol.

### Despliegue

6. **El repositorio contiene la URL y la clave pública de Supabase.** Son
   públicas por diseño y RLS las contiene, pero si el repo es público conviene
   saberlo. Lo que nunca debe entrar al repo es la `service_role`.
7. **Verificar tras el deploy** que `sebweb.co/commerce-cms` redirige bien y
   responde con la cabecera `X-Robots-Tag: noindex` (ambas configuradas en
   `next.config.mjs`; probadas en local, conviene reconfirmar en Cloudflare).
8. **Copias de seguridad.** El plan gratuito de Supabase no incluye
   point-in-time recovery. Programar un respaldo periódico de las 4 tablas
   antes de que el cliente cargue el catálogo real.
9. **Vigilar el almacenamiento.** Sin compresión, el bucket crece rápido.
   Revisar el límite del plan contratado.
10. **Rotación de claves.** Si alguna vez se filtra la `service_role`, rotarla
    de inmediato en Project Settings → API.

### Mantenimiento

11. Cada cliente nuevo: seguir los 6 pasos del README, en orden.
12. Cada cambio de esquema: un archivo en `supabase/migrations/`, con fecha,
    re-ejecutable y con su consulta de comprobación al final.
13. La versión de supabase-js está fijada en `client.js`. Al actualizarla,
    probar login, subida de imágenes y paginación antes de desplegar.

---

## Conclusión

El proyecto está en estado **estable y entregable**. La arquitectura sostiene el
alcance actual sin deuda visible: no hay código muerto, no hay consultas
dispersas y cada capa tiene una responsabilidad clara.

El único requisito real antes de usarlo con un cliente es la **comprobación
manual en navegador** de la lista del punto 2, y la **configuración de
seguridad** del punto 4 — en particular, desactivar el registro público.
