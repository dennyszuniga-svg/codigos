drop policy if exists "inventario_select_mantenimiento" on public.inventario_repuestos;
create policy "inventario_select_superior"
on public.inventario_repuestos for select to authenticated
using (public.es_encargado_ti());

drop policy if exists "inventario_insert_mantenimiento" on public.inventario_repuestos;
create policy "inventario_insert_superior"
on public.inventario_repuestos for insert to authenticated
with check (public.es_encargado_ti() and actualizado_por = auth.uid());

drop policy if exists "inventario_update_mantenimiento" on public.inventario_repuestos;
create policy "inventario_update_superior"
on public.inventario_repuestos for update to authenticated
using (public.es_encargado_ti())
with check (public.es_encargado_ti() and actualizado_por = auth.uid());

drop policy if exists "inventario_delete_mantenimiento" on public.inventario_repuestos;
create policy "inventario_delete_superior"
on public.inventario_repuestos for delete to authenticated
using (public.es_encargado_ti());

create or replace function public.listar_inventario_para_informe(sede_arg text)
returns table (
    id uuid,
    codigo text,
    nombre text,
    stock numeric,
    unidad text,
    categoria text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.activo = true
          and profiles.rol in ('encargado_ti', 'tecnico')
    ) then
        raise exception 'No autorizado';
    end if;

    return query
    select r.id, r.codigo, r.nombre, r.stock, r.unidad, r.categoria
    from public.inventario_repuestos r
    where r.sede = sede_arg
    order by r.nombre;
end;
$$;

revoke all on function public.listar_inventario_para_informe(text) from public, anon;
grant execute on function public.listar_inventario_para_informe(text) to authenticated;

drop policy if exists "inventario_movimientos_select_mantenimiento" on public.inventario_movimientos;
create policy "inventario_movimientos_select_superior"
on public.inventario_movimientos for select to authenticated
using (public.es_encargado_ti());

drop policy if exists "inventario_movimientos_insert_mantenimiento" on public.inventario_movimientos;
create policy "inventario_movimientos_insert_superior"
on public.inventario_movimientos for insert to authenticated
with check (public.es_encargado_ti() and creado_por = auth.uid());
