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

test('mini TV: tráilers oficiales doblados, válidos, sin repetidos, y un iframe silenciado en bucle', () => {
  const datos = createContext({ console, URLSearchParams }); datos.window = datos;
  runInContext(leer('data.js'), datos);
  runInContext(leer('clicktv-mini-tv.js'), datos);
  const trailers = runInContext('CONFIG.trailersYouTube', datos);
  const { trailersValidos, urlInsercion } = datos.ctvMiniTV;
  assert.ok(trailers.length >= 2 && trailers.length <= 3, 'entre 2 y 3 tráilers');
  assert.equal(trailersValidos(trailers).length, trailers.length);
  const oficiales = ['Disney Studios LA', 'Warner Bros. Pictures Latinoamérica', 'Universal Pictures Latinoamérica', 'Sony Pictures Latinoamérica', 'Paramount Pictures Latinoamérica'];
  for (const t of trailers) {
    assert.ok(oficiales.includes(t.canal), `${t.titulo}: canal oficial del estudio`);
    assert.match(t.version, /^(Doblado|Subtitulado)$/, `${t.titulo}: versión en español indicada`);
  }
  const url = new URL(urlInsercion('s_qpMMkvHYE', 'https://click-tv-streaming.vercel.app'));
  assert.equal(url.hostname, 'www.youtube-nocookie.com');
  for (const [k, v] of [['autoplay', '1'], ['mute', '1'], ['loop', '1'], ['playlist', 's_qpMMkvHYE'], ['playsinline', '1']]) assert.equal(url.searchParams.get(k), v, k);
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
  assert.match(html, /<video id="ctv-tv-promo"[^>]*\bmuted\b[^>]*\bloop\b[^>]*\bplaysinline\b[^>]*\bcontrols\b/);
  assert.match(html, /role="tab"[^>]*>📺 Click TV Oficial</);
  assert.match(html, /role="tab"[^>]*>🎬 Estrenos de Cine</);
  // El CTA y el cierre viven en la barra, fuera del recuadro del video.
  const marco = html.slice(html.indexOf('id="ctv-tv-marco"'), html.indexOf('class="ctv-tv__barra"'));
  assert.doesNotMatch(marco, /ctv-tv-cta|ctv-tv-cerrar/);
  assert.equal((html.match(/id="ctv-tv-cta"/g) || []).length, 1, 'un solo CTA, compartido por ambas pestañas');
  assert.ok(html.indexOf('id="ctv-tv-controles-cine"') < html.indexOf('class="ctv-tv__ventana"'), 'selector arriba del video');
});
