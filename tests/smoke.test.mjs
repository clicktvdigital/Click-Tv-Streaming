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

async function abrirPagina(vista, { fecha, consulta = '' } = {}) {
  const pagina = await navegador.newPage({ viewport: vista, isMobile: vista.width < 600, hasTouch: vista.width < 600 });
  if (fecha) await pagina.clock.setFixedTime(fecha);
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  // Las APIs externas no están disponibles en la prueba: se responden vacías.
  await pagina.route(/\/api\/(resenas|partidos)/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"resenas":[],"matches":[],"ligas":[]}' }));
  await pagina.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await pagina.goto(base + consulta, { waitUntil: 'load' });
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
  const conPromo = await pagina.$$eval('[data-producto] .ctv-bd', (cajas) => cajas.map((c) => c.closest('[data-producto]').dataset.producto).sort());
  assert.deepEqual(conPromo, ['iptv-basico', 'iptv-premium', 'iptv-ultra']);
  for (const id of ['flujo-tv', 'stella-tv', 'xc-tv']) {
    assert.equal(await pagina.locator(`[data-producto="${id}"] .ctv-bd`).count(), 0, `${id} sin Black Days`);
  }
  await caja.scrollIntoViewIfNeeded();
  await pagina.waitForFunction(() => document.body.classList.contains('ctv-bd-selector-visible'), null, { timeout: 3000 });
  assert.equal(await pagina.isHidden('#ctv-bd-barra'), true, 'la barra se aparta con el selector de la promo a la vista');
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

test('enlaces: el nuevo y el antiguo abren IPTV Premium, y se comparte con television-por-internet', async () => {
  for (const consulta of ['?producto=television-por-internet-premium', '?producto=iptv-premium']) {
    const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { consulta });
    const tarjetas = await pagina.locator('#catalogo-grid .product-card').evaluateAll((els) => els.map((e) => e.dataset.producto));
    assert.deepEqual(tarjetas, ['iptv-premium'], consulta);
    const enlace = await pagina.evaluate(() => window.enlaceDeProducto('iptv-premium'));
    assert.match(enlace, /\?producto=television-por-internet-premium$/);
    assert.deepEqual(errores, []);
    await pagina.context().close();
  }
});

for (const [nombre, vista] of [['celular 390 px', { width: 390, height: 844 }], ['escritorio 1280 px', { width: 1280, height: 800 }]]) {
  test(`carrito ${nombre}: el logo IPTV se ve, tiene ranura fija y no se monta sobre el texto`, async () => {
    const { pagina, errores } = await abrirPagina(vista, { fecha: new Date('2026-11-17T15:00:00Z') });
    await pagina.click('[data-bd-ver-iptv]');
    await pagina.locator('[data-producto="iptv-premium"] .ctv-bd [data-bd-accion="carrito"]').click();
    const medir = () => pagina.evaluate(() => {
      const fila = document.querySelector('#carrito-items .carrito-item[data-producto="iptv-premium"]');
      const icono = fila.querySelector('.carrito-item__icono');
      const img = icono.querySelector('img');
      const a = icono.getBoundingClientRect(), b = fila.querySelector('.carrito-item__info').getBoundingClientRect();
      return { ancho: Math.round(a.width), alto: Math.round(a.height), separado: a.right <= b.left + 0.5,
        filtro: img ? getComputedStyle(img).filter : 'sin imagen', animada: fila.classList.contains('is-new') };
    });
    const antes = await medir();
    assert.notEqual(antes.filtro, 'sin imagen');
    assert.doesNotMatch(antes.filtro, /invert/, 'el logo propio no debe volverse blanco');
    assert.equal(antes.ancho, antes.alto);
    assert.ok(antes.ancho >= 48 && antes.ancho <= 56, `ranura de ${antes.ancho}px`);
    assert.ok(antes.separado, 'el emblema no debe montarse sobre el texto');
    // Cambiar la cantidad vuelve a pintar el carrito: el logo sigue y la fila no se anima otra vez.
    await pagina.locator('#carrito-items .carrito-item[data-producto="iptv-premium"] button[aria-label="Aumentar cantidad"]').dispatchEvent('click');
    const despues = await medir();
    assert.deepEqual({ ...despues, animada: false }, { ...antes, animada: false });
    assert.equal(despues.animada, false);
    assert.deepEqual(errores, []);
    await pagina.context().close();
  });
}

test('menú: IPTV cierra el menú, filtra IPTV y lleva al catálogo', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  await pagina.click('#btn-menu-movil');
  await pagina.click('#nav-menu a[data-ir-categoria="iptv"]');
  await pagina.waitForFunction(() => {
    const r = document.querySelector('#streaming .filter-tabs').getBoundingClientRect();
    return r.top >= 0 && r.top < innerHeight;
  }, null, { timeout: 4000 }).catch(() => {});
  const estado = await pagina.evaluate(() => ({
    abierto: document.getElementById('nav-menu').classList.contains('abierto'),
    bloqueado: document.body.classList.contains('menu-movil-abierto'),
    activo: document.querySelector('#streaming .filter-btn.activo')?.dataset.categoria,
    categorias: [...new Set([...document.querySelectorAll('#catalogo-grid .product-card')].map((c) => PRODUCTOS.find((p) => p.id === c.dataset.producto)?.categoria))],
    filtroVisible: (() => { const r = document.querySelector('#streaming .filter-tabs').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })()
  }));
  assert.deepEqual(estado, { abierto: false, bloqueado: false, activo: 'iptv', categorias: ['iptv'], filtroVisible: true });
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('menú: búsqueda maestra filtra en tiempo real, se limpia y salta al producto', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  await pagina.click('#btn-menu-movil');
  await pagina.fill('#nav-busqueda-input', 'spotify');
  await pagina.waitForSelector('#nav-busqueda-resultados .nav-busqueda__item');
  assert.match(await pagina.textContent('#nav-busqueda-resultados'), /Spotify/);
  await pagina.click('#nav-busqueda-limpiar');
  assert.equal(await pagina.inputValue('#nav-busqueda-input'), '');
  assert.equal(await pagina.isHidden('#nav-busqueda-resultados'), true);
  await pagina.fill('#nav-busqueda-input', 'spotify');
  await pagina.locator('#nav-busqueda-resultados .nav-busqueda__item[data-tipo="producto"]').first().click();
  // El scroll suave tarda según la distancia y la máquina: se espera a que la tarjeta entre en pantalla.
  await pagina.waitForFunction(() => {
    const r = document.querySelector('#catalogo-grid [data-producto*="spotify"]')?.getBoundingClientRect();
    return !!r && r.top < innerHeight && r.bottom > 0;
  }, null, { timeout: 4000 }).catch(() => {});
  const estado = await pagina.evaluate(() => {
    const tarjeta = document.querySelector('#catalogo-grid [data-producto*="spotify"]');
    const r = tarjeta?.getBoundingClientRect();
    return { abierto: document.getElementById('nav-menu').classList.contains('abierto'), existe: !!tarjeta, visible: !!r && r.top < innerHeight && r.bottom > 0 };
  });
  assert.deepEqual(estado, { abierto: false, existe: true, visible: true });
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('catálogo en celular: 2 columnas y la tarjeta abierta ocupa todo el ancho', async () => {
  const { pagina, errores } = await abrirPagina({ width: 375, height: 812 }, { fecha: new Date('2026-11-25T15:00:00Z') });
  const columnas = await pagina.evaluate(() => getComputedStyle(document.getElementById('catalogo-grid')).gridTemplateColumns.split(' ').length);
  assert.equal(columnas, 2);
  const primera = pagina.locator('#catalogo-grid .product-card').first();
  await primera.locator('.product-plans-wrap > summary').click();
  const anchos = await pagina.evaluate(() => {
    // Ancho de maquetación (offsetWidth): la animación .reveal escala la tarjeta mientras entra.
    const grid = document.getElementById('catalogo-grid');
    const card = document.querySelector('#catalogo-grid .product-card');
    return { grid: grid.clientWidth, card: card.offsetWidth };
  });
  assert.equal(anchos.card, anchos.grid);
  assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth), 375);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('sitemap: ?categoria=iptv abre el catálogo filtrado en IPTV', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { consulta: '?categoria=iptv' });
  const estado = await pagina.evaluate(() => ({
    activo: document.querySelector('#streaming .filter-btn.activo')?.dataset.categoria,
    categorias: [...new Set([...document.querySelectorAll('#catalogo-grid .product-card')].map((c) => PRODUCTOS.find((p) => p.id === c.dataset.producto)?.categoria))]
  }));
  assert.deepEqual(estado, { activo: 'iptv', categorias: ['iptv'] });
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Black Days en celular: tarjetas IPTV compactas en 2 columnas y abiertas desde el aviso', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  await pagina.evaluate(() => window.seleccionarCategoriaCatalogo('iptv'));
  const medir = () => pagina.evaluate(() => {
    const grid = document.getElementById('catalogo-grid').clientWidth;
    const card = document.querySelector('[data-producto="iptv-premium"]');
    return { compacta: card.offsetWidth < grid * 0.6, selloVisible: !!card.querySelector('.ctv-bd__sello')?.offsetHeight,
      selectorVisible: !!card.querySelector('[data-bd-accion="carrito"]')?.offsetHeight };
  });
  assert.deepEqual(await medir(), { compacta: true, selloVisible: true, selectorVisible: false });
  await pagina.click('[data-bd-ver-iptv]');
  assert.deepEqual(await medir(), { compacta: false, selloVisible: true, selectorVisible: true });
  assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth), 390);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Black Days en celular: barra de WhatsApp con mensaje listo, se puede ocultar y desaparece al terminar', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  assert.equal(await pagina.isVisible('#ctv-bd-barra'), true);
  const href = await pagina.getAttribute('#ctv-bd-barra-whatsapp', 'href');
  assert.match(href, /^https:\/\/wa\.me\/593939166222\?text=/);
  assert.match(decodeURIComponent(href), /Black Days\* de IPTV/);
  const solape = await pagina.evaluate(() => {
    const a = document.getElementById('ctv-bd-barra').getBoundingClientRect();
    const b = document.querySelector('.floating-actions').getBoundingClientRect();
    return a.bottom > b.top + 0.5;
  });
  assert.equal(solape, false, 'la barra no se monta sobre los accesos rápidos');
  await pagina.click('#btn-menu-movil');
  assert.equal(await pagina.isVisible('#ctv-bd-barra'), false, 'se oculta con el menú abierto');
  await pagina.click('#btn-cerrar-menu');
  await pagina.click('#ctv-bd-barra-cerrar');
  assert.equal(await pagina.isVisible('#ctv-bd-barra'), false);
  assert.deepEqual(errores, []);
  await pagina.context().close();
  const despues = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-21T06:00:00Z') });
  assert.equal(await despues.pagina.isVisible('#ctv-bd-barra'), false);
  await despues.pagina.context().close();
});

test('escritorio: la barra de Black Days no aparece', async () => {
  const { pagina } = await abrirPagina({ width: 1280, height: 800 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  assert.equal(await pagina.isVisible('#ctv-bd-barra'), false);
  await pagina.context().close();
});
