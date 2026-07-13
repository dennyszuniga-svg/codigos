alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check
check (rol in (
  'encargado_ti',
  'admin',
  'comercial_abonados',
  'jefe_operaciones',
  'coordinador_operaciones',
  'gdh',
  'tecnico',
  'supervisor',
  'eco',
  'charly',
  'anfitrion'
));

create or replace function public.es_operacion_global()
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and activo = true
      and rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
  );
$$;

drop policy if exists asistencia_programacion_lectura on public.asistencia_programacion;
create policy asistencia_programacion_lectura on public.asistencia_programacion
for select to authenticated using (
  user_id = auth.uid()
  or public.es_operacion_global()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo
      and p.rol = 'admin'
      and p.sede = asistencia_programacion.sede
  )
);

drop policy if exists asistencia_registros_lectura on public.asistencia_registros;
create policy asistencia_registros_lectura on public.asistencia_registros
for select to authenticated using (
  user_id = auth.uid()
  or public.es_operacion_global()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.activo
      and p.rol = 'admin'
      and p.sede = asistencia_registros.sede
  )
);

create or replace function public.listar_personal_asistencia(sede_arg text)
returns table(id uuid, nombre text, rol text, sede text)
language sql
security definer
set search_path = public as $$
  select p.id, p.nombre, p.rol, p.sede
  from public.profiles p
  where p.activo
    and p.rol in ('anfitrion', 'tecnico', 'supervisor')
    and (
      public.es_operacion_global()
      or exists (
        select 1
        from public.profiles a
        where a.id = auth.uid()
          and a.activo
          and a.rol = 'admin'
          and a.sede = sede_arg
      )
    )
    and (p.sede = sede_arg or p.rol = 'tecnico')
  order by p.nombre;
$$;

create or replace function public.guardar_programacion_asistencia(items_arg jsonb)
returns integer
language plpgsql
security definer
set search_path = public as $$
declare
  item jsonb;
  total integer := 0;
  sede_item text;
  user_item uuid;
  fecha_item date;
  turno_item uuid;
  estado_item text;
begin
  if jsonb_typeof(items_arg) <> 'array' then
    raise exception 'Programacion no valida';
  end if;

  for item in select * from jsonb_array_elements(items_arg) loop
    sede_item := item->>'sede';
    user_item := (item->>'user_id')::uuid;
    fecha_item := (item->>'fecha')::date;
    turno_item := nullif(item->>'turno_id', '')::uuid;
    estado_item := coalesce(item->>'estado', 'programado');

    if not (
      public.es_operacion_global()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.activo
          and p.rol = 'admin'
          and p.sede = sede_item
      )
    ) then
      raise exception 'No autorizado';
    end if;

    if not exists (
      select 1
      from public.profiles p
      where p.id = user_item
        and p.activo
        and p.rol in ('anfitrion', 'tecnico', 'supervisor')
        and (p.sede = sede_item or p.rol = 'tecnico')
    ) then
      raise exception 'Trabajador no valido para la sede';
    end if;

    if estado_item = 'programado' and turno_item is null then
      raise exception 'Turno requerido';
    end if;

    insert into public.asistencia_programacion(user_id, sede, fecha, turno_id, estado, creado_por)
    values(user_item, sede_item, fecha_item, turno_item, estado_item, auth.uid())
    on conflict(user_id, fecha) do update
    set sede = excluded.sede,
        turno_id = excluded.turno_id,
        estado = excluded.estado,
        updated_at = now();

    total := total + 1;
  end loop;

  return total;
end;
$$;

create or replace function public.aprobar_horas_extra_asistencia(registro_arg uuid, horas_arg integer, observacion_arg text default '')
returns void
language plpgsql
security definer
set search_path = public as $$
declare
  registro public.asistencia_registros%rowtype;
begin
  select * into registro from public.asistencia_registros where id = registro_arg for update;
  if not found then
    raise exception 'Registro no encontrado';
  end if;

  if not (
    public.es_operacion_global()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.activo
        and p.rol = 'admin'
        and p.sede = registro.sede
    )
  ) then
    raise exception 'No autorizado';
  end if;

  if horas_arg < 0 or horas_arg > registro.horas_extra_solicitadas then
    raise exception 'Horas no validas';
  end if;

  update public.asistencia_registros
  set horas_extra_aprobadas = horas_arg,
      horas_extra_25 = least(horas_arg, 2),
      horas_extra_35 = greatest(horas_arg - 2, 0),
      estado_extra = case when horas_arg > 0 then 'aprobado' else 'rechazado' end,
      aprobado_por = auth.uid(),
      aprobado_at = now(),
      observacion_aprobacion = left(coalesce(observacion_arg, ''), 500),
      updated_at = now()
  where id = registro_arg;
end;
$$;

create or replace function public.resumen_asistencia_mes(sede_arg text, mes_arg text)
returns table(
  user_id uuid,
  nombre text,
  rol text,
  minutos_trabajados bigint,
  horas_trabajadas numeric,
  dias_trabajados bigint,
  minutos_tardanza bigint,
  horas_nocturnas numeric,
  horas_extra_25 bigint,
  horas_extra_35 bigint,
  extras_pendientes bigint
)
language plpgsql
security definer
set search_path = public as $$
declare
  inicio date;
begin
  if not (
    public.es_operacion_global()
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.activo
        and p.rol = 'admin'
        and p.sede = sede_arg
    )
  ) then
    raise exception 'No autorizado';
  end if;

  inicio := to_date(mes_arg || '-01', 'YYYY-MM-DD');

  return query
  select p.id,
         p.nombre,
         p.rol,
         coalesce(sum(r.minutos_trabajados), 0)::bigint,
         round(coalesce(sum(r.minutos_trabajados), 0)::numeric / 60, 2),
         count(r.id)::bigint,
         coalesce(sum(r.minutos_tardanza), 0)::bigint,
         round(coalesce(sum(case when t.es_nocturno then r.minutos_trabajados else 0 end), 0)::numeric / 60, 2),
         coalesce(sum(r.horas_extra_25), 0)::bigint,
         coalesce(sum(r.horas_extra_35), 0)::bigint,
         count(r.id) filter(where r.estado_extra = 'pendiente')::bigint
  from public.profiles p
  left join public.asistencia_registros r
    on r.user_id = p.id
   and r.sede = sede_arg
   and r.fecha_laboral >= inicio
   and r.fecha_laboral < (inicio + interval '1 month')
  left join public.asistencia_programacion ap on ap.id = r.programacion_id
  left join public.asistencia_turnos t on t.id = ap.turno_id
  where p.activo
    and p.rol in ('anfitrion', 'tecnico', 'supervisor')
    and (p.sede = sede_arg or p.rol = 'tecnico')
  group by p.id, p.nombre, p.rol
  order by p.nombre;
end;
$$;

grant execute on function public.es_operacion_global() to authenticated;
grant execute on function public.listar_personal_asistencia(text) to authenticated;
grant execute on function public.guardar_programacion_asistencia(jsonb) to authenticated;
grant execute on function public.aprobar_horas_extra_asistencia(uuid, integer, text) to authenticated;
grant execute on function public.resumen_asistencia_mes(text, text) to authenticated;
