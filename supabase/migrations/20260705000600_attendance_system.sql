create table if not exists public.asistencia_sedes (
  codigo text primary key,
  nombre text not null,
  latitud double precision not null,
  longitud double precision not null,
  radio_metros integer not null default 120 check (radio_metros between 20 and 500),
  activa boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.asistencia_sedes(codigo,nombre,latitud,longitud,radio_metros) values
 ('salaverry','Real Plaza Salaverry',-12.089944,-77.053306,120),
 ('primavera','Real Plaza Primavera',-12.110472,-77.001528,120),
 ('civico','Real Plaza Centro Civico',-12.057222,-77.037222,120),
 ('puruchuco','Real Plaza Puruchuco',-12.040056,-76.932972,120),
 ('gama','GAMA',-12.070556,-77.012278,120)
on conflict(codigo) do update set nombre=excluded.nombre,latitud=excluded.latitud,longitud=excluded.longitud,
 radio_metros=excluded.radio_metros,updated_at=now();

create table if not exists public.asistencia_turnos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  hora_inicio time not null,
  hora_fin time not null,
  refrigerio_minutos integer not null default 60 check (refrigerio_minutos between 0 and 180),
  minutos_jornada integer not null default 480 check (minutos_jornada > 0),
  es_nocturno boolean not null default false,
  activo boolean not null default true
);

insert into public.asistencia_turnos(codigo,nombre,hora_inicio,hora_fin,refrigerio_minutos,minutos_jornada,es_nocturno) values
 ('T0600','06:00 a 15:00','06:00','15:00',60,480,false),
 ('T1000','10:00 a 19:00','10:00','19:00',60,480,false),
 ('T0645','06:45 a 15:45','06:45','15:45',60,480,false),
 ('T1700','17:00 a 02:00 - Nocturno','17:00','02:00',60,480,true),
 ('T2300','23:00 a 07:00 - Nocturno','23:00','07:00',0,480,true)
on conflict(codigo) do update set nombre=excluded.nombre,hora_inicio=excluded.hora_inicio,hora_fin=excluded.hora_fin,
 refrigerio_minutos=excluded.refrigerio_minutos,minutos_jornada=excluded.minutos_jornada,es_nocturno=excluded.es_nocturno,activo=true;

create table if not exists public.asistencia_programacion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sede text not null references public.asistencia_sedes(codigo),
  fecha date not null,
  turno_id uuid references public.asistencia_turnos(id),
  estado text not null default 'programado' check (estado in ('programado','descanso','libre')),
  creado_por uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,fecha)
);

create table if not exists public.asistencia_registros (
  id uuid primary key default gen_random_uuid(),
  programacion_id uuid not null unique references public.asistencia_programacion(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  sede text not null references public.asistencia_sedes(codigo),
  fecha_laboral date not null,
  entrada_at timestamptz not null,
  salida_at timestamptz,
  entrada_lat double precision not null,
  entrada_lon double precision not null,
  entrada_precision_m double precision,
  salida_lat double precision,
  salida_lon double precision,
  salida_precision_m double precision,
  distancia_entrada_m numeric(10,2),
  distancia_salida_m numeric(10,2),
  minutos_trabajados integer,
  minutos_tardanza integer not null default 0,
  horas_extra_solicitadas integer not null default 0,
  horas_extra_aprobadas integer not null default 0,
  horas_extra_25 integer not null default 0,
  horas_extra_35 integer not null default 0,
  estado_extra text not null default 'sin_extra' check (estado_extra in ('sin_extra','pendiente','aprobado','rechazado')),
  aprobado_por uuid references public.profiles(id),
  aprobado_at timestamptz,
  observacion_aprobacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists asistencia_programacion_sede_fecha_idx on public.asistencia_programacion(sede,fecha);
create index if not exists asistencia_registros_sede_fecha_idx on public.asistencia_registros(sede,fecha_laboral);
create index if not exists asistencia_registros_usuario_fecha_idx on public.asistencia_registros(user_id,fecha_laboral desc);

alter table public.asistencia_sedes enable row level security;
alter table public.asistencia_turnos enable row level security;
alter table public.asistencia_programacion enable row level security;
alter table public.asistencia_registros enable row level security;

drop policy if exists asistencia_sedes_lectura on public.asistencia_sedes;
create policy asistencia_sedes_lectura on public.asistencia_sedes for select to authenticated using(true);
drop policy if exists asistencia_turnos_lectura on public.asistencia_turnos;
create policy asistencia_turnos_lectura on public.asistencia_turnos for select to authenticated using(true);
drop policy if exists asistencia_programacion_lectura on public.asistencia_programacion;
create policy asistencia_programacion_lectura on public.asistencia_programacion for select to authenticated using(
 user_id=auth.uid() or public.es_encargado_ti() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol='admin' and p.sede=asistencia_programacion.sede)
);
drop policy if exists asistencia_registros_lectura on public.asistencia_registros;
create policy asistencia_registros_lectura on public.asistencia_registros for select to authenticated using(
 user_id=auth.uid() or public.es_encargado_ti() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol='admin' and p.sede=asistencia_registros.sede)
);

create or replace function public.listar_personal_asistencia(sede_arg text)
returns table(id uuid,nombre text,rol text,sede text)
language sql security definer set search_path=public as $$
 select p.id,p.nombre,p.rol,p.sede from public.profiles p
 where p.activo and p.rol in('anfitrion','tecnico')
 and (public.es_encargado_ti() or exists(select 1 from public.profiles a where a.id=auth.uid() and a.activo and a.rol='admin' and a.sede=sede_arg))
 and (p.sede=sede_arg or p.rol='tecnico') order by p.nombre;
$$;

create or replace function public.guardar_programacion_asistencia(items_arg jsonb)
returns integer language plpgsql security definer set search_path=public as $$
declare item jsonb; total integer:=0; sede_item text; user_item uuid; fecha_item date; turno_item uuid; estado_item text;
begin
 if jsonb_typeof(items_arg)<>'array' then raise exception 'Programacion no valida'; end if;
 for item in select * from jsonb_array_elements(items_arg) loop
   sede_item:=item->>'sede'; user_item:=(item->>'user_id')::uuid; fecha_item:=(item->>'fecha')::date;
   turno_item:=nullif(item->>'turno_id','')::uuid; estado_item:=coalesce(item->>'estado','programado');
   if not (public.es_encargado_ti() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol='admin' and p.sede=sede_item)) then raise exception 'No autorizado'; end if;
   if not exists(select 1 from public.profiles p where p.id=user_item and p.activo and p.rol in('anfitrion','tecnico') and (p.sede=sede_item or p.rol='tecnico')) then raise exception 'Trabajador no valido para la sede'; end if;
   if estado_item='programado' and turno_item is null then raise exception 'Turno requerido'; end if;
   insert into public.asistencia_programacion(user_id,sede,fecha,turno_id,estado,creado_por)
   values(user_item,sede_item,fecha_item,turno_item,estado_item,auth.uid())
   on conflict(user_id,fecha) do update set sede=excluded.sede,turno_id=excluded.turno_id,estado=excluded.estado,updated_at=now();
   total:=total+1;
 end loop;
 return total;
end; $$;

create or replace function public.aprobar_horas_extra_asistencia(registro_arg uuid,horas_arg integer,observacion_arg text default '')
returns void language plpgsql security definer set search_path=public as $$
declare registro public.asistencia_registros%rowtype;
begin
 select * into registro from public.asistencia_registros where id=registro_arg for update;
 if not found then raise exception 'Registro no encontrado'; end if;
 if not (public.es_encargado_ti() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol='admin' and p.sede=registro.sede)) then raise exception 'No autorizado'; end if;
 if horas_arg<0 or horas_arg>registro.horas_extra_solicitadas then raise exception 'Horas no validas'; end if;
 update public.asistencia_registros set horas_extra_aprobadas=horas_arg,horas_extra_25=least(horas_arg,2),horas_extra_35=greatest(horas_arg-2,0),
 estado_extra=case when horas_arg>0 then 'aprobado' else 'rechazado' end,aprobado_por=auth.uid(),aprobado_at=now(),observacion_aprobacion=left(coalesce(observacion_arg,''),500),updated_at=now()
 where id=registro_arg;
end; $$;

create or replace function public.resumen_asistencia_mes(sede_arg text,mes_arg text)
returns table(user_id uuid,nombre text,rol text,minutos_trabajados bigint,horas_trabajadas numeric,dias_trabajados bigint,
 minutos_tardanza bigint,horas_nocturnas numeric,horas_extra_25 bigint,horas_extra_35 bigint,extras_pendientes bigint)
language plpgsql security definer set search_path=public as $$
declare inicio date;
begin
 if not (public.es_encargado_ti() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo and p.rol='admin' and p.sede=sede_arg)) then raise exception 'No autorizado'; end if;
 inicio:=to_date(mes_arg||'-01','YYYY-MM-DD');
 return query select p.id,p.nombre,p.rol,coalesce(sum(r.minutos_trabajados),0)::bigint,round(coalesce(sum(r.minutos_trabajados),0)::numeric/60,2),
 count(r.id)::bigint,coalesce(sum(r.minutos_tardanza),0)::bigint,
 round(coalesce(sum(case when t.es_nocturno then r.minutos_trabajados else 0 end),0)::numeric/60,2),coalesce(sum(r.horas_extra_25),0)::bigint,
 coalesce(sum(r.horas_extra_35),0)::bigint,count(r.id) filter(where r.estado_extra='pendiente')::bigint
 from public.profiles p left join public.asistencia_registros r on r.user_id=p.id and r.sede=sede_arg and r.fecha_laboral>=inicio and r.fecha_laboral<(inicio+interval '1 month')
 left join public.asistencia_programacion ap on ap.id=r.programacion_id left join public.asistencia_turnos t on t.id=ap.turno_id
 where p.activo and p.rol in('anfitrion','tecnico') and (p.sede=sede_arg or p.rol='tecnico') group by p.id,p.nombre,p.rol order by p.nombre;
end; $$;

grant execute on function public.listar_personal_asistencia(text) to authenticated;
grant execute on function public.guardar_programacion_asistencia(jsonb) to authenticated;
grant execute on function public.aprobar_horas_extra_asistencia(uuid,integer,text) to authenticated;
grant execute on function public.resumen_asistencia_mes(text,text) to authenticated;

do $$ begin
 alter publication supabase_realtime add table public.asistencia_programacion;
exception when duplicate_object then null; end $$;
do $$ begin
 alter publication supabase_realtime add table public.asistencia_registros;
exception when duplicate_object then null; end $$;
