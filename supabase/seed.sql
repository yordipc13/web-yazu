-- Run only when the catalog is empty. The transaction is deliberately all-or-nothing.
begin;
do $$
begin
  if exists (select 1 from public.productos) then
    raise exception 'La tabla de productos no está vacía; no se cargaron los ejemplos.';
  end if;
end $$;
insert into public.productos (nombre, categoria, precio, descripcion, imagenes, estado)
values
('Jalea de piña artesanal','Jaleas',3500,'Jalea elaborada con piña.',array[]::text[],'activo'),
('Jalea de guayaba','Jaleas',3500,'Jalea de guayaba.',array[]::text[],'activo'),
('Jalea de mango','Jaleas',3500,'Jalea de mango.',array[]::text[],'activo'),
('Jalea de mora','Jaleas',3500,'Jalea de mora.',array[]::text[],'activo'),
('Jabón de avena','Jabones',2500,'Jabón artesanal de avena.',array[]::text[],'activo'),
('Jabón de lavanda','Jabones',2500,'Jabón artesanal de lavanda.',array[]::text[],'activo'),
('Jabón de café','Jabones',2500,'Jabón artesanal de café.',array[]::text[],'activo'),
('Jabón de romero','Jabones',2500,'Jabón artesanal de romero.',array[]::text[],'activo'),
('Repelente de citronela','Cuidado personal',4000,'Repelente artesanal de citronela.',array[]::text[],'activo'),
('Repelente natural','Cuidado personal',4000,'Repelente de elaboración artesanal.',array[]::text[],'activo'),
('Champú de romero','Cuidado personal',4500,'Champú artesanal de romero.',array[]::text[],'activo'),
('Acondicionador de hierbas','Cuidado personal',4500,'Acondicionador artesanal.',array[]::text[],'activo'),
('Crema hidratante','Cuidado personal',5000,'Crema de elaboración artesanal.',array[]::text[],'activo'),
('Aceite de masaje','Cuidado personal',5000,'Aceite de elaboración artesanal.',array[]::text[],'activo'),
('Salsa de tomate','Salsas',3000,'Salsa artesanal de tomate.',array[]::text[],'activo'),
('Salsa picante','Salsas',3000,'Salsa artesanal picante.',array[]::text[],'activo'),
('Salsa de mango','Salsas',3000,'Salsa artesanal de mango.',array[]::text[],'activo'),
('Té de hierbas','Infusiones',3000,'Mezcla artesanal de hierbas.',array[]::text[],'activo'),
('Infusión de zacate limón','Infusiones',3000,'Infusión artesanal de zacate limón.',array[]::text[],'activo'),
('Infusión de menta','Infusiones',3000,'Infusión artesanal de menta.',array[]::text[],'activo');
commit;
