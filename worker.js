const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});

function publicHeaders(env, token) {
  const headers = {apikey:env.SUPABASE_PUBLISHABLE_KEY};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
function serviceHeaders(env) {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = {apikey:key, 'Content-Type':'application/json'};
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
  return headers;
}
async function authenticatedAdmin(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) return null;
  const token = authorization.slice(7);
  const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {headers:publicHeaders(env, token)});
  if (userResponse.status === 401 || userResponse.status === 403) return null;
  if (!userResponse.ok) throw new Error('No se pudo verificar la sesión.');
  const user = await userResponse.json();
  const check = await fetch(`${env.SUPABASE_URL}/rest/v1/administradores?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, {headers:publicHeaders(env, token)});
  if (!check.ok) throw new Error('No se pudo verificar el acceso administrativo.');
  const admins = await check.json();
  return admins.length === 1 ? user : null;
}
async function supabaseService(env, path, options = {}) {
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {...options, headers:{...serviceHeaders(env), ...options.headers}});
  const text = await response.text();
  let body = null;
  if (text) { try { body = JSON.parse(text); } catch { throw new Error('Respuesta inválida de Supabase.'); } }
  if (!response.ok) throw new Error(body?.msg || body?.message || body?.error_description || `Supabase respondió con HTTP ${response.status}.`);
  return body;
}
async function adminRoutes(request, env, url) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) return json({error:'Faltan variables de configuración del servidor.'},503);
  const user = await authenticatedAdmin(request,env);
  if (!user) return json({error:'Acceso no autorizado.'},401);
  if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({error:'Origen no autorizado.'},403);
  if (url.pathname === '/api/admin/users' && request.method === 'GET') {
    const admins = await supabaseService(env,'/rest/v1/administradores?select=user_id');
    const users = await Promise.all(admins.map(async admin => {
      const result = await supabaseService(env,`/auth/v1/admin/users/${encodeURIComponent(admin.user_id)}`);
      return {id:result.id, email:result.email};
    }));
    return json({users});
  }
  if (url.pathname === '/api/admin/users' && request.method === 'POST') {
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error:'Formato no admitido.'},415);
    const data = await request.json();
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:'Correo inválido.'},400);
    const redirect = `${url.origin}/admin/admin`;
    const invited = await supabaseService(env,`/auth/v1/invite?redirect_to=${encodeURIComponent(redirect)}`,{method:'POST',body:JSON.stringify({email})});
    if (!invited?.id) throw new Error('Supabase no devolvió el identificador de la persona invitada.');
    try {
      await supabaseService(env,'/rest/v1/administradores',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:invited.id})});
    } catch (error) {
      throw new Error(`La invitación se creó, pero no se pudo conceder acceso. Revisa Supabase: ${error.message}`);
    }
    return json({ok:true},201);
  }
  const match = url.pathname.match(/^\/api\/admin\/users\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  if (match && request.method === 'DELETE') {
    if (match[1] === user.id) return json({error:'No puedes eliminar tu propia cuenta.'},400);
    const admins = await supabaseService(env,`/rest/v1/administradores?user_id=eq.${encodeURIComponent(match[1])}&select=user_id`);
    if (admins.length !== 1) return json({error:'No se encontró la cuenta administradora.'},404);
    await supabaseService(env,`/auth/v1/admin/users/${encodeURIComponent(match[1])}`,{method:'DELETE'});
    return json({ok:true});
  }
  return json({error:'Ruta no encontrada.'},404);
}
function withHeaders(response) {
  const result = new Response(response.body,response);
  result.headers.set('X-Content-Type-Options','nosniff');
  result.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  result.headers.set('X-Frame-Options','DENY');
  return result;
}
async function page(request, env, url) {
  const admin = url.pathname === '/admin/admin' || url.pathname === '/admin/admin/';
  const assetUrl = new URL(request.url);
  assetUrl.pathname = admin ? '/admin/admin' : '/';
  const asset = await env.ASSETS.fetch(new Request(assetUrl,request));
  if (!asset.ok) return asset;
  if (admin) return withHeaders(asset);
  let html = await asset.text();
  let status = 200;
  let title = 'YaZú | Productos con raíces';
  let description = 'Conoce productos artesanales y una colectiva agroecológica de Costa Rica.';
  let image = `${url.origin}/assets/logo_yazu.png`;
  const match = url.pathname.match(/^\/producto\/([a-z0-9-]+)\/?$/);
  if (match) {
    const endpoint = `${env.SUPABASE_URL}/rest/v1/productos?slug=eq.${encodeURIComponent(match[1])}&estado=eq.activo&select=nombre,descripcion,imagenes`;
    const response = await fetch(endpoint,{headers:publicHeaders(env)});
    if (!response.ok) return new Response('No se pudo cargar el producto.', {status:502,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    const [product] = await response.json();
    if (!product) status = 404;
    else {
      title = `${product.nombre} | YaZú`;
      description = product.descripcion || description;
      try { const candidate = new URL(product.imagenes?.[0] || image,url.origin); if (['http:','https:'].includes(candidate.protocol)) image = candidate.href; } catch { /* Use the logo for an invalid image URL. */ }
    }
  } else if (!['/','/productos','/informacion','/favoritos','/carrito'].includes(url.pathname.replace(/\/+$/,'') || '/')) status = 404;
  const canonical = `${url.origin}${url.pathname}`;
  html = html.replace(/<title>.*?<\/title>/, `<title>${htmlEscape(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${htmlEscape(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${htmlEscape(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${htmlEscape(description)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${htmlEscape(image)}">`)
    .replace('</head>', `<meta property="og:url" content="${htmlEscape(canonical)}"><link rel="canonical" href="${htmlEscape(canonical)}"></head>`);
  const headers = new Headers(asset.headers);
  for (const header of ['content-length','content-encoding','etag','last-modified']) headers.delete(header);
  headers.set('Content-Type','text/html; charset=utf-8');
  headers.set('Cache-Control','no-store');
  return withHeaders(new Response(html,{status,headers}));
}
export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/admin/')) return await adminRoutes(request,env,url);
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Método no permitido.',{status:405});
      if (url.pathname === '/admin/admin' || url.pathname === '/admin/admin/' || !url.pathname.includes('.')) return await page(request,env,url);
      return withHeaders(await env.ASSETS.fetch(request));
    } catch (error) {
      console.error('Error en Worker:',error);
      if (url.pathname.startsWith('/api/')) return json({error:error.message || 'Error del servidor.'},500);
      return new Response('Error al cargar la página.',{status:500,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  }
};
