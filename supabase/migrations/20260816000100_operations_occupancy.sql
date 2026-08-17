create table if not exists public.operaciones_ocupabilidad_diaria (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    fecha date not null default (timezone('America/Lima', now()))::date,
    cortes jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (sede, fecha)
);

alter table public.operaciones_ocupabilidad_diaria enable row level security;

create or replace function public.puede_registrar_ocupabilidad(sede_arg text)
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and activo = true
          and (rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
               or sede = sede_arg or sede = 'general')
    );
$$;

drop policy if exists "operaciones_ocupabilidad_select" on public.operaciones_ocupabilidad_diaria;
create policy "operaciones_ocupabilidad_select" on public.operaciones_ocupabilidad_diaria
for select to authenticated using (public.puede_ver_checklist_operaciones(sede));

drop policy if exists "operaciones_ocupabilidad_insert" on public.operaciones_ocupabilidad_diaria;
create policy "operaciones_ocupabilidad_insert" on public.operaciones_ocupabilidad_diaria
for insert to authenticated with check (public.puede_registrar_ocupabilidad(sede));

drop policy if exists "operaciones_ocupabilidad_update" on public.operaciones_ocupabilidad_diaria;
create policy "operaciones_ocupabilidad_update" on public.operaciones_ocupabilidad_diaria
for update to authenticated using (public.puede_registrar_ocupabilidad(sede))
with check (public.puede_registrar_ocupabilidad(sede));

drop trigger if exists operaciones_ocupabilidad_set_updated_at on public.operaciones_ocupabilidad_diaria;
create trigger operaciones_ocupabilidad_set_updated_at before update on public.operaciones_ocupabilidad_diaria
for each row execute function public.set_updated_at();

create index if not exists operaciones_ocupabilidad_sede_fecha_idx
on public.operaciones_ocupabilidad_diaria (sede, fecha desc);

create or replace function public.guardar_zona_ocupabilidad(
    sede_arg text, fecha_arg date, hora_arg text, zona_arg jsonb
)
returns public.operaciones_ocupabilidad_diaria
language plpgsql security definer set search_path = public as $$
declare
    registro public.operaciones_ocupabilidad_diaria%rowtype;
    perfil public.profiles%rowtype;
    fecha_lima date := (timezone('America/Lima', now()))::date;
    hora_lima text := to_char(date_trunc('hour', timezone('America/Lima', now())), 'HH24:MI');
    zona_id text := zona_arg->>'id';
    corte_actual jsonb;
    cortes_restantes jsonb;
    zonas_restantes jsonb;
    zona_auditada jsonb;
begin
    if not public.puede_registrar_ocupabilidad(sede_arg) then
        raise exception 'No tienes permiso para registrar esta sede.';
    end if;
    if sede_arg <> 'salaverry' then
        raise exception 'La ocupabilidad esta habilitada inicialmente para Salaverry.';
    end if;
    if fecha_arg <> fecha_lima or hora_arg <> hora_lima then
        raise exception 'Solo puedes registrar la hora actual del dia.';
    end if;
    if zona_id not in ('sotano-1', 'sotano-2', 'sotano-3', 'sotano-4', 'parking-vip', 'bicicletas', 'motos') then
        raise exception 'Zona no valida.';
    end if;

    select * into perfil from public.profiles where id = auth.uid() and activo = true;
    if perfil.id is null then raise exception 'Usuario no autorizado.'; end if;

    delete from public.operaciones_ocupabilidad_diaria where fecha < fecha_lima;
    insert into public.operaciones_ocupabilidad_diaria (sede, fecha) values (sede_arg, fecha_arg)
    on conflict (sede, fecha) do nothing;
    select * into registro from public.operaciones_ocupabilidad_diaria
    where sede = sede_arg and fecha = fecha_arg for update;

    select elemento into corte_actual
    from jsonb_array_elements(coalesce(registro.cortes, '[]'::jsonb)) elemento
    where elemento->>'hora' = hora_arg limit 1;
    corte_actual := coalesce(corte_actual, jsonb_build_object('hora', hora_arg, 'zonas', '[]'::jsonb));

    select coalesce(jsonb_agg(elemento), '[]'::jsonb) into zonas_restantes
    from jsonb_array_elements(coalesce(corte_actual->'zonas', '[]'::jsonb)) elemento
    where elemento->>'id' <> zona_id;

    zona_auditada := zona_arg || jsonb_build_object(
        'responsable_id', perfil.id,
        'responsable_nombre', coalesce(nullif(perfil.nombre, ''), split_part(perfil.email, '@', 1)),
        'responsable_rol', perfil.rol,
        'registrado_at', now()
    );
    corte_actual := jsonb_build_object(
        'hora', hora_arg,
        'zonas', zonas_restantes || jsonb_build_array(zona_auditada),
        'actualizado_at', now()
    );

    select coalesce(jsonb_agg(elemento), '[]'::jsonb) into cortes_restantes
    from jsonb_array_elements(coalesce(registro.cortes, '[]'::jsonb)) elemento
    where elemento->>'hora' <> hora_arg;

    update public.operaciones_ocupabilidad_diaria
    set cortes = cortes_restantes || jsonb_build_array(corte_actual)
    where id = registro.id returning * into registro;
    return registro;
end;
$$;

revoke all on function public.guardar_zona_ocupabilidad(text, date, text, jsonb) from public;
grant execute on function public.guardar_zona_ocupabilidad(text, date, text, jsonb) to authenticated;

do $$
begin
    alter publication supabase_realtime add table public.operaciones_ocupabilidad_diaria;
exception when duplicate_object then null;
end $$;
