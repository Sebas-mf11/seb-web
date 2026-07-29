-- =============================================================================
-- Commerce CMS — Seguridad de la base de datos (RLS) y Storage
-- =============================================================================
-- Ejecutar en: Supabase > SQL Editor > New query > pegar > Run
-- El script es re-ejecutable: se puede correr las veces que haga falta.
--
-- POR QUÉ ES OBLIGATORIO:
-- La clave pública viaja al navegador, cualquiera puede leerla. Con RLS activo
-- pero SIN políticas, la base queda cerrada por completo: ni el CMS autenticado
-- puede leer o escribir. Este script abre exactamente lo necesario:
--   público  -> solo lectura del catálogo (lo que muestra la tienda)
--   sesión   -> lectura y escritura (lo que hace el panel)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Activar RLS en todas las tablas
-- -----------------------------------------------------------------------------
alter table public.categories     enable row level security;
alter table public.brands         enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;


-- -----------------------------------------------------------------------------
-- 2. Lectura pública (la tienda muestra el catálogo sin necesidad de login)
-- -----------------------------------------------------------------------------
drop policy if exists "lectura publica categories"     on public.categories;
drop policy if exists "lectura publica brands"         on public.brands;
drop policy if exists "lectura publica products"       on public.products;
drop policy if exists "lectura publica product_images" on public.product_images;

create policy "lectura publica categories"
  on public.categories for select using (true);

create policy "lectura publica brands"
  on public.brands for select using (true);

create policy "lectura publica products"
  on public.products for select using (true);

create policy "lectura publica product_images"
  on public.product_images for select using (true);


-- -----------------------------------------------------------------------------
-- 3. Escritura solo para usuarios autenticados (el CMS)
--    `for all` cubre insert, update y delete.
-- -----------------------------------------------------------------------------
drop policy if exists "escritura autenticada categories"     on public.categories;
drop policy if exists "escritura autenticada brands"         on public.brands;
drop policy if exists "escritura autenticada products"       on public.products;
drop policy if exists "escritura autenticada product_images" on public.product_images;

create policy "escritura autenticada categories"
  on public.categories for all to authenticated
  using (true) with check (true);

create policy "escritura autenticada brands"
  on public.brands for all to authenticated
  using (true) with check (true);

create policy "escritura autenticada products"
  on public.products for all to authenticated
  using (true) with check (true);

create policy "escritura autenticada product_images"
  on public.product_images for all to authenticated
  using (true) with check (true);


-- -----------------------------------------------------------------------------
-- 4. Storage: bucket público de imágenes de producto
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "lectura publica imagenes"    on storage.objects;
drop policy if exists "escritura autenticada imagenes" on storage.objects;

create policy "lectura publica imagenes"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "escritura autenticada imagenes"
  on storage.objects for all to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');


-- -----------------------------------------------------------------------------
-- 5. Comprobación: debe devolver 4 tablas con rls_activo = true y 2 políticas
--    cada una (una de lectura pública y una de escritura autenticada).
-- -----------------------------------------------------------------------------
select
  t.tablename                as tabla,
  t.rowsecurity              as rls_activo,
  count(p.policyname)        as politicas
from pg_tables t
left join pg_policies p
  on p.schemaname = t.schemaname and p.tablename = t.tablename
where t.schemaname = 'public'
  and t.tablename in ('categories', 'brands', 'products', 'product_images')
group by t.tablename, t.rowsecurity
order by t.tablename;


-- -----------------------------------------------------------------------------
-- 6. Crear el usuario del cliente
-- -----------------------------------------------------------------------------
-- NO se hace por SQL. Desde el panel, para que la contraseña quede cifrada:
--   Authentication > Users > Add user > Create new user
--   (marcar "Auto Confirm User" para que pueda entrar sin confirmar correo)
--
-- Y desactivar el registro público, para que nadie más se cree una cuenta:
--   Authentication > Sign In / Providers > Email > Allow new users to sign up = OFF
-- -----------------------------------------------------------------------------
