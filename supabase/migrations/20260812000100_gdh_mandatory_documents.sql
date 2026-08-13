alter table public.gdh_documentos
  add column if not exists obligatorio boolean not null default false;

create table if not exists public.gdh_documento_lecturas (
  documento_id uuid not null references public.gdh_documentos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  visto_at timestamptz not null default now(),
  confirmado boolean not null default false,
  confirmado_at timestamptz,
  primary key (documento_id, user_id)
);

alter table public.gdh_documento_lecturas enable row level security;

drop policy if exists gdh_documento_lecturas_select on public.gdh_documento_lecturas;
create policy gdh_documento_lecturas_select on public.gdh_documento_lecturas
for select to authenticated
using (user_id = auth.uid() or public.es_gdh());

drop policy if exists gdh_documento_lecturas_insert on public.gdh_documento_lecturas;
create policy gdh_documento_lecturas_insert on public.gdh_documento_lecturas
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.gdh_documentos documento
    where documento.id = documento_id
      and documento.user_id = auth.uid()
      and documento.obligatorio = true
  )
);

drop policy if exists gdh_documento_lecturas_update on public.gdh_documento_lecturas;
create policy gdh_documento_lecturas_update on public.gdh_documento_lecturas
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists gdh_documento_lecturas_user_idx
on public.gdh_documento_lecturas(user_id, confirmado);

grant select, insert, update on public.gdh_documento_lecturas to authenticated;
