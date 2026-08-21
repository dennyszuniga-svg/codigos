begin;

create table if not exists public.gdh_evaluaciones_desempeno (
  id uuid primary key default gen_random_uuid(),
  periodo integer not null check (periodo between 2020 and 2100),
  evaluado_id uuid not null references public.profiles(id) on delete cascade,
  evaluador_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  sede text not null,
  estado text not null default 'en_proceso' check (estado in ('en_proceso', 'finalizada')),
  puntaje_total integer not null default 0 check (puntaje_total between 0 and 104),
  promedio numeric(4,2) not null default 0 check (promedio between 0 and 4),
  nivel text,
  fortalezas text,
  oportunidades_mejora text,
  plan_accion text,
  observacion_general text,
  iniciada_at timestamptz not null default now(),
  finalizada_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (periodo, evaluado_id)
);

create table if not exists public.gdh_evaluacion_respuestas (
  id uuid primary key default gen_random_uuid(),
  evaluacion_id uuid not null references public.gdh_evaluaciones_desempeno(id) on delete cascade,
  categoria_key text not null,
  criterio_key text not null,
  puntaje smallint not null check (puntaje between 1 and 4),
  comentario text,
  guardado_at timestamptz not null default now(),
  unique (evaluacion_id, categoria_key, criterio_key),
  check (puntaje <> 1 or char_length(btrim(coalesce(comentario, ''))) >= 5)
);

create index if not exists gdh_evaluaciones_periodo_sede_idx
on public.gdh_evaluaciones_desempeno(periodo desc, sede, estado);

create index if not exists gdh_evaluaciones_evaluado_idx
on public.gdh_evaluaciones_desempeno(evaluado_id, periodo desc);

create index if not exists gdh_respuestas_evaluacion_idx
on public.gdh_evaluacion_respuestas(evaluacion_id, categoria_key);

alter table public.gdh_evaluaciones_desempeno enable row level security;
alter table public.gdh_evaluacion_respuestas enable row level security;

create or replace function public.puede_gestionar_evaluacion(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles actor
    join public.profiles target on target.id = target_user
    where actor.id = auth.uid()
      and actor.activo = true
      and target.activo = true
      and actor.rol in ('encargado_ti', 'gdh', 'jefe_operaciones', 'coordinador_operaciones', 'admin')
      and (
        actor.rol in ('encargado_ti', 'gdh', 'jefe_operaciones', 'coordinador_operaciones')
        or actor.sede = target.sede
      )
  );
$$;

drop policy if exists gdh_evaluaciones_select on public.gdh_evaluaciones_desempeno;
create policy gdh_evaluaciones_select on public.gdh_evaluaciones_desempeno
for select to authenticated
using (
  evaluador_id = auth.uid()
  or (evaluado_id = auth.uid() and estado = 'finalizada')
  or public.puede_gestionar_evaluacion(evaluado_id)
);

drop policy if exists gdh_evaluaciones_insert on public.gdh_evaluaciones_desempeno;
create policy gdh_evaluaciones_insert on public.gdh_evaluaciones_desempeno
for insert to authenticated
with check (
  evaluador_id = auth.uid()
  and estado = 'en_proceso'
  and public.puede_gestionar_evaluacion(evaluado_id)
);

drop policy if exists gdh_evaluaciones_update on public.gdh_evaluaciones_desempeno;
create policy gdh_evaluaciones_update on public.gdh_evaluaciones_desempeno
for update to authenticated
using (evaluador_id = auth.uid() and estado = 'en_proceso')
with check (evaluador_id = auth.uid() and public.puede_gestionar_evaluacion(evaluado_id));

drop policy if exists gdh_evaluaciones_delete on public.gdh_evaluaciones_desempeno;
create policy gdh_evaluaciones_delete on public.gdh_evaluaciones_desempeno
for delete to authenticated
using (evaluador_id = auth.uid() and estado = 'en_proceso');

drop policy if exists gdh_respuestas_select on public.gdh_evaluacion_respuestas;
create policy gdh_respuestas_select on public.gdh_evaluacion_respuestas
for select to authenticated
using (
  exists (
    select 1 from public.gdh_evaluaciones_desempeno evaluacion
    where evaluacion.id = evaluacion_id
  )
);

drop policy if exists gdh_respuestas_insert on public.gdh_evaluacion_respuestas;
create policy gdh_respuestas_insert on public.gdh_evaluacion_respuestas
for insert to authenticated
with check (
  exists (
    select 1 from public.gdh_evaluaciones_desempeno evaluacion
    where evaluacion.id = evaluacion_id
      and evaluacion.evaluador_id = auth.uid()
      and evaluacion.estado = 'en_proceso'
      and public.puede_gestionar_evaluacion(evaluacion.evaluado_id)
  )
);

grant select, insert, update, delete on public.gdh_evaluaciones_desempeno to authenticated;
grant select, insert on public.gdh_evaluacion_respuestas to authenticated;
grant execute on function public.puede_gestionar_evaluacion(uuid) to authenticated;

commit;
