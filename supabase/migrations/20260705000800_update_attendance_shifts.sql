update public.asistencia_turnos
set codigo = 'T1100',
    nombre = '11:00 a 20:00',
    hora_inicio = '11:00',
    hora_fin = '20:00',
    refrigerio_minutos = 60,
    minutos_jornada = 480,
    es_nocturno = false,
    activo = true
where codigo = 'T1000';

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
values ('T1400', '14:00 a 23:00', '14:00', '23:00', 60, 480, false, true)
on conflict (codigo) do update
set nombre = excluded.nombre,
    hora_inicio = excluded.hora_inicio,
    hora_fin = excluded.hora_fin,
    refrigerio_minutos = excluded.refrigerio_minutos,
    minutos_jornada = excluded.minutos_jornada,
    es_nocturno = excluded.es_nocturno,
    activo = true;
