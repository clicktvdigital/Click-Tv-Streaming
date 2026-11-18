// Precios IPTV con promo, pagos solo en el carrito, formulario internacional, combos y mini TV.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');
const contexto = createContext({ console });
contexto.window = contexto;
runInContext(leer('clicktv-formulario-contacto.js'), contexto);
const formulario = contexto.ctvFormularioContacto;

test('teléfono: el prefijo se agrega solo y se limpian ceros, espacios y signos', () => {
  assert.equal(formulario.telefonoCompleto('+593', '0991234567'), '+593 991234567');
  assert.equal(formulario.telefonoCompleto('+593', '099 123 4567'), '+593 991234567');
  assert.equal(formulario.telefonoCompleto('+593', '593991234567'), '+593 991234567', 'si lo escribe con código, no se duplica');
  assert.equal(formulario.telefonoCompleto('+1', '(555) 123-4567'), '+1 5551234567');
  assert.equal(formulario.telefonoCompleto('', '+44 7700 900123'), '+447700900123');
  assert.equal(formulario.telefonoCompleto('+51', ''), '');
  assert.equal(formulario.telefonoValido('0991234567'), true);
  assert.equal(formulario.telefonoValido('12345'), false);
  assert.equal(formulario.telefonoValido('123456789012345'), false);
});

test('buscador de países: por nombre sin acentos y por código', () => {
  assert.deepEqual([...formulario.filtrarPaises('peru')].map((p) => p.nombre), ['Perú']);
  assert.equal(formulario.filtrarPaises('593')[0].nombre, 'Ecuador');
  assert.equal(formulario.filtrarPaises('').length, formulario.PAISES.length);
  assert.equal(formulario.filtrarPaises('zzz').length, 0);
});

test('regiones: 24 provincias de Ecuador con cantones, y listas sin repetidos', () => {
  const provincias = Object.keys(formulario.ECUADOR);
  assert.equal(provincias.length, 24);
  assert.ok(formulario.ECUADOR['Pichincha'].includes('Quito'));
  assert.ok(formulario.ECUADOR['Guayas'].includes('Guayaquil'));
  for (const p of provincias) assert.ok(formulario.ECUADOR[p].length >= 2, p);
  for (const pais of formulario.PAISES) {
    assert.equal(new Set(pais.regiones).size, pais.regiones.length, pais.nombre);
    if (pais.nombre !== 'Otro país') assert.match(pais.prefijo, /^\+\d{1,3}$/, pais.nombre);
  }
  assert.equal(formulario.buscarPais('Estados Unidos').regiones.length, 51);
  assert.equal(formulario.buscarPais('México').regiones.length, 32);
});

test('la portada ya no muestra cuentas bancarias; siguen en el carrito', () => {
  const html = leer('index.html');
  const datos = createContext({ console }); datos.window = datos;
  runInContext(leer('data.js'), datos);
  const config = runInContext('CONFIG', datos);
  assert.doesNotMatch(html, /class="clicktv-bank"|id="ctv-banco-/);
  for (const numero of [config.bancoPichincha, config.bancoGuayaquil].filter(Boolean)) assert.ok(!html.includes(String(numero)), 'número de cuenta fuera de la portada');
  assert.match(html, /id="ctv-ver-datos-pago"/);
  assert.match(leer('script.js'), /Banco Pichincha: <b>\$\{CONFIG\.bancoPichincha\}<\/b>/, 'el carrito conserva los datos');
});

test('IPTV con promo: precios normales plegados y la promo reemplaza el plan normal en el carrito', () => {
  assert.match(leer('catalogo.js'), /<details class="ctv-bd-normales"><summary>Ver precios sin promoción/);
  assert.match(leer('clicktv-promo-black-days.js'), /details\.ctv-bd-normales'\);\n\s+if \(normales\) normales\.open = false;/);
  assert.match(leer('script.js'), /Se reemplazó el plan normal por la promo Black Days/);
});

test('mini TV: tráilers horizontales de estrenos 2026 y próximos, oficiales y doblados, en un iframe silenciado en bucle', () => {
  const datos = createContext({ console, URLSearchParams }); datos.window = datos;
  runInContext(leer('data.js'), datos);
  runInContext(leer('clicktv-mini-tv.js'), datos);
  const trailers = runInContext('CONFIG.trailersYouTube', datos);
  const { trailersValidos, urlInsercion } = datos.ctvMiniTV;
  assert.ok(trailers.length >= 3 && trailers.length <= 6, 'entre 3 y 6 tráilers');
  assert.equal(trailersValidos(trailers).length, trailers.length);
  const oficiales = ['Disney Studios LA', 'Warner Bros. Pictures Latinoamérica', 'Universal Pictures Latinoamérica', 'Sony Pictures Latinoamérica', 'Paramount Pictures Latinoamérica', 'Marvel Latinoamérica Oficial', 'Corazón Films'];
  for (const t of trailers) {
    assert.ok(oficiales.includes(t.canal), `${t.titulo}: canal oficial del estudio o distribuidora`);
    assert.equal(t.version, 'Doblado', `${t.titulo}: en español latino (doblado)`);
    assert.match(t.estreno, /^(\d{1,2} (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic) 202[6-9]|Estreno 2026|Próximamente)$/, `${t.titulo}: estreno 2026 o próximo`);
  }
  assert.ok(trailers.some((t) => /2026/.test(t.estreno)), 'incluye estrenos 2026');
  // Lo próximo primero: los que tienen fecha concreta van antes que «Estreno 2026» y «Próximamente».
  const conFecha = trailers.map((t) => /^\d/.test(t.estreno));
  assert.ok(conFecha.lastIndexOf(true) < Math.max(conFecha.indexOf(false), 0) || !conFecha.includes(false), 'próximos estrenos arriba');
  const url = new URL(urlInsercion('s_qpMMkvHYE', 'https://click-tv-streaming.vercel.app'));
  assert.equal(url.hostname, 'www.youtube-nocookie.com');
  for (const [k, v] of [['autoplay', '1'], ['mute', '1'], ['loop', '1'], ['playlist', 's_qpMMkvHYE'], ['playsinline', '1']]) assert.equal(url.searchParams.get(k), v, k);
  // Si el cliente pidió el tráiler (clic, tecla o selector), arranca con audio.
  const conSonido = new URL(urlInsercion('s_qpMMkvHYE', 'https://click-tv-streaming.vercel.app', true));
  assert.equal(conSonido.searchParams.get('mute'), '0');
  assert.equal(conSonido.searchParams.get('autoplay'), '1');
  const mini = leer('clicktv-mini-tv.js');
  assert.match(mini, /play\?\.addEventListener\('click', \(\) => \{ cerradoPorCliente = false; cargarCine\(true\); \}\);/);
  assert.match(mini, /selector\?\.addEventListener\('change', \(\) => \{[\s\S]*?cargarCine\(true\);/);
  assert.match(mini, /cambiarPestana\(clave, true\)/);
  assert.match(mini, /else if \(!iframe && !sinAutoplay\(\)\) cargarCine\(\);/, 'la carga automática al llegar sigue en silencio');
  assert.equal(trailersValidos([{ id: 'corto', titulo: 'X' }, { id: 's_qpMMkvHYE', titulo: '' }, { id: 's_qpMMkvHYE', titulo: 'A' }, { id: 's_qpMMkvHYE', titulo: 'B' }]).length, 1);
  assert.doesNotMatch(leer('data.js'), /canalesMiniTV|\.m3u8/, 'sin restos del reproductor HLS');
});

test('mini TV: pestaña «Click TV Oficial» con el video propio optimizado y CTA según Black Days', () => {
  const datos = createContext({ console, URLSearchParams }); datos.window = datos;
  runInContext(leer('data.js'), datos);
  runInContext(leer('clicktv-mini-tv.js'), datos);
  const promo = runInContext('CONFIG.videoPromo', datos);
  assert.equal(promo.url, 'assets/promo.mp4');
  const peso = statSync(new URL(`../${promo.url}`, import.meta.url)).size;
  assert.ok(peso > 100_000 && peso < 4_000_000, `video web liviano (${peso} bytes)`);
  assert.ok(statSync(new URL(`../${promo.poster}`, import.meta.url)).size > 1000, 'póster presente');
  const { textoCta } = datos.ctvMiniTV;
  assert.equal(textoCta(true), '🔥 ¡Activa tu IPTV Premium con Black Days!');
  assert.equal(textoCta(false), '🔥 ¡Activa tu IPTV Premium!');
  const html = leer('index.html');
  assert.match(html, /<video id="ctv-tv-promo"[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b/);
  // Controles nativos fuera: audio y volumen compactos en una píldora discreta dentro del video.
  assert.doesNotMatch(html.match(/<video id="ctv-tv-promo"[^>]*>/)[0], /\bcontrols\b/);
  for (const id of ['ctv-tv-pausa', 'ctv-tv-sonido', 'ctv-tv-volumen']) assert.match(html, new RegExp(`id="${id}"`), id);
  assert.match(html, /<input id="ctv-tv-volumen"[^>]*type="range"[^>]*aria-label="Volumen del video"/);
  const css = leer('clicktv-ajustes-finales-2026.css');
  assert.match(css, /\.ctv-tv__audio-btn \{[^}]*width: 30px;[^}]*height: 30px;/, 'botones compactos');
  assert.match(css, /\.ctv-tv__volumen \{[^}]*width: 84px;/, 'volumen compacto');
  // Misma paleta que el volumen de la radio.
  assert.match(css, /\.ctv-tv__volumen::-webkit-slider-thumb \{[^}]*border: 2px solid #cceaff;[^}]*background: #65c0ff;/);
  assert.match(css, /#ctv-tv-sonido\[aria-pressed="true"\] \{ background: #279bff; \}/);
  // El volumen se recuerda, al activar sonido vuelve al último nivel, y en iOS se oculta el deslizador.
  const js = leer('clicktv-mini-tv.js');
  assert.match(js, /const CLAVE_VOLUMEN = 'clicktv_minitv_volumen';/);
  assert.match(js, /btnSonido\?\.addEventListener\('click', \(\) => \{\s*if \(enSilencio\(\)\) activarSonido\(\);\s*else \{ silenciadoPorCliente = true; fijarVolumen\(0\); \}/);
  assert.match(js, /if \(volumen && video\.volume !== nivel\) volumen\.hidden = true;/);
  // Paridad con YouTube: tocar el video o ▶ habilita el audio dentro del mismo gesto, y si estaba detenido, reproduce.
  assert.match(js, /function activarSonido\(\) \{\s*silenciadoPorCliente = false;\s*quiereSonido = true;\s*fijarVolumen\(nivel\);\s*if \(video\.paused\) reproducir\(\);/);
  assert.match(js, /video\.addEventListener\('click', \(\) => \{\s*const soloMostrar = ocultosAlTocar;\s*ocultosAlTocar = false;\s*if \(!video\.paused && enSilencio\(\) && !silenciadoPorCliente\) activarSonido\(\);\s*else if \(!soloMostrar\) btnPausa\?\.click\(\);/);
  // Auto-ocultar como YouTube: 3 s sin actividad reproduciendo; en pausa, con foco o arrastrando, siguen visibles.
  assert.match(js, /const ESPERA_OCULTAR = 3000;/);
  assert.match(js, /if \(video\.paused \|\| arrastrando \|\| pildora\?\.querySelector\(':focus-visible'\)\) return;\s*tarjeta\.classList\.add\('ctv-tv--controles-ocultos'\);/);
  assert.match(js, /marco\.addEventListener\('pointerdown', \(\) => \{ ocultosAlTocar = ocultos\(\); mostrarControles\(\); \}\);/);
  assert.match(css, /\.ctv-tv--controles-ocultos \.ctv-tv__audio \{[^}]*opacity: 0;[^}]*visibility: hidden;[^}]*pointer-events: none;/);
  assert.match(js, /if \(enSilencio\(\) && !silenciadoPorCliente\) activarSonido\(\); else reproducir\(\);/);
  assert.match(js, /escuchar\?\.addEventListener\('click', activarSonido\);/);
  assert.match(html, /<button id="ctv-tv-escuchar" class="ctv-tv__escuchar" type="button" hidden>/);
  // Las reglas globales dan min-height 48px a button e input: los controles compactos la anulan.
  assert.match(css, /\.ctv-tv__audio-btn \{[^}]*min-height: 0;/, 'botón sin alto mínimo global');
  assert.match(css, /\.ctv-tv__volumen \{[^}]*min-height: 0;/, 'volumen sin alto mínimo global');
  assert.match(html, /role="tab"[^>]*>📺 Click TV Streaming</);
  assert.match(html, /role="tab"[^>]*>🎬 Estrenos de Cine</);
  // El CTA y el cierre viven en la barra, fuera del recuadro del video.
  const marco = html.slice(html.indexOf('id="ctv-tv-marco"'), html.indexOf('class="ctv-tv__barra"'));
  assert.doesNotMatch(marco, /ctv-tv-cta|ctv-tv-cerrar/);
  assert.equal((html.match(/id="ctv-tv-cta"/g) || []).length, 1, 'un solo CTA, compartido por ambas pestañas');
  assert.ok(html.indexOf('id="ctv-tv-controles-cine"') < html.indexOf('class="ctv-tv__ventana"'), 'selector arriba del video');
});
