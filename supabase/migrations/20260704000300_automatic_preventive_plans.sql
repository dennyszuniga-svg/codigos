create table if not exists public.planes_preventivos (
    id uuid primary key default gen_random_uuid(),
    titulo text not null,
    descripcion text not null default '',
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    equipo_codigo text not null,
    equipo_nombre text not null,
    prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'critica')),
    tecnico_id uuid not null references public.profiles(id) on delete restrict,
    dia_mes integer not null default 28 check (dia_mes between 1 and 28),
    activo boolean not null default true,
    creado_por uuid not null default auth.uid() references public.profiles(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, equipo_codigo, tecnico_id)
);

drop trigger if exists planes_preventivos_set_updated_at on public.planes_preventivos;
create trigger planes_preventivos_set_updated_at before update on public.planes_preventivos
for each row execute function public.set_updated_at();

alter table public.tareas_mantenimiento add column if not exists plan_preventivo_id uuid references public.planes_preventivos(id) on delete set null;
alter table public.tareas_mantenimiento add column if not exists periodo text;
create unique index if not exists tareas_plan_periodo_uidx
on public.tareas_mantenimiento (plan_preventivo_id, periodo)
where plan_preventivo_id is not null and periodo is not null;

alter table public.planes_preventivos enable row level security;
create policy "planes_select_mantenimiento" on public.planes_preventivos for select to authenticated
using (public.es_personal_mantenimiento());
create policy "planes_insert_superior" on public.planes_preventivos for insert to authenticated
with check (public.es_encargado_ti() and creado_por = auth.uid());
create policy "planes_update_superior" on public.planes_preventivos for update to authenticated
using (public.es_encargado_ti()) with check (public.es_encargado_ti());
create policy "planes_delete_superior" on public.planes_preventivos for delete to authenticated
using (public.es_encargado_ti());

create or replace function public.generar_tareas_preventivas(mes_arg date default current_date)
returns table (
    id uuid,
    asignado_a uuid,
    titulo text,
    fecha_limite date,
    sede text
)
language plpgsql
security definer
set search_path = public
as $$
declare
    periodo_actual text := to_char(mes_arg, 'YYYY-MM');
begin
    if not public.es_personal_mantenimiento() then
        raise exception 'No autorizado';
    end if;

    return query
    with creadas as (
        insert into public.tareas_mantenimiento (
            titulo, descripcion, sede, equipo_codigo, equipo_nombre, prioridad,
            fecha_limite, asignado_a, asignado_por, plan_preventivo_id, periodo
        )
        select
            p.titulo, p.descripcion, p.sede, p.equipo_codigo, p.equipo_nombre, p.prioridad,
            make_date(extract(year from mes_arg)::int, extract(month from mes_arg)::int, p.dia_mes),
            p.tecnico_id, p.creado_por, p.id, periodo_actual
        from public.planes_preventivos p
        join public.profiles perfil on perfil.id = p.tecnico_id and perfil.activo = true and perfil.rol = 'tecnico'
        where p.activo = true
        on conflict (plan_preventivo_id, periodo) where plan_preventivo_id is not null and periodo is not null
        do nothing
        returning tareas_mantenimiento.id, tareas_mantenimiento.asignado_a,
                  tareas_mantenimiento.titulo, tareas_mantenimiento.fecha_limite, tareas_mantenimiento.sede
    )
    select creadas.id, creadas.asignado_a, creadas.titulo, creadas.fecha_limite, creadas.sede from creadas;
end;
$$;

revoke all on function public.generar_tareas_preventivas(date) from public, anon;
grant execute on function public.generar_tareas_preventivas(date) to authenticated;

do $$
begin
    alter publication supabase_realtime add table public.planes_preventivos;
exception when duplicate_object then null;
end $$;
