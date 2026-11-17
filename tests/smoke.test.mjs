// Prueba de humo de la portada con Playwright (sin dependencias extra: node:test).
// Levanta un servidor estático de esta carpeta y revisa lo principal en celular y escritorio.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RUTA_ENTORNO = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };

let servidor, navegador, base;

before(async () => {
  servidor = http.createServer(async (req, res) => {
    const ruta = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    try {
      const archivo = join(ROOT, ruta === '/' || ruta === '\\' ? 'index.html' : ruta);
      res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] || 'application/octet-stream' });
      res.end(await readFile(archivo));
    } catch {
      res.writeHead(404).end('no encontrado');
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  base = `http://127.0.0.1:${servidor.address().port}/index.html`;
  // El proyecto usa Playwright 1.65; el navegador preinstalado del entorno es otra versión, así que se indica su ruta.
  // Si no existe (otra máquina), Playwright usa el navegador que haya instalado con `npx playwright install chromium`.
  const ejecutable = process.env.CHROMIUM_PATH || (existsSync(RUTA_ENTORNO) ? RUTA_ENTORNO : undefined);
  navegador = await chromium.launch(ejecutable ? { executablePath: ejecutable, args: ['--no-sandbox'] } : {});
});

after(async () => {
  await navegador?.close();
  await new Promise((ok) => servidor?.close(ok));
});

async function abrirPagina(vista, { fecha } = {}) {
  const pagina = await navegador.newPage({ viewport: vista, isMobile: vista.width < 600, hasTouch: vista.width < 600 });
  if (fecha) await pagina.clock.setFixedTime(fecha);
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  // Las APIs externas no están disponibles en la prueba: se responden vacías.
  await pagina.route(/\/api\/(resenas|partidos)/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"resenas":[],"matches":[],"ligas":[]}' }));
  await pagina.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await pagina.goto(base, { waitUntil: 'load' });
  await pagina.waitForTimeout(800);
  return { pagina, errores };
}

for (const [nombre, vista] of [['celular 390 px', { width: 390, height: 844 }], ['escritorio 1280 px', { width: 1280, height: 800 }]]) {
  test(`${nombre}: sin errores de JavaScript ni desplazamiento horizontal`, async () => {
    const { pagina, errores } = await abrirPagina(vista);
    const ancho = await pagina.evaluate(() => document.documentElement.scrollWidth);
    assert.equal(ancho, vista.width, 'la página no debe desbordar horizontalmente');
    assert.deepEqual(errores, []);
    await pagina.context().close();
  });
}

test('cabecera: país solo como bandera y sin botón de activar ubicación', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  const pais = (await pagina.textContent('#pais-detectado')).trim();
  assert.ok(pais.length <= 2, `se esperaba solo una bandera y llegó "${pais}"`);
  assert.equal(await pagina.locator('#btn-activar-ubicacion').count(), 0);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('menú: abre y se cierra con la X', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  await pagina.click('#btn-menu-movil');
  assert.equal(await pagina.evaluate(() => document.getElementById('nav-menu').classList.contains('abierto')), true);
  await pagina.click('#btn-cerrar-menu');
  assert.equal(await pagina.evaluate(() => document.getElementById('nav-menu').classList.contains('abierto')), false);
  assert.equal(await pagina.locator('#btn-menu-subir').count(), 0);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('simulador: nadie preseleccionado y un combo llega al carrito', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 });
  assert.equal(await pagina.locator('#ahorro-servicios input:checked').count(), 0);
  await pagina.locator('#ahorro-servicios input').first().check({ force: true });
  await pagina.click('#btn-ahorro-carrito');
  assert.equal((await pagina.textContent('#contador-carrito')).trim(), '1');
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('pie: métodos de pago abren WhatsApp con el método elegido', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 });
  // Se registra la URL que la página intenta abrir (no se navega: no hay red en la prueba).
  await pagina.evaluate(() => { window.__abiertos = []; window.open = (url) => { window.__abiertos.push(String(url)); return null; }; });
  await pagina.click('[data-pago="PayPal"]');
  const url = await pagina.evaluate(() => window.__abiertos[0] || '');
  assert.match(url, /wa\.me|whatsapp/i);
  assert.match(decodeURIComponent(url), /PayPal/);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Black Days: la promo de IPTV llega al carrito y al mensaje de WhatsApp con su desglose', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  assert.equal(await pagina.isVisible('#black-days-aviso'), true);
  await pagina.click('[data-bd-ver-iptv]');
  const caja = pagina.locator('[data-producto="iptv-premium"] .ctv-bd');
  await caja.locator('input[value="2"]').check({ force: true });
  await caja.locator('input[value="bd-paga3"]').check({ force: true });
  assert.match(await caja.locator('[data-bd-desglose]').textContent(), /41[.,]50/);
  await caja.locator('[data-bd-accion="carrito"]').click();
  assert.equal((await pagina.textContent('#contador-carrito')).trim(), '1');
  const itemCarrito = await pagina.textContent('#carrito-items');
  assert.match(itemCarrito, /Más Beneficio: Paga 3 meses y recibe 3 meses gratis/);
  assert.match(itemCarrito, /Ahorras/);
  assert.equal(await pagina.isHidden('#carrito-ahorro-promo-fila'), false);
  const mensaje = await pagina.evaluate(() => generarResumenPedido());
  assert.match(mensaje, /Meses pagados: 3 · 🎁 Meses gratis: 3 · ✅ Meses activados: 6/);
  assert.match(mensaje, /Ahorro Black Days \(ya incluido en los precios\): \$37\.00 USD/);
  assert.match(mensaje, /Total: \$41\.50 USD/);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Black Days: después del 20 de noviembre no aparece la promoción', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 }, { fecha: new Date('2026-11-21T06:00:00Z') });
  assert.equal(await pagina.isHidden('#black-days-aviso'), true);
  assert.equal(await pagina.locator('.ctv-bd').count(), 0);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});
