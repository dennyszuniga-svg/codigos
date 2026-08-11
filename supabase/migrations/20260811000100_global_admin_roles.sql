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
      and activo = true
      and rol in ('encargado_ti', 'admin', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
  );
$$;

create or replace function public.puede_ver_guia(nivel text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select nivel = 'todos'
    or public.es_admin()
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and activo = true
        and rol in ('supervisor', 'fortaleza')
    );
$$;

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.es_admin() and rol <> 'encargado_ti')
with check (public.es_admin() and rol <> 'encargado_ti');
