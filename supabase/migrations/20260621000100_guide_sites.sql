alter table public.guias_operativas
add column if not exists sede text;

update public.guias_operativas
set sede = 'gama'
where modulo = 'caja';

update public.guias_operativas
set sede = 'general'
where sede is null or btrim(sede) = '';

alter table public.guias_operativas
alter column sede set default 'general';

alter table public.guias_operativas
alter column sede set not null;

alter table public.guias_operativas
drop constraint if exists guias_operativas_sede_check;

alter table public.guias_operativas
add constraint guias_operativas_sede_check
check (sede in ('general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama'));

create index if not exists guias_operativas_sede_idx
on public.guias_operativas (modulo, sede);
