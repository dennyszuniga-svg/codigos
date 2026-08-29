alter table public.asistencia_registros
  alter column programacion_id drop not null;

alter table public.asistencia_registros
  drop constraint if exists asistencia_registros_programacion_id_key;

create index if not exists asistencia_registros_programacion_idx
  on public.asistencia_registros(programacion_id)
  where programacion_id is not null;

create unique index if not exists asistencia_registros_un_abierto_usuario_sede_idx
  on public.asistencia_registros(user_id, sede)
  where salida_at is null;

comment on column public.asistencia_registros.programacion_id is
  'Horario opcional. Puede ser nulo para marcaciones libres presenciales.';
