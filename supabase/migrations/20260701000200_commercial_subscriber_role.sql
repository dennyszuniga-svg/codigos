alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles add constraint profiles_rol_check
check (rol in ('encargado_ti', 'admin', 'comercial_abonados', 'tecnico', 'supervisor', 'eco', 'charly', 'anfitrion'));

create or replace function public.es_comercial_abonados()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
          and activo = true
          and rol = 'comercial_abonados'
    );
$$;

drop policy if exists "abonados_insert_sede_admin" on public.solicitudes_abonados;
create policy "abonados_insert_sede_admin"
on public.solicitudes_abonados
for insert
to authenticated
with check (
    creado_por = auth.uid()
    and (
        public.es_encargado_ti()
        or (public.es_admin() and sede = public.usuario_sede())
        or public.es_comercial_abonados()
    )
);
