alter table public.catalogo_repuestos
add column if not exists moneda text not null default 'PEN'
check (moneda in ('PEN','USD'));

alter table public.movimientos_stock_repuestos
add column if not exists moneda text not null default 'PEN'
check (moneda in ('PEN','USD'));

drop function if exists public.guardar_stock_repuesto_multiples(text,text,text,text,numeric,text,text,text,text[],numeric,numeric,text);

create function public.guardar_stock_repuesto_multiples(
    codigo_arg text, nombre_arg text, categoria_arg text, unidad_arg text,
    costo_unitario_arg numeric, moneda_arg text, compatibilidad_arg text, proveedor_arg text, contacto_arg text,
    ubicaciones_arg text[], stock_arg numeric, stock_minimo_arg numeric, ubicacion_detalle_arg text
)
returns integer language plpgsql security definer set search_path=public as $$
declare catalogo_id uuid; ubicacion text; total integer := 0;
declare ubicaciones_validas constant text[] := array['general','puruchuco','salaverry','primavera','civico','gama'];
begin
 if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
 if coalesce(array_length(ubicaciones_arg,1),0)=0 or not ubicaciones_arg <@ ubicaciones_validas then raise exception 'Almacen no valido'; end if;
 if stock_arg<0 or stock_minimo_arg<0 or costo_unitario_arg<0 or moneda_arg not in('PEN','USD') then raise exception 'Stock, costo o moneda no valido'; end if;
 insert into public.catalogo_repuestos(codigo,nombre,categoria,unidad,costo_unitario_sin_igv,moneda,compatibilidad,proveedor,contacto_proveedor,creado_por)
 values(upper(trim(codigo_arg)),trim(nombre_arg),coalesce(nullif(trim(categoria_arg),''),'General'),coalesce(nullif(trim(unidad_arg),''),'unidad'),
   costo_unitario_arg,moneda_arg,compatibilidad_arg,nullif(trim(proveedor_arg),''),nullif(trim(contacto_arg),''),auth.uid())
 on conflict(codigo) do update set nombre=excluded.nombre,categoria=excluded.categoria,unidad=excluded.unidad,
   costo_unitario_sin_igv=excluded.costo_unitario_sin_igv,moneda=excluded.moneda,compatibilidad=excluded.compatibilidad,
   proveedor=excluded.proveedor,contacto_proveedor=excluded.contacto_proveedor returning id into catalogo_id;
 for ubicacion in select distinct unnest(ubicaciones_arg) loop
   insert into public.stock_repuestos(repuesto_id,ubicacion_sede,stock,stock_minimo,ubicacion_detalle,actualizado_por)
   values(catalogo_id,ubicacion,stock_arg,stock_minimo_arg,nullif(trim(ubicacion_detalle_arg),''),auth.uid())
   on conflict(repuesto_id,ubicacion_sede) do update set stock=excluded.stock,stock_minimo=excluded.stock_minimo,
     ubicacion_detalle=excluded.ubicacion_detalle,actualizado_por=auth.uid();
   total:=total+1;
 end loop;
 return total;
end; $$;

create or replace function public.registrar_movimiento_stock(
 stock_id_arg uuid,tipo_arg text,cantidad_arg numeric,destino_arg text default null,
 sede_consumo_arg text default null,equipo_arg text default null,observacion_arg text default ''
)
returns numeric language plpgsql security definer set search_path=public as $$
declare origen public.stock_repuestos%rowtype; nuevo numeric; destino_id uuid; costo_unitario numeric; costo_sin_igv numeric; moneda_actual text;
begin
 if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
 if tipo_arg<>'ajuste' and cantidad_arg<=0 then raise exception 'La cantidad debe ser mayor a cero'; end if;
 if tipo_arg='ajuste' and cantidad_arg<0 then raise exception 'La cantidad no puede ser negativa'; end if;
 if tipo_arg='salida' and (sede_consumo_arg is null or nullif(trim(equipo_arg),'') is null) then raise exception 'Indica sede y equipo'; end if;
 select * into origen from public.stock_repuestos where id=stock_id_arg for update;
 if not found then raise exception 'Stock no encontrado'; end if;
 select c.costo_unitario_sin_igv,c.moneda into costo_unitario,moneda_actual from public.catalogo_repuestos c where c.id=origen.repuesto_id;
 if tipo_arg='ingreso' then nuevo:=origen.stock+cantidad_arg;
 elsif tipo_arg='salida' then nuevo:=origen.stock-cantidad_arg;
 elsif tipo_arg='ajuste' then nuevo:=cantidad_arg;
 elsif tipo_arg='transferencia' then nuevo:=origen.stock-cantidad_arg;
 else raise exception 'Movimiento invalido'; end if;
 if nuevo<0 then raise exception 'Stock insuficiente'; end if;
 update public.stock_repuestos set stock=nuevo,actualizado_por=auth.uid() where id=origen.id;
 if tipo_arg='transferencia' then
   if destino_arg is null or destino_arg=origen.ubicacion_sede then raise exception 'Destino invalido'; end if;
   insert into public.stock_repuestos(repuesto_id,ubicacion_sede,stock,stock_minimo,actualizado_por)
   values(origen.repuesto_id,destino_arg,cantidad_arg,origen.stock_minimo,auth.uid())
   on conflict(repuesto_id,ubicacion_sede) do update set stock=stock_repuestos.stock+cantidad_arg,actualizado_por=auth.uid() returning id into destino_id;
 end if;
 costo_sin_igv:=case when tipo_arg='salida' then round(cantidad_arg*costo_unitario,2) else 0 end;
 insert into public.movimientos_stock_repuestos(repuesto_id,stock_origen_id,ubicacion_origen,ubicacion_destino,tipo,cantidad,stock_anterior,stock_resultante,
   moneda,costo_unitario_sin_igv,costo_total_sin_igv,costo_total_con_igv,sede_consumo,equipo_detalle,observacion,creado_por)
 values(origen.repuesto_id,origen.id,origen.ubicacion_sede,destino_arg,tipo_arg,cantidad_arg,origen.stock,nuevo,
   moneda_actual,costo_unitario,costo_sin_igv,round(costo_sin_igv*1.18,2),sede_consumo_arg,nullif(trim(equipo_arg),''),left(coalesce(observacion_arg,''),500),auth.uid());
 return nuevo;
end; $$;

drop function if exists public.listar_inventario_consolidado();
create function public.listar_inventario_consolidado()
returns table(id uuid,repuesto_id uuid,codigo text,nombre text,categoria text,unidad text,compatibilidad text,proveedor text,
 contacto_proveedor text,costo_unitario_sin_igv numeric,moneda text,ubicacion_sede text,stock numeric,stock_minimo numeric,ubicacion_detalle text,stock_total numeric)
language sql security definer set search_path=public as $$
 select s.id,c.id,c.codigo,c.nombre,c.categoria,c.unidad,c.compatibilidad,c.proveedor,c.contacto_proveedor,c.costo_unitario_sin_igv,c.moneda,
 s.ubicacion_sede,s.stock,s.stock_minimo,s.ubicacion_detalle,sum(s.stock) over(partition by c.id)
 from public.stock_repuestos s join public.catalogo_repuestos c on c.id=s.repuesto_id
 where public.es_encargado_ti() order by c.nombre,s.ubicacion_sede;
$$;

create or replace function public.registrar_consumo_repuestos(numero_informe_arg text,sede_arg text,repuestos_arg jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare item jsonb; cantidad_num numeric; origen public.stock_repuestos%rowtype; costo_unitario numeric; costo_sin_igv numeric; moneda_actual text;
begin
 if not public.es_personal_mantenimiento() then raise exception 'No autorizado'; end if;
 if repuestos_arg is null or jsonb_typeof(repuestos_arg)<>'array' then return; end if;
 if exists(select 1 from public.movimientos_stock_repuestos where numero_informe=numero_informe_arg and tipo='consumo') then return; end if;
 for item in select * from jsonb_array_elements(repuestos_arg) loop
   cantidad_num:=greatest(coalesce((item->>'cantidad')::numeric,0),0); if cantidad_num<=0 then continue; end if;
   select * into origen from public.stock_repuestos where id=nullif(item->>'id','')::uuid for update;
   if not found or origen.stock<cantidad_num then raise exception 'Stock insuficiente para %',item->>'codigo'; end if;
   select c.costo_unitario_sin_igv,c.moneda into costo_unitario,moneda_actual from public.catalogo_repuestos c where c.id=origen.repuesto_id;
   costo_sin_igv:=round(cantidad_num*costo_unitario,2);
   update public.stock_repuestos set stock=stock-cantidad_num,actualizado_por=auth.uid() where id=origen.id;
   insert into public.movimientos_stock_repuestos(repuesto_id,stock_origen_id,ubicacion_origen,ubicacion_destino,tipo,cantidad,stock_anterior,stock_resultante,numero_informe,
     moneda,costo_unitario_sin_igv,costo_total_sin_igv,costo_total_con_igv,observacion,creado_por)
   values(origen.repuesto_id,origen.id,origen.ubicacion_sede,sede_arg,'consumo',cantidad_num,origen.stock,origen.stock-cantidad_num,numero_informe_arg,
     moneda_actual,costo_unitario,costo_sin_igv,round(costo_sin_igv*1.18,2),coalesce(item->>'observacion','Consumo desde informe'),auth.uid());
 end loop;
end; $$;

drop function if exists public.actualizar_costo_repuesto(uuid,numeric);
create function public.actualizar_costo_repuesto(repuesto_id_arg uuid,costo_arg numeric,moneda_arg text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
 if costo_arg<0 or moneda_arg not in('PEN','USD') then raise exception 'Costo o moneda no valido'; end if;
 update public.catalogo_repuestos set costo_unitario_sin_igv=costo_arg,moneda=moneda_arg where id=repuesto_id_arg;
 if not found then raise exception 'Repuesto no encontrado'; end if;
end; $$;

drop function if exists public.listar_pyg_inventario_mes(text);
create function public.listar_pyg_inventario_mes(mes_arg text)
returns table(fecha timestamptz,tipo text,numero_informe text,sede_consumo text,equipo_codigo text,equipo_nombre text,
 codigo text,repuesto text,cantidad numeric,unidad text,moneda text,costo_unitario_sin_igv numeric,costo_total_sin_igv numeric,igv numeric,costo_total_con_igv numeric,observacion text)
language plpgsql security definer set search_path=public as $$
declare inicio date;
begin
 if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
 if mes_arg !~ '^[0-9]{4}-[0-9]{2}$' then raise exception 'Mes no valido'; end if;
 inicio:=to_date(mes_arg||'-01','YYYY-MM-DD');
 return query select m.created_at,m.tipo,m.numero_informe,
   case when m.tipo='consumo' then coalesce(m.ubicacion_destino,m.ubicacion_origen) else coalesce(m.sede_consumo,m.ubicacion_origen) end,
   coalesce(i.equipo_codigo,m.equipo_detalle),i.equipo_nombre,c.codigo,c.nombre,m.cantidad,c.unidad,m.moneda,m.costo_unitario_sin_igv,
   m.costo_total_sin_igv,round(m.costo_total_con_igv-m.costo_total_sin_igv,2),m.costo_total_con_igv,m.observacion
 from public.movimientos_stock_repuestos m join public.catalogo_repuestos c on c.id=m.repuesto_id
 left join public.intervenciones_mantenimiento i on i.numero_informe=m.numero_informe
 where m.tipo in('consumo','salida') and m.created_at>=inicio and m.created_at<(inicio+interval '1 month') order by m.created_at desc;
end; $$;

grant execute on function public.guardar_stock_repuesto_multiples(text,text,text,text,numeric,text,text,text,text,text[],numeric,numeric,text) to authenticated;
grant execute on function public.listar_inventario_consolidado() to authenticated;
grant execute on function public.registrar_consumo_repuestos(text,text,jsonb) to authenticated;
grant execute on function public.actualizar_costo_repuesto(uuid,numeric,text) to authenticated;
grant execute on function public.listar_pyg_inventario_mes(text) to authenticated;
