// Precios IPTV con promo, pagos solo en el carrito, formulario internacional, combos y mini TV.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

test('mini TV: canales configurables, válidos y sin credenciales; hls.js fijado con SRI', () => {
  const datos = createContext({ console }); datos.window = datos;
  runInContext(leer('data.js'), datos);
  runInContext(leer('clicktv-tv-en-vivo.js'), datos);
  const canales = runInContext('CONFIG.canalesMiniTV', datos);
  assert.ok(canales.length >= 2, 'al menos dos canales para alternar');
  assert.equal(datos.ctvMiniTV.canalesValidos(canales).length, canales.length, 'todos los canales son válidos');
  for (const c of canales) {
    assert.match(c.url, /^https:\/\/.+\.m3u8$/, c.id);
    assert.doesNotMatch(c.url, /username=|password=|get\.php/i, `${c.id}: sin credenciales ni paneles IPTV en un archivo público`);
  }
  assert.equal(datos.ctvMiniTV.canalesValidos([{ id: 'x', nombre: 'X', url: 'http://inseguro.example/a.m3u8' }, { id: 'y', nombre: 'Y', url: 'https://ok.example/b.m3u8' }, { id: 'y', nombre: 'Repetido', url: 'https://ok.example/c.m3u8' }]).length, 1);
  const js = leer('clicktv-tv-en-vivo.js');
  assert.match(js, /hls\.js\/\d+\.\d+\.\d+\/hls\.min\.js/);
  assert.match(js, /integridad: 'sha384-[A-Za-z0-9+/=]{64}'/);
  assert.match(leer('index.html'), /<video id="ctv-tv-video"[^>]*preload="none"/);
});
