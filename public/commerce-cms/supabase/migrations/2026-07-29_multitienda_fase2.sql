-- =============================================================================
-- 2026-07-29 · Multitienda · Fase 2: usuarios, permisos y aislamiento por RLS
-- =============================================================================
-- Cierra el modelo multitienda:
--
--   · `profiles` vincula cada usuario de Supabase Auth con su tienda y su rol
--   · las políticas RLS impiden, EN LA BASE DE DATOS, que un cliente vea o
--     toque el catálogo de otro
--   · Nicolás Pastrán arranca con una copia del catálogo de Alprecio, para que
--     cada tienda edite el suyo sin pisar al otro
--
-- Requisito previo: ejecutar antes 2026-07-29_multitienda_fase1.sql
--
-- Ejecutar en: Supabase > SQL Editor > New query > pegar > Run
-- El script es re-ejecutable: no duplica el catálogo ni repite lo ya aplicado.
--
-- ORDEN DE PUESTA EN MARCHA (importante):
--   1. este script
--   2. crear los usuarios y sus perfiles (paso 7, al final)
--   3. desplegar el CMS actualizado
-- Entre 1 y 3 el panel antiguo puede leer, pero no guardar: sin perfil, RLS
-- le niega la escritura. Son minutos y afecta solo a quien esté dentro.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Perfiles: quién es cada usuario y a qué tienda pertenece
--
--    La clave primaria ES el id de auth.users: un perfil por usuario, y si se
--    borra la cuenta desaparece su perfil.
--
--    Roles:
--      super_admin -> administra todas las tiendas (store_id puede ir en null)
--      admin       -> administra una sola tienda (store_id obligatorio)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  store_id   uuid references public.stores (id) on delete restrict,
  role       text not null default 'admin',
  created_at timestamptz not null default now(),

  constraint profiles_role_valido
    check (role in ('super_admin', 'admin')),

  -- Un admin sin tienda no podría administrar nada: se rechaza de entrada.
  constraint profiles_admin_con_tienda
    check (role = 'super_admin' or store_id is not null)
);

create index if not exists profiles_store_id_idx on public.profiles (store_id);


-- -----------------------------------------------------------------------------
-- 2. Funciones de apoyo para las políticas
--
--    SECURITY DEFINER es obligatorio aquí: estas funciones consultan
--    `profiles`, y `profiles` también tiene RLS. Sin SECURITY DEFINER, evaluar
--    la política de profiles exigiría leer profiles, que exigiría evaluar la
--    política otra vez: recursión infinita.
--
--    `search_path` fijo evita que alguien redirija las funciones a otro
--    esquema suplantando las tablas.
-- -----------------------------------------------------------------------------
create or replace function public.current_store_id()
  returns uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select store_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'super_admin'
  );
$$;

revoke all on function public.current_store_id() from public;
revoke all on function public.is_super_admin()   from public;
grant execute on function public.current_store_id() to authenticated;
grant execute on function public.is_super_admin()   to authenticated;


-- -----------------------------------------------------------------------------
-- 3. Copiar el catálogo de Alprecio a Nicolás Pastrán
--
--    Cada tienda necesita SUS PROPIAS filas: si compartieran las mismas, un
--    cambio de precio o un borrado en una se reflejaría en la otra.
--
--    Los ids nuevos se generan por adelantado en tablas temporales para poder
--    reapuntar las relaciones: los productos copiados apuntan a las marcas y
--    categorías copiadas, no a las originales.
--
--    Los ARCHIVOS de Storage no se duplican: las filas nuevas reutilizan las
--    mismas URLs. El CMS ya sabe no borrar un archivo que otra fila usa.
-- -----------------------------------------------------------------------------
do $$
declare
  v_origen  uuid;
  v_destino uuid;
  v_copias  bigint;
begin
  select id into v_origen  from public.stores where slug = 'alprecio';
  select id into v_destino from public.stores where slug = 'nicolas-pastran';

  if v_origen is null or v_destino is null then
    raise exception 'Faltan las tiendas. Ejecuta antes la migración de la fase 1.';
  end if;

  if exists (select 1 from public.products where store_id = v_destino) then
    raise notice 'Nicolás Pastrán ya tiene productos: no se copia nada.';
    return;
  end if;

  create temp table map_brands on commit drop as
    select id as old_id, gen_random_uuid() as new_id
      from public.brands where store_id = v_origen;

  create temp table map_categories on commit drop as
    select id as old_id, gen_random_uuid() as new_id
      from public.categories where store_id = v_origen;

  create temp table map_products on commit drop as
    select id as old_id, gen_random_uuid() as new_id
      from public.products where store_id = v_origen;

  insert into public.brands (id, name, store_id)
  select m.new_id, b.name, v_destino
    from public.brands b
    join map_brands m on m.old_id = b.id;

  insert into public.categories (id, name, description, store_id)
  select m.new_id, c.name, c.description, v_destino
    from public.categories c
    join map_categories m on m.old_id = c.id;

  -- El slug se copia tal cual: el índice único es (store_id, slug), así que
  -- las dos tiendas pueden tener el mismo sin chocar.
  insert into public.products
    (id, name, slug, reference, description, price, condition, available,
     category_id, brand_id, store_id)
  select m.new_id, p.name, p.slug, p.reference, p.description, p.price,
         p.condition, p.available, mc.new_id, mb.new_id, v_destino
    from public.products p
    join map_products m       on m.old_id  = p.id
    left join map_categories mc on mc.old_id = p.category_id
    left join map_brands mb     on mb.old_id = p.brand_id;

  insert into public.product_images (product_id, image_url, sort_order)
  select m.new_id, i.image_url, i.sort_order
    from public.product_images i
    join map_products m on m.old_id = i.product_id;

  select count(*) into v_copias from map_products;
  raise notice 'Catálogo copiado a Nicolás Pastrán: % producto(s).', v_copias;
end $$;


-- -----------------------------------------------------------------------------
-- 4. Aislamiento por RLS
--
--    Se sustituyen las políticas de la v1.0 ("cualquier autenticado escribe
--    todo") por otras separadas POR ROL DE POSTGRES:
--
--      anon          -> la tienda pública lee el catálogo, no escribe nada
--      authenticated -> el panel solo ve y toca SU tienda
--      super_admin   -> sin restricción
--
--    Nota deliberada: el rol anónimo sigue leyendo todas las tiendas. Es
--    necesario para que cada web pública muestre su catálogo sin login, y no
--    expone nada: esos datos ya están publicados en internet.
-- -----------------------------------------------------------------------------

-- 4.1 · Perfiles
alter table public.profiles enable row level security;

drop policy if exists "cada usuario ve su perfil"      on public.profiles;
drop policy if exists "super admin gestiona perfiles"  on public.profiles;

create policy "cada usuario ve su perfil"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_super_admin());

create policy "super admin gestiona perfiles"
  on public.profiles for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 4.2 · Tiendas: todos las leen (el selector las necesita), solo el
--       super_admin las crea o modifica.
drop policy if exists "lectura publica stores"       on public.stores;
drop policy if exists "escritura autenticada stores" on public.stores;
drop policy if exists "super admin gestiona stores"  on public.stores;

create policy "lectura publica stores"
  on public.stores for select using (true);

create policy "super admin gestiona stores"
  on public.stores for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 4.3 · Catálogo: products, brands y categories comparten el mismo criterio.
do $$
declare
  v_tabla text;
begin
  foreach v_tabla in array array['products', 'brands', 'categories', 'settings']
  loop
    if to_regclass(format('public.%I', v_tabla)) is null then
      raise notice '% : la tabla no existe, se omite', v_tabla;
      continue;
    end if;

    -- Fuera las políticas de la etapa de una sola tienda.
    execute format('drop policy if exists %I on public.%I',
                   'lectura publica ' || v_tabla, v_tabla);
    execute format('drop policy if exists %I on public.%I',
                   'escritura autenticada ' || v_tabla, v_tabla);
    execute format('drop policy if exists %I on public.%I',
                   'catalogo publico ' || v_tabla, v_tabla);
    execute format('drop policy if exists %I on public.%I',
                   'panel gestiona su tienda ' || v_tabla, v_tabla);

    -- La web pública lee; no escribe.
    execute format(
      'create policy %I on public.%I for select to anon using (true)',
      'catalogo publico ' || v_tabla, v_tabla
    );

    -- El panel solo ve y toca su tienda.
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_super_admin() or store_id = public.current_store_id())
         with check (public.is_super_admin() or store_id = public.current_store_id())',
      'panel gestiona su tienda ' || v_tabla, v_tabla
    );
  end loop;
end $$;

-- 4.4 · Imágenes: no tienen store_id, su tienda es la de su producto.
alter table public.product_images enable row level security;

drop policy if exists "lectura publica product_images"       on public.product_images;
drop policy if exists "escritura autenticada product_images" on public.product_images;
drop policy if exists "catalogo publico product_images"      on public.product_images;
drop policy if exists "panel gestiona sus imagenes"          on public.product_images;

create policy "catalogo publico product_images"
  on public.product_images for select to anon using (true);

create policy "panel gestiona sus imagenes"
  on public.product_images for all to authenticated
  using (
    public.is_super_admin() or exists (
      select 1 from public.products p
       where p.id = product_images.product_id
         and p.store_id = public.current_store_id()
    )
  )
  with check (
    public.is_super_admin() or exists (
      select 1 from public.products p
       where p.id = product_images.product_id
         and p.store_id = public.current_store_id()
    )
  );


-- -----------------------------------------------------------------------------
-- 5. Retirar el DEFAULT puente de la fase 1
--    El CMS ya envía store_id explícitamente. Mantener el default escondería
--    un error de programación: una fila mal formada acabaría, en silencio, en
--    la tienda equivocada.
-- -----------------------------------------------------------------------------
do $$
declare
  v_tabla text;
begin
  foreach v_tabla in array array['products', 'brands', 'categories', 'settings']
  loop
    if to_regclass(format('public.%I', v_tabla)) is not null then
      execute format('alter table public.%I alter column store_id drop default', v_tabla);
    end if;
  end loop;
end $$;


-- -----------------------------------------------------------------------------
-- 6. Comprobaciones
-- -----------------------------------------------------------------------------

-- 6.1 · Reparto del catálogo: las dos tiendas con las mismas cifras.
select s.name as tienda,
       (select count(*) from public.products   p where p.store_id = s.id) as productos,
       (select count(*) from public.brands     b where b.store_id = s.id) as marcas,
       (select count(*) from public.categories c where c.store_id = s.id) as categorias,
       (select count(*) from public.product_images i
          join public.products p on p.id = i.product_id
         where p.store_id = s.id) as imagenes
from public.stores s
order by s.name;

-- 6.2 · Ningún producto copiado debe apuntar a la marca o categoría de la otra
--       tienda. Debe devolver 0 filas.
select p.id, p.name, 'relación cruzada entre tiendas' as problema
from public.products p
left join public.brands     b on b.id = p.brand_id
left join public.categories c on c.id = p.category_id
where (b.id is not null and b.store_id <> p.store_id)
   or (c.id is not null and c.store_id <> p.store_id);

-- 6.3 · Políticas activas por tabla.
select tablename as tabla, policyname as politica, roles, cmd as operacion
from pg_policies
where schemaname = 'public'
  and tablename in ('stores', 'profiles', 'products', 'brands', 'categories', 'product_images')
order by tablename, policyname;


-- -----------------------------------------------------------------------------
-- 7. Crear los usuarios y sus perfiles  ·  HAZLO A MANO, EN ESTE ORDEN
-- -----------------------------------------------------------------------------
-- a) Authentication > Users > Add user > Create new user  (marca Auto Confirm)
--    - tu cuenta                      -> será super_admin
--    - cuenta del cliente de Alprecio -> admin de Alprecio
--    - cuenta de Nicolás Pastrán      -> admin de Nicolás Pastrán
--
-- b) Mira los correos exactos que quedaron registrados:
--
-- select id, email, created_at, last_sign_in_at
--   from auth.users
--  order by created_at;
--
-- c) Asigna los perfiles cambiando SOLO los correos. Los uuid los resuelve
--    Postgres a partir de auth.users, así que no hay que copiarlos a mano.
--    Es re-ejecutable: si un perfil ya existe, lo actualiza.
--
-- with asignaciones (email, store_slug, rol) as (
--   values
--     ('TU-CORREO@dominio.com',        null::text,        'super_admin'),
--     ('CLIENTE-ALPRECIO@dominio.com', 'alprecio',        'admin'),
--     ('CLIENTE-NICOLAS@dominio.com',  'nicolas-pastran', 'admin')
-- )
-- insert into public.profiles (id, store_id, role)
-- select u.id, s.id, a.rol
--   from asignaciones a
--   join auth.users u on lower(u.email) = lower(trim(a.email))
--   left join public.stores s on s.slug = a.store_slug
-- on conflict (id) do update
--   set role = excluded.role, store_id = excluded.store_id
-- returning id, role, store_id;
--
-- d) Comprueba el resultado. Lista TODOS los usuarios, no solo los asignados:
--    un correo mal escrito aparece aquí como "— SIN PERFIL —", que es el fallo
--    más probable de este paso.
--
-- select u.email,
--        coalesce(p.role, '— SIN PERFIL —') as rol,
--        coalesce(s.name, '—')              as tienda
--   from auth.users u
--   left join public.profiles p on p.id = u.id
--   left join public.stores   s on s.id = p.store_id
--  order by p.role nulls last, u.email;
--
-- Nota: si intentas asignar un admin a un slug de tienda inexistente, el
-- INSERT falla por la restricción profiles_admin_con_tienda en lugar de crear
-- un perfil sin tienda. Slugs válidos: 'alprecio' y 'nicolas-pastran'.
-- -----------------------------------------------------------------------------
