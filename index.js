import { supabase } from './supabase/connection.js';
import { config } from './site-config.js';

const logo = location.port === '5500' ? '/InsumosYaZú.tx/Timbó/Logomarca/logo_yazu.svg' : '/assets/logo_yazu.svg';
const messages = {
  es: {
    home:'Inicio', products:'Productos', about:'La historia', contact:'Contacto', explore:'Explorar', footerText:'Hecho con raíces, cuidado y comunidad.', socials:'Redes sociales', socialPending:'Enlace pendiente',
    heroLabel:'PAISAJISMO, SABERES Y SABORES', heroTitle:'Productos con raíces', heroText:'Descubre productos hechos con cuidado y conoce las historias que los acompañan.', shop:'Explorar productos', featured:'Una selección para ti', featuredText:'Pequeños detalles que nos conectan con la tierra.', all:'Ver todos los productos', storyLabel:'CONOCE YAZÚ', storyTitle:'Una comunidad que florece', storyText:'YaZú visibiliza iniciativas agroecológicas lideradas por mujeres rurales de Costa Rica.', discover:'Conoce más',
    catalogLabel:'EL CATÁLOGO', catalogTitle:'Encuentra algo especial', catalogText:'Explora nuestra selección de productos.', search:'Buscar productos', categories:'Todas las categorías', empty:'Todavía no hay productos para mostrar.', error:'No pudimos cargar el contenido. Inténtalo de nuevo.', retry:'Reintentar', add:'Agregar a cotización', added:'Producto agregado a la cotización.', favorite:'Agregar a favoritos', unfavorite:'Quitar de favoritos', back:'Volver a productos', description:'Descripción', noDescription:'', unavailable:'Este producto no está disponible.', image:'Imagen del producto',
    infoLabel:'LA COLECTIVA', infoTitle:'Historias que nos unen', infoText:'Conoce las iniciativas y personas que dan vida a nuestra comunidad.', ventures:'Emprendimientos', services:'Servicios', map:'Mapa', gallery:'Galería', ventureTitle:'Una iniciativa de ejemplo', ventureText:'Este espacio muestra cómo podremos compartir la historia de un emprendimiento y enlazar su página.', pending:'Próximamente compartiremos más información.', location:'Encuéntranos en el mapa', galleryEmpty:'Próximamente compartiremos imágenes de nuestra comunidad.', write:'Escríbenos', sinpe:'SINPE Móvil',
    favorites:'Favoritos', favoritesText:'Tus productos guardados.', favoritesEmpty:'Aún no tienes favoritos.', syncTitle:'Tus favoritos en otros dispositivos', syncText:'Tus favoritos se guardan en este dispositivo. Crea una cuenta o inicia sesión para sincronizarlos cuando quieras.', createAccount:'Crear cuenta', signIn:'Iniciar sesión', email:'Correo electrónico', password:'Contraseña', createAccountAction:'Registrarme', signInAction:'Iniciar sesión', syncFavorites:'Sincronizar favoritos', signOut:'Cerrar sesión', signedInAs:'Sesión iniciada como', authWorking:'Procesando…', checkEmail:'Revisa tu correo para confirmar la cuenta.', signedUp:'Cuenta creada. Ya puedes sincronizar tus favoritos.', syncComplete:'Favoritos sincronizados.', syncFailed:'No se pudieron sincronizar los favoritos. Inténtalo de nuevo.', authFailed:'No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo.', signedOut:'Sesión cerrada. Tus favoritos siguen guardados en este dispositivo.', cart:'Cotización', cartText:'Reúne productos y cantidades para solicitar una cotización.', cartEmpty:'Tu lista de cotización está vacía.', quantity:'Cantidad', remove:'Quitar', total:'Total de referencia', name:'Nombre', contactField:'Teléfono de contacto', locality:'Localidad (opcional)', delivery:'Entrega o retiro', chooseDelivery:'Selecciona una opción', homeDelivery:'Entrega a domicilio', pickup:'Retiro', payment:'Forma de pago', paymentInfo:'Pago por SINPE Móvil, coordinado al confirmar la cotización', send:'Solicitar cotización por WhatsApp', whatsappPending:'WhatsApp estará disponible próximamente.', quote:'Hola, quisiera solicitar una cotización de estos productos:', client:'Nombre', contactInfo:'Teléfono', localityInfo:'Localidad',
    notFound:'No encontramos esta página.', light:'Cambiar tema', language:'Cambiar idioma', showImage:'Mostrar imagen', videosLabel:'Videos', videosTitle:'Videos de Chaperno', videosText:'Conozca más sobre Chaperno y nuestras cadenas alimentarias sanas.', videoSoon:'Próximamente', galleryImage:'Imagen de la galería', mapTitle:'Mapa de San José, Costa Rica', skip:'Saltar al contenido', navigation:'Navegación principal', brandLabel:'YaZú, inicio', storageError:'No se pudieron guardar las preferencias en este navegador.',
  },
  en: {
    home:'Home', products:'Products', about:'The story', contact:'Contact', explore:'Explore', footerText:'Made with roots, care and community.', socials:'Social media', socialPending:'Link pending',
    heroLabel:'LANDSCAPING, KNOWLEDGE & FLAVORS', heroTitle:'Products with roots', heroText:'Discover carefully made products and the stories behind them.', shop:'Explore products', featured:'A selection for you', featuredText:'Little things that connect us to the earth.', all:'View all products', storyLabel:'MEET YAZÚ', storyTitle:'A community in bloom', storyText:'YaZú brings visibility to agroecological initiatives led by rural women in Costa Rica.', discover:'Learn more',
    catalogLabel:'THE CATALOG', catalogTitle:'Find something special', catalogText:'Explore our selection of products.', search:'Search products', categories:'All categories', empty:'There are no products to show yet.', error:'We could not load the content. Please try again.', retry:'Try again', add:'Add to quote', added:'Added to your quote.', favorite:'Add to favorites', unfavorite:'Remove from favorites', back:'Back to products', description:'Description', noDescription:'', unavailable:'This product is not available.', image:'Product image',
    infoLabel:'THE COLLECTIVE', infoTitle:'Stories that connect us', infoText:'Meet the initiatives and people who bring our community to life.', ventures:'Initiatives', services:'Services', map:'Map', gallery:'Gallery', ventureTitle:'An example initiative', ventureText:'This space shows how we can share an initiative’s story and link to its website.', pending:'More information is coming soon.', location:'Find us on the map', galleryEmpty:'Images of our community are coming soon.', write:'Get in touch', sinpe:'SINPE Móvil',
    favorites:'Favorites', favoritesText:'Your saved products.', favoritesEmpty:'You have no favorites yet.', syncTitle:'Your favorites on other devices', syncText:'Your favorites are saved on this device. Create an account or sign in to sync them whenever you choose.', createAccount:'Create account', signIn:'Sign in', email:'Email address', password:'Password', createAccountAction:'Create account', signInAction:'Sign in', syncFavorites:'Sync favorites', signOut:'Sign out', signedInAs:'Signed in as', authWorking:'Working…', checkEmail:'Check your email to confirm your account.', signedUp:'Account created. You can now sync your favorites.', syncComplete:'Favorites synced.', syncFailed:'Favorites could not be synced. Please try again.', authFailed:'The request could not be completed. Check your details and try again.', signedOut:'Signed out. Your favorites are still saved on this device.', cart:'Quote request', cartText:'Gather products and quantities to request a quote.', cartEmpty:'Your quote list is empty.', quantity:'Quantity', remove:'Remove', total:'Reference total', name:'Name', contactField:'Contact phone', locality:'Locality (optional)', delivery:'Delivery or pickup', chooseDelivery:'Choose an option', homeDelivery:'Home delivery', pickup:'Pickup', payment:'Payment method', paymentInfo:'SINPE Móvil payment, arranged after the quote is confirmed', send:'Request a quote via WhatsApp', whatsappPending:'WhatsApp will be available soon.', quote:'Hello, I would like to request a quote for these products:', client:'Name', contactInfo:'Phone', localityInfo:'Locality',
    notFound:'We could not find this page.', light:'Change theme', language:'Change language', showImage:'Show image', videosLabel:'Videos', videosTitle:'Chaperno videos', videosText:'Learn more about Chaperno and our healthy food chains.', videoSoon:'Coming soon', galleryImage:'Gallery image', mapTitle:'Map of San José, Costa Rica', skip:'Skip to content', navigation:'Main navigation', brandLabel:'YaZú, home', storageError:'Could not save your preferences in this browser.',
  }
};

const main = document.querySelector('#contenido');
const storage = {
  get(key, fallback) {
    try { const value = localStorage.getItem(`yazu-${key}`); return value === null ? fallback : JSON.parse(value); }
    catch (error) { console.error(`No se pudo leer ${key}:`, error); return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`yazu-${key}`, JSON.stringify(value)); }
    catch (error) { console.error(`No se pudo guardar ${key}:`, error); notify(t('storageError')); }
  }
};
let language = storage.get('language', navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es');
if (!messages[language]) language = 'es';
let theme = storage.get('theme', null);
let cart = storage.get('cart', {});
let favorites = storage.get('favorites', []);
if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
if (!Array.isArray(favorites)) favorites = [];
let products = [];
let gallery = [];
let authUser = null;
let authMode = 'signin';
let authMessage = '';
let renderId = 0;
const t = key => messages[language][key] || key;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local = (item, key) => (language === 'en' && item[`${key}_en`]) || item[key] || '';
const price = n => new Intl.NumberFormat(language === 'en' ? 'en-CR' : 'es-CR', {style:'currency', currency:'CRC', minimumFractionDigits:0, maximumFractionDigits:2}).format(Number(n) || 0);
const totalPrice = items => items.reduce((sum,p)=>sum+Math.round(Number(p.precio)*100)*Number(cart[p.uuid]),0)/100;
const imageUrl = url => {
  try { const parsed = new URL(url, location.origin); return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : logo; }
  catch { return logo; }
};
const productImage = item => imageUrl(item.imagenes?.[0] || logo);
const link = item => `/producto/${encodeURIComponent(item.slug)}`;
let noticeTimer;
function notify(text) {
  const notice = document.querySelector('#notice');
  notice.textContent = text; notice.hidden = false;
  clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { notice.hidden = true; }, 2500);
}
function setTheme() {
  const actual = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = actual;
}
let navigationObserver;
function setActiveNavigation(name) {
  document.querySelectorAll('.navigation [data-nav]').forEach(link => {
    if (link.dataset.nav === name) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
function observeNavigationSections() {
  navigationObserver?.disconnect();
  const sections = document.querySelectorAll('[data-nav-section]');
  if (!sections.length || !('IntersectionObserver' in window)) return;
  navigationObserver = new IntersectionObserver(entries => {
    const headerHeight = document.querySelector('.header').getBoundingClientRect().height;
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top - headerHeight) - Math.abs(b.boundingClientRect.top - headerHeight))[0];
    if (visible) setActiveNavigation(visible.target.dataset.navSection);
  }, {rootMargin:'-96px 0px -55% 0px',threshold:0});
  sections.forEach(section => navigationObserver.observe(section));
}
function updateHeader() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelector('.skip').textContent = t('skip');
  document.querySelector('.navigation').setAttribute('aria-label', t('navigation'));
  document.querySelector('.brand').setAttribute('aria-label', t('brandLabel'));
  const languageButton = document.querySelector('#language');
  languageButton.querySelector('.language-flag').textContent = language === 'es' ? '🇨🇷' : '🇺🇸';
  languageButton.querySelector('.language-code').textContent = language.toUpperCase();
  languageButton.setAttribute('aria-label', t('language'));
  document.querySelector('#theme').setAttribute('aria-label', t('light'));
  document.querySelector('#favorites-link').setAttribute('aria-label', t('favorites'));
  document.querySelector('#cart-link').setAttribute('aria-label', t('cart'));
  document.querySelector('#favorite-count').textContent = favorites.length;
  document.querySelector('#cart-count').textContent = Object.values(cart).reduce((a, n) => a + (Number(n) || 0), 0);
  const configureSocialLink = (element, href) => {
    if (!href) return;
    const pending = element.querySelector('small');
    if (element.tagName !== 'A') {
      const anchor = document.createElement('a');
      anchor.id = element.id;
      anchor.className = 'social-link';
      anchor.replaceChildren(...Array.from(element.childNodes).filter(node => node !== pending));
      element.replaceWith(anchor);
      element = anchor;
    } else pending?.remove();
    element.href = href;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
  };
  let facebookUrl = '';
  try {
    const candidate = new URL(config.facebook);
    if (['http:', 'https:'].includes(candidate.protocol)) facebookUrl = candidate.href;
  } catch {}
  configureSocialLink(document.querySelector('#footer-facebook'), facebookUrl);
  configureSocialLink(document.querySelector('#footer-whatsapp'), /^\d{8,15}$/.test(config.whatsapp) ? `https://wa.me/${config.whatsapp}` : '');
}
function card(item) {
  const saved = favorites.includes(item.uuid);
  return `<article class="card"><div class="card-image"><a href="${link(item)}" data-link><img src="${esc(productImage(item))}" alt="${esc(local(item,'nombre'))}"></a><button type="button" class="favorite" data-favorite="${esc(item.uuid)}" aria-label="${esc(t(saved?'unfavorite':'favorite'))}" aria-pressed="${saved}">${saved?'♥':'♡'}</button></div><div class="card-body"><span class="category">${esc(local(item,'categoria'))}</span><h3><a href="${link(item)}" data-link>${esc(local(item,'nombre'))}</a></h3><span class="price">${price(item.precio)}</span></div></article>`;
}
const cards = items => items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<div class="empty">${t('empty')}</div>`;
const skeleton = () => `<div class="grid">${Array.from({length:4},()=>'<div class="skeleton"></div>').join('')}</div>`;
function errorBox() { return `<div class="error" role="alert"><img src="${logo}" alt=""><p>${t('error')}</p><button class="button secondary" type="button" data-retry>${t('retry')}</button></div>`; }
async function loadProducts() {
  const {data, error} = await supabase.from('productos').select('*').eq('estado','activo').order('nombre');
  if (error) throw error;
  products = data;
  return products;
}
async function loadGallery() {
  const {data, error} = await supabase.from('galeria').select('*').eq('estado','activo').order('posicion');
  if (error) throw error;
  gallery = data;
  return gallery;
}
function heading(label, title, text) {
  return `<div class="catalog-head wrap"><p class="eyebrow">${t(label)}</p><h1>${t(title)}</h1><p class="muted">${t(text)}</p></div>`;
}
function renderHome() {
  main.innerHTML = `<section id="inicio" class="hero" data-nav-section="home"><div class="wrap hero-copy"><p class="eyebrow">${t('heroLabel')}</p><h1>${t('heroTitle')}</h1><p>${t('heroText')}</p><a class="button" href="/productos" data-link>${t('shop')} →</a></div></section><section id="catalogo" class="section wrap" data-nav-section="products"><div class="section-heading"><div><p class="eyebrow">${t('catalogLabel')}</p><h2>${t('featured')}</h2></div><p>${t('featuredText')}</p></div><div id="product-results">${skeleton()}</div><p><a class="button secondary" href="/productos" data-link>${t('all')} →</a></p></section>${infoSections(true)}`;
  normalizeTapestry();
}
function renderCatalog() {
  main.innerHTML = `${heading('catalogLabel','catalogTitle','catalogText')}<section class="wrap section" style="padding-top:0"><div class="controls"><input class="field" id="search" type="search" placeholder="${t('search')}" aria-label="${t('search')}"><select class="field" id="category" aria-label="${t('categories')}"><option value="">${t('categories')}</option></select></div><div id="product-results">${skeleton()}</div></section>`;
}
function updateCatalog() {
  const target = document.querySelector('#product-results');
  if (!target) return;
  const search = document.querySelector('#search')?.value.trim().toLocaleLowerCase() || '';
  const category = document.querySelector('#category')?.value || '';
  const filtered = products.filter(p => (!category || p.categoria === category) && `${local(p,'nombre')} ${local(p,'categoria')} ${local(p,'descripcion')}`.toLocaleLowerCase().includes(search));
  target.innerHTML = cards(location.pathname === '/' ? filtered.slice(0,4) : filtered);
}
function populateCategories() {
  const select = document.querySelector('#category');
  if (!select) return;
  const categories = [...new Set(products.map(p=>p.categoria).filter(Boolean))].sort();
  select.innerHTML = `<option value="">${t('categories')}</option>` + categories.map(c => `<option value="${esc(c)}">${esc(language === 'en' ? local(products.find(p => p.categoria === c),'categoria') : c)}</option>`).join('');
}
function renderDetail(item) {
  if (!item) { main.innerHTML = `${heading('catalogLabel','notFound','unavailable')}<div class="wrap section"><a class="button" data-link href="/productos">${t('back')}</a></div>`; return; }
  const imgs = item.imagenes?.length ? item.imagenes : [logo];
  main.innerHTML = `<div class="wrap"><a class="back" href="/productos" data-link>← ${t('back')}</a><section class="detail"><div><div class="detail-image"><img id="detail-image" src="${esc(imageUrl(imgs[0]))}" alt="${esc(local(item,'nombre'))}"></div>${imgs.length>1?`<div class="thumbs">${imgs.map((src,i)=>`<button data-image="${esc(imageUrl(src))}" aria-label="${t('showImage')} ${i+1}"><img src="${esc(imageUrl(src))}" alt=""></button>`).join('')}</div>`:''}</div><div><p class="eyebrow">${esc(local(item,'categoria'))}</p><h1>${esc(local(item,'nombre'))}</h1><p class="price">${price(item.precio)}</p><p>${esc(local(item,'descripcion'))}</p><div class="detail-actions"><button class="button" data-add="${esc(item.uuid)}">${t('add')}</button><button class="button secondary" data-favorite="${esc(item.uuid)}">${t(favorites.includes(item.uuid)?'unfavorite':'favorite')} ${favorites.includes(item.uuid)?'♥':'♡'}</button></div></div></section></div>`;
  document.title = `${local(item,'nombre')} | YaZú`;
}
function videoSlot(id) {
  return id ? `<figure class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="${t('videosTitle')}" loading="lazy" allowfullscreen></iframe></figure>` : `<figure class="video-frame video-soon"><div><img src="${logo}" alt=""><p>${t('videoSoon')}</p></div></figure>`;
}
function infoSections(includeIntro = false) {
  const intro = includeIntro ? `<section id="historia" class="section history-intro" data-nav-section="history"><div class="wrap"><p class="eyebrow">${t('infoLabel')}</p><h2>${t('infoTitle')}</h2><p>${t('infoText')}</p></div></section>` : '';
  return `${intro}<div class="wrap info-nav"><a href="#emprendimientos">${t('ventures')}</a><a href="#servicios">${t('services')}</a><a href="#mapa">${t('map')}</a><a href="#galeria">${t('gallery')}</a>  <a href="#contacto">${t('contact')}</a></div><section id="videos" class="section wrap" data-nav-section="history"><p class="eyebrow">${t('videosLabel')}</p><h2>${t('videosTitle')}</h2><p class="muted">${t('videosText')}</p><div class="video-grid"><figure class="video-frame"><video controls preload="metadata" playsinline src="/assets/videos/chaperno.mp4" title="${t('videosTitle')}"></video></figure>${videoSlot(config.youtube?.[0])}${videoSlot(config.youtube?.[1])}</div></section><section id="emprendimientos" class="section fondo fondo-1" data-nav-section="history"><div class="wrap feature"><img class="feature-photo" src="/assets/decorativas/foto-1.jpg" alt=""><div><p class="eyebrow">${t('ventures')}</p><h2>${t('ventureTitle')}</h2><p>${t('ventureText')}</p></div></div></section><section id="servicios" class="section fondo fondo-2" data-nav-section="history"><div class="wrap"><p class="eyebrow">${t('services')}</p><h2>${t('services')}</h2><p>${t('pending')}</p></div></section><section id="mapa" class="section soft" data-nav-section="history"><div class="wrap"><p class="eyebrow">${t('map')}</p><h2>${t('location')}</h2><iframe class="map" title="${t('mapTitle')}" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-84.1746111%2C9.8661389%2C-84.1146111%2C9.9261389&amp;layer=mapnik&amp;marker=9.8961389%2C-84.1446111"></iframe><p><a href="https://www.openstreetmap.org/?mlat=9.8961389&amp;mlon=-84.1446111#map=13/9.8961389/-84.1446111" target="_blank" rel="noopener noreferrer">OpenStreetMap ↗</a></p></div></section><section id="galeria" class="section wrap" data-nav-section="history"><p class="eyebrow">${t('gallery')}</p><h2>${t('gallery')}</h2><div class="photo-strip"><img src="/assets/decorativas/foto-2.jpg" alt=""><img src="/assets/decorativas/foto-3.jpg" alt=""></div><div id="gallery-results">${skeleton()}</div></section><section id="contacto" class="section fondo fondo-3" data-nav-section="history"><div class="wrap"><p class="eyebrow">${t('contact')}</p><h2>${t('write')}</h2><p><a href="mailto:ecomonzu@gmail.com">ecomonzu@gmail.com</a></p><p><a href="https://www.instagram.com/chapernoagroeco/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>${config.facebook ? ` · <a href="${esc(imageUrl(config.facebook))}" target="_blank" rel="noopener noreferrer">Facebook ↗</a>` : ''}</p>${config.sinpe ? `<p>${t('sinpe')}: ${esc(config.sinpe)}</p>` : ''}</div></section>`;
}
function normalizeTapestry() {
  const venture = document.querySelector('#emprendimientos');
  const services = document.querySelector('#servicios');
  if (!venture || !services || venture.parentElement?.classList.contains('tapestry')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'tapestry';
  venture.before(wrapper);
  wrapper.append(venture, services);
}
function renderInfo() {
  main.innerHTML = `${heading('infoLabel','infoTitle','infoText')}${infoSections()}`;
  normalizeTapestry();
  main.querySelector('.catalog-head').classList.add('history-page-heading');
}
function renderGallery() {
  const target = document.querySelector('#gallery-results');
  if (!target) return;
  target.innerHTML = gallery.length ? `<div class="gallery-grid">${gallery.map(item=>`<figure><img src="${esc(imageUrl(item.imagen_url))}" alt="${esc(item.titulo || t('galleryImage'))}"><figcaption>${esc(item.titulo || '')}</figcaption></figure>`).join('')}</div>` : `<div class="placeholder"><div><img src="${logo}" alt=""><p>${t('galleryEmpty')}</p></div></div>`;
}
function favoritesSyncPanel() {
  if (authUser) return `<section class="favorite-sync" aria-labelledby="favorite-sync-title"><div><h2 id="favorite-sync-title">${t('syncTitle')}</h2><p>${t('signedInAs')} <strong>${esc(authUser.email || '')}</strong></p></div><div class="favorite-sync-actions"><button class="button" type="button" data-favorites-sync>${t('syncFavorites')}</button><button class="button secondary" type="button" data-auth-signout>${t('signOut')}</button></div><p class="favorite-sync-message" id="favorite-sync-message" role="status">${esc(authMessage)}</p></section>`;
  return `<section class="favorite-sync" aria-labelledby="favorite-sync-title"><div><h2 id="favorite-sync-title">${t('syncTitle')}</h2><p>${t('syncText')}</p></div><div class="auth-mode" role="group" aria-label="${t('syncTitle')}"><button type="button" data-auth-mode="signup" aria-pressed="${authMode === 'signup'}">${t('createAccount')}</button><button type="button" data-auth-mode="signin" aria-pressed="${authMode === 'signin'}">${t('signIn')}</button></div><form class="favorite-auth-form" id="favorite-auth-form"><label>${t('email')}<input class="field" type="email" name="email" autocomplete="email" required maxlength="254"></label><label>${t('password')}<input class="field" type="password" name="password" autocomplete="${authMode === 'signup' ? 'new-password' : 'current-password'}" required minlength="6"></label><button class="button" type="submit">${t(authMode === 'signup' ? 'createAccountAction' : 'signInAction')}</button><p class="favorite-sync-message" id="favorite-sync-message" role="status">${esc(authMessage)}</p></form></section>`;
}
function renderList(kind) {
  const isCart = kind === 'cart';
  const items = products.filter(p => isCart ? Number(cart[p.uuid]) > 0 : favorites.includes(p.uuid));
  const rows = items.map(p => `<article class="list-item"><a href="${link(p)}" data-link><img src="${esc(productImage(p))}" alt="${esc(local(p,'nombre'))}"></a><div><h3><a href="${link(p)}" data-link>${esc(local(p,'nombre'))}</a></h3><span class="price">${price(p.precio)}</span></div><div class="list-actions">${isCart?`<label class="quantity">${t('quantity')} <input class="field" type="number" min="1" max="999" value="${Number(cart[p.uuid])}" data-quantity="${esc(p.uuid)}"></label><button class="text-button" data-remove="${esc(p.uuid)}">${t('remove')}</button>`:`<button class="text-button" data-favorite="${esc(p.uuid)}">${t('unfavorite')}</button>`}</div></article>`).join('');
  const total = totalPrice(items);
  const enabled = /^\d{8,15}$/.test(config.whatsapp);
  main.innerHTML = `${heading('catalogLabel',isCart?'cart':'favorites',isCart?'cartText':'favoritesText')}<div class="wrap section" style="padding-top:0">${isCart?'':favoritesSyncPanel()}<div class="${isCart && items.length?'checkout':''}"><div class="list">${rows || `<div class="empty">${t(isCart?'cartEmpty':'favoritesEmpty')}</div>`}</div>${isCart && items.length?`<form class="summary" id="checkout"><div class="total"><strong>${t('total')}</strong><strong>${price(total)}</strong></div><label>${t('name')}<input class="field" name="name" required maxlength="120"></label><label>${t('contactField')}<input class="field" type="tel" name="contact" autocomplete="tel" required maxlength="30"></label><label>${t('locality')}<input class="field" name="locality" maxlength="150"></label><label>${t('delivery')}<select class="field" name="delivery" required><option value="">${t('chooseDelivery')}</option><option value="delivery">${t('homeDelivery')}</option><option value="pickup">${t('pickup')}</option></select></label><p class="quote-payment">${t('paymentInfo')}: ${esc(config.sinpe)}</p><button class="button" type="submit" ${enabled?'':'disabled'}>${t('send')}</button>${enabled?'':`<p class="muted">${t('whatsappPending')}</p>`}</form>`:''}</div></div>`;
}
function readSyncedFavorites(userId) {
  const state = storage.get('favoritesSyncState', {});
  return Array.isArray(state?.[userId]) ? state[userId] : null;
}
function saveSyncedFavorites(userId, ids) {
  const state = storage.get('favoritesSyncState', {});
  state[userId] = ids;
  storage.set('favoritesSyncState', state);
}
async function syncFavorites() {
  authMessage = t('authWorking');
  renderList('favorites');
  try {
    const userId = authUser.id;
    const {data, error} = await supabase.from('favoritos_usuario').select('product_ids').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    const remoteIds = Array.isArray(data?.product_ids) ? data.product_ids : [];
    const previousIds = readSyncedFavorites(userId);
    const allIds = new Set([...favorites, ...remoteIds, ...(previousIds || [])]);
    const merged = [...allIds].filter(id => {
      if (!previousIds) return favorites.includes(id) || remoteIds.includes(id);
      const base = previousIds.includes(id);
      const local = favorites.includes(id);
      const remote = remoteIds.includes(id);
      const localChanged = local !== base;
      const remoteChanged = remote !== base;
      if (localChanged && !remoteChanged) return local;
      if (remoteChanged && !localChanged) return remote;
      if (localChanged && remoteChanged) return local;
      return base;
    });
    const {error: saveError} = await supabase.from('favoritos_usuario').upsert({user_id:userId, product_ids:merged}, {onConflict:'user_id'});
    if (saveError) throw saveError;
    favorites = merged;
    storage.set('favorites', favorites);
    saveSyncedFavorites(userId, merged);
    updateHeader();
    authMessage = t('syncComplete');
  } catch (error) {
    console.error('Error al sincronizar favoritos:', error);
    authMessage = t('syncFailed');
  }
  renderList('favorites');
}
function initializeAuth() {
  supabase.auth.onAuthStateChange((_event, session) => {
    authUser = session?.user || null;
    if (location.pathname === '/favoritos' && products.length) renderList('favorites');
  });
  supabase.auth.getSession().then(({data, error}) => {
    if (error) throw error;
    authUser = data.session?.user || null;
    if (location.pathname === '/favoritos' && products.length) renderList('favorites');
  }).catch(error => console.error('No se pudo recuperar la sesión:', error));
}
async function render() {
  const id = ++renderId;
  let path = location.pathname.replace(/\/+$/, '') || '/';
  const knownPage = ['/', '/productos', '/informacion', '/favoritos', '/carrito'].includes(path) || /^\/producto\/[a-z0-9-]+$/.test(path);
  if (!knownPage) {
    history.replaceState({}, '', '/');
    path = '/';
  }
  updateHeader(); document.title = 'YaZú | Productos con raíces';
  setActiveNavigation(path === '/productos' || path.startsWith('/producto/') ? 'products' : path === '/informacion' ? 'history' : 'home');
  if (path === '/informacion') {
    renderInfo();
    observeNavigationSections();
    try { await loadGallery(); if (id === renderId) renderGallery(); }
    catch (error) { console.error('Error al cargar galería:', error); if (id === renderId) document.querySelector('#gallery-results').innerHTML = errorBox(); }
    scrollToCurrentHash();
    return;
  }
  if (path === '/') {
    renderHome();
    observeNavigationSections();
    loadGallery().then(() => { if (id === renderId) renderGallery(); }).catch(error => {
      console.error('Error al cargar galería:', error);
      if (id === renderId) document.querySelector('#gallery-results').innerHTML = errorBox();
    });
  }
  else if (path === '/productos') renderCatalog();
  else main.innerHTML = `<div class="wrap loading" role="status">${skeleton()}</div>`;
  try {
    await loadProducts();
    if (id !== renderId) return;
    if (path === '/' || path === '/productos') { populateCategories(); updateCatalog(); }
    else if (path.startsWith('/producto/')) renderDetail(products.find(p => p.slug === decodeURIComponent(path.slice('/producto/'.length))));
    else if (path === '/carrito') renderList('cart');
    else if (path === '/favoritos') renderList('favorites');
    else main.innerHTML = `${heading('catalogLabel','notFound','unavailable')}`;
    if (path === '/') scrollToCurrentHash();
  } catch (error) {
    console.error('Error al cargar productos:', error);
    if (id === renderId) { const target = document.querySelector('#product-results') || main; target.innerHTML = errorBox(); }
  }
}
function scrollToCurrentHash() {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  target.scrollIntoView({behavior,block:'start'});
}
function navigate(url) {
  const destination = new URL(url, location.href);
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  if (destination.origin === location.origin && destination.pathname === currentPath) {
    if (destination.href !== location.href) history.pushState({}, '', destination.href);
    const target = destination.hash ? document.getElementById(decodeURIComponent(destination.hash.slice(1))) : main;
    if (target) {
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      target.scrollIntoView({behavior,block:'start'});
    }
    return;
  }
  history.pushState({}, '', destination.href);
  if (!destination.hash) window.scrollTo(0,0);
  render();
}
document.addEventListener('click', event => {
  const anchor = event.target.closest('a[data-link]');
  if (anchor && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); navigate(anchor.href); return; }
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) {
    const id = favorite.dataset.favorite;
    favorites = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id];
    storage.set('favorites', favorites); updateHeader();
    if (location.pathname === '/favoritos') renderList('favorites');
    else if (location.pathname.startsWith('/producto/')) renderDetail(products.find(p=>p.slug===decodeURIComponent(location.pathname.slice(10))));
    else updateCatalog();
  }
  const authModeButton = event.target.closest('[data-auth-mode]');
  if (authModeButton) { authMode = authModeButton.dataset.authMode; authMessage = ''; renderList('favorites'); }
  if (event.target.closest('[data-favorites-sync]')) syncFavorites();
  if (event.target.closest('[data-auth-signout]')) {
    supabase.auth.signOut().then(({error}) => {
      if (error) throw error;
      authMessage = t('signedOut');
      renderList('favorites');
    }).catch(error => { console.error('Error al cerrar sesión:', error); authMessage = t('authFailed'); renderList('favorites'); });
  }
  const add = event.target.closest('[data-add]');
  if (add) { cart[add.dataset.add] = Math.min(999, (Number(cart[add.dataset.add]) || 0) + 1); storage.set('cart',cart); updateHeader(); notify(t('added')); }
  const remove = event.target.closest('[data-remove]');
  if (remove) { delete cart[remove.dataset.remove]; storage.set('cart',cart); updateHeader(); renderList('cart'); }
  const image = event.target.closest('[data-image]');
  if (image) document.querySelector('#detail-image').src = image.dataset.image;
  if (event.target.closest('[data-retry]')) render();
});
document.addEventListener('input', event => {
  if (event.target.id === 'search') updateCatalog();
  if (event.target.closest('#checkout')) event.target.setCustomValidity('');
});
document.addEventListener('change', event => {
  if (event.target.id === 'category') updateCatalog();
  if (event.target.matches('[data-quantity]')) {
    const n = Math.max(1, Math.min(999, Math.floor(Number(event.target.value) || 1)));
    cart[event.target.dataset.quantity] = n; storage.set('cart',cart); updateHeader(); renderList('cart');
  }
});
document.addEventListener('submit', event => {
  if (event.target.id === 'favorite-auth-form') {
    event.preventDefault();
    const form = new FormData(event.target);
    const email = String(form.get('email')).trim();
    const password = String(form.get('password'));
    const submit = event.target.querySelector('[type="submit"]');
    submit.disabled = true;
    authMessage = t('authWorking');
    const request = authMode === 'signup'
      ? supabase.auth.signUp({email, password})
      : supabase.auth.signInWithPassword({email, password});
    request.then(({data, error}) => {
      if (error) throw error;
      authMessage = authMode === 'signup' ? (data.session ? t('signedUp') : t('checkEmail')) : t('signedUp');
      if (location.pathname === '/favoritos') renderList('favorites');
    }).catch(error => {
      console.error('Error de autenticación:', error);
      authMessage = t('authFailed');
      if (location.pathname === '/favoritos') renderList('favorites');
    }).finally(() => { if (location.pathname === '/favoritos') renderList('favorites'); });
    return;
  }
  if (event.target.id !== 'checkout') return;
  event.preventDefault();
  if (!/^\d{8,15}$/.test(config.whatsapp)) { notify(t('whatsappPending')); return; }
  for (const input of event.target.querySelectorAll('input[required], select[required]')) {
    input.setCustomValidity(input.value.trim() ? '' : (language === 'es' ? 'Completa este campo.' : 'Please complete this field.'));
    if (!input.reportValidity()) return;
  }
  const form = new FormData(event.target);
  const items = products.filter(p=>Number(cart[p.uuid]) > 0);
  const lines = items.map(p=>`- ${local(p,'nombre')} × ${cart[p.uuid]} (${price(Number(p.precio)*Number(cart[p.uuid]))})`);
  const total = totalPrice(items);
  const delivery = String(form.get('delivery'));
  const message = [t('quote'),...lines,`${t('total')}: ${price(total)}`,`${t('client')}: ${String(form.get('name')).trim()}`,`${t('contactInfo')}: ${String(form.get('contact')).trim()}`,`${t('delivery')}: ${t(delivery === 'delivery' ? 'homeDelivery' : 'pickup')}`,...(String(form.get('locality')).trim() ? [`${t('localityInfo')}: ${String(form.get('locality')).trim()}`] : []),`${t('payment')}: ${t('sinpe')} (${config.sinpe})`].join('\n');
  window.open(`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.addEventListener('error', event => { if (event.target instanceof HTMLImageElement && !event.target.src.endsWith(logo)) event.target.src = logo; }, true);
document.querySelector('#language').addEventListener('click', () => { language = language === 'es' ? 'en' : 'es'; storage.set('language',language); render(); });
document.querySelector('#theme').addEventListener('click', () => { theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; storage.set('theme',theme); setTheme(); });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!theme) setTheme(); });
window.addEventListener('popstate', render);
initializeAuth(); setTheme(); render();
