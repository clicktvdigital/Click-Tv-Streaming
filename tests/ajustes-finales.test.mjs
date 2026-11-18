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
  // La Mini TV queda fuera de los acordeones para poder reproducirse sola.
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
