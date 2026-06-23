alter table public.guias_operativas
add column if not exists audiencia text;

update public.guias_operativas
set audiencia = 'todos'
where audiencia is null or btrim(audiencia) = '';

alter table public.guias_operativas
alter column audiencia set default 'todos';

alter table public.guias_operativas
alter column audiencia set not null;

alter table public.guias_operativas
drop constraint if exists guias_operativas_audiencia_check;

alter table public.guias_operativas
add constraint guias_operativas_audiencia_check
check (audiencia in ('todos', 'supervision'));

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
          and rol in ('admin', 'supervisor')
    );
$$;

drop policy if exists "guias_select_authenticated" on public.guias_operativas;
create policy "guias_select_authenticated"
on public.guias_operativas
for select
to authenticated
using (public.puede_ver_guia(audiencia));

create index if not exists guias_operativas_audiencia_idx
on public.guias_operativas (audiencia);
