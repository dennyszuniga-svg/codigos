create or replace function public.crear_turno_asistencia(
  hora_inicio_arg time,
  hora_fin_arg time,
  refrigerio_arg integer default 60
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  minutos_inicio integer;
  minutos_fin integer;
  minutos_totales integer;
  minutos_efectivos integer;
  codigo_turno text;
  nombre_turno text;
  turno_id uuid;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo
      and p.rol in ('encargado_ti', 'admin', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
  ) then
    raise exception 'No autorizado para crear horarios';
  end if;

  if hora_inicio_arg is null or hora_fin_arg is null then
    raise exception 'Completa la hora de inicio y fin';
  end if;
  if refrigerio_arg is null or refrigerio_arg < 0 or refrigerio_arg > 180 then
    raise exception 'El refrigerio debe estar entre 0 y 180 minutos';
  end if;

  minutos_inicio := extract(hour from hora_inicio_arg)::integer * 60
    + extract(minute from hora_inicio_arg)::integer;
  minutos_fin := extract(hour from hora_fin_arg)::integer * 60
    + extract(minute from hora_fin_arg)::integer;
  minutos_totales := minutos_fin - minutos_inicio;
  if minutos_totales <= 0 then
    minutos_totales := minutos_totales + 1440;
  end if;
  minutos_efectivos := minutos_totales - refrigerio_arg;
  if minutos_efectivos < 60 or minutos_efectivos > 900 then
    raise exception 'La jornada efectiva debe estar entre 1 y 15 horas';
  end if;

  select t.id into turno_id
  from public.asistencia_turnos t
  where t.hora_inicio = hora_inicio_arg
    and t.hora_fin = hora_fin_arg
    and t.refrigerio_minutos = refrigerio_arg
  limit 1;

  if turno_id is not null then
    update public.asistencia_turnos set activo = true where id = turno_id;
    return turno_id;
  end if;

  codigo_turno := 'CUSTOM_' || to_char(hora_inicio_arg, 'HH24MI') || '_'
    || to_char(hora_fin_arg, 'HH24MI') || '_R' || refrigerio_arg::text;
  nombre_turno := to_char(hora_inicio_arg, 'HH24:MI') || ' a '
    || to_char(hora_fin_arg, 'HH24:MI')
    || case when minutos_fin <= minutos_inicio then ' - Nocturno' else '' end;

  insert into public.asistencia_turnos (
    codigo, nombre, hora_inicio, hora_fin, refrigerio_minutos,
    minutos_jornada, es_nocturno, activo
  ) values (
    codigo_turno, nombre_turno, hora_inicio_arg, hora_fin_arg, refrigerio_arg,
    minutos_efectivos, minutos_fin <= minutos_inicio, true
  )
  on conflict (codigo) do update
  set nombre = excluded.nombre,
      hora_inicio = excluded.hora_inicio,
      hora_fin = excluded.hora_fin,
      refrigerio_minutos = excluded.refrigerio_minutos,
      minutos_jornada = excluded.minutos_jornada,
      es_nocturno = excluded.es_nocturno,
      activo = true
  returning id into turno_id;

  return turno_id;
end;
$$;

grant execute on function public.crear_turno_asistencia(time, time, integer) to authenticated;
