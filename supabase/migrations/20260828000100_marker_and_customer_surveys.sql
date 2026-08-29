alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check check (rol in (
  'encargado_ti', 'admin', 'comercial_abonados', 'jefe_operaciones',
  'coordinador_operaciones', 'gdh', 'tecnico', 'supervisor', 'fortaleza',
  'eco', 'charly', 'anfitrion', 'marcador'
));

alter table public.asistencia_registros
  add column if not exists minutos_retraso_real integer not null default 0,
  add column if not exists minutos_tolerancia integer not null default 0;

update public.asistencia_registros
set minutos_retraso_real = greatest(coalesce(minutos_tardanza, 0), 0)
where minutos_retraso_real = 0 and coalesce(minutos_tardanza, 0) > 0;

create table if not exists public.encuestas_satisfaccion (
  id bigint generated always as identity primary key,
  sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
  fecha date not null default ((now() at time zone 'America/Lima')::date),
  colaborador_id uuid references public.profiles(id) on delete set null,
  colaborador_nombre varchar(90) not null,
  atencion smallint not null check (atencion between 0 and 2),
  uniforme smallint not null check (uniforme between 0 and 2),
  saludo smallint not null check (saludo between 0 and 2),
  informacion smallint not null check (informacion between 0 and 2),
  solucion smallint not null check (solucion between 0 and 2),
  observacion varchar(300) not null default '',
  created_at timestamptz not null default now()
);

create index if not exists encuestas_satisfaccion_sede_fecha_idx
  on public.encuestas_satisfaccion(sede, fecha desc, id desc);
create index if not exists encuestas_satisfaccion_colaborador_fecha_idx
  on public.encuestas_satisfaccion(colaborador_id, fecha desc)
  where colaborador_id is not null;

alter table public.encuestas_satisfaccion enable row level security;

drop policy if exists encuestas_satisfaccion_lectura on public.encuestas_satisfaccion;
create policy encuestas_satisfaccion_lectura on public.encuestas_satisfaccion
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.activo
      and (
        p.rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
        or (p.rol = 'admin' and p.sede = encuestas_satisfaccion.sede)
      )
  )
);

grant select on public.encuestas_satisfaccion to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'encuestas_satisfaccion'
  ) then
    alter publication supabase_realtime add table public.encuestas_satisfaccion;
  end if;
end $$;

comment on table public.encuestas_satisfaccion is 'Respuestas compactas de satisfacción, sin imágenes ni datos personales del cliente.';
comment on column public.encuestas_satisfaccion.atencion is '0 No cumple, 1 Cumple, 2 No aplica.';
