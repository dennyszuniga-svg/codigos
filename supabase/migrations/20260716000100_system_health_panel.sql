create or replace function public.get_system_health()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth, storage
as $$
declare
    database_bytes bigint;
    storage_bytes bigint;
    storage_objects bigint;
    total_users bigint;
    active_users bigint;
    users_last_30_days bigint;
    active_connections bigint;
    roles jsonb;
    sites jsonb;
    hosts jsonb;
    tables_usage jsonb;
begin
    if auth.uid() is null or not exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.activo is distinct from false
          and p.rol = 'encargado_ti'
          and lower(coalesce(p.nombre, '')) like '%dennys%'
    ) then
        raise exception 'Acceso exclusivo para el encargado Dennys'
            using errcode = '42501';
    end if;

    select pg_database_size(current_database()) into database_bytes;

    select
        coalesce(sum(
            case
                when metadata ->> 'size' ~ '^[0-9]+$' then (metadata ->> 'size')::bigint
                else 0
            end
        ), 0),
        count(*)
    into storage_bytes, storage_objects
    from storage.objects;

    select count(*), count(*) filter (where activo is distinct from false)
    into total_users, active_users
    from public.profiles;

    select count(*)
    into users_last_30_days
    from public.profiles
    where created_at >= now() - interval '30 days';

    select coalesce(sum(numbackends), 0)
    into active_connections
    from pg_stat_database
    where datname = current_database();

    select coalesce(jsonb_agg(jsonb_build_object(
        'role', grouped.rol,
        'count', grouped.total,
        'active', grouped.activos
    ) order by grouped.total desc, grouped.rol), '[]'::jsonb)
    into roles
    from (
        select rol, count(*)::bigint total,
               count(*) filter (where activo is distinct from false)::bigint activos
        from public.profiles
        group by rol
    ) grouped;

    select coalesce(jsonb_agg(jsonb_build_object(
        'site', grouped.sede,
        'count', grouped.total,
        'active', grouped.activos
    ) order by grouped.total desc, grouped.sede), '[]'::jsonb)
    into sites
    from (
        select coalesce(sede, 'sin_sede') sede, count(*)::bigint total,
               count(*) filter (where activo is distinct from false)::bigint activos
        from public.profiles
        group by coalesce(sede, 'sin_sede')
    ) grouped;

    select coalesce(jsonb_agg(jsonb_build_object(
        'name', p.nombre,
        'email', p.email,
        'site', p.sede,
        'active', p.activo,
        'created_at', p.created_at
    ) order by p.nombre), '[]'::jsonb)
    into hosts
    from public.profiles p
    where p.rol = 'anfitrion';

    select coalesce(jsonb_agg(jsonb_build_object(
        'schema', ranked.schemaname,
        'table', ranked.relname,
        'estimated_rows', ranked.rows_count,
        'bytes', ranked.total_bytes
    ) order by ranked.total_bytes desc), '[]'::jsonb)
    into tables_usage
    from (
        select schemaname, relname, n_live_tup::bigint rows_count,
               pg_total_relation_size(relid)::bigint total_bytes
        from pg_stat_user_tables
        where schemaname in ('public', 'auth', 'storage')
        order by pg_total_relation_size(relid) desc
        limit 15
    ) ranked;

    return jsonb_build_object(
        'mode', 'advanced',
        'generated_at', now(),
        'database', jsonb_build_object(
            'bytes', database_bytes,
            'limit_bytes', 524288000
        ),
        'storage', jsonb_build_object(
            'bytes', storage_bytes,
            'limit_bytes', 1073741824,
            'objects', storage_objects
        ),
        'users', jsonb_build_object(
            'total', total_users,
            'active', active_users,
            'created_last_30_days', users_last_30_days,
            'roles', roles,
            'sites', sites,
            'hosts', hosts
        ),
        'database_connections', active_connections,
        'tables', tables_usage
    );
end;
$$;

revoke all on function public.get_system_health() from public;
grant execute on function public.get_system_health() to authenticated;
