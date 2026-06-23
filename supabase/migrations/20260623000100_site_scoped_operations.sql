alter table public.profiles
add column if not exists sede text;

update public.profiles
set sede = 'gama'
where sede is null or btrim(sede) = '';

alter table public.profiles
alter column sede set default 'gama';

alter table public.profiles
alter column sede set not null;

alter table public.profiles
drop constraint if exists profiles_sede_check;

alter table public.profiles
add constraint profiles_sede_check
check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama'));

alter table public.registros_codigos
add column if not exists sede text;

update public.registros_codigos
set sede = 'gama'
where sede is null or btrim(sede) = '';

alter table public.registros_codigos
alter column sede set default 'gama';

alter table public.registros_codigos
alter column sede set not null;

alter table public.registros_codigos
drop constraint if exists registros_codigos_sede_check;

alter table public.registros_codigos
add constraint registros_codigos_sede_check
check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama'));

alter table public.estado_operativo
drop constraint if exists estado_operativo_global;

alter table public.estado_operativo
add column if not exists sede text;

update public.estado_operativo
set sede = 'gama'
where id = 'global' or sede is null or btrim(sede) = '';

update public.estado_operativo
set id = sede
where id = 'global';

alter table public.estado_operativo
alter column id drop default;

alter table public.estado_operativo
alter column sede set not null;

alter table public.estado_operativo
drop constraint if exists estado_operativo_sede_check;

alter table public.estado_operativo
add constraint estado_operativo_sede_check
check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama'));

alter table public.estado_operativo
drop constraint if exists estado_operativo_id_sede_check;

alter table public.estado_operativo
add constraint estado_operativo_id_sede_check
check (id = sede);

insert into public.estado_operativo (id, sede, codigo_activo, checklist_estado)
values
    ('puruchuco', 'puruchuco', null, '{}'::jsonb),
    ('salaverry', 'salaverry', null, '{}'::jsonb),
    ('primavera', 'primavera', null, '{}'::jsonb),
    ('civico', 'civico', null, '{}'::jsonb),
    ('gama', 'gama', null, '{}'::jsonb)
on conflict (id) do nothing;

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
with check (
    id = sede
    and sede = public.usuario_sede()
    and actualizado_por = auth.uid()
);

drop policy if exists "estado_operativo_update_authenticated" on public.estado_operativo;
create policy "estado_operativo_update_authenticated"
on public.estado_operativo
for update
to authenticated
using (sede = public.usuario_sede())
with check (
    id = sede
    and sede = public.usuario_sede()
    and actualizado_por = auth.uid()
);

create index if not exists profiles_sede_idx
on public.profiles (sede);

create index if not exists registros_codigos_sede_created_at_idx
on public.registros_codigos (sede, created_at desc);

create index if not exists estado_operativo_sede_idx
on public.estado_operativo (sede);
