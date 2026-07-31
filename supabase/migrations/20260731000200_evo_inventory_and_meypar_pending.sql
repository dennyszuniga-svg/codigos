begin;

create table if not exists public.cargas_inventario_aplicadas (
    clave text primary key,
    descripcion text not null,
    applied_at timestamptz not null default now()
);

alter table public.cargas_inventario_aplicadas enable row level security;

create temporary table carga_activa on commit drop as
with inserted as (
    insert into public.cargas_inventario_aplicadas (clave, descripcion)
    values ('meypar-primavera-20260731', 'Stock Primavera y pendientes MEYPAR recibidos el 31/07/2026')
    on conflict (clave) do nothing
    returning clave
)
select clave from inserted;

create temporary table carga_stock_primavera (
    codigo text, nombre text, compatibilidad text, cantidad numeric, costo numeric
) on commit drop;

insert into carga_stock_primavera values
('PLA01-30110_24V', 'PLACA GESTOR DE BARRERA', 'actual', 1, 455.00),
('ELA50-30186', 'DISPLAY TFT 7" 800X480 16:9 900 cd/m2', 'actual', 1, 250.00),
('ELA10-30104', 'FUENTE ALIMENTACION MDR-240-24 24V/100W', 'universal', 1, 140.00),
('ELA10-30077', 'FUENTE ALIMENTACION MDR-60-12 12V/60W', 'universal', 1, 63.00),
('ELA80-30199', 'PANTALLA 18,5" PCAP TOUCH TFT MONITOR', 'actual', 1, 1888.77),
('ELA50-30187', 'PANTALLA 10.1 PCAP 1280x800 1250 cd/m2 HDMI', 'actual', 1, 1085.50),
('PLA01-30119', 'PLACA MEYLINK V2', 'actual', 1, 445.50),
('ELA60-30187', 'CONJUNTO PC TPA PC TPA GAMA LITE + ADAPT MECANICA', 'actual', 1, 1312.00),
('ELA40-30260', 'SELECTOR V2EAGLE 5-FOLD IN-LINE SOL PERU / PESO CO', 'actual', 2, 664.74),
('ELA50-30055', 'IMPRESORA TERMICA NP2511 mey_BASIC mey_TECH', 'universal', 1, 1001.00),
('ELA50-30056', 'PRESENTADOR NPT-306 SERIE mey_BASIC', 'actual', 1, 78.00),
('ELA40-30235', 'CUBE HOPPER MKII CCTALK 10-1900-41', 'actual', 1, 267.20),
('ELA40-30234', 'CUBE HOPPER MKII CCTALK 10-1900-20', 'actual', 1, 267.20),
('ELA40-30251', 'CUBE HOPPER MKII CCTALK 10-1900-40', 'actual', 1, 267.20),
('ELA40-30253', 'CUBE HOPPER MKII CCTALK 10-1900-51', 'actual', 1, 267.20);

create temporary table carga_pendientes_meypar (
    codigo text, nombre text, compatibilidad text, cantidad numeric, costo numeric,
    referencia text, observacion text
) on commit drop;

insert into carga_pendientes_meypar values
('ELA40-30156', 'SELECTOR MONEDAS SOL (PERU)', 'antiguo', 3, 346.50, 'OC-2026', 'A espera de entrega'),
('BB-EVO-20001', 'BRAZO BARRERA EVO RECTO ILUMINADO HASTA 4M', 'actual', 3, 252.01, 'OV-26-0630', 'A espera de entrega'),
('ELA60-30140', 'IMPRESORA PAPEL TERMICO', 'universal', 1, 860.00, 'OV-26-0630', 'A espera de entrega'),
('MPE90-30049', 'ALTAVOZ VoIP VISATON 2918 8 Ohm', 'universal', 4, 15.40, 'OV-26-0631', 'A espera de entrega');

insert into public.catalogo_repuestos
    (codigo, nombre, categoria, unidad, compatibilidad, proveedor, contacto_proveedor,
     costo_unitario_sin_igv, moneda, creado_por)
select d.codigo, d.nombre, 'General', 'unidad', d.compatibilidad, 'MEYPAR', null,
       d.costo, 'USD', owner.id
from (
    select codigo, nombre, compatibilidad, costo from carga_stock_primavera
    union all
    select codigo, nombre, compatibilidad, costo from carga_pendientes_meypar
) d
cross join lateral (
    select id from public.profiles where rol = 'encargado_ti' order by created_at limit 1
) owner
where exists (select 1 from carga_activa)
on conflict (codigo) do update set
    nombre = excluded.nombre,
    unidad = excluded.unidad,
    compatibilidad = excluded.compatibilidad,
    proveedor = excluded.proveedor,
    costo_unitario_sin_igv = excluded.costo_unitario_sin_igv,
    moneda = excluded.moneda;

insert into public.stock_repuestos
    (repuesto_id, ubicacion_sede, stock, stock_minimo, ubicacion_detalle, actualizado_por)
select c.id, 'primavera', d.cantidad, 0, 'Almacen Primavera', owner.id
from carga_stock_primavera d
join public.catalogo_repuestos c on c.codigo = d.codigo
cross join lateral (
    select id from public.profiles where rol = 'encargado_ti' order by created_at limit 1
) owner
where exists (select 1 from carga_activa)
on conflict (repuesto_id, ubicacion_sede) do update set
    stock = stock_repuestos.stock + excluded.stock,
    ubicacion_detalle = excluded.ubicacion_detalle,
    actualizado_por = excluded.actualizado_por;

insert into public.movimientos_stock_repuestos
    (repuesto_id, stock_origen_id, ubicacion_origen, tipo, cantidad, stock_anterior,
     stock_resultante, moneda, costo_unitario_sin_igv, costo_total_sin_igv,
     costo_total_con_igv, observacion, creado_por)
select c.id, s.id, 'primavera', 'ingreso', d.cantidad, s.stock - d.cantidad,
       s.stock, 'USD', d.costo, 0, 0,
       'Carga de stock MEYPAR - Primavera 31/07/2026', owner.id
from carga_stock_primavera d
join public.catalogo_repuestos c on c.codigo = d.codigo
join public.stock_repuestos s on s.repuesto_id = c.id and s.ubicacion_sede = 'primavera'
cross join lateral (
    select id from public.profiles where rol = 'encargado_ti' order by created_at limit 1
) owner
where exists (select 1 from carga_activa);

insert into public.pendientes_entrega_meypar
    (repuesto_id, cantidad, fecha_estimada, referencia, observacion, estado, creado_por)
select c.id, d.cantidad, null, d.referencia, d.observacion, 'pendiente', owner.id
from carga_pendientes_meypar d
join public.catalogo_repuestos c on c.codigo = d.codigo
cross join lateral (
    select id from public.profiles where rol = 'encargado_ti' order by created_at limit 1
) owner
where exists (select 1 from carga_activa);

commit;
