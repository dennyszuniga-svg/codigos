create table if not exists public.pendientes_entrega_meypar (
    id uuid primary key default gen_random_uuid(),
    repuesto_id uuid not null references public.catalogo_repuestos(id) on delete cascade,
    cantidad numeric(12,2) not null check (cantidad > 0),
    fecha_estimada date,
    referencia text,
    observacion text,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'en_transito', 'recibido')),
    creado_por uuid not null default auth.uid() references public.profiles(id),
    recibido_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.pendientes_entrega_meypar enable row level security;

drop policy if exists "meypar_encargado_ti_all" on public.pendientes_entrega_meypar;
create policy "meypar_encargado_ti_all"
on public.pendientes_entrega_meypar
for all
to authenticated
using (public.es_encargado_ti())
with check (public.es_encargado_ti());

drop trigger if exists pendientes_entrega_meypar_updated_at on public.pendientes_entrega_meypar;
create trigger pendientes_entrega_meypar_updated_at
before update on public.pendientes_entrega_meypar
for each row execute function public.set_updated_at();

create index if not exists pendientes_entrega_meypar_estado_idx
on public.pendientes_entrega_meypar (estado, fecha_estimada, created_at desc);

grant select, insert, update, delete on public.pendientes_entrega_meypar to authenticated;
