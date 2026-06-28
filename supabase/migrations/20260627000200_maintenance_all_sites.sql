drop policy if exists "inventario_select_mantenimiento" on public.inventario_repuestos;
create policy "inventario_select_mantenimiento"
on public.inventario_repuestos
for select
to authenticated
using (public.es_personal_mantenimiento());

drop policy if exists "inventario_insert_mantenimiento" on public.inventario_repuestos;
create policy "inventario_insert_mantenimiento"
on public.inventario_repuestos
for insert
to authenticated
with check (public.es_personal_mantenimiento() and actualizado_por = auth.uid());

drop policy if exists "inventario_update_mantenimiento" on public.inventario_repuestos;
create policy "inventario_update_mantenimiento"
on public.inventario_repuestos
for update
to authenticated
using (public.es_personal_mantenimiento())
with check (public.es_personal_mantenimiento() and actualizado_por = auth.uid());

drop policy if exists "inventario_delete_mantenimiento" on public.inventario_repuestos;
create policy "inventario_delete_mantenimiento"
on public.inventario_repuestos
for delete
to authenticated
using (public.es_personal_mantenimiento());

drop policy if exists "intervenciones_select_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_select_mantenimiento"
on public.intervenciones_mantenimiento
for select
to authenticated
using (public.es_personal_mantenimiento());

drop policy if exists "intervenciones_insert_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_insert_mantenimiento"
on public.intervenciones_mantenimiento
for insert
to authenticated
with check (public.es_personal_mantenimiento() and creado_por = auth.uid());

drop policy if exists "intervenciones_update_mantenimiento" on public.intervenciones_mantenimiento;
create policy "intervenciones_update_mantenimiento"
on public.intervenciones_mantenimiento
for update
to authenticated
using (public.es_personal_mantenimiento())
with check (public.es_personal_mantenimiento());
