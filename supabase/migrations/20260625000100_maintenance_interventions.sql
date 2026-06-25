create table if not exists public.intervenciones_mantenimiento (
    id uuid primary key default gen_random_uuid(),
    numero_informe text not null unique,
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    sede_nombre text,
    equipo_codigo text not null,
    equipo_nombre text not null,
    equipo_tipo text,
    componentes text[] not null default '{}',
    tipo_mantenimiento text not null check (tipo_mantenimiento in ('Preventivo', 'Correctivo', 'Verificación', 'Verificacion')),
    prioridad text,
    estado_inicial text,
    resultado_final text,
    tecnico text,
    supervisor text,
    hora_inicio text,
    hora_final text,
    duracion_minutos integer,
    preventivo_estimado_minutos integer,
    motivo text,
    solucion text,
    repuestos text,
    fecha_guardado timestamptz not null default now(),
    creado_por uuid default auth.uid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists intervenciones_mantenimiento_set_updated_at on public.intervenciones_mantenimiento;
create trigger intervenciones_mantenimiento_set_updated_at
before update on public.intervenciones_mantenimiento
for each row execute function public.set_updated_at();

alter table public.intervenciones_mantenimiento enable row level security;

drop policy if exists "intervenciones_select_sede" on public.intervenciones_mantenimiento;
create policy "intervenciones_select_sede"
on public.intervenciones_mantenimiento
for select
to authenticated
using (sede = public.usuario_sede());

drop policy if exists "intervenciones_insert_sede" on public.intervenciones_mantenimiento;
create policy "intervenciones_insert_sede"
on public.intervenciones_mantenimiento
for insert
to authenticated
with check (sede = public.usuario_sede() and creado_por = auth.uid());

drop policy if exists "intervenciones_update_owner_or_supervision" on public.intervenciones_mantenimiento;
create policy "intervenciones_update_owner_or_supervision"
on public.intervenciones_mantenimiento
for update
to authenticated
using (sede = public.usuario_sede() and (creado_por = auth.uid() or public.es_supervision()))
with check (sede = public.usuario_sede() and (creado_por = auth.uid() or public.es_supervision()));

create index if not exists intervenciones_mantenimiento_sede_fecha_idx
on public.intervenciones_mantenimiento (sede, fecha_guardado desc);

create index if not exists intervenciones_mantenimiento_equipo_idx
on public.intervenciones_mantenimiento (sede, equipo_codigo, tipo_mantenimiento);

do $$
begin
    alter publication supabase_realtime add table public.intervenciones_mantenimiento;
exception
    when duplicate_object then null;
end $$;
