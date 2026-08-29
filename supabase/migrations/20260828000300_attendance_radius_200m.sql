update public.asistencia_sedes
set radio_metros = 200,
    updated_at = now()
where activa = true;

comment on column public.asistencia_sedes.radio_metros is
  'Radio máximo de marcación presencial. Configurado en 200 metros para QR y reconocimiento facial.';
