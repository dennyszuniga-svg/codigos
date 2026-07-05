delete from public.inventario_movimientos;
delete from public.inventario_repuestos;

create table if not exists public.catalogo_repuestos (
    id uuid primary key default gen_random_uuid(),
    codigo text not null unique,
    nombre text not null,
    categoria text not null default 'General',
    unidad text not null default 'unidad',
    compatibilidad text not null default 'universal' check (compatibilidad in ('universal', 'actual', 'antiguo')),
    proveedor text,
    contacto_proveedor text,
    creado_por uuid not null default auth.uid() references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.stock_repuestos (
    id uuid primary key default gen_random_uuid(),
    repuesto_id uuid not null references public.catalogo_repuestos(id) on delete cascade,
    ubicacion_sede text not null check (ubicacion_sede in ('general','puruchuco','salaverry','primavera','civico','gama')),
    stock numeric(12,2) not null default 0 check (stock >= 0),
    stock_minimo numeric(12,2) not null default 0 check (stock_minimo >= 0),
    ubicacion_detalle text,
    actualizado_por uuid not null default auth.uid() references public.profiles(id),
    updated_at timestamptz not null default now(),
    unique (repuesto_id, ubicacion_sede)
);

create table if not exists public.movimientos_stock_repuestos (
    id uuid primary key default gen_random_uuid(),
    repuesto_id uuid not null references public.catalogo_repuestos(id),
    stock_origen_id uuid references public.stock_repuestos(id),
    ubicacion_origen text,
    ubicacion_destino text,
    tipo text not null check (tipo in ('ingreso','salida','ajuste','transferencia','consumo')),
    cantidad numeric(12,2) not null check (cantidad >= 0),
    stock_anterior numeric(12,2),
    stock_resultante numeric(12,2),
    numero_informe text,
    observacion text,
    creado_por uuid not null default auth.uid() references public.profiles(id),
    created_at timestamptz not null default now()
);

alter table public.catalogo_repuestos enable row level security;
alter table public.stock_repuestos enable row level security;
alter table public.movimientos_stock_repuestos enable row level security;

create policy "catalogo_superior_all" on public.catalogo_repuestos for all to authenticated
using (public.es_encargado_ti()) with check (public.es_encargado_ti());
create policy "stock_superior_all" on public.stock_repuestos for all to authenticated
using (public.es_encargado_ti()) with check (public.es_encargado_ti());
create policy "movimientos_superior_select" on public.movimientos_stock_repuestos for select to authenticated
using (public.es_encargado_ti());

drop trigger if exists catalogo_repuestos_updated_at on public.catalogo_repuestos;
create trigger catalogo_repuestos_updated_at before update on public.catalogo_repuestos
for each row execute function public.set_updated_at();
drop trigger if exists stock_repuestos_updated_at on public.stock_repuestos;
create trigger stock_repuestos_updated_at before update on public.stock_repuestos
for each row execute function public.set_updated_at();

create or replace function public.guardar_stock_repuesto(
    codigo_arg text, nombre_arg text, categoria_arg text, unidad_arg text,
    compatibilidad_arg text, proveedor_arg text, contacto_arg text,
    ubicacion_sede_arg text, stock_arg numeric, stock_minimo_arg numeric, ubicacion_detalle_arg text
)
returns uuid language plpgsql security definer set search_path=public as $$
declare catalogo_id uuid; stock_id uuid;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    insert into public.catalogo_repuestos (codigo,nombre,categoria,unidad,compatibilidad,proveedor,contacto_proveedor,creado_por)
    values (upper(trim(codigo_arg)),trim(nombre_arg),coalesce(nullif(trim(categoria_arg),''),'General'),coalesce(nullif(trim(unidad_arg),''),'unidad'),compatibilidad_arg,nullif(trim(proveedor_arg),''),nullif(trim(contacto_arg),''),auth.uid())
    on conflict (codigo) do update set nombre=excluded.nombre,categoria=excluded.categoria,unidad=excluded.unidad,
      compatibilidad=excluded.compatibilidad,proveedor=excluded.proveedor,contacto_proveedor=excluded.contacto_proveedor
    returning id into catalogo_id;
    insert into public.stock_repuestos (repuesto_id,ubicacion_sede,stock,stock_minimo,ubicacion_detalle,actualizado_por)
    values (catalogo_id,ubicacion_sede_arg,stock_arg,stock_minimo_arg,nullif(trim(ubicacion_detalle_arg),''),auth.uid())
    on conflict (repuesto_id,ubicacion_sede) do update set stock=excluded.stock,stock_minimo=excluded.stock_minimo,
      ubicacion_detalle=excluded.ubicacion_detalle,actualizado_por=auth.uid()
    returning id into stock_id;
    return stock_id;
end; $$;

create or replace function public.registrar_movimiento_stock(
    stock_id_arg uuid, tipo_arg text, cantidad_arg numeric, destino_arg text default null, observacion_arg text default ''
)
returns numeric language plpgsql security definer set search_path=public as $$
declare origen public.stock_repuestos%rowtype; nuevo numeric; destino_id uuid;
begin
    if not public.es_encargado_ti() then raise exception 'No autorizado'; end if;
    if tipo_arg <> 'ajuste' and cantidad_arg <= 0 then raise exception 'La cantidad debe ser mayor a cero'; end if;
    if tipo_arg = 'ajuste' and cantidad_arg < 0 then raise exception 'La cantidad no puede ser negativa'; end if;
    select * into origen from public.stock_repuestos where id=stock_id_arg for update;
    if not found then raise exception 'Stock no encontrado'; end if;
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
      on conflict(repuesto_id,ubicacion_sede) do update set stock=stock_repuestos.stock+cantidad_arg,actualizado_por=auth.uid()
      returning id into destino_id;
    end if;
    insert into public.movimientos_stock_repuestos(repuesto_id,stock_origen_id,ubicacion_origen,ubicacion_destino,tipo,cantidad,stock_anterior,stock_resultante,observacion,creado_por)
    values(origen.repuesto_id,origen.id,origen.ubicacion_sede,destino_arg,tipo_arg,cantidad_arg,origen.stock,nuevo,left(coalesce(observacion_arg,''),500),auth.uid());
    return nuevo;
end; $$;

create or replace function public.listar_inventario_consolidado()
returns table(id uuid,repuesto_id uuid,codigo text,nombre text,categoria text,unidad text,compatibilidad text,proveedor text,
 contacto_proveedor text,ubicacion_sede text,stock numeric,stock_minimo numeric,ubicacion_detalle text,stock_total numeric)
language sql security definer set search_path=public as $$
 select s.id,c.id,c.codigo,c.nombre,c.categoria,c.unidad,c.compatibilidad,c.proveedor,c.contacto_proveedor,
 s.ubicacion_sede,s.stock,s.stock_minimo,s.ubicacion_detalle,sum(s.stock) over(partition by c.id)
 from public.stock_repuestos s join public.catalogo_repuestos c on c.id=s.repuesto_id
 where public.es_encargado_ti() order by c.nombre,s.ubicacion_sede;
$$;

drop function if exists public.listar_inventario_para_informe(text);

create or replace function public.listar_inventario_para_informe(sede_arg text)
returns table(id uuid,codigo text,nombre text,stock numeric,unidad text,categoria text,almacen text)
language sql security definer set search_path=public as $$
 select s.id,c.codigo,c.nombre,s.stock,c.unidad,c.categoria,s.ubicacion_sede
 from public.stock_repuestos s join public.catalogo_repuestos c on c.id=s.repuesto_id
 where exists(select 1 from public.profiles p where p.id=auth.uid() and p.activo=true and p.rol in('encargado_ti','tecnico'))
 and (c.compatibilidad='universal' or c.compatibilidad=case when sede_arg='primavera' then 'actual' else 'antiguo' end)
 order by c.nombre,s.ubicacion_sede;
$$;

drop function if exists public.registrar_consumo_repuestos(text, text, jsonb);

create or replace function public.registrar_consumo_repuestos(numero_informe_arg text,sede_arg text,repuestos_arg jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare item jsonb; cantidad_num numeric; origen public.stock_repuestos%rowtype;
begin
 if not public.es_personal_mantenimiento() then raise exception 'No autorizado'; end if;
 if repuestos_arg is null or jsonb_typeof(repuestos_arg)<>'array' then return; end if;
 if exists(select 1 from public.movimientos_stock_repuestos where numero_informe=numero_informe_arg and tipo='consumo') then return; end if;
 for item in select * from jsonb_array_elements(repuestos_arg) loop
   cantidad_num:=greatest(coalesce((item->>'cantidad')::numeric,0),0); if cantidad_num<=0 then continue; end if;
   select * into origen from public.stock_repuestos where id=nullif(item->>'id','')::uuid for update;
   if not found or origen.stock<cantidad_num then raise exception 'Stock insuficiente para %',item->>'codigo'; end if;
   update public.stock_repuestos set stock=stock-cantidad_num,actualizado_por=auth.uid() where id=origen.id;
   insert into public.movimientos_stock_repuestos(repuesto_id,stock_origen_id,ubicacion_origen,ubicacion_destino,tipo,cantidad,stock_anterior,stock_resultante,numero_informe,observacion,creado_por)
   values(origen.repuesto_id,origen.id,origen.ubicacion_sede,sede_arg,'consumo',cantidad_num,origen.stock,origen.stock-cantidad_num,numero_informe_arg,coalesce(item->>'observacion','Consumo desde informe'),auth.uid());
 end loop;
end; $$;

grant execute on function public.guardar_stock_repuesto(text,text,text,text,text,text,text,text,numeric,numeric,text) to authenticated;
grant execute on function public.registrar_movimiento_stock(uuid,text,numeric,text,text) to authenticated;
grant execute on function public.listar_inventario_consolidado() to authenticated;
grant execute on function public.listar_inventario_para_informe(text) to authenticated;
