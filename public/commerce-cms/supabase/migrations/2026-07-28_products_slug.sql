-- =============================================================================
-- 2026-07-28 · products: `slug` como identificador público
-- =============================================================================
-- El slug es lo que la tienda usa en la URL del producto, así que tiene que
-- existir siempre y no repetirse nunca.
--
-- El CMS ya evita los choques al guardar, pero eso no basta: dos personas
-- guardando a la vez pueden colarse entre la comprobación y el INSERT. La
-- garantía real es el índice único de este script.
--
-- Ejecutar en: Supabase > SQL Editor > New query > pegar > Run
-- El script es re-ejecutable: si ya se aplicó, no hace nada y no falla.
--
-- Requisito previo: la columna `slug` (text) debe existir en `products`.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Rellenar el slug de los productos que aún no lo tienen
--
--    Se recorre fila por fila en lugar de un UPDATE masivo porque cada slug
--    necesita comprobarse contra los que ya existen: dos productos llamados
--    igual deben acabar como `nevera` y `nevera-2`, no chocar.
--
--    `translate` sustituye las vocales acentuadas y la eñe; el resto de
--    caracteres no válidos se colapsa en guiones.
-- -----------------------------------------------------------------------------
do $$
declare
  producto   record;
  base_slug  text;
  candidato  text;
  sufijo     int;
begin
  for producto in
    select id, name
      from public.products
     where slug is null or btrim(slug) = ''
     order by created_at
  loop
    base_slug := trim(both '-' from regexp_replace(
      lower(translate(
        coalesce(producto.name, ''),
        'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
        'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
      )),
      '[^a-z0-9]+', '-', 'g'
    ));

    base_slug := left(nullif(base_slug, ''), 80);

    if base_slug is null then
      base_slug := 'producto';
    end if;

    candidato := base_slug;
    sufijo := 1;

    while exists (select 1 from public.products where slug = candidato) loop
      sufijo := sufijo + 1;
      candidato := base_slug || '-' || sufijo;
    end loop;

    update public.products set slug = candidato where id = producto.id;
  end loop;
end $$;


-- -----------------------------------------------------------------------------
-- 2. Unicidad y obligatoriedad
--    A partir de aquí la base de datos rechaza cualquier slug repetido, venga
--    del CMS o de donde venga.
-- -----------------------------------------------------------------------------
create unique index if not exists products_slug_key
  on public.products (slug);

alter table public.products
  alter column slug set not null;


-- -----------------------------------------------------------------------------
-- 3. Comprobación
--    `slug` debe salir como text, NOT NULL, y `duplicados` debe dar 0 filas.
-- -----------------------------------------------------------------------------
select
  column_name  as columna,
  data_type    as tipo,
  is_nullable  as acepta_nulos
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
  and column_name = 'slug';

select slug, count(*) as repeticiones
from public.products
group by slug
having count(*) > 1;
