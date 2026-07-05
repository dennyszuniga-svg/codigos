create or replace function public.guardar_stock_repuesto_multiples(
    codigo_arg text, nombre_arg text, categoria_arg text, unidad_arg text,
    compatibilidad_arg text, proveedor_arg text, contacto_arg text,
    ubicaciones_arg text[], stock_arg numeric, stock_minimo_arg numeric, ubicacion_detalle_arg text
)
returns integer language plpgsql security definer set search_path=public as $$
declare
    catalogo_id uuid;
    ubicacion text;
    total integer := 0;
    ubicaciones_validas constant text[] := array['general','puruchuco','salaverry','primavera','civico','gama'];
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    if coalesce(array_length(ubicaciones_arg, 1), 0) = 0 then raise exception 'Selecciona al menos un almacen'; end if;
    if not ubicaciones_arg <@ ubicaciones_validas then raise exception 'Almacen no valido'; end if;
    if stock_arg < 0 or stock_minimo_arg < 0 then raise exception 'El stock no puede ser negativo'; end if;

    insert into public.catalogo_repuestos (codigo,nombre,categoria,unidad,compatibilidad,proveedor,contacto_proveedor,creado_por)
    values (upper(trim(codigo_arg)),trim(nombre_arg),coalesce(nullif(trim(categoria_arg),''),'General'),coalesce(nullif(trim(unidad_arg),''),'unidad'),compatibilidad_arg,nullif(trim(proveedor_arg),''),nullif(trim(contacto_arg),''),auth.uid())
    on conflict (codigo) do update set nombre=excluded.nombre,categoria=excluded.categoria,unidad=excluded.unidad,
      compatibilidad=excluded.compatibilidad,proveedor=excluded.proveedor,contacto_proveedor=excluded.contacto_proveedor
    returning id into catalogo_id;

    for ubicacion in select distinct unnest(ubicaciones_arg) loop
        insert into public.stock_repuestos (repuesto_id,ubicacion_sede,stock,stock_minimo,ubicacion_detalle,actualizado_por)
        values (catalogo_id,ubicacion,stock_arg,stock_minimo_arg,nullif(trim(ubicacion_detalle_arg),''),auth.uid())
        on conflict (repuesto_id,ubicacion_sede) do update set stock=excluded.stock,stock_minimo=excluded.stock_minimo,
          ubicacion_detalle=excluded.ubicacion_detalle,actualizado_por=auth.uid();
        total := total + 1;
    end loop;
    return total;
end; $$;

grant execute on function public.guardar_stock_repuesto_multiples(text,text,text,text,text,text,text,text[],numeric,numeric,text) to authenticated;
