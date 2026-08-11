alter table public.gdh_comunicados
  add column if not exists mime_type text,
  add column if not exists tamano_bytes bigint;

alter table public.gdh_comunicados
  drop constraint if exists gdh_comunicados_tamano_bytes_check;

alter table public.gdh_comunicados
  add constraint gdh_comunicados_tamano_bytes_check
  check (tamano_bytes is null or tamano_bytes between 0 and 41943040);

update storage.buckets
set
  file_size_limit = 41943040,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
where id = 'gdh-comunicados';
