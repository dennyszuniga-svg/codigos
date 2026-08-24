drop policy if exists "operations_checklist_images_delete" on storage.objects;
create policy "operations_checklist_images_delete"
on storage.objects for delete to authenticated
using (
    bucket_id = 'operations-checklist-images'
    and (
        (storage.foldername(name))[2] = auth.uid()::text
        or public.puede_gestionar_checklist_operaciones((storage.foldername(name))[1])
    )
);

create or replace function public.eliminar_evidencia_checklist_operaciones(
    checklist_id_arg uuid,
    seccion_arg text,
    path_arg text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    registro public.operaciones_checklists%rowtype;
    perfil public.profiles%rowtype;
    fotos jsonb;
    foto jsonb;
    puede_eliminar boolean := false;
begin
    select * into perfil from public.profiles where id = auth.uid() and activo = true;
    if perfil.id is null then raise exception 'Usuario no autorizado.'; end if;

    select * into registro
    from public.operaciones_checklists
    where id = checklist_id_arg
    for update;
    if registro.id is null then raise exception 'Checklist no encontrado.'; end if;
    if registro.estado <> 'borrador' then raise exception 'El checklist ya fue finalizado.'; end if;
    if not public.puede_ver_checklist_operaciones(registro.sede) then raise exception 'No puedes acceder a esta sede.'; end if;

    fotos := coalesce(registro.evidencias->seccion_arg, '[]'::jsonb);
    if jsonb_typeof(fotos) <> 'array' then fotos := '[]'::jsonb; end if;
    select elemento into foto
    from jsonb_array_elements(fotos) elemento
    where elemento->>'path' = path_arg
    limit 1;
    if foto is null then return coalesce(registro.evidencias, '{}'::jsonb); end if;

    puede_eliminar := foto->>'autor_id' = auth.uid()::text
        or public.puede_gestionar_checklist_operaciones(registro.sede);
    if not puede_eliminar then raise exception 'No tienes permiso para quitar esta foto.'; end if;

    select coalesce(jsonb_agg(elemento), '[]'::jsonb) into fotos
    from jsonb_array_elements(fotos) elemento
    where elemento->>'path' <> path_arg;

    update public.operaciones_checklists
    set evidencias = jsonb_set(coalesce(evidencias, '{}'::jsonb), array[seccion_arg], fotos, true)
    where id = checklist_id_arg
    returning evidencias into fotos;

    return fotos;
end;
$$;

revoke all on function public.eliminar_evidencia_checklist_operaciones(uuid, text, text) from public;
grant execute on function public.eliminar_evidencia_checklist_operaciones(uuid, text, text) to authenticated;
