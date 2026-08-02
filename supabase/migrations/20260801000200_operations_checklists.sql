create table if not exists public.operaciones_checklists (
    id uuid primary key default gen_random_uuid(),
    sede text not null check (sede in ('puruchuco', 'salaverry', 'primavera', 'civico', 'gama')),
    fecha date not null default current_date,
    inicio_at timestamptz not null default now(),
    fin_at timestamptz,
    responsable_id uuid not null references public.profiles(id) on delete restrict,
    responsable_nombre text not null,
    responsable_rol text not null,
    turno text check (turno in ('apertura', 'intermedio', 'cierre')),
    estado text not null default 'borrador' check (estado in ('borrador', 'finalizado')),
    respuestas jsonb not null default '{}'::jsonb,
    observaciones jsonb not null default '{}'::jsonb,
    evidencias jsonb not null default '{}'::jsonb,
    total_items integer not null default 0,
    cumple_items integer not null default 0,
    no_cumple_items integer not null default 0,
    no_aplica_items integer not null default 0,
    cumplimiento numeric(5,2) not null default 0,
    criticos_no_cumple integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.operaciones_checklists enable row level security;

create or replace function public.puede_ver_checklist_operaciones(sede_arg text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
          and activo = true
          and (
              rol in ('encargado_ti', 'jefe_operaciones', 'coordinador_operaciones', 'gdh')
              or sede = sede_arg
          )
    );
$$;

drop policy if exists "operaciones_checklists_select" on public.operaciones_checklists;
create policy "operaciones_checklists_select"
on public.operaciones_checklists for select to authenticated
using (public.puede_ver_checklist_operaciones(sede));

drop policy if exists "operaciones_checklists_insert" on public.operaciones_checklists;
create policy "operaciones_checklists_insert"
on public.operaciones_checklists for insert to authenticated
with check (
    responsable_id = auth.uid()
    and public.puede_ver_checklist_operaciones(sede)
);

drop policy if exists "operaciones_checklists_update" on public.operaciones_checklists;
create policy "operaciones_checklists_update"
on public.operaciones_checklists for update to authenticated
using (responsable_id = auth.uid())
with check (
    responsable_id = auth.uid()
    and public.puede_ver_checklist_operaciones(sede)
);

drop policy if exists "operaciones_checklists_delete" on public.operaciones_checklists;
create policy "operaciones_checklists_delete"
on public.operaciones_checklists for delete to authenticated
using (
    estado = 'borrador'
    and responsable_id = auth.uid()
);

drop trigger if exists operaciones_checklists_set_updated_at on public.operaciones_checklists;
create trigger operaciones_checklists_set_updated_at
before update on public.operaciones_checklists
for each row execute function public.set_updated_at();

create index if not exists operaciones_checklists_sede_fecha_idx
on public.operaciones_checklists (sede, fecha desc);

create index if not exists operaciones_checklists_responsable_estado_idx
on public.operaciones_checklists (responsable_id, estado, updated_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'operations-checklist-images',
    'operations-checklist-images',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "operations_checklist_images_read" on storage.objects;
create policy "operations_checklist_images_read"
on storage.objects for select to authenticated
using (
    bucket_id = 'operations-checklist-images'
    and public.puede_ver_checklist_operaciones((storage.foldername(name))[1])
);

drop policy if exists "operations_checklist_images_insert" on storage.objects;
create policy "operations_checklist_images_insert"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'operations-checklist-images'
    and (storage.foldername(name))[2] = auth.uid()::text
    and public.puede_ver_checklist_operaciones((storage.foldername(name))[1])
);

drop policy if exists "operations_checklist_images_delete" on storage.objects;
create policy "operations_checklist_images_delete"
on storage.objects for delete to authenticated
using (
    bucket_id = 'operations-checklist-images'
    and (storage.foldername(name))[2] = auth.uid()::text
);

do $$
begin
    alter publication supabase_realtime add table public.operaciones_checklists;
exception
    when duplicate_object then null;
end $$;
