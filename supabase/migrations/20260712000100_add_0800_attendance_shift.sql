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
values ('T0800', '08:00 a 17:00', '08:00', '17:00', 60, 480, false, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    hora_inicio = excluded.hora_inicio,
    hora_fin = excluded.hora_fin,
    refrigerio_minutos = excluded.refrigerio_minutos,
    minutos_jornada = excluded.minutos_jornada,
    es_nocturno = excluded.es_nocturno,
    activo = true;
