drop policy if exists "operations_checklist_images_delete" on storage.objects;
create policy "operations_checklist_images_delete"
on storage.objects for delete to authenticated
using (
    bucket_id = 'operations-checklist-images'
    and (
        (storage.foldername(name))[2] = auth.uid()::text
        or public.es_encargado_ti()
    )
);

drop policy if exists "operaciones_checklists_update_superior" on public.operaciones_checklists;
create policy "operaciones_checklists_update_superior"
on public.operaciones_checklists for update to authenticated
using (public.es_encargado_ti())
with check (public.es_encargado_ti());
