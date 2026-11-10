import { supabase } from '/supabase/connection.js';

const logo = '/assets/logo_yazu.png';
const content = document.querySelector('#content');
const dialog = document.querySelector('#dialog');
const dialogContent = document.querySelector('#dialog-content');
const menu = document.querySelector('#context-menu');
const status = document.querySelector('#status');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowedUrl = value => { try { return ['http:','https:'].includes(new URL(value,location.origin).protocol); } catch { return false; } };
const image = value => value && allowedUrl(value) ? value : logo;
let currentView = 'productos';
let records = [];
let currentUser = null;
let timer;
let ignoreNextCardClick = false;

function message(text, error = false) {
  status.textContent = text; status.hidden = false;
  status.style.background = error ? '#a62d2d' : '#34402d';
  clearTimeout(timer); timer = setTimeout(() => { status.hidden = true; }, 6000);
}
function showError(error) { console.error(error); message(error.message || String(error), true); }
function modal(html) {
  dialogContent.innerHTML = `<div class="dialog-inner"><div class="dialog-header"><div></div><button class="close" type="button" aria-label="Cerrar" data-close>×</button></div>${html}</div>`;
  dialog.showModal();
}
function check(result) { if (result.error) throw result.error; return result.data; }
async function adminApi(path, options = {}) {
  const {data, error} = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('La sesión ha caducado.');
  const response = await fetch(`/api/admin/${path}`, { ...options, headers: {'Content-Type':'application/json', Authorization:`Bearer ${data.session.access_token}`, ...options.headers} });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Error HTTP ${response.status}`);
  return body;
}
async function enter() {
  const sessionResult = await supabase.auth.getSession();
  if (sessionResult.error) { showError(sessionResult.error); return; }
  if (!sessionResult.data.session) return;
  const {data, error} = await supabase.auth.getUser();
  if (error) { showError(error); return; }
  if (!data.user) { message('La sesión no contiene una cuenta válida.', true); return; }
  const result = await supabase.from('administradores').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (result.error) { showError(result.error); return; }
  if (!result.data) { await supabase.auth.signOut(); message('La cuenta no tiene acceso de administración.',true); return; }
  currentUser = data.user;
  document.querySelector('#auth').hidden = true; document.querySelector('#app').hidden = false;
  await loadView();
}
async function loadView() {
  menu.hidden = true;
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === currentView));
  content.innerHTML = '<p>Cargando…</p>';
  try {
    if (currentView === 'usuarios') {
      const {users} = await adminApi('users');
      content.innerHTML = `<div class="content-header"><div><p class="eyebrow">ACCESO</p><h1>Usuarios</h1><p>Gestiona las personas administradoras.</p></div><button class="button" data-invite>Invitar usuario +</button></div><div>${users.map(user=>`<div class="user-row"><span>${escapeHtml(user.email || user.id)}${user.id === currentUser.id?' (tu cuenta)':''}</span>${user.id !== currentUser.id?`<button class="button danger" data-delete-user="${escapeHtml(user.id)}" data-email="${escapeHtml(user.email || user.id)}">Eliminar</button>`:''}</div>`).join('')}</div>`;
      return;
    }
    const table = currentView;
    const result = await supabase.from(table).select('*').order(table === 'productos' ? 'nombre' : 'posicion');
    records = check(result);
    const productsView = table === 'productos';
    content.innerHTML = `<div class="content-header"><div><p class="eyebrow">YAZÚ / ${productsView?'CATÁLOGO':'IMÁGENES'}</p><h1>${productsView?'Productos':'Galería'}</h1><p>${productsView?'Organiza tu catálogo en un solo lugar.':'Organiza las imágenes de la galería.'}</p></div><button class="button" data-create>Agregar ${productsView?'producto':'imagen'} +</button></div><div class="toolbar"><input id="search" type="search" placeholder="Buscar por nombre o categoría" aria-label="Buscar"></div><p class="muted">Clic derecho o pulsación larga sobre una tarjeta para administrarla.</p><div id="cards" class="cards"></div>${productsView?`<section class="danger-zone"><p class="eyebrow">ZONA DE PELIGRO</p><h2>Borrado masivo</h2><p>Estas acciones son irreversibles.</p><div class="actions"><button class="button danger" data-clean="productos">Borrar todos los productos</button><button class="button danger" data-clean="imagenes">Borrar imágenes de productos</button><button class="button danger" data-clean="descripciones">Borrar descripciones</button><button class="button danger" data-clean="categoria">Borrar una categoría</button></div></section>`:''}`;
    drawCards();
  } catch (error) { console.error(error); content.innerHTML = `<p class="error">No se pudo cargar: ${escapeHtml(error.message || error)}</p><button class="button secondary" data-reload>Reintentar</button>`; }
}
function drawCards() {
  const query = document.querySelector('#search')?.value.trim().toLowerCase() || '';
  const matches = records.filter(r=>`${r.nombre || r.titulo} ${r.categoria}`.toLowerCase().includes(query));
  const cards = document.querySelector('#cards');
  if (!cards) return;
  cards.innerHTML = matches.map(r=>`<article class="card" data-id="${escapeHtml(r.uuid)}" tabindex="0"><div class="card-image"><span class="badge">${r.estado==='activo'?'Visible':'Oculto'}</span><img src="${escapeHtml(image(currentView==='productos'?r.imagenes?.[0]:r.imagen_url))}" alt=""></div><h3>${escapeHtml(r.nombre || r.titulo || 'Sin título')}</h3><p>${escapeHtml(r.categoria)}</p>${currentView==='productos'?`<strong>₡${Number(r.precio).toLocaleString('es-CR')}</strong>`:`<p>Orden: ${Number(r.posicion)}</p>`}</article>`).join('') || '<p>No hay elementos para mostrar.</p>';
}
function openMenu(card, x, y) {
  const record = records.find(r=>r.uuid===card.dataset.id);
  if (!record) return;
  menu.innerHTML = `<button data-action="edit">Editar</button><button data-action="toggle">${record.estado==='activo'?'Ocultar':'Mostrar'}</button><button class="danger-text" data-action="delete">Borrar</button>`;
  menu.dataset.id = record.uuid;
  menu.style.left = `${Math.max(0, Math.min(x, innerWidth-180))}px`;
  menu.style.top = `${Math.max(0, Math.min(y, innerHeight-150))}px`;
  menu.hidden = false;
}
function editor(record = null) {
  const isProduct = currentView === 'productos';
  const r = record || {};
  const fields = isProduct ? `<div class="fields"><label>Nombre *<input name="nombre" required value="${escapeHtml(r.nombre)}"></label><label>Nombre en inglés<input name="nombre_en" value="${escapeHtml(r.nombre_en)}"></label><label>Categoría *<input name="categoria" required value="${escapeHtml(r.categoria)}"></label><label>Categoría en inglés<input name="categoria_en" value="${escapeHtml(r.categoria_en)}"></label><label>Precio en colones *<input type="number" name="precio" min="0" step="0.01" required value="${escapeHtml(r.precio ?? '')}"></label><label>Estado<select name="estado"><option value="activo" ${r.estado!=='oculto'?'selected':''}>Activo</option><option value="oculto" ${r.estado==='oculto'?'selected':''}>Oculto</option></select></label></div><label>Descripción<textarea name="descripcion">${escapeHtml(r.descripcion)}</textarea></label><label>Descripción en inglés<textarea name="descripcion_en">${escapeHtml(r.descripcion_en)}</textarea></label><label>URLs de imágenes (una por línea)<textarea name="urls">${escapeHtml((r.imagenes || []).join('\n'))}</textarea></label><label>Subir imágenes<input type="file" name="files" accept="image/jpeg,image/png,image/webp,image/gif" multiple></label>` : `<div class="fields"><label>Título<input name="titulo" value="${escapeHtml(r.titulo)}"></label><label>Categoría<input name="categoria" value="${escapeHtml(r.categoria)}"></label><label>Posición<input type="number" name="posicion" value="${escapeHtml(r.posicion ?? 0)}" required></label><label>Estado<select name="estado"><option value="activo" ${r.estado!=='oculto'?'selected':''}>Visible</option><option value="oculto" ${r.estado==='oculto'?'selected':''}>Oculto</option></select></label></div><label>Descripción<textarea name="descripcion">${escapeHtml(r.descripcion)}</textarea></label><label>URL de imagen<input name="url" type="url" value="${escapeHtml(r.imagen_url)}"></label><label>Subir imagen<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>`;
  modal(`<p class="eyebrow">${isProduct?'CATÁLOGO':'GALERÍA'}</p><h2>${record?'Editar':'Agregar'} ${isProduct?'producto':'imagen'}</h2><form id="editor" data-id="${escapeHtml(r.uuid || '')}">${fields}<div class="actions"><button class="button" type="submit">Guardar</button><button class="button secondary" type="button" data-close>Cancelar</button></div></form>`);
}
async function upload(file, bucket) {
  if (!file.type.startsWith('image/') || file.size > 10485760) throw new Error('La imagen debe ser válida y pesar como máximo 10 MB.');
  const ext = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[file.type];
  if (!ext) throw new Error('Formato de imagen no admitido.');
  const path = `${crypto.randomUUID()}.${ext}`;
  check(await supabase.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false}));
  return {path, url:supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl};
}
async function saveEditor(form) {
  const values = new FormData(form);
  const id = form.dataset.id;
  const bucket = currentView;
  const uploaded = [];
  let saving = false;
  let payload;
  try {
    if (currentView === 'productos') {
      const urls = String(values.get('urls')).split('\n').map(s=>s.trim()).filter(Boolean);
      if (urls.some(url=>!allowedUrl(url))) throw new Error('Las URLs de imágenes deben ser HTTP o HTTPS.');
      const files = values.getAll('files').filter(file=>file.size);
      for (const file of files) { const result = await upload(file,bucket); uploaded.push(result.path); urls.push(result.url); }
      payload = {nombre:String(values.get('nombre')).trim(), nombre_en:String(values.get('nombre_en')).trim() || null, categoria:String(values.get('categoria')).trim(), categoria_en:String(values.get('categoria_en')).trim() || null, precio:Number(values.get('precio')), descripcion:String(values.get('descripcion')).trim(), descripcion_en:String(values.get('descripcion_en')).trim() || null, imagenes:urls, estado:values.get('estado')};
      if (!payload.nombre || !payload.categoria || !Number.isFinite(payload.precio) || payload.precio < 0) throw new Error('Revisa el nombre, la categoría y el precio.');
    } else {
      let url = String(values.get('url')).trim();
      const file = values.get('file');
      if (file.size) { const result = await upload(file,bucket); uploaded.push(result.path); url = result.url; }
      if (!url || !allowedUrl(url)) throw new Error('Indica una URL válida o sube una imagen.');
      payload = {titulo:String(values.get('titulo')).trim(), categoria:String(values.get('categoria')).trim(), descripcion:String(values.get('descripcion')).trim(), posicion:Number(values.get('posicion')), estado:values.get('estado'), imagen_url:url};
    }
    const query = supabase.from(currentView);
    saving = true;
    check(id ? await query.update(payload).eq('uuid',id).select('uuid').single() : await query.insert(payload).select('uuid').single());
  } catch (error) {
    if (uploaded.length && saving) throw new Error(`${error.message}. No se pudo confirmar el guardado; revisa el registro y las imágenes subidas en Supabase antes de reintentar.`);
    if (uploaded.length) {
      const cleanup = await supabase.storage.from(bucket).remove(uploaded);
      if (cleanup.error) throw new Error(`${error.message}. No se pudieron limpiar las imágenes subidas: ${cleanup.error.message}`);
    }
    throw error;
  }
  dialog.close(); message('Guardado correctamente.'); await loadView();
}
async function removeProductImages() {
  const bucket = supabase.storage.from('productos');
  const paths = [];
  async function collect(prefix) {
    let offset = 0;
    while (true) {
      const entries = check(await bucket.list(prefix, {limit:1000,offset}));
      for (const entry of entries) {
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id) paths.push(path);
        else await collect(path);
      }
      if (entries.length < 1000) break;
      offset += entries.length;
    }
  }
  await collect('');
  for (let i=0; i<paths.length; i+=1000) check(await bucket.remove(paths.slice(i,i+1000)));
}
function cleanDialog(action) {
  const descriptions = {productos:'Se eliminarán todos los productos.', imagenes:'Se eliminarán los archivos del bucket de productos y se limpiarán todas las referencias de imágenes, incluidas las URLs externas. La galería no se modificará.', descripciones:'Se borrarán las descripciones en español e inglés de todos los productos.', categoria:'Se eliminarán todos los productos de la categoría seleccionada.'};
  const categories = [...new Set(records.map(r=>r.categoria).filter(Boolean))].sort();
  modal(`<p class="eyebrow">ACCIÓN IRREVERSIBLE</p><h2>Confirmar borrado</h2><p>${descriptions[action]}</p><form id="clean" data-action="${action}">${action==='categoria'?`<label>Categoría<select name="categoria" required><option value="">Selecciona una categoría</option>${categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select></label>`:''}<label>Escribe «eliminar» para confirmar<input name="confirmacion" autocomplete="off" required></label><button class="button danger">Eliminar</button></form>`);
}
function inviteDialog() { modal('<h2>Invitar usuario</h2><p>La persona recibirá un correo para crear su contraseña.</p><form id="invite"><label>Correo electrónico<input type="email" name="email" required></label><button class="button">Enviar invitación</button></form>'); }
function deleteUserDialog(id, email) { modal(`<h2>Eliminar usuario</h2><p>Se eliminará la cuenta de Supabase Auth de ${escapeHtml(email)}. Esta acción es irreversible.</p><form id="delete-user" data-id="${escapeHtml(id)}"><button class="button danger">Confirmar eliminación</button></form>`); }

document.querySelector('#login').addEventListener('submit', async event => {
  event.preventDefault(); const f = new FormData(event.target);
  try { check(await supabase.auth.signInWithPassword({email:String(f.get('email')).trim(),password:String(f.get('password'))})); await enter(); }
  catch (error) { showError(error); }
});
document.querySelector('#forgot').addEventListener('click', () => modal('<h2>Recuperar contraseña</h2><form id="reset"><label>Correo electrónico<input name="email" type="email" required></label><button class="button">Enviar enlace</button></form>'));
document.querySelector('#new-password').addEventListener('submit', async event => {
  event.preventDefault(); const f = new FormData(event.target);
  try {
    if (f.get('password') !== f.get('confirm')) throw new Error('Las contraseñas no coinciden.');
    check(await supabase.auth.updateUser({password:String(f.get('password'))}));
    history.replaceState(null,'','/admin/admin'); document.querySelector('#new-password').hidden = true;
    document.querySelector('#login').hidden = false; message('Contraseña actualizada.'); await enter();
  } catch (error) { showError(error); }
});
async function logout() { try { check(await supabase.auth.signOut()); location.assign('/admin/admin'); } catch (error) { showError(error); } }
document.querySelector('#logout').addEventListener('click', logout);
document.querySelector('#logout-mobile').addEventListener('click', logout);
document.addEventListener('click', async event => {
  if (ignoreNextCardClick && event.target.closest('.card[data-id]')) {
    ignoreNextCardClick = false;
    event.preventDefault();
    return;
  }
  ignoreNextCardClick = false;
  const view = event.target.closest('[data-view]');
  if (view) { currentView = view.dataset.view; await loadView(); return; }
  if (event.target.closest('[data-close]')) { dialog.close(); return; }
  if (event.target.closest('[data-create]')) { editor(); return; }
  if (event.target.closest('[data-invite]')) { inviteDialog(); return; }
  if (event.target.closest('[data-reload]')) { await loadView(); return; }
  const clean = event.target.closest('[data-clean]'); if (clean) { cleanDialog(clean.dataset.clean); return; }
  const user = event.target.closest('[data-delete-user]'); if (user) { deleteUserDialog(user.dataset.deleteUser,user.dataset.email); return; }
  const action = event.target.closest('[data-action]');
  if (action && menu.contains(action)) {
    const record = records.find(r=>r.uuid===menu.dataset.id); menu.hidden = true;
    if (!record) return;
    if (action.dataset.action === 'edit') editor(record);
    else if (action.dataset.action === 'delete') modal(`<h2>Eliminar elemento</h2><p>Esta acción es irreversible.</p><form id="delete-record" data-id="${escapeHtml(record.uuid)}"><button class="button danger">Confirmar eliminación</button></form>`);
    else { try { check(await supabase.from(currentView).update({estado:record.estado==='activo'?'oculto':'activo'}).eq('uuid',record.uuid).select('uuid').single()); await loadView(); } catch (error) { showError(error); } }
    return;
  }
  if (!menu.contains(event.target)) menu.hidden = true;
});
document.addEventListener('contextmenu', event => { const card = event.target.closest('.card[data-id]'); if (card) { event.preventDefault(); openMenu(card,event.clientX,event.clientY); } });
let hold;
let holdPosition;
document.addEventListener('pointerdown', event => {
  const card = event.target.closest('.card[data-id]');
  if (card && event.pointerType === 'touch') {
    const x=event.clientX,y=event.clientY;
    holdPosition = {x,y};
    hold=setTimeout(()=>{ ignoreNextCardClick = true; openMenu(card,x,y); },600);
  }
});
document.addEventListener('pointermove', event => {
  if (holdPosition && Math.hypot(event.clientX-holdPosition.x,event.clientY-holdPosition.y) > 10) {
    clearTimeout(hold); holdPosition = null;
  }
});
['pointerup','pointercancel'].forEach(type=>document.addEventListener(type,()=>{ clearTimeout(hold); holdPosition = null; }));
document.addEventListener('input', event=>{ if (event.target.id==='search') drawCards(); });
document.addEventListener('error', event=>{ if (event.target instanceof HTMLImageElement && !event.target.src.endsWith(logo)) event.target.src=logo; },true);
document.addEventListener('submit', async event => {
  const form = event.target;
  if (!['editor','reset','invite','delete-user','delete-record','clean'].includes(form.id)) return;
  event.preventDefault(); const button = form.querySelector('button[type=submit],button:not([type])'); if (button) button.disabled = true;
  try {
    const values = new FormData(form);
    if (form.id==='editor') await saveEditor(form);
    if (form.id==='reset') { check(await supabase.auth.resetPasswordForEmail(String(values.get('email')).trim(),{redirectTo:`${location.origin}/admin/admin`})); dialog.close(); message('Si la cuenta existe, recibirás un correo de recuperación.'); }
    if (form.id==='invite') { await adminApi('users',{method:'POST',body:JSON.stringify({email:String(values.get('email')).trim()})}); dialog.close(); message('Invitación enviada.'); await loadView(); }
    if (form.id==='delete-user') { await adminApi(`users/${encodeURIComponent(form.dataset.id)}`,{method:'DELETE'}); dialog.close(); message('Usuario eliminado.'); await loadView(); }
    if (form.id==='delete-record') { check(await supabase.from(currentView).delete().eq('uuid',form.dataset.id).select('uuid').single()); dialog.close(); message('Elemento eliminado.'); await loadView(); }
    if (form.id==='clean') {
      if (values.get('confirmacion') !== 'eliminar') throw new Error('Escribe exactamente «eliminar» para continuar.');
      if (form.dataset.action==='imagenes') {
        try { await removeProductImages(); }
        catch (error) { throw new Error(`No se terminó el borrado de imágenes; algunas podrían haberse borrado. Reintenta: ${error.message}`); }
      }
      check(await supabase.rpc('limpiar_catalogo',{accion:form.dataset.action,confirmacion:'eliminar',categoria_elegida:values.get('categoria') || null}));
      dialog.close(); message('Acción completada.'); await loadView();
    }
  } catch (error) { showError(error); }
  finally { if (button) button.disabled = false; }
});

const recovery = ['invite','recovery'].includes(new URLSearchParams(location.hash.slice(1)).get('type'));
if (recovery) {
  document.querySelector('#login').hidden = true;
  document.querySelector('#new-password').hidden = false;
} else {
  enter();
}