alter table public.profiles drop constraint if exists profiles_sede_check;
alter table public.profiles add constraint profiles_sede_check
check (sede in ('general', 'puruchuco', 'salaverry', 'primavera', 'civico', 'gama'));

update public.profiles
set sede = 'general'
where rol = 'encargado_ti'
  and activo = true;
