create or replace function public.puede_ver_reporteria_operaciones()
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
          and rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
    );
$$;

revoke all on function public.puede_ver_reporteria_operaciones() from public;
grant execute on function public.puede_ver_reporteria_operaciones() to authenticated;

drop policy if exists "operaciones_checklists_select" on public.operaciones_checklists;
create policy "operaciones_checklists_select"
on public.operaciones_checklists for select to authenticated
using (
    public.puede_ver_reporteria_operaciones()
    or (
        estado = 'borrador'
        and public.puede_ver_checklist_operaciones(sede)
    )
);

create or replace function public.puede_ver_evidencia_checklist_operaciones(nombre_objeto text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
    select public.puede_ver_reporteria_operaciones()
        or exists (
            select 1
            from public.operaciones_checklists checklist
            where checklist.id::text = (storage.foldername(nombre_objeto))[3]
              and checklist.estado = 'borrador'
              and public.puede_ver_checklist_operaciones(checklist.sede)
        );
$$;

revoke all on function public.puede_ver_evidencia_checklist_operaciones(text) from public;
grant execute on function public.puede_ver_evidencia_checklist_operaciones(text) to authenticated;

drop policy if exists "operations_checklist_images_read" on storage.objects;
create policy "operations_checklist_images_read"
on storage.objects for select to authenticated
using (
    bucket_id = 'operations-checklist-images'
    and public.puede_ver_evidencia_checklist_operaciones(name)
);
