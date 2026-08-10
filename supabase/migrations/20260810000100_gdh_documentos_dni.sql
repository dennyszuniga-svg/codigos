begin;

alter table public.profiles add column if not exists dni text;
alter table public.profiles add column if not exists apellidos_nombres text;
alter table public.profiles add column if not exists debe_cambiar_password boolean not null default false;
alter table public.profiles add column if not exists password_actualizada_at timestamptz;

update public.profiles
set apellidos_nombres = nombre
where apellidos_nombres is null and nombre is not null;

alter table public.profiles drop constraint if exists profiles_dni_check;
alter table public.profiles add constraint profiles_dni_check
check (dni is null or dni ~ '^[0-9]{8}$');

create unique index if not exists profiles_dni_unique_idx
on public.profiles (dni)
where dni is not null;

create or replace function public.es_gdh()
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and activo = true
      and rol in ('encargado_ti', 'gdh')
  );
$$;

create or replace function public.confirmar_cambio_password()
returns void
language sql
security definer
set search_path = public as $$
  update public.profiles
  set debe_cambiar_password = false,
      password_actualizada_at = now(),
      updated_at = now()
  where id = auth.uid();
$$;

drop policy if exists profiles_select_gdh on public.profiles;
create policy profiles_select_gdh on public.profiles
for select to authenticated
using (public.es_gdh());

create table if not exists public.gdh_documentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  categoria text not null check (categoria in ('boleta', 'contrato', 'formulario', 'constancia', 'politica', 'otro')),
  titulo text not null check (char_length(btrim(titulo)) between 3 and 180),
  periodo text,
  storage_path text not null unique,
  archivo_nombre text not null,
  mime_type text not null default 'application/pdf',
  tamano_bytes bigint not null default 0 check (tamano_bytes >= 0),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.gdh_documentos add column if not exists colaborador_nombre text;
alter table public.gdh_documentos add column if not exists colaborador_dni text;
alter table public.gdh_documentos alter column user_id drop not null;
alter table public.gdh_documentos drop constraint if exists gdh_documentos_user_id_fkey;
alter table public.gdh_documentos add constraint gdh_documentos_user_id_fkey
foreign key (user_id) references public.profiles(id) on delete set null;

alter table public.gdh_documentos enable row level security;

drop policy if exists gdh_documentos_select on public.gdh_documentos;
create policy gdh_documentos_select on public.gdh_documentos
for select to authenticated
using (user_id = auth.uid() or public.es_gdh());

drop policy if exists gdh_documentos_insert on public.gdh_documentos;
create policy gdh_documentos_insert on public.gdh_documentos
for insert to authenticated
with check (public.es_gdh() and uploaded_by = auth.uid());

drop policy if exists gdh_documentos_update on public.gdh_documentos;
create policy gdh_documentos_update on public.gdh_documentos
for update to authenticated
using (public.es_gdh()) with check (public.es_gdh());

drop policy if exists gdh_documentos_delete on public.gdh_documentos;
create policy gdh_documentos_delete on public.gdh_documentos
for delete to authenticated
using (public.es_gdh());

create table if not exists public.gdh_comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(btrim(titulo)) between 3 and 180),
  contenido text not null check (char_length(btrim(contenido)) between 3 and 5000),
  link_url text,
  storage_path text,
  archivo_nombre text,
  obligatorio boolean not null default false,
  audiencia text not null default 'todos' check (audiencia in ('todos', 'sedes', 'roles', 'usuarios')),
  sedes text[] not null default '{}',
  roles text[] not null default '{}',
  usuarios uuid[] not null default '{}',
  publicado boolean not null default true,
  publicado_desde timestamptz not null default now(),
  vence_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.gdh_comunicado_visible(comunicado public.gdh_comunicados)
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select comunicado.publicado
    and comunicado.publicado_desde <= now()
    and (comunicado.vence_at is null or comunicado.vence_at > now())
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.activo = true
        and (
          comunicado.audiencia = 'todos'
          or (comunicado.audiencia = 'sedes' and p.sede = any(comunicado.sedes))
          or (comunicado.audiencia = 'roles' and p.rol = any(comunicado.roles))
          or (comunicado.audiencia = 'usuarios' and p.id = any(comunicado.usuarios))
        )
    );
$$;

alter table public.gdh_comunicados enable row level security;

drop policy if exists gdh_comunicados_select on public.gdh_comunicados;
create policy gdh_comunicados_select on public.gdh_comunicados
for select to authenticated
using (public.es_gdh() or public.gdh_comunicado_visible(gdh_comunicados));

drop policy if exists gdh_comunicados_insert on public.gdh_comunicados;
create policy gdh_comunicados_insert on public.gdh_comunicados
for insert to authenticated
with check (public.es_gdh() and created_by = auth.uid());

drop policy if exists gdh_comunicados_update on public.gdh_comunicados;
create policy gdh_comunicados_update on public.gdh_comunicados
for update to authenticated
using (public.es_gdh()) with check (public.es_gdh());

drop policy if exists gdh_comunicados_delete on public.gdh_comunicados;
create policy gdh_comunicados_delete on public.gdh_comunicados
for delete to authenticated
using (public.es_gdh());

create table if not exists public.gdh_lecturas (
  comunicado_id uuid not null references public.gdh_comunicados(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  visto_at timestamptz not null default now(),
  confirmado boolean not null default false,
  confirmado_at timestamptz,
  primary key (comunicado_id, user_id)
);

alter table public.gdh_lecturas enable row level security;

drop policy if exists gdh_lecturas_select on public.gdh_lecturas;
create policy gdh_lecturas_select on public.gdh_lecturas
for select to authenticated
using (user_id = auth.uid() or public.es_gdh());

drop policy if exists gdh_lecturas_insert on public.gdh_lecturas;
create policy gdh_lecturas_insert on public.gdh_lecturas
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists gdh_lecturas_update on public.gdh_lecturas;
create policy gdh_lecturas_update on public.gdh_lecturas
for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gdh-documentos',
  'gdh-documentos',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gdh-comunicados',
  'gdh-comunicados',
  false,
  20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists gdh_documentos_storage_select on storage.objects;
create policy gdh_documentos_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'gdh-documentos'
  and (
    public.es_gdh()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists gdh_documentos_storage_insert on storage.objects;
create policy gdh_documentos_storage_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'gdh-documentos' and public.es_gdh());

drop policy if exists gdh_documentos_storage_delete on storage.objects;
create policy gdh_documentos_storage_delete on storage.objects
for delete to authenticated
using (bucket_id = 'gdh-documentos' and public.es_gdh());

drop policy if exists gdh_comunicados_storage_select on storage.objects;
create policy gdh_comunicados_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'gdh-comunicados'
  and (
    public.es_gdh()
    or exists (
      select 1
      from public.gdh_comunicados c
      where c.id::text = (storage.foldername(name))[1]
        and public.gdh_comunicado_visible(c)
    )
  )
);

drop policy if exists gdh_comunicados_storage_insert on storage.objects;
create policy gdh_comunicados_storage_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'gdh-comunicados' and public.es_gdh());

drop policy if exists gdh_comunicados_storage_delete on storage.objects;
create policy gdh_comunicados_storage_delete on storage.objects
for delete to authenticated
using (bucket_id = 'gdh-comunicados' and public.es_gdh());

create index if not exists gdh_documentos_user_created_idx on public.gdh_documentos(user_id, created_at desc);
create index if not exists gdh_comunicados_created_idx on public.gdh_comunicados(created_at desc);
create index if not exists gdh_lecturas_user_idx on public.gdh_lecturas(user_id, confirmado);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gdh_comunicados'
  ) then
    alter publication supabase_realtime add table public.gdh_comunicados;
  end if;
end $$;

grant execute on function public.es_gdh() to authenticated;
grant execute on function public.confirmar_cambio_password() to authenticated;
grant execute on function public.gdh_comunicado_visible(public.gdh_comunicados) to authenticated;

commit;
