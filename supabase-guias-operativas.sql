-- Guias operativas editables por administradores.
-- Ejecutar en Supabase SQL Editor o con:
-- supabase db query --linked --file supabase-guias-operativas.sql

create table if not exists public.guias_operativas (
    id uuid primary key default gen_random_uuid(),
    modulo text not null
        check (modulo in ('mantenimiento', 'operaciones', 'caja', 'ronda')),
    sede text not null default 'general'
        check (sede in ('general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    titulo text not null,
    descripcion text,
    pasos jsonb not null default '[]'::jsonb,
    creado_por uuid references auth.users(id),
    creado_por_email text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.guia_progreso (
    id uuid primary key default gen_random_uuid(),
    guia_id uuid references public.guias_operativas(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    user_email text,
    revisada boolean not null default false,
    revisada_en timestamptz,
    updated_at timestamptz not null default now(),
    unique (guia_id, user_id)
);

drop trigger if exists guias_operativas_set_updated_at on public.guias_operativas;
create trigger guias_operativas_set_updated_at
before update on public.guias_operativas
for each row
execute function public.set_updated_at();

drop trigger if exists guia_progreso_set_updated_at on public.guia_progreso;
create trigger guia_progreso_set_updated_at
before update on public.guia_progreso
for each row
execute function public.set_updated_at();

alter table public.guias_operativas enable row level security;
alter table public.guia_progreso enable row level security;

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

drop policy if exists "guia_progreso_select_own_or_admin" on public.guia_progreso;
create policy "guia_progreso_select_own_or_admin"
on public.guia_progreso
for select
to authenticated
using (user_id = auth.uid() or public.es_admin());

drop policy if exists "guia_progreso_insert_own" on public.guia_progreso;
create policy "guia_progreso_insert_own"
on public.guia_progreso
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "guia_progreso_update_own" on public.guia_progreso;
create policy "guia_progreso_update_own"
on public.guia_progreso
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

do $$
begin
    alter publication supabase_realtime add table public.guias_operativas;
exception
    when duplicate_object then null;
end $$;

create index if not exists guias_operativas_modulo_idx
on public.guias_operativas (modulo);

create index if not exists guias_operativas_sede_idx
on public.guias_operativas (modulo, sede);

create index if not exists guia_progreso_user_id_idx
on public.guia_progreso (user_id);
