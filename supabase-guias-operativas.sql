-- Guias operativas editables por administradores.
-- Ejecutar en Supabase SQL Editor o con:
-- supabase db query --linked --file supabase-guias-operativas.sql

create table if not exists public.guias_operativas (
    id uuid primary key default gen_random_uuid(),
    modulo text not null
        check (modulo in ('mantenimiento', 'operaciones', 'caja', 'ronda')),
    titulo text not null,
    descripcion text,
    pasos jsonb not null default '[]'::jsonb,
    creado_por uuid references auth.users(id),
    creado_por_email text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists guias_operativas_set_updated_at on public.guias_operativas;
create trigger guias_operativas_set_updated_at
before update on public.guias_operativas
for each row
execute function public.set_updated_at();

alter table public.guias_operativas enable row level security;

drop policy if exists "guias_select_authenticated" on public.guias_operativas;
create policy "guias_select_authenticated"
on public.guias_operativas
for select
to authenticated
using (true);

drop policy if exists "guias_insert_admin" on public.guias_operativas;
create policy "guias_insert_admin"
on public.guias_operativas
for insert
to authenticated
with check (public.es_admin() and creado_por = auth.uid());

drop policy if exists "guias_update_admin" on public.guias_operativas;
create policy "guias_update_admin"
on public.guias_operativas
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());

drop policy if exists "guias_delete_admin" on public.guias_operativas;
create policy "guias_delete_admin"
on public.guias_operativas
for delete
to authenticated
using (public.es_admin());

create index if not exists guias_operativas_modulo_idx
on public.guias_operativas (modulo);
