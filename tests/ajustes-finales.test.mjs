// Ajustes finales 18/11/2026: marca, banner Black Days, partidos, acordeones y limpieza del Mundial.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');
const html = leer('index.html');
const script = leer('script.js');

test('marca: el sitio se presenta como Click TV Streaming, dentro de Click TV Digital', () => {
  assert.match(html, /<footer class="footer">[\s\S]*<strong>Click TV Streaming<\/strong>\s*<p>Una marca de Click TV Digital\.<\/p>/);
  assert.match(html, /aria-label="Click TV Streaming, inicio"/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="Click TV Streaming">/);
  assert.equal(JSON.parse(leer('manifest.webmanifest')).name, 'Click TV Streaming');
  assert.doesNotMatch(html, /CLICK TV inicio|Click Tv Streaming|Subtotal Click TV<|Recomienda Click TV</);
});

test('banner Black Days: imagen oficial en el aviso de promociones, liviana y sin recortes', () => {
  const aviso = html.slice(html.indexOf('id="black-days-aviso"'), html.indexOf('class="container stats-grid"'));
  assert.match(aviso, /<picture>[\s\S]*black-days-540\.webp 540w, assets\/images\/black-days-1080\.webp 1080w[\s\S]*<img src="assets\/images\/black-days\.jpg" width="1296" height="1616" loading="lazy"/);
  assert.match(aviso, /alt="Black Days de Click TV Streaming[^"]+"/);
  assert.ok(statSync(new URL('../assets/images/black-days.jpg', import.meta.url)).size > 10_000);
  for (const ancho of [540, 1080]) {
    const peso = statSync(new URL(`../assets/images/black-days-${ancho}.webp`, import.meta.url)).size;
    assert.ok(peso > 10_000 && peso < 250_000, `webp ${ancho}: ${peso} bytes`);
  }
  assert.match(leer('clicktv-ajustes-finales-2026.css'), /\.ctv-bd-aviso__imagen img \{[^}]*object-fit: contain;/);
});

test('limpieza: sin «Ideal para el Mundial» y con mensajes de fin de año', () => {
  const archivos = ['index.html', 'data.js', 'script.js', 'catalogo.js', ...readdirSync(new URL('..', import.meta.url)).filter((f) => /^clicktv-.*\.js$/.test(f))];
  for (const archivo of archivos) assert.doesNotMatch(leer(archivo), /ideal para el mundial/i, archivo);
  assert.match(leer('data.js'), /🎄 IDEAL PARA FIN DE AÑO/);
  assert.doesNotMatch(html, /Primero mostramos los partidos del Mundial/);
});

test('partidos: sin mapa ni enlace de indicaciones, banderas grandes y datos en retícula sin huecos', () => {
  assert.doesNotMatch(script, /google\.com\/maps|match-indicaciones|Cómo llegar/);
  const extraer = (nombre) => {
    const i = script.indexOf(`function ${nombre}(`);
    assert.ok(i >= 0, nombre);
    return script.slice(i, script.indexOf('\n}\n', i) + 2);
  };
  const ctx = createContext({});
  runInContext(['escaparHTML', 'formatearFechaPartidoCliente', 'formatearHoraPartidoCliente', 'crearDatosPartido', 'crearEmblemaEquipo', 'obtenerBanderaEquipo', 'normalizarTextoPais'].map(extraer).join('\n'), ctx);
  const fecha = new Date('2026-11-20T01:00:00Z');
  const conSede = ctx.crearDatosPartido({}, fecha, 'Estadio Rodrigo Paz <Casa Blanca>');
  assert.match(conSede, /class="match-datos match-datos--3"/);
  assert.equal((conSede.match(/class="match-dato"/g) || []).length, 3);
  assert.match(conSede, /Estadio Rodrigo Paz &lt;Casa Blanca&gt;/, 'escapa el nombre del estadio');
  assert.match(conSede, /20:00/, 'hora de Ecuador');
  const sinSede = ctx.crearDatosPartido({}, fecha, '');
  assert.match(sinSede, /match-datos--2/);
  assert.equal((sinSede.match(/class="match-dato"/g) || []).length, 2, 'sin estadio no queda una celda vacía');
  assert.match(ctx.crearEmblemaEquipo('Ecuador', 'ECU', ''), /class="team-flag team-flag--grande" role="img" aria-label="Bandera de Ecuador">🇪🇨/);
  assert.match(ctx.crearEmblemaEquipo('Liga de Quito', '', 'https://x.test/ldu.png'), /<img class="mundial-escudo" src="https:\/\/x\.test\/ldu\.png" alt="" width="64" height="64"/);
  assert.match(ctx.crearEmblemaEquipo('Independiente del Valle', '', ''), /team-flag--iniciales[^>]*>ID</);
  // El nombre aparece una sola vez por equipo (antes se repetía junto a la bandera).
  const card = extraer('crearCardPartido');
  assert.doesNotMatch(card, /crearNombreEquipoConBandera/);
  const css = leer('clicktv-ajustes-finales-2026.css');
  assert.match(css, /#mundial \.team-flag--grande \{[^}]*width: 44px;[^}]*height: 32px;[^}]*font-size: 2rem;/, 'bandera en caja fija');
  // Formato horizontal: equipos en fila (visitante en espejo) y datos en una sola fila de 2 o 3 celdas.
  // Marcador deportivo en filas: [bandera Nombre] por equipo y el marcador a la derecha de ambas filas.
  assert.match(css, /#mundial \.mundial-duelo \{[^}]*grid-template-columns: minmax\(0, 1fr\) auto;[^}]*grid-template-areas: "local marcador" "visitante marcador";/);
  assert.match(css, /#mundial \.mundial-team \{[^}]*display: flex;[^}]*flex-direction: row !important;/);
  // El nombre se lee completo: ocupa el espacio libre (flex-grow), salta de línea entre palabras y sin «…».
  assert.match(css, /#mundial \.mundial-team strong \{[^}]*flex: 1 1 0;[^}]*min-width: 0;[^}]*white-space: normal;[^}]*overflow-wrap: break-word;[^}]*word-break: normal;/, 'nombre completo');
  assert.doesNotMatch(css.slice(css.indexOf('#mundial .mundial-team strong {'), css.indexOf('#mundial .mundial-marcador {\n')), /ellipsis|nowrap/, 'sin recortes');
  assert.match(css, /@media \(max-width: 420px\) \{[^@]*#mundial \.team-flag--grande \{ width: 36px;/, 'en Android estrecho la bandera cede espacio al nombre');
  assert.doesNotMatch(css, /row-reverse/, 'sin variantes en espejo');
  assert.doesNotMatch(css, /overflow-wrap: anywhere/, 'sin cortes a media palabra');
  // La tarjeta: clases por lado, nombres escapados con título y el contador solo antes del inicio.
  assert.match(card, /mundial-team mundial-team--\$\{lado\}/);
  assert.match(card, /<strong title="\$\{escaparHTML\(nombre\)\}">\$\{escaparHTML\(nombre\)\}<\/strong>/);
  assert.match(card, /const porEmpezar = fecha\.getTime\(\) > Date\.now\(\);/);
  assert.match(css, /#mundial \.match-datos--3 \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
  assert.doesNotMatch(css, /match-dato:last-child \{ grid-column/, 'sin celdas estiradas en vertical');
  const movil = leer('clicktv-movil-2col.css');
  assert.doesNotMatch(movil, /#mundial \.mundial-escudo \{ width: 28px/, 'sin la variante vertical diminuta');
  assert.match(movil, /#mundial \.mundial-cards \{[^}]*grid-template-columns: minmax\(0, 1fr\) !important;/, '1 tarjeta apaisada por fila en celular');
});

test('acordeones: cada sección larga es un <details> con su contenido dentro', () => {
  const seccion = (id) => {
    const i = html.indexOf(`<details class="`, html.lastIndexOf('<', html.indexOf(`id="${id}"`)));
    assert.ok(i >= 0, id);
    const apertura = html.slice(i, html.indexOf('>', i) + 1);
    assert.match(apertura, new RegExp(`id="${id}"`), `${id} es un <details>`);
    // Recorre hasta el </details> que lo cierra (admite <details> anidados).
    let nivel = 0;
    const re = /<details\b|<\/details>/g;
    re.lastIndex = i;
    for (let m; (m = re.exec(html));) {
      nivel += m[0] === '</details>' ? -1 : 1;
      if (nivel === 0) return html.slice(i, m.index);
    }
    assert.fail(`${id} sin cierre`);
  };
  const casos = {
    'acordeon-combo': ['🧩 Elegir productos del combo', 'id="combo-buscar"', 'id="ahorro-servicios"'],
    'acordeon-resena': ['✍️ Deja tu reseña', 'id="form-resena-publica"'],
    'acordeon-contacto': ['Activa hoy tu servicio', 'id="form-contacto-internacional"'],
    'clicktv-garantias': ['🛡️ Condiciones de uso y atención', 'clicktv-terms__grid'],
    'acordeon-resumen': ['🧾 Resumen estimado del pedido', 'id="ahorro-total"', 'id="ahorro-total-resumen"'],
    'acordeon-tv-vivo': ['Teleamazonas', 'id="teleamazonas-link-oficial"'],
    'acordeon-radio': ['📻 Radio en vivo', 'id="radio-app"', 'id="radio-player"']
  };
  for (const [id, contenidos] of Object.entries(casos)) {
    const bloque = seccion(id);
    assert.match(bloque, /^<details[^>]*>\s*<summary>/, `${id}: empieza con <summary>`);
    assert.doesNotMatch(bloque.slice(0, bloque.indexOf('>') + 1), /\bopen\b/, `${id}: cerrado al cargar`);
    for (const c of contenidos) assert.ok(bloque.includes(c), `${id} contiene ${c}`);
  }
  // Los botones para pedir el combo siguen visibles fuera del resumen plegado.
  assert.ok(!seccion('acordeon-resumen').includes('btn-ahorro-carrito'));
  // La Click TV Player queda fuera de los acordeones para poder reproducirse sola.
  for (const id of ['acordeon-radio', 'acordeon-tv-vivo']) assert.ok(!seccion(id).includes('ctv-tv-prueba'));
  assert.match(html, /<script src="clicktv-acordeones\.js\?v=[^"]+" defer><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="clicktv-ajustes-finales-2026\.css\?v=[^"]+">\n<\/head>|clicktv-ajustes-finales-2026\.css\?v=[^"]+">\s*<\/head>/, 'estilos finales al último');
});

test('reseña: «Deja tu reseña» carga cerrada y solo se abre con un clic o un enlace', () => {
  assert.match(html, /<details class="review-submit glass-card ctv-acordeon" id="acordeon-resena" data-inicio="cerrado">\s*<summary>/);
  const js = leer('clicktv-acordeones.js');
  assert.match(js, /querySelectorAll\('details\[data-inicio="cerrado"\]\[open\]'\)\.forEach\(\(d\) => \{ d\.open = false; \}\)/);
  assert.ok(js.indexOf('cerrarIniciales();') < js.indexOf('abrirPorHash(location.hash, true);\n'), 'se cierra antes de mirar el enlace');
  assert.match(js, /addEventListener\('pageshow'/, 'también al volver con Atrás');
  assert.match(leer('clicktv-ajustes-finales-2026.css'), /\.ctv-acordeon:not\(\[open\]\) > :not\(summary\) \{ display: none !important; \}/);

  // Simulación: aunque el navegador lo restaure abierto, al cargar queda cerrado.
  const resena = { tagName: 'DETAILS', open: true };
  const ctx = createContext({
    document: { readyState: 'complete', body: { tagName: 'BODY' }, addEventListener() {}, getElementById: () => null,
      querySelectorAll: (sel) => (sel.includes('data-inicio="cerrado"') && resena.open ? [resena] : []) },
    matchMedia: () => ({ matches: true }), MutationObserver: class { observe() {} }
  });
  ctx.window = ctx; ctx.location = { hash: '' }; ctx.window.addEventListener = () => {};
  runInContext(js, ctx);
  assert.equal(resena.open, false);
});

test('acordeones: un enlace o el menú abren el desplegable que contiene su destino', () => {
  const js = leer('clicktv-acordeones.js');
  assert.match(js, /addEventListener\('click'[\s\S]*abrirAcordeones\(destinoDeHash\(enlace\.getAttribute\('href'\)\)\)[\s\S]*\}, true\);/);
  assert.match(js, /addEventListener\('invalid', \(e\) => abrirAcordeones\(e\.target\), true\)/);
  assert.match(js, /reflejar\('ahorro-total', 'ahorro-total-resumen'\)/);
  assert.match(leer('clicktv-navegacion-movil.js'), /window\.ctvAcordeones\?\.abrir\(destino\);/);

  // abrirAcordeones abre todos los <details> ancestros.
  const ctx = createContext({ document: { readyState: 'complete', body: { tagName: 'BODY' }, addEventListener() {}, querySelectorAll: () => [] }, matchMedia: () => ({ matches: true }) });
  ctx.window = ctx; ctx.location = { hash: '' }; ctx.window.addEventListener = () => {};
  ctx.document.getElementById = () => null;
  ctx.MutationObserver = class { observe() {} };
  runInContext(js, ctx);
  const body = ctx.document.body;
  const externo = { tagName: 'DETAILS', open: false, parentElement: body };
  const interno = { tagName: 'DETAILS', open: false, parentElement: externo };
  const campo = { tagName: 'INPUT', parentElement: interno };
  assert.equal(ctx.ctvAcordeones.abrir(campo), true);
  assert.deepEqual([externo.open, interno.open], [true, true]);
  assert.equal(ctx.ctvAcordeones.abrir(campo), false, 'si ya estaban abiertos no hace nada');
});

test('Click TV Player: el reproductor se llama así en todo el sitio, sin «Mini TV»', () => {
  assert.match(html, /<strong id="ctv-tv-titulo" class="ctv-tv__titulo">🎬 Click TV Player<\/strong>/);
  assert.match(html, /aria-label="Contenido de Click TV Player"/);
  assert.match(html, /aria-label="Cerrar Click TV Player"/);
  for (const archivo of ['index.html', 'clicktv-mini-tv.js', 'data.js', 'script.js', 'clicktv-navegacion-movil.js']) {
    // Solo texto visible o comentarios; identificadores internos (ctvMiniTV, clicktv-mini-tv.js) no cuentan.
    assert.doesNotMatch(leer(archivo), /\bmini tv\b/i, archivo);
  }
});

test('Click TV Player: compartir en WhatsApp con mensaje optimizado y enlace directo a los planes IPTV', () => {
  const barra = html.slice(html.indexOf('class="ctv-tv__barra"'), html.indexOf('id="ctv-tv-estado"'));
  assert.match(barra, /<a id="ctv-tv-compartir" class="ctv-tv__icono ctv-tv__compartir" href="https:\/\/wa\.me\/" target="_blank" rel="noopener noreferrer" aria-label="Compartir en WhatsApp"/);
  const ctx = createContext({ console, URL, URLSearchParams }); ctx.window = ctx;
  runInContext(leer('clicktv-mini-tv.js'), ctx);
  const { enlacePlanes, mensajeCompartir, urlCompartir } = ctx.ctvMiniTV;

  const enlace = new URL(enlacePlanes());
  assert.equal(enlace.origin, 'https://click-tv-streaming.vercel.app');
  // Slug público de IPTV Premium: clicktv-enlaces-2026.js lo abre en la categoría IPTV con sus planes.
  assert.equal(enlace.searchParams.get('producto'), 'television-por-internet-premium');
  assert.match(leer('clicktv-enlaces-2026.js'), /const PALABRA_PUBLICA = 'television-por-internet';/);
  assert.equal(enlace.searchParams.get('utm_source'), 'whatsapp');

  const conPromo = mensajeCompartir(true);
  assert.match(conPromo, /^🎬 \*Click TV Player\* · Click TV Streaming\n/);
  assert.match(conPromo, /\*BLACK DAYS:\* hasta \*6 meses GRATIS\* en IPTV Básico, Premium y Ultra/);
  assert.ok(conPromo.endsWith(enlacePlanes()), 'el enlace va al final para que WhatsApp muestre la vista previa');
  const sinPromo = mensajeCompartir(false);
  assert.doesNotMatch(sinPromo, /BLACK DAYS/i, 'fuera de fechas no se anuncia la promo');
  assert.match(sinPromo, /Mira los planes IPTV/);

  const wa = new URL(urlCompartir(true));
  assert.equal(`${wa.origin}${wa.pathname}`, 'https://wa.me/');
  assert.equal(wa.searchParams.get('text'), conPromo);

  const js = leer('clicktv-mini-tv.js');
  assert.match(js, /if \(compartir\) compartir\.href = urlCompartir\(vigente\);/);
  assert.match(js, /compartir\?\.addEventListener\('click', \(\) => \{ compartir\.href = urlCompartir\(promoVigente\(\)\); \}\);/);
});

test('Botón Pro Black Days: oscuro con borde dorado y brillo rojo en el player, el aviso y la barra', () => {
  const css = leer('clicktv-ajustes-finales-2026.css');
  assert.match(css, /--ctv-pro-oro: #e6b94a;/);
  assert.match(css, /\.ctv-tv--promo-bd \.ctv-tv__cta,\n\.ctv-bd-aviso a\.btn\[data-bd-ver-iptv\],\n\.ctv-bd-barra \.ctv-bd-barra__boton \{[^}]*background: var\(--ctv-pro-fondo\) !important;[^}]*border: 1\.5px solid var\(--ctv-pro-oro\) !important;[^}]*color: #fff !important;/);
  assert.match(leer('clicktv-mini-tv.js'), /tarjeta\.classList\.toggle\('ctv-tv--promo-bd', vigente\);/);
});

test('unslop: sin prueba social simulada ni partículas decorativas', () => {
  const js = leer('script.js');
  for (const nombre of ['renderActividadReciente', 'actualizarUsuariosConectados', 'inicializarFondoDinamico']) {
    assert.doesNotMatch(js, new RegExp(`function ${nombre}\\(`), nombre);
  }
  assert.doesNotMatch(leer('data.js'), /ACTIVIDAD_RECIENTE/);
  assert.doesNotMatch(html, /id="actividad-reciente"|id="usuarios-conectados"|id="tech-particles"/);
});

test('unslop: párrafos sin emoji decorativo al inicio y titular en tipo oración', () => {
  const emoji = /<p>[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
  assert.doesNotMatch(html, emoji);
  assert.match(html, /<h1>Netflix, DAZN, IPTV y recargas, <em>activados<\/em> tras verificar tu pago<\/h1>/);
  const css = leer('clicktv-ajustes-finales-2026.css');
  assert.match(css, /\.hero \.hero__content h1 \{\s*text-transform: none !important;\s*font-weight: 800 !important;/);
  assert.match(css, /\.eyebrow,\n\.hero \.eyebrow,\n\.ctv-discovery__kicker,[\s\S]*?\{\s*text-transform: none !important;/);
  assert.match(leer('clicktv-accesible.js'), /<ol class="clicktv-help__pasos"><li>Elige tu servicio<\/li>/);
  assert.doesNotMatch(leer('clicktv-accesible.js'), /1️⃣|2️⃣|3️⃣/);
});

test('unslop: etiquetas de producto en tipo oración, sin emoji y con siglas/marcas intactas', () => {
  const ctx = createContext({ document: { addEventListener() {} } }); ctx.window = ctx;
  runInContext(leer('catalogo.js'), ctx);
  const casos = {
    '🎄 IDEAL PARA FIN DE AÑO': 'Ideal para fin de año', '🔥 MÁS VENDIDO': 'Más vendido', '🟣 CNT': 'CNT',
    '⚽ LIGA PRO ECUADOR': 'Liga Pro Ecuador', '📺 +40 CANALES': '+40 canales', '📶 WIFI': 'WiFi', '💎 PREMIUM': 'Premium'
  };
  for (const [entrada, salida] of Object.entries(casos)) assert.equal(ctx.ctvEtiquetaLegible(entrada), salida, entrada);
  assert.match(leer('catalogo.js'), /<span>\$\{escapar\(etiquetaLegible\(e\)\)\}<\/span>/);
});

test('unslop: carrito vacío limpio, sin desbordes en catálogo y menos capas fijas en Android', () => {
  const css = leer('clicktv-ajustes-finales-2026.css');
  assert.match(css, /#panel-carrito:has\(\.carrito-vacio\) :is\(\.cupon-box, \.cart-summary, \.cart-contact-options\) \{ display: none !important; \}/);
  assert.match(css, /#panel-carrito:has\(\.carrito-vacio\) \.cart-actions > :not\(#btn-continuar-comprando\) \{ display: none !important; \}/);
  assert.match(css, /\.product-tags span \{[^}]*white-space: normal !important;/);
  assert.match(css, /\.catalogo-ayuda__duda \{[^}]*white-space: normal !important;/);
  assert.match(css, /body\.ctv-bd-barra-visible \.ctv-asistente-btn__promo \{ display: none !important; \}/);
});
