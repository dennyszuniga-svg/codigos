create table if not exists public.series_repuestos (
    id uuid primary key default gen_random_uuid(),
    repuesto_id uuid not null references public.catalogo_repuestos(id) on delete cascade,
    stock_id uuid references public.stock_repuestos(id) on delete set null,
    numero_serie text not null,
    estado text not null default 'disponible' check (estado in ('disponible', 'utilizado', 'baja')),
    movimiento_id uuid references public.movimientos_stock_repuestos(id) on delete set null,
    ubicacion_sede text not null check (ubicacion_sede in ('general','puruchuco','salaverry','primavera','civico','gama')),
    sede_uso text,
    equipo_uso text,
    observacion text,
    usado_at timestamptz,
    creado_por uuid not null default auth.uid() references public.profiles(id),
    actualizado_por uuid not null default auth.uid() references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (repuesto_id, numero_serie)
);

alter table public.movimientos_stock_repuestos
add column if not exists numeros_serie text[] not null default '{}';

create index if not exists series_repuestos_stock_estado_idx
on public.series_repuestos (stock_id, estado);

create index if not exists series_repuestos_repuesto_idx
on public.series_repuestos (repuesto_id, numero_serie);

alter table public.series_repuestos enable row level security;

drop policy if exists "series_select_mantenimiento" on public.series_repuestos;
create policy "series_select_mantenimiento"
on public.series_repuestos for select to authenticated
using (public.es_personal_mantenimiento() or public.es_encargado_ti());

drop policy if exists "series_all_encargado_ti" on public.series_repuestos;
create policy "series_all_encargado_ti"
on public.series_repuestos for all to authenticated
using (public.es_encargado_ti())
with check (public.es_encargado_ti());

create or replace function public.guardar_serie_repuesto(
    stock_id_arg uuid,
    numero_serie_arg text,
    serie_id_arg uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    stock_row public.stock_repuestos%rowtype;
    serie_id uuid;
    numero_limpio text;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    numero_limpio := upper(trim(coalesce(numero_serie_arg, '')));
    if numero_limpio = '' or numero_limpio in ('*', '****', 'SIN SERIE') then
        raise exception 'Numero de serie no valido';
    end if;
    select * into stock_row from public.stock_repuestos where id = stock_id_arg;
    if not found then raise exception 'Ubicacion de stock no encontrada'; end if;

    if serie_id_arg is null then
        if (select count(*) from public.series_repuestos where stock_id = stock_id_arg and estado = 'disponible') >= stock_row.stock then
            raise exception 'La cantidad de series disponibles no puede superar el stock';
        end if;
        insert into public.series_repuestos (
            repuesto_id, stock_id, numero_serie, ubicacion_sede, creado_por, actualizado_por
        ) values (
            stock_row.repuesto_id, stock_row.id, numero_limpio, stock_row.ubicacion_sede, auth.uid(), auth.uid()
        ) returning id into serie_id;
    else
        update public.series_repuestos
        set numero_serie = numero_limpio,
            actualizado_por = auth.uid(),
            updated_at = now()
        where id = serie_id_arg
          and repuesto_id = stock_row.repuesto_id
          and estado = 'disponible'
        returning id into serie_id;
        if serie_id is null then raise exception 'La serie utilizada no puede editarse'; end if;
    end if;
    return serie_id;
end;
$$;

create or replace function public.guardar_series_repuesto_lote(
    stock_id_arg uuid,
    numeros_arg text[]
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    numero text;
    total integer := 0;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    foreach numero in array coalesce(numeros_arg, '{}') loop
        if trim(coalesce(numero, '')) <> '' and trim(numero) not in ('*', '****') then
            perform public.guardar_serie_repuesto(stock_id_arg, numero, null);
            total := total + 1;
        end if;
    end loop;
    return total;
end;
$$;

create or replace function public.eliminar_serie_repuesto(serie_id_arg uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    delete from public.series_repuestos where id = serie_id_arg and estado = 'disponible';
    if not found then raise exception 'La serie utilizada no puede eliminarse'; end if;
end;
$$;

create or replace function public.registrar_movimiento_stock_con_series(
    stock_id_arg uuid,
    tipo_arg text,
    cantidad_arg numeric,
    destino_arg text default null,
    sede_consumo_arg text default null,
    equipo_arg text default null,
    observacion_arg text default '',
    series_ids_arg uuid[] default '{}'
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
    origen public.stock_repuestos%rowtype;
    nuevo numeric;
    destino_id uuid;
    movimiento_generado_id uuid;
    costo_unitario numeric;
    costo_sin_igv numeric;
    moneda_actual text;
    series_disponibles integer;
    series_seleccionadas integer;
    series_texto text[] := '{}';
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    if tipo_arg <> 'ajuste' and cantidad_arg <= 0 then raise exception 'La cantidad debe ser mayor a cero'; end if;
    if tipo_arg = 'ajuste' and cantidad_arg < 0 then raise exception 'La cantidad no puede ser negativa'; end if;
    if tipo_arg = 'salida' and (sede_consumo_arg is null or nullif(trim(equipo_arg), '') is null) then
        raise exception 'Indica sede y equipo';
    end if;

    select * into origen from public.stock_repuestos where id = stock_id_arg for update;
    if not found then raise exception 'Stock no encontrado'; end if;
    select c.costo_unitario_sin_igv, c.moneda into costo_unitario, moneda_actual
    from public.catalogo_repuestos c where c.id = origen.repuesto_id;

    series_seleccionadas := coalesce(array_length(series_ids_arg, 1), 0);
    select count(*) into series_disponibles
    from public.series_repuestos
    where stock_id = origen.id and estado = 'disponible';

    if tipo_arg in ('salida', 'transferencia') and series_seleccionadas > cantidad_arg then
        raise exception 'Hay mas series seleccionadas que unidades en el movimiento';
    end if;
    if tipo_arg = 'salida' and series_disponibles > 0
       and series_seleccionadas < least(cantidad_arg::integer, series_disponibles) then
        raise exception 'Selecciona los numeros de serie de las unidades utilizadas';
    end if;
    if series_seleccionadas > 0 and (
        select count(*) from public.series_repuestos
        where id = any(series_ids_arg) and stock_id = origen.id and estado = 'disponible'
    ) <> series_seleccionadas then
        raise exception 'Una serie seleccionada no esta disponible en este almacen';
    end if;

    if tipo_arg = 'ingreso' then nuevo := origen.stock + cantidad_arg;
    elsif tipo_arg = 'salida' then nuevo := origen.stock - cantidad_arg;
    elsif tipo_arg = 'ajuste' then nuevo := cantidad_arg;
    elsif tipo_arg = 'transferencia' then nuevo := origen.stock - cantidad_arg;
    else raise exception 'Movimiento invalido';
    end if;
    if nuevo < 0 then raise exception 'Stock insuficiente'; end if;

    update public.stock_repuestos set stock = nuevo, actualizado_por = auth.uid() where id = origen.id;
    if tipo_arg = 'transferencia' then
        if destino_arg is null or destino_arg = origen.ubicacion_sede then raise exception 'Destino invalido'; end if;
        insert into public.stock_repuestos (repuesto_id, ubicacion_sede, stock, stock_minimo, actualizado_por)
        values (origen.repuesto_id, destino_arg, cantidad_arg, origen.stock_minimo, auth.uid())
        on conflict (repuesto_id, ubicacion_sede) do update
        set stock = stock_repuestos.stock + cantidad_arg, actualizado_por = auth.uid()
        returning id into destino_id;
    end if;

    if series_seleccionadas > 0 then
        select array_agg(numero_serie order by numero_serie) into series_texto
        from public.series_repuestos where id = any(series_ids_arg);
    end if;
    costo_sin_igv := case when tipo_arg = 'salida' then round(cantidad_arg * costo_unitario, 2) else 0 end;
    insert into public.movimientos_stock_repuestos (
        repuesto_id, stock_origen_id, ubicacion_origen, ubicacion_destino, tipo, cantidad,
        stock_anterior, stock_resultante, moneda, costo_unitario_sin_igv,
        costo_total_sin_igv, costo_total_con_igv, sede_consumo, equipo_detalle,
        observacion, numeros_serie, creado_por
    ) values (
        origen.repuesto_id, origen.id, origen.ubicacion_sede, destino_arg, tipo_arg, cantidad_arg,
        origen.stock, nuevo, moneda_actual, costo_unitario, costo_sin_igv,
        round(costo_sin_igv * 1.18, 2), sede_consumo_arg, nullif(trim(equipo_arg), ''),
        left(coalesce(observacion_arg, ''), 500), coalesce(series_texto, '{}'), auth.uid()
    ) returning id into movimiento_generado_id;

    if series_seleccionadas > 0 and tipo_arg = 'salida' then
        update public.series_repuestos
        set estado = 'utilizado', movimiento_id = movimiento_generado_id, stock_id = null,
            sede_uso = sede_consumo_arg, equipo_uso = nullif(trim(equipo_arg), ''),
            observacion = left(coalesce(observacion_arg, ''), 500), usado_at = now(),
            actualizado_por = auth.uid(), updated_at = now()
        where id = any(series_ids_arg);
    elsif series_seleccionadas > 0 and tipo_arg = 'transferencia' then
        update public.series_repuestos
        set stock_id = destino_id, ubicacion_sede = destino_arg,
            actualizado_por = auth.uid(), updated_at = now()
        where id = any(series_ids_arg);
    end if;
    return nuevo;
end;
$$;

grant select on public.series_repuestos to authenticated;
grant execute on function public.guardar_serie_repuesto(uuid, text, uuid) to authenticated;
grant execute on function public.guardar_series_repuesto_lote(uuid, text[]) to authenticated;
grant execute on function public.eliminar_serie_repuesto(uuid) to authenticated;
grant execute on function public.registrar_movimiento_stock_con_series(uuid, text, numeric, text, text, text, text, uuid[]) to authenticated;

drop function if exists public.listar_pyg_inventario_mes(text);
create function public.listar_pyg_inventario_mes(mes_arg text)
returns table(
    fecha timestamptz,
    tipo text,
    numero_informe text,
    sede_consumo text,
    equipo_codigo text,
    equipo_nombre text,
    codigo text,
    repuesto text,
    cantidad numeric,
    unidad text,
    numeros_serie text[],
    moneda text,
    costo_unitario_sin_igv numeric,
    costo_total_sin_igv numeric,
    igv numeric,
    costo_total_con_igv numeric,
    observacion text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    inicio date;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    if mes_arg !~ '^[0-9]{4}-[0-9]{2}$' then raise exception 'Mes no valido'; end if;
    inicio := to_date(mes_arg || '-01', 'YYYY-MM-DD');
    return query
    select
        m.created_at,
        m.tipo,
        m.numero_informe,
        case when m.tipo = 'consumo'
            then coalesce(m.ubicacion_destino, m.ubicacion_origen)
            else coalesce(m.sede_consumo, m.ubicacion_origen)
        end,
        coalesce(i.equipo_codigo, m.equipo_detalle),
        i.equipo_nombre,
        c.codigo,
        c.nombre,
        m.cantidad,
        c.unidad,
        m.numeros_serie,
        m.moneda,
        m.costo_unitario_sin_igv,
        m.costo_total_sin_igv,
        round(m.costo_total_con_igv - m.costo_total_sin_igv, 2),
        m.costo_total_con_igv,
        m.observacion
    from public.movimientos_stock_repuestos m
    join public.catalogo_repuestos c on c.id = m.repuesto_id
    left join public.intervenciones_mantenimiento i on i.numero_informe = m.numero_informe
    where m.tipo in ('consumo', 'salida')
      and m.created_at >= inicio
      and m.created_at < (inicio + interval '1 month')
    order by m.created_at desc;
end;
$$;

grant execute on function public.listar_pyg_inventario_mes(text) to authenticated;
