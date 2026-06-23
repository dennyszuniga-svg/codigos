create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
    clave text primary key,
    secret_salt text not null,
    secret_hash text not null,
    updated_at timestamptz not null default now()
);

revoke all on private.app_secrets from public, anon, authenticated;

create or replace function public.validar_acceso_mantenimiento(clave_ingresada text)
returns boolean
language sql
stable
security definer
set search_path = public, private, extensions
as $$
    select exists (
        select 1
        from private.app_secrets
        where app_secrets.clave = 'maintenance_access'
          and secret_hash = encode(
              digest(convert_to(secret_salt || coalesce(clave_ingresada, ''), 'UTF8'), 'sha256'),
              'hex'
          )
    );
$$;

revoke all on function public.validar_acceso_mantenimiento(text) from public, anon;
grant execute on function public.validar_acceso_mantenimiento(text) to authenticated;

create or replace function public.es_supervision()
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
          and activo = true
          and rol in ('admin', 'supervisor')
    );
$$;

create table if not exists public.inventario_repuestos (
    id uuid primary key default gen_random_uuid(),
    sede text not null
        check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    codigo text not null,
    nombre text not null,
    categoria text not null default 'General',
    stock numeric(12, 2) not null default 0 check (stock >= 0),
    stock_minimo numeric(12, 2) not null default 0 check (stock_minimo >= 0),
    unidad text not null default 'unidad',
    ubicacion text,
    observaciones text,
    actualizado_por uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, codigo)
);

drop trigger if exists inventario_repuestos_set_updated_at on public.inventario_repuestos;
create trigger inventario_repuestos_set_updated_at
before update on public.inventario_repuestos
for each row
execute function public.set_updated_at();

alter table public.inventario_repuestos enable row level security;

drop policy if exists "inventario_select_sede" on public.inventario_repuestos;
create policy "inventario_select_sede"
on public.inventario_repuestos
for select
to authenticated
using (sede = public.usuario_sede());

drop policy if exists "inventario_insert_supervision" on public.inventario_repuestos;
create policy "inventario_insert_supervision"
on public.inventario_repuestos
for insert
to authenticated
with check (
    sede = public.usuario_sede()
    and public.es_supervision()
    and actualizado_por = auth.uid()
);

drop policy if exists "inventario_update_supervision" on public.inventario_repuestos;
create policy "inventario_update_supervision"
on public.inventario_repuestos
for update
to authenticated
using (sede = public.usuario_sede() and public.es_supervision())
with check (
    sede = public.usuario_sede()
    and public.es_supervision()
    and actualizado_por = auth.uid()
);

drop policy if exists "inventario_delete_supervision" on public.inventario_repuestos;
create policy "inventario_delete_supervision"
on public.inventario_repuestos
for delete
to authenticated
using (sede = public.usuario_sede() and public.es_supervision());

create index if not exists inventario_repuestos_sede_nombre_idx
on public.inventario_repuestos (sede, nombre);

do $$
begin
    alter publication supabase_realtime add table public.inventario_repuestos;
exception
    when duplicate_object then null;
end;
$$;
