alter table public.asistencia_registros
  add column if not exists descuento_tardanza numeric(10,2) not null default 0,
  add column if not exists estado_jornada text not null default 'laborable';

update public.asistencia_registros
set descuento_tardanza = least(greatest(coalesce(minutos_tardanza, 0), 0), 15),
    estado_jornada = case
      when coalesce(minutos_tardanza, 0) > 15 then 'no_laborable_tardanza'
      when coalesce(minutos_tardanza, 0) > 0 then 'tardanza'
      else 'laborable'
    end;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'asistencia_registros_estado_jornada_check'
  ) then
    alter table public.asistencia_registros
      add constraint asistencia_registros_estado_jornada_check
      check (estado_jornada in ('laborable', 'tardanza', 'no_laborable_tardanza'));
  end if;
end $$;

comment on column public.asistencia_registros.descuento_tardanza is 'Descuento en soles: S/1 por minuto, con tope de S/15.';
comment on column public.asistencia_registros.estado_jornada is 'Jornada laborable, con tardanza o no laborable por superar 15 minutos.';

create or replace function public.resumen_asistencia_mes(sede_arg text, mes_arg text)
returns table(
  user_id uuid, nombre text, rol text, minutos_trabajados bigint, horas_trabajadas numeric,
  dias_trabajados bigint, minutos_tardanza bigint, horas_nocturnas numeric,
  horas_extra_25 bigint, horas_extra_35 bigint, extras_pendientes bigint
)
language plpgsql security definer set search_path = public as $$
declare inicio date;
begin
  if not (
    public.es_operacion_global()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.activo and p.rol = 'admin' and p.sede = sede_arg)
  ) then raise exception 'No autorizado'; end if;
  inicio := to_date(mes_arg || '-01', 'YYYY-MM-DD');
  return query
  select p.id, p.nombre, p.rol,
    coalesce(sum(case when r.estado_jornada <> 'no_laborable_tardanza' then r.minutos_trabajados else 0 end), 0)::bigint,
    round(coalesce(sum(case when r.estado_jornada <> 'no_laborable_tardanza' then r.minutos_trabajados else 0 end), 0)::numeric / 60, 2),
    count(r.id) filter(where r.estado_jornada <> 'no_laborable_tardanza')::bigint,
    coalesce(sum(r.minutos_tardanza), 0)::bigint,
    round(coalesce(sum(case when t.es_nocturno and r.estado_jornada <> 'no_laborable_tardanza' then r.minutos_trabajados else 0 end), 0)::numeric / 60, 2),
    coalesce(sum(case when r.estado_jornada <> 'no_laborable_tardanza' then r.horas_extra_25 else 0 end), 0)::bigint,
    coalesce(sum(case when r.estado_jornada <> 'no_laborable_tardanza' then r.horas_extra_35 else 0 end), 0)::bigint,
    count(r.id) filter(where r.estado_extra = 'pendiente' and r.estado_jornada <> 'no_laborable_tardanza')::bigint
  from public.profiles p
  left join public.asistencia_registros r on r.user_id = p.id and r.sede = sede_arg
    and r.fecha_laboral >= inicio and r.fecha_laboral < (inicio + interval '1 month')
  left join public.asistencia_programacion ap on ap.id = r.programacion_id
  left join public.asistencia_turnos t on t.id = ap.turno_id
  where p.activo
    and (
      p.rol in ('anfitrion', 'tecnico', 'supervisor', 'fortaleza')
      or (p.rol = 'admin' and p.sede = sede_arg)
      or (p.rol = 'encargado_ti' and p.sede = sede_arg)
    )
    and (p.sede = sede_arg or p.rol = 'tecnico')
  group by p.id, p.nombre, p.rol order by p.nombre;
end;
$$;
