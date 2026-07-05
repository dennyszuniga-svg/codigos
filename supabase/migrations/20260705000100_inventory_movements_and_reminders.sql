alter table public.inventario_movimientos drop constraint if exists inventario_movimientos_tipo_check;
alter table public.inventario_movimientos add constraint inventario_movimientos_tipo_check
check (tipo in ('consumo', 'ingreso', 'salida', 'ajuste'));
alter table public.inventario_movimientos drop constraint if exists inventario_movimientos_cantidad_check;
alter table public.inventario_movimientos add constraint inventario_movimientos_cantidad_check
check (cantidad >= 0);

alter table public.inventario_repuestos add column if not exists proveedor text;
alter table public.inventario_repuestos add column if not exists contacto_proveedor text;

create or replace function public.registrar_movimiento_inventario(
    repuesto_id_arg uuid,
    tipo_arg text,
    cantidad_arg numeric,
    observacion_arg text default ''
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
    repuesto public.inventario_repuestos%rowtype;
    stock_nuevo numeric;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    if tipo_arg not in ('ingreso', 'salida', 'ajuste') or cantidad_arg < 0
       or (tipo_arg in ('ingreso', 'salida') and cantidad_arg = 0) then raise exception 'Movimiento invalido'; end if;

    select * into repuesto from public.inventario_repuestos where id = repuesto_id_arg for update;
    if not found then raise exception 'Repuesto no encontrado'; end if;

    stock_nuevo := case
        when tipo_arg = 'ingreso' then repuesto.stock + cantidad_arg
        when tipo_arg = 'salida' then repuesto.stock - cantidad_arg
        else cantidad_arg
    end;
    if stock_nuevo < 0 then raise exception 'Stock insuficiente'; end if;

    update public.inventario_repuestos set stock = stock_nuevo, actualizado_por = auth.uid() where id = repuesto.id;
    insert into public.inventario_movimientos (
        sede, repuesto_id, repuesto_codigo, repuesto_nombre, tipo, cantidad, unidad, observacion, creado_por
    ) values (
        repuesto.sede, repuesto.id, repuesto.codigo, repuesto.nombre, tipo_arg, cantidad_arg,
        repuesto.unidad, left(coalesce(observacion_arg, ''), 500), auth.uid()
    );
    return stock_nuevo;
end;
$$;

revoke all on function public.registrar_movimiento_inventario(uuid, text, numeric, text) from public, anon;
grant execute on function public.registrar_movimiento_inventario(uuid, text, numeric, text) to authenticated;

alter table public.tareas_mantenimiento add column if not exists recordatorio_tres_dias_at timestamptz;
alter table public.tareas_mantenimiento add column if not exists recordatorio_dia_at timestamptz;
alter table public.tareas_mantenimiento add column if not exists recordatorio_vencido_at timestamptz;
