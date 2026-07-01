alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check
check (rol in ('encargado_ti', 'admin', 'tecnico', 'supervisor', 'eco', 'charly', 'anfitrion'));

update public.profiles set rol = 'encargado_ti', nombre = 'Dennys - Encargado de Mantenimiento y TI'
where lower(coalesce(nombre, '')) = 'dennys' or lower(coalesce(email, '')) = 'admin@urbapark.com';
update public.profiles set nombre = 'Administrador Salaverry', sede = 'salaverry' where lower(coalesce(email, '')) = 'salaverry@usuarios.urbapark.pe';
update public.profiles set nombre = 'Administrador Civico', sede = 'civico' where lower(coalesce(email, '')) = 'civico@usuarios.urbapark.pe';
update public.profiles set nombre = 'Administrador Primavera', sede = 'primavera' where lower(coalesce(email, '')) = 'primavera@usuarios.urbapark.pe';
update public.profiles set nombre = 'Administrador Puruchuco', sede = 'puruchuco' where lower(coalesce(email, '')) = 'puruchuco@usuarios.urbapark.pe';
update public.profiles set nombre = 'Administrador GAMA', sede = 'gama' where lower(coalesce(email, '')) = 'gama@usuarios.urbapark.pe';

create or replace function public.es_encargado_ti() returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and activo = true and rol = 'encargado_ti');
$$;
create or replace function public.es_admin() returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and activo = true and rol in ('encargado_ti', 'admin'));
$$;
create or replace function public.es_supervision() returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and activo = true and rol in ('encargado_ti', 'admin', 'supervisor'));
$$;
create or replace function public.es_personal_mantenimiento() returns boolean language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and activo = true and rol in ('encargado_ti', 'admin', 'tecnico'));
$$;

drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "profiles_update_superior" on public.profiles;
create policy "profiles_update_superior" on public.profiles for update to authenticated
using (public.es_encargado_ti()) with check (public.es_encargado_ti());

create table if not exists public.solicitudes_abonados (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    nombres_completos text not null check (char_length(btrim(nombres_completos)) between 3 and 160),
    dni text not null check (dni ~ '^[0-9]{8,12}$'),
    tipo_abono text not null check (tipo_abono in ('locatario_lv', 'locatario_sd')),
    monto numeric(10,2) not null check (monto in (150, 200)),
    fecha_inicio date not null,
    estado text not null default 'pendiente' check (estado in ('pendiente', 'generado', 'rechazado')),
    observaciones text not null default '',
    creado_por uuid references auth.users(id) on delete set null,
    atendido_por uuid references auth.users(id) on delete set null,
    atendido_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, dni, fecha_inicio)
);

alter table public.solicitudes_abonados alter column creado_por drop not null;
alter table public.solicitudes_abonados drop constraint if exists solicitudes_abonados_creado_por_fkey;
alter table public.solicitudes_abonados add constraint solicitudes_abonados_creado_por_fkey
foreign key (creado_por) references auth.users(id) on delete set null;
alter table public.solicitudes_abonados drop constraint if exists solicitudes_abonados_atendido_por_fkey;
alter table public.solicitudes_abonados add constraint solicitudes_abonados_atendido_por_fkey
foreign key (atendido_por) references auth.users(id) on delete set null;
alter table public.solicitudes_abonados enable row level security;

drop policy if exists "abonados_select_sede_admin" on public.solicitudes_abonados;
create policy "abonados_select_sede_admin" on public.solicitudes_abonados for select to authenticated
using (public.es_encargado_ti() or (public.es_admin() and sede = public.usuario_sede()));
drop policy if exists "abonados_insert_sede_admin" on public.solicitudes_abonados;
create policy "abonados_insert_sede_admin" on public.solicitudes_abonados for insert to authenticated
with check (creado_por = auth.uid() and (public.es_encargado_ti() or (public.es_admin() and sede = public.usuario_sede())));
drop policy if exists "abonados_update_sede_admin" on public.solicitudes_abonados;
create policy "abonados_update_sede_admin" on public.solicitudes_abonados for update to authenticated
using (public.es_encargado_ti() or (public.es_admin() and sede = public.usuario_sede()))
with check (public.es_encargado_ti() or (public.es_admin() and sede = public.usuario_sede()));
drop policy if exists "abonados_delete_superior" on public.solicitudes_abonados;
create policy "abonados_delete_superior" on public.solicitudes_abonados for delete to authenticated using (public.es_encargado_ti());

create index if not exists solicitudes_abonados_sede_fecha_idx on public.solicitudes_abonados (sede, fecha_inicio desc);
create index if not exists solicitudes_abonados_estado_idx on public.solicitudes_abonados (sede, estado, fecha_inicio desc);

create or replace function public.actualizar_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists solicitudes_abonados_updated_at on public.solicitudes_abonados;
create trigger solicitudes_abonados_updated_at before update on public.solicitudes_abonados
for each row execute function public.actualizar_updated_at();

do $$
begin
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'solicitudes_abonados') then
        alter publication supabase_realtime add table public.solicitudes_abonados;
    end if;
end $$;
