create table if not exists public.tareas_mantenimiento (
    id uuid primary key default gen_random_uuid(),
    titulo text not null check (char_length(trim(titulo)) between 3 and 160),
    descripcion text not null default '',
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    equipo_codigo text,
    equipo_nombre text,
    prioridad text not null default 'media' check (prioridad in ('baja', 'media', 'alta', 'critica')),
    fecha_limite date not null,
    asignado_a uuid not null references public.profiles(id) on delete restrict,
    asignado_por uuid not null default auth.uid() references public.profiles(id) on delete restrict,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'completada')),
    observacion_tecnico text not null default '',
    iniciada_at timestamptz,
    completada_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.intervenciones_mantenimiento
drop constraint if exists intervenciones_mantenimiento_tipo_mantenimiento_check;
alter table public.intervenciones_mantenimiento
add constraint intervenciones_mantenimiento_tipo_mantenimiento_check
check (tipo_mantenimiento in (
    'Preventivo', 'PreventivoMensual', 'Correctivo',
    'Verificación', 'VerificaciÃ³n', 'Verificacion', 'Mejora / Instalacion'
));

drop trigger if exists tareas_mantenimiento_set_updated_at on public.tareas_mantenimiento;
create trigger tareas_mantenimiento_set_updated_at
before update on public.tareas_mantenimiento
for each row execute function public.set_updated_at();

alter table public.tareas_mantenimiento enable row level security;

drop policy if exists "tareas_select_asignado_o_superior" on public.tareas_mantenimiento;
create policy "tareas_select_asignado_o_superior"
on public.tareas_mantenimiento for select to authenticated
using (asignado_a = auth.uid() or public.es_encargado_ti());

drop policy if exists "tareas_insert_superior" on public.tareas_mantenimiento;
create policy "tareas_insert_superior"
on public.tareas_mantenimiento for insert to authenticated
with check (
    public.es_encargado_ti()
    and asignado_por = auth.uid()
    and exists (
        select 1 from public.profiles
        where id = asignado_a and activo = true and rol = 'tecnico'
    )
);

drop policy if exists "tareas_update_superior" on public.tareas_mantenimiento;
create policy "tareas_update_superior"
on public.tareas_mantenimiento for update to authenticated
using (public.es_encargado_ti())
with check (public.es_encargado_ti());

drop policy if exists "tareas_update_asignado" on public.tareas_mantenimiento;

create or replace function public.actualizar_estado_tarea_mantenimiento(
    tarea_id uuid,
    estado_nuevo text,
    observacion_nueva text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if estado_nuevo not in ('pendiente', 'en_proceso', 'completada') then
        raise exception 'Estado invalido';
    end if;

    update public.tareas_mantenimiento
    set estado = estado_nuevo,
        observacion_tecnico = left(coalesce(observacion_nueva, ''), 1000),
        iniciada_at = case
            when estado_nuevo = 'en_proceso' and iniciada_at is null then now()
            else iniciada_at
        end,
        completada_at = case
            when estado_nuevo = 'completada' then now()
            when estado_nuevo <> 'completada' then null
            else completada_at
        end
    where id = tarea_id
      and asignado_a = auth.uid();

    if not found then
        raise exception 'Tarea no encontrada o no autorizada';
    end if;
end;
$$;

revoke all on function public.actualizar_estado_tarea_mantenimiento(uuid, text, text) from public, anon;
grant execute on function public.actualizar_estado_tarea_mantenimiento(uuid, text, text) to authenticated;

drop policy if exists "tareas_delete_superior" on public.tareas_mantenimiento;
create policy "tareas_delete_superior"
on public.tareas_mantenimiento for delete to authenticated
using (public.es_encargado_ti());

create index if not exists tareas_mantenimiento_asignado_fecha_idx
on public.tareas_mantenimiento (asignado_a, fecha_limite, estado);

create index if not exists tareas_mantenimiento_mes_idx
on public.tareas_mantenimiento (fecha_limite, created_at desc);

do $$
begin
    alter publication supabase_realtime add table public.tareas_mantenimiento;
exception
    when duplicate_object then null;
end $$;
