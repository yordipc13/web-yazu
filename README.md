# YaZú

Sitio público en HTML, CSS y JavaScript, con datos en Supabase y rutas dinámicas en Cloudflare Workers. El catálogo incluido es provisional y no debe publicarse con datos de prueba por accidente.

## Preparación de Supabase

1. En el proyecto ya configurado en `supabase/connection.js`, ejecuta `supabase/schema.sql` en el editor SQL de Supabase. Revisa cualquier conflicto con tablas o políticas existentes antes de aplicar el esquema.
2. Crea la primera cuenta en Authentication. Para concederle acceso, abre `supabase/hacer_admin.sql`, sustituye el correo de ejemplo por el de esa cuenta y ejecuta la consulta completa en el editor SQL. El resultado indica si la cuenta no existe, si se concedió el acceso o si ya estaba concedido; repetirla no duplica el acceso.
3. Si la tabla de productos está vacía y deseas cargar los 20 productos provisionales, ejecuta `supabase/seed.sql` una sola vez. La carga falla sin insertar nada si la tabla ya contiene productos. Las imágenes vacías muestran el logo.
4. Habilita el registro por correo en Authentication para que cada persona pueda crear una cuenta e iniciar sesión desde Favoritos. Configura la URL del sitio y las redirecciones permitidas para el dominio real; configura y prueba el proveedor de correo y la confirmación de cuentas.
5. El registro no concede acceso administrativo. Las políticas RLS limitan la administración del catálogo a cuentas presentes en `administradores`; la tabla `favoritos_usuario` solo permite a cada cuenta acceder a sus propios favoritos. Los buckets `productos` y `galeria` son públicos para lectura de imágenes y requieren administración para modificarlas. No subas contenido privado a esos buckets.

## Cloudflare Workers

1. Ejecuta `node build.mjs` desde la raíz para preparar únicamente los archivos públicos en `.worker-assets`, incluidos el logo SVG y el PNG usado cuando faltan imágenes. La guía, el esquema y los archivos locales no se sirven como recursos públicos. Los logos viven también en `assets/` en la raíz, para que Live Server los sirva igual que Wrangler. Live Server no reescribe rutas como `/productos`: esas URL solo funcionan con Wrangler o navegando desde la home.
2. Recursos visuales en `assets/`: `decorativas/` (imagen del hero `inicio.jpg` y fotos `foto-1..3.jpg`), `fondos/` (fondos `fondo-1..3.png` para emprendimientos, servicios y contacto) y `videos/chaperno.mp4`. Cada archivo nuevo debe agregarse también a la lista `files` de `build.mjs`, o el build falla con "Archivo inesperado".
3. Los dos videos grandes de Chaperno (más de 25 MiB, límite de Cloudflare) se suben a YouTube. Pon sus IDs en `youtube` de `site-config.js`, en orden. Un ID vacío muestra un espacio de "próximamente".
2. Instala y autentica la herramienta Wrangler según la documentación oficial de Cloudflare, si aún no la tienes. Configura el secreto del Worker con `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` e introduce la clave privada solo en el terminal, nunca en el repositorio ni en el chat. La clave debe corresponder al proyecto Supabase configurado.
3. Comprueba las variables públicas de `wrangler.jsonc` y publica con `npx wrangler deploy`. Configura el dominio o ruta del Worker en Cloudflare. El Worker debe atender las rutas públicas y `/admin/admin`.
4. Después de cada cambio en archivos públicos, ejecuta de nuevo `node build.mjs` antes del despliegue. El Worker construye las URL canónicas y Open Graph a partir del dominio de cada solicitud; prueba las vistas previas en el dominio definitivo.

La gestión de usuarios se ejecuta en el Worker tras verificar la sesión y la pertenencia a `administradores`. La clave de servicio no debe estar en JavaScript del navegador ni en variables públicas. Si una invitación se crea pero falla la asignación del acceso, el panel informa del error y se debe revisar la cuenta y la tabla en Supabase antes de volver a intentarlo.

La clave privada puede ser una clave secreta actual `sb_secret_...`, disponible en Settings > API Keys > Publishable and secret API keys, o una clave antigua `service_role`. Se configurará directamente en los secretos de Cloudflare cuando corresponda. Sin ella, el menú Usuarios muestra un error de configuración; el catálogo, la galería y el acceso administrativo no dependen de ella.

Para iniciar una vista previa local sin publicar, ejecuta `node build.mjs` y luego `npx wrangler dev --local`. Abre la dirección local indicada por Wrangler; el panel se encuentra en `/admin/admin`. Detén el proceso con Ctrl+C cuando termines.

## Datos pendientes

Edita `site-config.js` para configurar `whatsapp` como número internacional sin `+`, espacios ni guiones, `sinpe` con la información autorizada y `facebook` con la URL oficial. Sin número, la cotización por WhatsApp permanece deshabilitada. El enlace general de WhatsApp no incluye datos de pedido. Cambia la ubicación provisional del mapa y completa el contenido, servicios, imágenes, precios y productos reales antes de publicar. No se almacenan pedidos ni datos de contacto de clientes en Supabase.

La identidad gráfica de referencia utiliza Doodler y Gilroy; el CSS usa estas familias si están instaladas localmente y alternativas si no lo están. No se han distribuido archivos de fuentes sin verificar la licencia. Las políticas legales, impuestos y costos de entrega siguen pendientes.

## Pruebas

Con Node.js instalado, ejecuta `node --test tests\worker.test.mjs tests\assets.test.mjs` y `node --check index.js`, `node --check Guía\admin\admin.js` y `node --check worker.js`. Para la validación completa hacen falta un proyecto Supabase configurado, una cuenta administradora, correo de Auth y un Worker con su secreto y dominio. Verifica los borrados masivos con datos de prueba antes de usar datos reales.
