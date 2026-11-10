import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import worker from '../worker.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const env = {
  SUPABASE_URL:'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY:'public-key',
  SUPABASE_SERVICE_ROLE_KEY:'server-secret',
  ASSETS:{fetch:async request => {
    const path = new URL(request.url).pathname;
    if (path === '/index.html' || path === '/admin/admin.html') return new Response(null,{status:307,headers:{Location:path === '/index.html' ? '/' : '/admin/admin'}});
    return new Response(path === '/admin/admin' ? 'admin' : html,{headers:{'Content-Type':'text/html','Content-Length':'10','ETag':'"original"'}});
  }},
};
const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; });
function mockFetch(handler) { globalThis.fetch = async (url,options={}) => handler(String(url),options); }
function response(data,status=200) { return Response.json(data,{status}); }

test('product pages contain escaped, absolute Open Graph metadata', async () => {
  mockFetch((url,options) => {
    assert.match(url,/slug=eq.jalea-pina/);
    assert.equal(options.headers.Authorization,undefined);
    return response([{nombre:'Jalea "especial" <x>',descripcion:'Fruta & cuidado',imagenes:['https://images.example.com/photo.jpg']}]);
  });
  const result = await worker.fetch(new Request('https://yazu.example/producto/jalea-pina'),env);
  const body = await result.text();
  assert.equal(result.status,200);
  assert.equal(result.headers.get('content-length'),null);
  assert.equal(result.headers.get('etag'),null);
  assert.match(body, /og:title" content="Jalea &quot;especial&quot; &lt;x&gt; \| YaZú"/);
  assert.match(body, /og:description" content="Fruta &amp; cuidado"/);
  assert.match(body, /og:image" content="https:\/\/images.example.com\/photo.jpg"/);
  assert.match(body, /og:url" content="https:\/\/yazu.example\/producto\/jalea-pina"/);
});
test('missing or hidden product returns 404; database failures return 502', async () => {
  mockFetch(() => response([]));
  assert.equal((await worker.fetch(new Request('https://yazu.example/producto/no-existe'),env)).status,404);
  mockFetch(() => response({error:'down'},503));
  assert.equal((await worker.fetch(new Request('https://yazu.example/producto/no-existe'),env)).status,502);
});
test('products without images use the PNG logo in Open Graph', async () => {
  mockFetch(() => response([{nombre:'Producto',descripcion:'Descripción',imagenes:[]}]));
  const result = await worker.fetch(new Request('https://yazu.example/producto/producto'),env);
  const body = await result.text();
  assert.equal(result.status,200);
  assert.match(body, /og:image" content="https:\/\/yazu.example\/assets\/logo_yazu\.png"/);
});
test('admin page is available at the requested route', async () => {
  const result = await worker.fetch(new Request('https://yazu.example/admin/admin'),env);
  assert.equal(await result.text(),'admin');
  assert.equal(result.headers.get('x-frame-options'),'DENY');
});
test('admin endpoints reject requests without a session', async () => {
  assert.equal((await worker.fetch(new Request('https://yazu.example/api/admin/users'),env)).status,401);
});
test('admin endpoints reject authenticated users without admin membership', async () => {
  mockFetch(url => url.endsWith('/auth/v1/user') ? response({id:'123'}) : response([]));
  const req = new Request('https://yazu.example/api/admin/users',{headers:{Authorization:'Bearer user-token'}});
  assert.equal((await worker.fetch(req,env)).status,401);
});
test('admin mutations reject cross-origin requests and self-deletion', async () => {
  const id = '11111111-1111-4111-8111-111111111111';
  mockFetch(url => url.endsWith('/auth/v1/user') ? response({id}) : response([{user_id:id}]));
  const headers = {Authorization:'Bearer user-token',Origin:'https://evil.example'};
  const crossOrigin = new Request('https://yazu.example/api/admin/users',{method:'POST',headers,body:'{}'});
  assert.equal((await worker.fetch(crossOrigin,env)).status,403);
  const own = new Request(`https://yazu.example/api/admin/users/${id}`,{method:'DELETE',headers:{...headers,Origin:'https://yazu.example'}});
  assert.equal((await worker.fetch(own,env)).status,400);
});
test('invitation grants admin access using the server credential', async () => {
  const id = '22222222-2222-4222-8222-222222222222';
  const calls = [];
  mockFetch((url,options) => {
    calls.push([url,options]);
    if (url.endsWith('/auth/v1/user')) return response({id:'admin'});
    if (url.includes('user_id=eq.admin')) return response([{user_id:'admin'}]);
    if (url.includes('/auth/v1/invite')) return response({id});
    if (url.endsWith('/rest/v1/administradores')) return new Response(null,{status:201});
    throw new Error(`Unexpected request ${url}`);
  });
  const req = new Request('https://yazu.example/api/admin/users',{method:'POST',headers:{Authorization:'Bearer session',Origin:'https://yazu.example','Content-Type':'application/json'},body:JSON.stringify({email:'person@example.com'})});
  assert.equal((await worker.fetch(req,env)).status,201);
  assert.equal(calls[2][1].headers.Authorization,'Bearer server-secret');
  assert.deepEqual(JSON.parse(calls[3][1].body),{user_id:id});
});
test('missing server secret never falls back to public access', async () => {
  const result = await worker.fetch(new Request('https://yazu.example/api/admin/users'),{...env,SUPABASE_SERVICE_ROLE_KEY:''});
  assert.equal(result.status,503);
});
test('new Supabase secret keys are sent only in the apikey header', async () => {
  const calls = [];
  mockFetch((url,options) => {
    calls.push([url,options]);
    if (url.endsWith('/auth/v1/user')) return response({id:'admin'});
    if (url.includes('user_id=eq.admin')) return response([{user_id:'admin'}]);
    if (url.endsWith('/rest/v1/administradores?select=user_id')) return response([]);
    throw new Error(`Unexpected request ${url}`);
  });
  const req = new Request('https://yazu.example/api/admin/users',{headers:{Authorization:'Bearer session'}});
  const result = await worker.fetch(req,{...env,SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test'});
  assert.equal(result.status,200);
  assert.equal(calls[2][1].headers.apikey,'sb_secret_test');
  assert.equal(calls[2][1].headers.Authorization,undefined);
});
