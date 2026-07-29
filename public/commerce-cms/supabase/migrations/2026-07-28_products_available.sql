-- =============================================================================
-- 2026-07-28 · products: reemplazar `stock` por `available`
-- =============================================================================
-- Este CMS no gestiona inventario: para una tienda de electrodomésticos basta
-- con saber si un producto se muestra o no. Un booleano expresa exactamente eso,
-- sin lógica de traducción en el código.
--
-- Ejecutar en: Supabase > SQL Editor > New query > pegar > Run
-- El script es re-ejecutable: si ya se aplicó, no hace nada y no falla.
--
-- IMPORTANTE: aplicar ANTES de usar el panel. El código ya pide la columna
-- `available`, así que hasta que esto corra, productos y dashboard darán error.
--
-- Cubre los tres escenarios posibles, para que sirva igual en cualquier cliente:
--   a) `stock` es boolean  -> se RENOMBRA (no se copia nada, cero riesgo)
--   b) `stock` es numérico -> se crea `available`, se convierte (>0) y se borra
--   c) no hay `stock`      -> se crea `available` y listo
-- =============================================================================

do $$
declare
  v_stock_type    text;
  v_has_available boolean;
begin
  select data_type
    into v_stock_type
    from information_schema.columns
   where table_schema = 'public'
     and table_name   = 'products'
     and column_name  = 'stock';

  select exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'products'
       and column_name  = 'available'
  ) into v_has_available;

  -- Ya migrado: nada que hacer.
  if v_stock_type is null and v_has_available then
    raise notice 'Sin cambios: products.available ya existe y stock ya no.';
    return;
  end if;

  -- (c) Instalación nueva que nunca tuvo `stock`.
  if v_stock_type is null then
    alter table public.products add column available boolean not null default true;
    raise notice 'Columna available creada.';
    return;
  end if;

  if not v_has_available and v_stock_type = 'boolean' then
    -- (a) Mismo tipo: renombrar conserva los datos sin copiarlos.
    execute 'alter table public.products rename column stock to available';
    raise notice 'stock (boolean) renombrado a available.';
  else
    -- (b) Tipos distintos, o ambas columnas presentes: convertir y retirar.
    if not v_has_available then
      alter table public.products add column available boolean not null default true;
    end if;

    if v_stock_type = 'boolean' then
      execute 'update public.products set available = coalesce(stock, false)';
    else
      execute 'update public.products set available = (coalesce(stock, 0) > 0)';
    end if;

    execute 'alter table public.products drop column stock';
    raise notice 'stock (%) migrado a available y eliminado.', v_stock_type;
  end if;

  -- Estado final garantizado, venga de donde venga la columna.
  update public.products set available = true where available is null;
  alter table public.products alter column available set default true;
  alter table public.products alter column available set not null;
end $$;


-- -----------------------------------------------------------------------------
-- Comprobación
-- Debe aparecer `available` (boolean, NO acepta nulos, por defecto true)
-- y NO debe aparecer `stock`.
-- -----------------------------------------------------------------------------
select
  column_name    as columna,
  data_type      as tipo,
  is_nullable    as acepta_nulos,
  column_default as valor_por_defecto
from information_schema.columns
where table_schema = 'public'
  and table_name = 'products'
order by ordinal_position;
