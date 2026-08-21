create table if not exists public.asistencia_biometria (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  descriptor jsonb not null check (jsonb_typeof(descriptor) = 'array' and jsonb_array_length(descriptor) = 128),
  modelo text not null default 'face-api-0.22.2',
  consentimiento_at timestamptz not null default now(),
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asistencia_pruebas_faciales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sede text references public.asistencia_sedes(codigo),
  distancia_facial numeric(8,5) not null,
  latitud double precision,
  longitud double precision,
  precision_m double precision,
  distancia_sede_m numeric(10,2),
  created_at timestamptz not null default now()
);

alter table public.asistencia_registros
  add column if not exists metodo_entrada text not null default 'qr',
  add column if not exists metodo_salida text,
  add column if not exists distancia_facial_entrada numeric(8,5),
  add column if not exists distancia_facial_salida numeric(8,5);

alter table public.asistencia_biometria enable row level security;
alter table public.asistencia_pruebas_faciales enable row level security;

drop policy if exists asistencia_biometria_propia_lectura on public.asistencia_biometria;
create policy asistencia_biometria_propia_lectura on public.asistencia_biometria
for select to authenticated using (user_id = auth.uid());
drop policy if exists asistencia_biometria_propia_alta on public.asistencia_biometria;
create policy asistencia_biometria_propia_alta on public.asistencia_biometria
for insert to authenticated with check (user_id = auth.uid());
drop policy if exists asistencia_biometria_propia_cambio on public.asistencia_biometria;
create policy asistencia_biometria_propia_cambio on public.asistencia_biometria
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists asistencia_biometria_propia_borrado on public.asistencia_biometria;
create policy asistencia_biometria_propia_borrado on public.asistencia_biometria
for delete to authenticated using (user_id = auth.uid());
drop policy if exists asistencia_pruebas_faciales_propias on public.asistencia_pruebas_faciales;
create policy asistencia_pruebas_faciales_propias on public.asistencia_pruebas_faciales
for select to authenticated using (user_id = auth.uid());

create index if not exists asistencia_pruebas_faciales_usuario_idx
on public.asistencia_pruebas_faciales(user_id, created_at desc);

grant select, insert, update, delete on public.asistencia_biometria to authenticated;
grant select on public.asistencia_pruebas_faciales to authenticated;
