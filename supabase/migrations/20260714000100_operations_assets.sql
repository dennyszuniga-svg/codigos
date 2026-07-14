create table if not exists public.activos_operaciones (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    codigo text not null,
    nombre text not null,
    costo numeric(14,2) not null default 0 check (costo >= 0),
    creado_por uuid references public.profiles(id) on delete set null,
    actualizado_por uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, codigo)
);

create or replace function public.puede_gestionar_activos_operaciones(sede_arg text)
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
          and (
              rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones')
              or (rol = 'admin' and sede = sede_arg)
          )
    );
$$;

alter table public.activos_operaciones enable row level security;

drop policy if exists "activos_operaciones_select" on public.activos_operaciones;
create policy "activos_operaciones_select"
on public.activos_operaciones for select to authenticated
using (exists (
    select 1 from public.profiles
    where id = auth.uid()
      and activo = true
      and (
          rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
          or sede = activos_operaciones.sede
      )
));

drop policy if exists "activos_operaciones_insert" on public.activos_operaciones;
create policy "activos_operaciones_insert"
on public.activos_operaciones for insert to authenticated
with check (public.puede_gestionar_activos_operaciones(sede));

drop policy if exists "activos_operaciones_update" on public.activos_operaciones;
create policy "activos_operaciones_update"
on public.activos_operaciones for update to authenticated
using (public.puede_gestionar_activos_operaciones(sede))
with check (public.puede_gestionar_activos_operaciones(sede));

drop policy if exists "activos_operaciones_delete" on public.activos_operaciones;
create policy "activos_operaciones_delete"
on public.activos_operaciones for delete to authenticated
using (public.puede_gestionar_activos_operaciones(sede));

drop trigger if exists activos_operaciones_set_updated_at on public.activos_operaciones;
create trigger activos_operaciones_set_updated_at
before update on public.activos_operaciones
for each row execute function public.set_updated_at();

create index if not exists activos_operaciones_sede_nombre_idx
on public.activos_operaciones (sede, nombre);

do $$
begin
    alter publication supabase_realtime add table public.activos_operaciones;
exception
    when duplicate_object then null;
end $$;
