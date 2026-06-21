-- Almacena las fotos de las guias fuera de PostgreSQL.
insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'guide-images',
    'guide-images',
    false,
    4194304,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "guide_images_read_authenticated" on storage.objects;
create policy "guide_images_read_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'guide-images');

drop policy if exists "guide_images_insert_admin" on storage.objects;
create policy "guide_images_insert_admin"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'guide-images' and public.es_admin());

drop policy if exists "guide_images_update_admin" on storage.objects;
create policy "guide_images_update_admin"
on storage.objects
for update
to authenticated
using (bucket_id = 'guide-images' and public.es_admin())
with check (bucket_id = 'guide-images' and public.es_admin());

drop policy if exists "guide_images_delete_admin" on storage.objects;
create policy "guide_images_delete_admin"
on storage.objects
for delete
to authenticated
using (bucket_id = 'guide-images' and public.es_admin());
