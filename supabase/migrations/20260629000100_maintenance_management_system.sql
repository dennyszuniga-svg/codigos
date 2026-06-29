alter table public.intervenciones_mantenimiento
add column if not exists repuestos_usados jsonb not null default '[]'::jsonb;

create table if not exists public.inventario_movimientos (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    repuesto_id uuid references public.inventario_repuestos(id) on delete set null,
    repuesto_codigo text not null,
    repuesto_nombre text not null,
    tipo text not null check (tipo in ('consumo', 'ingreso', 'ajuste')),
    cantidad numeric(12, 2) not null check (cantidad > 0),
    unidad text not null default 'unidad',
    numero_informe text,
    observacion text,
    creado_por uuid default auth.uid(),
    created_at timestamptz not null default now()
);

alter table public.inventario_movimientos enable row level security;

drop policy if exists "inventario_movimientos_select_mantenimiento" on public.inventario_movimientos;
create policy "inventario_movimientos_select_mantenimiento"
on public.inventario_movimientos
for select
to authenticated
using (public.es_personal_mantenimiento());

drop policy if exists "inventario_movimientos_insert_mantenimiento" on public.inventario_movimientos;
create policy "inventario_movimientos_insert_mantenimiento"
on public.inventario_movimientos
for insert
to authenticated
with check (public.es_personal_mantenimiento() and creado_por = auth.uid());

create index if not exists inventario_movimientos_sede_fecha_idx
on public.inventario_movimientos (sede, created_at desc);

create table if not exists public.mantenimiento_programado (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    equipo_codigo text not null,
    equipo_nombre text not null,
    equipo_tipo text,
    frecuencia_dias integer not null default 30 check (frecuencia_dias > 0),
    ultimo_preventivo timestamptz,
    proximo_preventivo date not null,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'programado', 'vencido', 'completado')),
    observaciones text,
    creado_por uuid default auth.uid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, equipo_codigo)
);

drop trigger if exists mantenimiento_programado_set_updated_at on public.mantenimiento_programado;
create trigger mantenimiento_programado_set_updated_at
before update on public.mantenimiento_programado
for each row execute function public.set_updated_at();

alter table public.mantenimiento_programado enable row level security;

drop policy if exists "mantenimiento_programado_select_mantenimiento" on public.mantenimiento_programado;
create policy "mantenimiento_programado_select_mantenimiento"
on public.mantenimiento_programado
for select
to authenticated
using (public.es_personal_mantenimiento());

drop policy if exists "mantenimiento_programado_upsert_mantenimiento" on public.mantenimiento_programado;
create policy "mantenimiento_programado_upsert_mantenimiento"
on public.mantenimiento_programado
for insert
to authenticated
with check (public.es_personal_mantenimiento() and creado_por = auth.uid());

drop policy if exists "mantenimiento_programado_update_mantenimiento" on public.mantenimiento_programado;
create policy "mantenimiento_programado_update_mantenimiento"
on public.mantenimiento_programado
for update
to authenticated
using (public.es_personal_mantenimiento())
with check (public.es_personal_mantenimiento());

create index if not exists mantenimiento_programado_sede_proximo_idx
on public.mantenimiento_programado (sede, proximo_preventivo);

create or replace function public.registrar_consumo_repuestos(
    numero_informe_arg text,
    sede_arg text,
    repuestos_arg jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    item jsonb;
    cantidad_num numeric;
    repuesto_row public.inventario_repuestos%rowtype;
begin
    if not public.es_personal_mantenimiento() then
        raise exception 'No autorizado';
    end if;

    if repuestos_arg is null or jsonb_typeof(repuestos_arg) <> 'array' then
        return;
    end if;

    if exists (
        select 1
        from public.inventario_movimientos
        where numero_informe = numero_informe_arg
          and tipo = 'consumo'
    ) then
        return;
    end if;

    for item in select * from jsonb_array_elements(repuestos_arg)
    loop
        cantidad_num := greatest(coalesce((item->>'cantidad')::numeric, 0), 0);
        if cantidad_num <= 0 then
            continue;
        end if;

        select *
        into repuesto_row
        from public.inventario_repuestos
        where id = nullif(item->>'id', '')::uuid
          and sede = sede_arg
        for update;

        if not found then
            continue;
        end if;

        update public.inventario_repuestos
        set stock = greatest(stock - cantidad_num, 0),
            actualizado_por = auth.uid()
        where id = repuesto_row.id;

        insert into public.inventario_movimientos (
            sede,
            repuesto_id,
            repuesto_codigo,
            repuesto_nombre,
            tipo,
            cantidad,
            unidad,
            numero_informe,
            observacion,
            creado_por
        )
        values (
            sede_arg,
            repuesto_row.id,
            repuesto_row.codigo,
            repuesto_row.nombre,
            'consumo',
            cantidad_num,
            repuesto_row.unidad,
            numero_informe_arg,
            coalesce(item->>'observacion', 'Consumo registrado desde informe de intervencion'),
            auth.uid()
        );
    end loop;
end;
$$;

do $$
begin
    alter publication supabase_realtime add table public.inventario_movimientos;
exception
    when duplicate_object then null;
end $$;

do $$
begin
    alter publication supabase_realtime add table public.mantenimiento_programado;
exception
    when duplicate_object then null;
end $$;
