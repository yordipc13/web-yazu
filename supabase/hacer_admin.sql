-- Sustituye el correo por el de una cuenta ya creada en Supabase Auth.
with usuario as (
  select id
  from auth.users
  where lower(email) = lower(trim('CORREO@EJEMPLO.COM'))
), acceso as (
  insert into public.administradores (user_id)
  select id from usuario
  on conflict (user_id) do nothing
  returning user_id
)
select case
  when not exists (select 1 from usuario) then 'No existe una cuenta con ese correo en Supabase Auth.'
  when exists (select 1 from acceso) then 'Acceso de administracion concedido.'
  else 'La cuenta ya tiene acceso de administracion.'
end as resultado;
