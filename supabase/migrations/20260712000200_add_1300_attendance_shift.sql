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
values ('T1300', '13:00 a 22:00', '13:00', '22:00', 60, 480, false, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    hora_inicio = excluded.hora_inicio,
    hora_fin = excluded.hora_fin,
    refrigerio_minutos = excluded.refrigerio_minutos,
    minutos_jornada = excluded.minutos_jornada,
    es_nocturno = excluded.es_nocturno,
    activo = true;
