create or replace function public.puede_gestionar_checklist_operaciones(sede_arg text)
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
          and rol in ('encargado_ti', 'admin', 'supervisor', 'fortaleza')
          and (rol = 'encargado_ti' or sede = sede_arg or sede = 'general')
    );
$$;

drop policy if exists "operaciones_checklists_insert" on public.operaciones_checklists;
create policy "operaciones_checklists_insert"
on public.operaciones_checklists for insert to authenticated
with check (
    responsable_id = auth.uid()
    and public.puede_gestionar_checklist_operaciones(sede)
);

drop policy if exists "operaciones_checklists_update" on public.operaciones_checklists;
drop policy if exists "operaciones_checklists_update_superior" on public.operaciones_checklists;
create policy "operaciones_checklists_update_gestores"
on public.operaciones_checklists for update to authenticated
using (public.puede_gestionar_checklist_operaciones(sede))
with check (public.puede_gestionar_checklist_operaciones(sede));

drop policy if exists "operaciones_checklists_delete" on public.operaciones_checklists;
create policy "operaciones_checklists_delete_gestores"
on public.operaciones_checklists for delete to authenticated
using (
    estado = 'borrador'
    and public.puede_gestionar_checklist_operaciones(sede)
);

create or replace function public.agregar_evidencia_checklist_operaciones(
    checklist_id_arg uuid,
    seccion_arg text,
    evidencia_arg jsonb
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
    evidencia jsonb;
    ruta text;
begin
    select * into perfil from public.profiles where id = auth.uid() and activo = true;
    if perfil.id is null or (perfil.rol <> 'anfitrion' and not public.puede_gestionar_checklist_operaciones(coalesce((select sede from public.operaciones_checklists where id = checklist_id_arg), ''))) then
        raise exception 'No tienes permiso para aportar evidencias.';
    end if;

    select * into registro
    from public.operaciones_checklists
    where id = checklist_id_arg
    for update;
    if registro.id is null then raise exception 'Checklist no encontrado.'; end if;
    if registro.estado <> 'borrador' then raise exception 'El checklist ya fue finalizado.'; end if;
    if not public.puede_ver_checklist_operaciones(registro.sede) then raise exception 'No puedes acceder a esta sede.'; end if;
    if seccion_arg !~ '^[a-z0-9_-]+$' then raise exception 'Seccion no valida.'; end if;

    ruta := coalesce(evidencia_arg->>'path', '');
    if ruta = '' or ruta not like registro.sede || '/' || auth.uid()::text || '/' || registro.id::text || '/' || seccion_arg || '/%' then
        raise exception 'Ruta de evidencia no valida.';
    end if;

    fotos := coalesce(registro.evidencias->seccion_arg, '[]'::jsonb);
    if jsonb_typeof(fotos) <> 'array' then fotos := '[]'::jsonb; end if;
    if jsonb_array_length(fotos) >= 5 then raise exception 'El bloque ya tiene 5 fotos.'; end if;

    evidencia := jsonb_build_object(
        'path', ruta,
        'nombre', left(coalesce(evidencia_arg->>'nombre', 'evidencia.jpg'), 160),
        'autor_id', auth.uid(),
        'autor_nombre', coalesce(nullif(perfil.nombre, ''), split_part(perfil.email, '@', 1)),
        'creado_at', now()
    );
    fotos := fotos || jsonb_build_array(evidencia);

    update public.operaciones_checklists
    set evidencias = jsonb_set(coalesce(evidencias, '{}'::jsonb), array[seccion_arg], fotos, true)
    where id = checklist_id_arg
    returning evidencias into fotos;

    return fotos;
end;
$$;

revoke all on function public.agregar_evidencia_checklist_operaciones(uuid, text, jsonb) from public;
grant execute on function public.agregar_evidencia_checklist_operaciones(uuid, text, jsonb) to authenticated;
