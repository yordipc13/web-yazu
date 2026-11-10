-- Apply in the Supabase SQL editor. This script does not delete existing data.
create extension if not exists unaccent with schema extensions;

create table if not exists public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.favoritos_usuario (
  user_id uuid primary key references auth.users(id) on delete cascade,
  product_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

create or replace function public.es_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$ select exists (select 1 from public.administradores where user_id = auth.uid()) $$;

revoke all on function public.es_admin() from public, anon, authenticated;
grant execute on function public.es_admin() to anon, authenticated;

create table if not exists public.productos (
  uuid uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) > 0),
  nombre_en text,
  categoria text not null check (length(trim(categoria)) > 0),
  categoria_en text,
  precio numeric(12,2) not null check (precio >= 0),
  descripcion text not null default '',
  descripcion_en text,
  imagenes text[] not null default '{}',
  estado text not null default 'activo' check (estado in ('activo','oculto')),
  slug text not null unique
);

create or replace function public.generar_slug_producto()
returns trigger language plpgsql
set search_path = public, extensions, pg_temp
as $$
declare
  words text[];
  base text;
  candidate text;
  suffix integer := 2;
begin
  if tg_op = 'UPDATE' and new.nombre = old.nombre then
    new.slug := old.slug;
    return new;
  end if;
  perform pg_advisory_xact_lock(1603857921);
  select array_agg(word order by ord) into words
  from (
    select word, ord from regexp_split_to_table(
      regexp_replace(lower(extensions.unaccent(new.nombre)), '[^a-z0-9]+', ' ', 'g'), '\s+'
    ) with ordinality as split(word, ord)
    where word <> '' and word <> all (array['el','la','los','las','un','una','unos','unas','de','del','a','al','en','y','con','para','por'])
    order by ord limit 5
  ) parts;
  base := coalesce(nullif(array_to_string(words, '-'), ''), 'producto');
  candidate := base;
  while exists (select 1 from public.productos p where p.slug = candidate and p.uuid <> new.uuid) loop
    candidate := coalesce(nullif(array_to_string(words[1:4], '-'), ''), 'producto') || '-' || suffix;
    suffix := suffix + 1;
  end loop;
  new.slug := candidate;
  return new;
end $$;

drop trigger if exists productos_slug on public.productos;
create trigger productos_slug before insert or update on public.productos
for each row execute function public.generar_slug_producto();

create table if not exists public.galeria (
  uuid uuid primary key default gen_random_uuid(),
  titulo text not null default '',
  descripcion text not null default '',
  categoria text not null default '',
  imagen_url text not null,
  posicion integer not null default 0,
  estado text not null default 'activo' check (estado in ('activo','oculto'))
);

alter table public.administradores enable row level security;
alter table public.favoritos_usuario enable row level security;
alter table public.productos enable row level security;
alter table public.galeria enable row level security;
drop policy if exists "administradores pueden ver su acceso" on public.administradores;
create policy "administradores pueden ver su acceso" on public.administradores for select to authenticated using (user_id = auth.uid());
drop policy if exists "cada usuario gestiona sus favoritos" on public.favoritos_usuario;
create policy "cada usuario gestiona sus favoritos" on public.favoritos_usuario for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "productos visibles" on public.productos;
create policy "productos visibles" on public.productos for select to anon, authenticated using (estado = 'activo' or public.es_admin());
drop policy if exists "administradores gestionan productos" on public.productos;
create policy "administradores gestionan productos" on public.productos for all to authenticated using (public.es_admin()) with check (public.es_admin());
drop policy if exists "galeria visible" on public.galeria;
create policy "galeria visible" on public.galeria for select to anon, authenticated using (estado = 'activo' or public.es_admin());
drop policy if exists "administradores gestionan galeria" on public.galeria;
create policy "administradores gestionan galeria" on public.galeria for all to authenticated using (public.es_admin()) with check (public.es_admin());
revoke all on public.administradores from anon, authenticated;
revoke all on public.favoritos_usuario from anon, authenticated;
grant select, insert, update on public.favoritos_usuario to authenticated;
revoke insert, update, delete on public.productos, public.galeria from anon;
grant select on public.productos, public.galeria to anon, authenticated;
grant insert, update, delete on public.productos, public.galeria to authenticated;
grant select on public.administradores to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
       ('galeria', 'galeria', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
drop policy if exists "imagenes publicas yazu" on storage.objects;
create policy "imagenes publicas yazu" on storage.objects for select to anon, authenticated using (bucket_id in ('productos','galeria'));
drop policy if exists "administradores gestionan imagenes yazu" on storage.objects;
create policy "administradores gestionan imagenes yazu" on storage.objects for all to authenticated
using (bucket_id in ('productos','galeria') and public.es_admin())
with check (bucket_id in ('productos','galeria') and public.es_admin());

create or replace function public.limpiar_catalogo(accion text, confirmacion text, categoria_elegida text default null)
returns void language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if not public.es_admin() then raise exception 'Acceso denegado'; end if;
  if confirmacion is distinct from 'eliminar' then raise exception 'Confirmación incorrecta'; end if;
  case accion
    when 'productos' then delete from public.productos;
    when 'descripciones' then update public.productos set descripcion = '', descripcion_en = null;
    when 'imagenes' then update public.productos set imagenes = '{}';
    when 'categoria' then
      if categoria_elegida is null or length(trim(categoria_elegida)) = 0 then raise exception 'Seleccione una categoría'; end if;
      delete from public.productos where categoria = categoria_elegida;
    else raise exception 'Acción desconocida';
  end case;
end $$;
revoke all on function public.limpiar_catalogo(text,text,text) from public, anon, authenticated;
grant execute on function public.limpiar_catalogo(text,text,text) to authenticated;

-- After creating the first user in Supabase Auth, insert its UUID here in the SQL editor:
-- insert into public.administradores (user_id) values ('USER_UUID');
