insert into public.asistencia_turnos (
  codigo,
  nombre,
  hora_inicio,
  hora_fin,
  refrigerio_minutos,
  minutos_jornada,
  es_nocturno,
  activo
)
values
  ('T1415', '14:15 a 23:00', '14:15', '23:00', 45, 480, false, true),
  ('T1330', '13:30 a 23:00', '13:30', '23:00', 90, 480, false, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    hora_inicio = excluded.hora_inicio,
    hora_fin = excluded.hora_fin,
    refrigerio_minutos = excluded.refrigerio_minutos,
    minutos_jornada = excluded.minutos_jornada,
    es_nocturno = excluded.es_nocturno,
    activo = true;
