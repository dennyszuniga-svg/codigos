create or replace function public.es_personal_mantenimiento()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and activo = true
          and rol in ('admin', 'tecnico')
    );
$$;

revoke all on function public.es_personal_mantenimiento() from public, anon;
grant execute on function public.es_personal_mantenimiento() to authenticated;

drop policy if exists "inventario_select_sede" on public.inventario_repuestos;
drop policy if exists "inventario_select_mantenimiento" on public.inventario_repuestos;
create policy "inventario_select_mantenimiento"
on public.inventario_repuestos
for select
to authenticated
using (sede = public.usuario_sede() and public.es_personal_mantenimiento());

drop policy if exists "inventario_insert_supervision" on public.inventario_repuestos;
drop policy if exists "inventario_insert_mantenimiento" on public.inventario_repuestos;
create policy "inventario_insert_mantenimiento"
on public.inventario_repuestos
for insert
to authenticated
with check (
    sede = public.usuario_sede()
    and public.es_personal_mantenimiento()
    and actualizado_por = auth.uid()
);

drop policy if exists "inventario_update_supervision" on public.inventario_repuestos;
drop policy if exists "inventario_update_mantenimiento" on public.inventario_repuestos;
create policy "inventario_update_mantenimiento"
on public.inventario_repuestos
for update
to authenticated
using (sede = public.usuario_sede() and public.es_personal_mantenimiento())
with check (
    sede = public.usuario_sede()
    and public.es_personal_mantenimiento()
    and actualizado_por = auth.uid()
);

drop policy if exists "inventario_delete_supervision" on public.inventario_repuestos;
drop policy if exists "inventario_delete_mantenimiento" on public.inventario_repuestos;
create policy "inventario_delete_mantenimiento"
on public.inventario_repuestos
for delete
to authenticated
using (sede = public.usuario_sede() and public.es_personal_mantenimiento());

drop policy if exists "intervenciones_select_sede" on public.intervenciones_mantenimiento;
drop policy if exists "intervenciones_select_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_select_mantenimiento"
on public.intervenciones_mantenimiento
for select
to authenticated
using (sede = public.usuario_sede() and public.es_personal_mantenimiento());

drop policy if exists "intervenciones_insert_sede" on public.intervenciones_mantenimiento;
drop policy if exists "intervenciones_insert_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_insert_mantenimiento"
on public.intervenciones_mantenimiento
for insert
to authenticated
with check (
    sede = public.usuario_sede()
    and public.es_personal_mantenimiento()
    and creado_por = auth.uid()
);

drop policy if exists "intervenciones_update_owner_or_supervision" on public.intervenciones_mantenimiento;
drop policy if exists "intervenciones_update_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_update_mantenimiento"
on public.intervenciones_mantenimiento
for update
to authenticated
using (sede = public.usuario_sede() and public.es_personal_mantenimiento())
with check (sede = public.usuario_sede() and public.es_personal_mantenimiento());
