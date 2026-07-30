-- =============================================================================
-- 2026-07-29 · Multitienda · Fase 1: base de datos y migración de datos
-- =============================================================================
-- Prepara el esquema para que un mismo proyecto Supabase aloje varias tiendas
-- y adopta los datos que ya existen, que son todos de Alprecio.
--
-- Esta fase NO toca el CMS: ni login, ni dashboard, ni consultas. El panel
-- sigue comportándose igual porque `store_id` recibe un valor por defecto.
--
-- Ejecutar en: Supabase > SQL Editor > New query > pegar > Run
-- El script es re-ejecutable: si ya se aplicó, no hace nada y no falla.
--
-- Requisitos previos (ya cumplidos):
--   - tabla `stores` (id, name, slug, created_at)
--   - columna `store_id` en products, brands, categories y settings
--
-- `product_images` NO lleva `store_id` a propósito: pertenece a un producto,
-- y el producto ya sabe de qué tienda es. Duplicar el dato solo permitiría
-- que ambos se contradijeran.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tiendas
--    El slug identifica a la tienda de forma estable y legible; es lo que se
--    usará para saber en qué tienda entra cada usuario.
-- -----------------------------------------------------------------------------
create unique index if not exists stores_slug_key
  on public.stores (slug);

insert into public.stores (name, slug) values
  ('Alprecio',        'alprecio'),
  ('Nicolás Pastrán', 'nicolas-pastran')
on conflict (slug) do nothing;


-- -----------------------------------------------------------------------------
-- 2 y 3. Adopción de los datos existentes y blindaje del modelo
--
--    Todo lo que hay ahora en la base es de Alprecio, así que se le asigna.
--    Después se cierra la puerta a que vuelva a entrar una fila sin tienda:
--
--      · clave foránea  -> no puede apuntar a una tienda inexistente
--      · índice         -> toda consulta filtrará por store_id
--      · DEFAULT        -> el CMS actual, que aún no envía store_id, sigue
--                          funcionando y sus altas caen en la tienda actual
--      · NOT NULL       -> ninguna fila puede quedar huérfana
--
--    El DEFAULT es un puente temporal hasta la Fase 2, cuando el CMS envíe
--    el store_id explícitamente. Está marcado para retirarlo entonces.
-- -----------------------------------------------------------------------------
do $$
declare
  v_store_id uuid;
  v_tabla    text;
  v_filas    bigint;
begin
  select id into v_store_id from public.stores where slug = 'alprecio';

  if v_store_id is null then
    raise exception 'No se encontró la tienda "alprecio". Revisa el paso 1.';
  end if;

  foreach v_tabla in array array['products', 'brands', 'categories', 'settings']
  loop
    -- `settings` solo existe en instalaciones anteriores a la v1.0; y una
    -- instalación nueva podría no tener todavía la columna. En ambos casos se
    -- omite en lugar de reventar el script entero.
    if to_regclass(format('public.%I', v_tabla)) is null then
      raise notice '% : la tabla no existe, se omite', v_tabla;
      continue;
    end if;

    if not exists (
      select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name   = v_tabla
         and column_name  = 'store_id'
    ) then
      raise notice '% : sin columna store_id, se omite', v_tabla;
      continue;
    end if;

    -- Adoptar las filas que aún no tienen tienda.
    execute format(
      'update public.%I set store_id = $1 where store_id is null', v_tabla
    ) using v_store_id;

    get diagnostics v_filas = row_count;
    raise notice '% : % fila(s) asignada(s) a Alprecio', v_tabla, v_filas;

    -- Clave foránea, solo si no existe ya.
    if not exists (
      select 1
        from pg_constraint c
        join pg_attribute a
          on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
       where c.conrelid = format('public.%I', v_tabla)::regclass
         and c.contype  = 'f'
         and a.attname  = 'store_id'
    ) then
      execute format(
        'alter table public.%I
           add constraint %I foreign key (store_id)
           references public.stores (id) on delete restrict',
        v_tabla, v_tabla || '_store_id_fkey'
      );
      raise notice '% : clave foránea creada', v_tabla;
    end if;

    -- Índice: cada pantalla del CMS filtrará por tienda.
    execute format(
      'create index if not exists %I on public.%I (store_id)',
      v_tabla || '_store_id_idx', v_tabla
    );

    -- TODO (Fase 2): retirar este DEFAULT cuando el CMS envíe store_id.
    execute format(
      'alter table public.%I alter column store_id set default %L',
      v_tabla, v_store_id
    );

    execute format(
      'alter table public.%I alter column store_id set not null', v_tabla
    );
  end loop;
end $$;


-- -----------------------------------------------------------------------------
-- 4. El slug del producto pasa a ser único POR TIENDA
--
--    Hasta ahora `products.slug` era único en toda la base. Con varias tiendas
--    eso es incorrecto: dos tiendas de electrodomésticos van a tener las dos
--    una "lavadora-12-kg", y la segunda no podría guardarse.
--
--    Se busca cualquier índice o restricción único que cubra solo `slug` y se
--    reemplaza por uno sobre (store_id, slug), sin depender del nombre que
--    tuviera.
-- -----------------------------------------------------------------------------
do $$
declare
  v_indice record;
begin
  for v_indice in
    select i.relname as nombre
      from pg_index x
      join pg_class i on i.oid = x.indexrelid
      join pg_class t on t.oid = x.indrelid
      join pg_namespace n on n.oid = t.relnamespace
     where n.nspname = 'public'
       and t.relname = 'products'
       and x.indisunique
       and x.indnkeyatts = 1
       and (
         select a.attname
           from pg_attribute a
          where a.attrelid = t.oid and a.attnum = x.indkey[0]
       ) = 'slug'
  loop
    -- Si el índice respalda una restricción, hay que soltarla por ahí.
    if exists (
      select 1 from pg_constraint
       where conname = v_indice.nombre
         and conrelid = 'public.products'::regclass
    ) then
      execute format(
        'alter table public.products drop constraint %I', v_indice.nombre
      );
    else
      execute format('drop index public.%I', v_indice.nombre);
    end if;

    raise notice 'Índice único global de slug retirado: %', v_indice.nombre;
  end loop;
end $$;

-- Aviso claro si hubiera slugs repetidos dentro de una misma tienda: sin esto,
-- el índice fallaría con un mensaje difícil de interpretar.
do $$
declare
  v_repetidos int;
begin
  select count(*) into v_repetidos
    from (
      select store_id, slug
        from public.products
       group by store_id, slug
      having count(*) > 1
    ) duplicados;

  if v_repetidos > 0 then
    raise exception
      'Hay % combinación(es) de (tienda, slug) repetidas. Resuélvelas antes de continuar; la consulta 6.5 del final las lista.',
      v_repetidos;
  end if;
end $$;

create unique index if not exists products_store_slug_key
  on public.products (store_id, slug);


-- -----------------------------------------------------------------------------
-- 5. Seguridad de la tabla nueva
--    Mismo criterio que el resto: la tienda lee, el panel escribe.
--
--    OJO (Fase 2): estas políticas dejan que CUALQUIER usuario autenticado
--    escriba en CUALQUIER tienda. Con un solo cliente daba igual; con dos, el
--    cliente de una tienda podría editar el catálogo de la otra. Cerrarlo pide
--    una tabla que vincule usuario y tienda, y políticas que filtren por ella.
-- -----------------------------------------------------------------------------
alter table public.stores enable row level security;

drop policy if exists "lectura publica stores"     on public.stores;
drop policy if exists "escritura autenticada stores" on public.stores;

create policy "lectura publica stores"
  on public.stores for select using (true);

create policy "escritura autenticada stores"
  on public.stores for all to authenticated
  using (true) with check (true);


-- -----------------------------------------------------------------------------
-- 6. Comprobaciones
-- -----------------------------------------------------------------------------

-- 6.1 · Las dos tiendas deben existir.
select id, name, slug, created_at
from public.stores
order by name;

-- 6.2 · Reparto de los datos por tienda.
--       Todo debe estar bajo Alprecio; Nicolás Pastrán arranca en cero.
--       (`settings` queda fuera de esta comprobación porque no forma parte del
--        CMS desde la v1.0; si la tabla existe, el paso 2 la procesa igual.)
select s.name as tienda,
       (select count(*) from public.products   p where p.store_id = s.id) as productos,
       (select count(*) from public.brands     b where b.store_id = s.id) as marcas,
       (select count(*) from public.categories c where c.store_id = s.id) as categorias
from public.stores s
order by s.name;

-- 6.3 · No debe quedar ninguna fila sin tienda (las tres cifras en 0).
select
  (select count(*) from public.products   where store_id is null) as productos_sin_tienda,
  (select count(*) from public.brands     where store_id is null) as marcas_sin_tienda,
  (select count(*) from public.categories where store_id is null) as categorias_sin_tienda;

-- 6.4 · Índices de products: debe aparecer products_store_slug_key (store_id, slug)
--       y NO debe quedar ninguno único solo sobre slug.
select indexname as indice, indexdef as definicion
from pg_indexes
where schemaname = 'public' and tablename = 'products'
order by indexname;

-- 6.5 · Slugs repetidos dentro de una misma tienda: debe devolver 0 filas.
select store_id, slug, count(*) as repeticiones
from public.products
group by store_id, slug
having count(*) > 1;
