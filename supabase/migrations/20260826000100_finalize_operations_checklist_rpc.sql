create or replace function public.finalizar_checklist_operaciones(
    checklist_id_arg uuid,
    turno_arg text,
    fin_at_arg timestamptz,
    respuestas_arg jsonb,
    observaciones_arg jsonb,
    total_items_arg integer,
    cumple_items_arg integer,
    no_cumple_items_arg integer,
    no_aplica_items_arg integer,
    cumplimiento_arg numeric,
    criticos_no_cumple_arg integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    registro public.operaciones_checklists%rowtype;
begin
    select * into registro
    from public.operaciones_checklists
    where id = checklist_id_arg
    for update;

    if registro.id is null then
        raise exception 'Checklist no encontrado.';
    end if;
    if registro.estado <> 'borrador' then
        raise exception 'El checklist ya fue finalizado.';
    end if;
    if not public.puede_gestionar_checklist_operaciones(registro.sede) then
        raise exception 'No tienes permiso para finalizar este checklist.';
    end if;
    if turno_arg not in ('apertura', 'intermedio', 'cierre') then
        raise exception 'Turno no valido.';
    end if;

    update public.operaciones_checklists
    set turno = turno_arg,
        estado = 'finalizado',
        fin_at = coalesce(fin_at_arg, now()),
        respuestas = coalesce(respuestas_arg, '{}'::jsonb),
        observaciones = coalesce(observaciones_arg, '{}'::jsonb),
        total_items = greatest(coalesce(total_items_arg, 0), 0),
        cumple_items = greatest(coalesce(cumple_items_arg, 0), 0),
        no_cumple_items = greatest(coalesce(no_cumple_items_arg, 0), 0),
        no_aplica_items = greatest(coalesce(no_aplica_items_arg, 0), 0),
        cumplimiento = least(greatest(coalesce(cumplimiento_arg, 0), 0), 100),
        criticos_no_cumple = greatest(coalesce(criticos_no_cumple_arg, 0), 0)
    where id = checklist_id_arg
    returning * into registro;

    return jsonb_build_object(
        'id', registro.id,
        'estado', registro.estado,
        'fin_at', registro.fin_at,
        'cumplimiento', registro.cumplimiento
    );
end;
$$;

revoke all on function public.finalizar_checklist_operaciones(
    uuid, text, timestamptz, jsonb, jsonb, integer, integer, integer, integer, numeric, integer
) from public;
grant execute on function public.finalizar_checklist_operaciones(
    uuid, text, timestamptz, jsonb, jsonb, integer, integer, integer, integer, numeric, integer
) to authenticated;
