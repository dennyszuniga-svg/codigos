-- Configuracion inicial para Codigos de Emergencia UrbaPark.
-- Ejecutar en Supabase: SQL Editor -> New query -> Run.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    nombre text,
    rol text not null default 'anfitrion'
        check (rol in ('encargado_ti', 'admin', 'comercial_abonados', 'tecnico', 'supervisor', 'eco', 'charly', 'anfitrion')),
    sede text not null default 'gama'
        check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.registros_codigos (
    id uuid primary key default gen_random_uuid(),
    codigo text not null,
    nombre text not null,
    descripcion text,
    encargado text not null,
    modo text not null default 'real',
    prioridad text not null default 'media',
    activado_en timestamptz,
    cerrado_en timestamptz,
    pasos jsonb not null default '[]'::jsonb,
    controles jsonb not null default '{}'::jsonb,
    sede text not null default 'gama'
        check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    creado_por uuid references auth.users(id),
    creado_por_email text,
    created_at timestamptz not null default now()
);

create table if not exists public.estado_operativo (
    id text primary key,
    sede text not null
        check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    codigo_activo text,
    checklist_estado jsonb not null default '{}'::jsonb,
    actualizado_por uuid references auth.users(id),
    actualizado_por_email text,
    updated_at timestamptz not null default now(),
    constraint estado_operativo_id_sede_check check (id = sede)
);

create table if not exists public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    user_agent text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.guias_operativas (
    id uuid primary key default gen_random_uuid(),
    modulo text not null
        check (modulo in ('mantenimiento', 'operaciones', 'caja', 'ronda')),
    sede text not null default 'general'
        check (sede in ('general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    audiencia text not null default 'todos'
        check (audiencia in ('todos', 'supervision')),
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, nombre)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and rol in ('encargado_ti', 'admin')
          and activo = true
    );
$$;

create or replace function public.usuario_sede()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select sede
    from public.profiles
    where id = auth.uid()
      and activo = true
    limit 1;
$$;

create or replace function public.puede_ver_guia(nivel text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select nivel = 'todos' or exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and activo = true
          and rol in ('encargado_ti', 'admin', 'supervisor')
    );
$$;

alter table public.profiles enable row level security;
alter table public.registros_codigos enable row level security;
alter table public.estado_operativo enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.guias_operativas enable row level security;
alter table public.guia_progreso enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.es_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.es_admin())
with check (public.es_admin());

drop policy if exists "registros_select_authenticated" on public.registros_codigos;
create policy "registros_select_authenticated"
on public.registros_codigos
for select
to authenticated
using (sede = public.usuario_sede());

drop policy if exists "registros_insert_authenticated" on public.registros_codigos;
create policy "registros_insert_authenticated"
on public.registros_codigos
for insert
to authenticated
with check (creado_por = auth.uid() and sede = public.usuario_sede());

drop policy if exists "registros_delete_admin" on public.registros_codigos;
create policy "registros_delete_admin"
on public.registros_codigos
for delete
to authenticated
using (public.es_admin() and sede = public.usuario_sede());

drop policy if exists "estado_operativo_select_authenticated" on public.estado_operativo;
create policy "estado_operativo_select_authenticated"
on public.estado_operativo
for select
to authenticated
using (sede = public.usuario_sede());

drop policy if exists "estado_operativo_insert_authenticated" on public.estado_operativo;
create policy "estado_operativo_insert_authenticated"
on public.estado_operativo
for insert
to authenticated
with check (id = sede and sede = public.usuario_sede() and actualizado_por = auth.uid());

drop policy if exists "estado_operativo_update_authenticated" on public.estado_operativo;
create policy "estado_operativo_update_authenticated"
on public.estado_operativo
for update
to authenticated
using (sede = public.usuario_sede())
with check (id = sede and sede = public.usuario_sede() and actualizado_por = auth.uid());

drop policy if exists "push_select_own_or_admin" on public.push_subscriptions;
create policy "push_select_own_or_admin"
on public.push_subscriptions
for select
to authenticated
using (user_id = auth.uid() or public.es_admin());

drop policy if exists "push_insert_own" on public.push_subscriptions;
create policy "push_insert_own"
on public.push_subscriptions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "push_update_own" on public.push_subscriptions;
create policy "push_update_own"
on public.push_subscriptions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_delete_own_or_admin" on public.push_subscriptions;
create policy "push_delete_own_or_admin"
on public.push_subscriptions
for delete
to authenticated
using (user_id = auth.uid() or public.es_admin());

drop policy if exists "guias_select_authenticated" on public.guias_operativas;
create policy "guias_select_authenticated"
on public.guias_operativas
for select
to authenticated
using (public.puede_ver_guia(audiencia));

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

insert into public.estado_operativo (id, sede, codigo_activo, checklist_estado)
values
    ('puruchuco', 'puruchuco', null, '{}'::jsonb),
    ('salaverry', 'salaverry', null, '{}'::jsonb),
    ('primavera', 'primavera', null, '{}'::jsonb),
    ('civico', 'civico', null, '{}'::jsonb),
    ('gama', 'gama', null, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.estado_operativo replica identity full;

do $$
begin
    alter publication supabase_realtime add table public.estado_operativo;
exception
    when duplicate_object then null;
end $$;

do $$
begin
    alter publication supabase_realtime add table public.guias_operativas;
exception
    when duplicate_object then null;
end $$;

create index if not exists registros_codigos_created_at_idx
on public.registros_codigos (created_at desc);

create index if not exists registros_codigos_codigo_idx
on public.registros_codigos (codigo);

create index if not exists registros_codigos_sede_created_at_idx
on public.registros_codigos (sede, created_at desc);

create index if not exists profiles_sede_idx
on public.profiles (sede);

create index if not exists estado_operativo_sede_idx
on public.estado_operativo (sede);

create index if not exists push_subscriptions_user_id_idx
on public.push_subscriptions (user_id);

create index if not exists guias_operativas_modulo_idx
on public.guias_operativas (modulo);

create index if not exists guias_operativas_sede_idx
on public.guias_operativas (modulo, sede);

create index if not exists guias_operativas_audiencia_idx
on public.guias_operativas (audiencia);

create index if not exists guia_progreso_user_id_idx
on public.guia_progreso (user_id);

-- Fotos privadas de guias operativas. La tabla guarda solo la ruta del archivo.
insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'guide-images',
    'guide-images',
    false,
    4194304,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "guide_images_read_authenticated" on storage.objects;
create policy "guide_images_read_authenticated"
on storage.objects for select to authenticated
using (bucket_id = 'guide-images');

drop policy if exists "guide_images_insert_admin" on storage.objects;
create policy "guide_images_insert_admin"
on storage.objects for insert to authenticated
with check (bucket_id = 'guide-images' and public.es_admin());

drop policy if exists "guide_images_update_admin" on storage.objects;
create policy "guide_images_update_admin"
on storage.objects for update to authenticated
using (bucket_id = 'guide-images' and public.es_admin())
with check (bucket_id = 'guide-images' and public.es_admin());

drop policy if exists "guide_images_delete_admin" on storage.objects;
create policy "guide_images_delete_admin"
on storage.objects for delete to authenticated
using (bucket_id = 'guide-images' and public.es_admin());

-- Despues de crear tu primer usuario en Authentication -> Users,
-- puedes hacerlo administrador con:
-- update public.profiles set rol = 'admin', nombre = 'Dennys' where email = 'TU_CORREO_AQUI';
