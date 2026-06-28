alter table public.intervenciones_mantenimiento
add column if not exists genera_parada boolean not null default true;

alter table public.intervenciones_mantenimiento
drop constraint if exists intervenciones_mantenimiento_tipo_mantenimiento_check;

alter table public.intervenciones_mantenimiento
add constraint intervenciones_mantenimiento_tipo_mantenimiento_check
check (tipo_mantenimiento in (
    'Preventivo',
    'Correctivo',
    'Verificación',
    'Verificacion',
    'Mejora / Instalacion'
));

create index if not exists intervenciones_mantenimiento_impacto_idx
on public.intervenciones_mantenimiento (sede, genera_parada, fecha_guardado desc);
