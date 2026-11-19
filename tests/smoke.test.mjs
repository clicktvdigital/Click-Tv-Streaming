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
  // Un video en bucle puede dejar conexiones abiertas: se cierran para que el proceso termine.
  servidor?.closeAllConnections?.();
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

test('combos: el combo empieza vacío, se busca un servicio y llega al carrito', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 });
  assert.equal(await pagina.locator('#ahorro-servicios .combo-builder__elegido').count(), 0);
  assert.equal(await pagina.isVisible('#combo-buscar'), false, 'productos plegados al cargar');
  await pagina.click('#acordeon-combo > summary');
  await pagina.fill('#combo-buscar', 'spotify');
  await pagina.waitForFunction(() => /Spotify/.test(document.getElementById('combo-resultados').textContent));
  await pagina.locator('#combo-resultados [data-combo-agregar]').first().click();
  assert.equal(await pagina.locator('#ahorro-servicios .combo-builder__elegido').count(), 1);
  await pagina.selectOption('#combo-categoria', 'iptv');
  await pagina.fill('#combo-buscar', '');
  await pagina.waitForFunction(() => !/Spotify/.test(document.getElementById('combo-resultados').textContent));
  await pagina.locator('#combo-resultados [data-combo-agregar]').first().click();
  assert.equal(await pagina.locator('#ahorro-servicios .combo-builder__elegido').count(), 2);
  assert.notEqual((await pagina.textContent('#ahorro-total-resumen')).trim(), '$0.00 USD', 'el total se ve en el resumen plegado');
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

test('Plataformas IPTV retirado: no aparece y su enlace antiguo abre IPTV', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { consulta: '?producto=plataformas-iptv' });
  assert.equal(await pagina.locator('[data-producto="plataformas-iptv"]').count(), 0);
  assert.equal(await pagina.evaluate(() => document.querySelector('#streaming .filter-btn.activo')?.dataset.categoria), 'iptv');
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('portada en celular: categorías en 2 columnas con su total de servicios', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  const datos = await pagina.evaluate(() => ({
    columnas: getComputedStyle(document.querySelector('.home-categorias')).gridTemplateColumns.split(' ').length,
    acciones: getComputedStyle(document.querySelector('.hero__actions')).gridTemplateColumns.split(' ').length,
    totales: [...document.querySelectorAll('.home-categorias__total')].map((e) => e.textContent),
    ancho: document.documentElement.scrollWidth
  }));
  assert.equal(datos.columnas, 2);
  assert.equal(datos.acciones, 2);
  assert.ok(datos.totales.length >= 7 && datos.totales.every((t) => /^\d+ servicios?$/.test(t)), datos.totales.join(', '));
  assert.equal(datos.ancho, 390);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('carrito compacto: el detalle de Black Days se despliega y sigue abierto al cambiar la cantidad', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  await pagina.click('[data-bd-ver-iptv]');
  await pagina.locator('[data-producto="iptv-premium"] .ctv-bd [data-bd-accion="carrito"]').click();
  await pagina.evaluate(() => abrirCarrito());
  const fila = '#carrito-items .carrito-item[data-producto="iptv-premium"]';
  assert.match(await pagina.textContent(`${fila} .carrito-item__promo-chip`), /Black Days · \d+ meses · Ahorras/);
  assert.equal(await pagina.isVisible(`${fila} .ctv-bd-item`), false, 'el desglose empieza plegado');
  assert.match(await pagina.textContent('#carrito-resumen-corto'), /^1 servicio · Total /);
  await pagina.click(`${fila} .carrito-item__detalle > summary`);
  assert.equal(await pagina.isVisible(`${fila} .ctv-bd-item`), true);
  await pagina.locator(`${fila} button[aria-label="Aumentar cantidad"]`).dispatchEvent('click');
  assert.equal(await pagina.isVisible(`${fila} .ctv-bd-item`), true, 'el detalle sigue abierto tras volver a pintar');
  assert.match(await pagina.textContent('#carrito-resumen-corto'), /^2 servicios · Total /);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('asistente: anuncia Black Days y lleva directo a IPTV Premium', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  assert.equal(await pagina.isVisible('#ctv-asistente-btn .ctv-asistente-btn__promo'), true);
  await pagina.click('#ctv-asistente-btn');
  await pagina.click('.ctv-asistente__promo');
  const texto = await pagina.textContent('#ctv-asistente .ctv-asistente__cuerpo');
  for (const promo of ['Paga 2 meses y recibe 1 mes gratis', 'Paga 3 meses y recibe 3 meses gratis', 'Paga 6 meses y recibe 6 meses gratis']) assert.ok(texto.includes(promo), promo);
  await pagina.locator('#ctv-asistente .ctv-asistente__op', { hasText: 'IPTV Premium' }).click();
  assert.equal(await pagina.isHidden('#ctv-asistente'), true);
  await pagina.waitForFunction(() => {
    const r = document.querySelector('#catalogo-grid [data-producto="iptv-premium"]')?.getBoundingClientRect();
    return !!r && r.top < innerHeight && r.bottom > 0;
  }, null, { timeout: 4000 });
  assert.deepEqual(errores, []);
  await pagina.context().close();
  const despues = await abrirPagina({ width: 390, height: 844 }, { fecha: new Date('2026-11-21T06:00:00Z') });
  assert.equal(await despues.pagina.locator('#ctv-asistente-btn .ctv-asistente-btn__promo').count(), 0);
  await despues.pagina.click('#ctv-asistente-btn');
  assert.equal(await despues.pagina.locator('.ctv-asistente__promo').count(), 0);
  assert.ok(await despues.pagina.locator('#ctv-asistente .ctv-asistente__op', { hasText: 'Planes de IPTV' }).count());
  await despues.pagina.context().close();
});

test('IPTV con Black Days: precios normales plegados y la promo reemplaza el plan normal en el carrito', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  await pagina.evaluate(() => window.seleccionarCategoriaCatalogo('iptv'));
  const card = '[data-producto="iptv-premium"]';
  assert.equal(await pagina.isVisible(`${card} .ctv-bd-normales .product-plans`), false);
  const indice = await pagina.evaluate(() => PRODUCTOS.find((p) => p.id === 'iptv-premium').planes.findIndex((p) => p.tipo === '2 dispositivos · 1 mes'));
  assert.ok(indice >= 0);
  await pagina.evaluate((i) => agregarPlanCatalogo('iptv-premium', i, 'compra'), indice);
  await pagina.evaluate(() => cerrarCarrito());
  await pagina.locator(`${card} .ctv-bd input[value="2"]`).check({ force: true });
  await pagina.locator(`${card} .ctv-bd [data-bd-accion="carrito"]`).click();
  const items = await pagina.evaluate(() => carrito.filter((i) => i.productoId === 'iptv-premium').map((i) => !!i.promo));
  assert.deepEqual(items, [true], 'solo queda la promo, sin el plan normal duplicado');
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('pagos: sin cuentas en la portada; el botón abre el carrito con la transferencia', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  assert.equal(await pagina.locator('.clicktv-bank').count(), 0);
  await pagina.click('#ctv-ver-datos-pago');
  assert.equal(await pagina.evaluate(() => document.body.classList.contains('cart-open')), true);
  assert.match(await pagina.textContent('#carrito-pago-detalle'), /Banco Pichincha/);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('contacto: buscar país, región dinámica, prefijo automático y suscripción por correo', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  await pagina.click('#acordeon-contacto > summary');
  await pagina.fill('#contacto-pais-buscar', 'peru');
  assert.equal(await pagina.inputValue('#contacto-pais'), 'Perú');
  assert.equal((await pagina.textContent('#contacto-prefijo')).trim(), '+51');
  assert.ok(await pagina.locator('#contacto-region option[value="Cusco"]').count());
  await pagina.fill('#contacto-pais-buscar', '');
  await pagina.selectOption('#contacto-pais', 'Ecuador');
  assert.equal((await pagina.textContent('#contacto-prefijo')).trim(), '+593');
  await pagina.selectOption('#contacto-region', 'Pichincha');
  assert.ok(await pagina.locator('#contacto-cantones option[value="Quito"]').count());
  await pagina.fill('#contacto-nombre', 'Ana Pérez');
  await pagina.fill('#contacto-canton', 'Quito');
  await pagina.fill('#contacto-telefono', '099 123 4567');
  assert.equal(await pagina.isHidden('#contacto-email-campo'), true);
  await pagina.check('#contacto-suscripcion');
  await pagina.fill('#contacto-email', 'ana@example.com');
  await pagina.fill('#contacto-mensaje', 'Quiero IPTV Premium');
  await pagina.evaluate(() => { window.__abiertos = []; window.open = (url) => { window.__abiertos.push(String(url)); return null; }; });
  await pagina.locator('#form-contacto-internacional button[type="submit"]').click();
  const mensaje = decodeURIComponent(await pagina.evaluate(() => window.__abiertos[0] || ''));
  assert.match(mensaje, /Ubicación: Quito, Pichincha, Ecuador/);
  assert.match(mensaje, /Teléfono: \+593 991234567/);
  assert.match(mensaje, /promociones en: ana@example\.com/);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Click TV Player: video oficial y tráilers en pestañas, CTA y ✕ fuera del video, ventana flotante y cierre', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  try {
  assert.equal(await pagina.getAttribute('#ctv-tv-promo', 'src'), null, 'nada se descarga antes de llegar');
  await pagina.locator('#ctv-tv-prueba').scrollIntoViewIfNeeded();
  await pagina.waitForFunction(() => document.getElementById('ctv-tv-promo').getAttribute('src') === 'assets/promo.mp4');
  await pagina.waitForFunction(() => !document.getElementById('ctv-tv-promo').paused, null, { timeout: 8000 });
  const sinSolape = () => pagina.evaluate(() => {
    const v = document.getElementById('ctv-tv-marco').getBoundingClientRect();
    return ['ctv-tv-cta', 'ctv-tv-cerrar'].every((id) => {
      const b = document.getElementById(id).getBoundingClientRect();
      return b.height === 0 || b.top >= v.bottom - 0.5;
    });
  });
  assert.equal(await sinSolape(), true, 'CTA y ✕ debajo del video en la tarjeta');
  // Compartir en WhatsApp: listo en la barra del player, con mensaje y enlace a IPTV Premium.
  const compartir = await pagina.getAttribute('#ctv-tv-compartir', 'href');
  assert.match(compartir, /^https:\/\/wa\.me\/\?text=/);
  assert.match(decodeURIComponent(compartir), /Click TV Player[\s\S]*producto=television-por-internet-premium/);
  assert.equal(await pagina.isVisible('#ctv-tv-compartir'), true);
  assert.equal((await pagina.textContent('#ctv-tv-titulo')).trim(), '🎬 Click TV Player');
  // Controles compactos: sin controles nativos; el botón de sonido activa y silencia.
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').controls), false);
  const pildora = await pagina.evaluate(() => document.getElementById('ctv-tv-audio').getBoundingClientRect().height);
  assert.ok(pildora <= 40, `controles compactos (${pildora}px)`);
  // Como en YouTube: con el video en silencio aparece «Toca para escuchar» y un toque da sonido sin pausar.
  assert.equal(await pagina.isVisible('#ctv-tv-escuchar'), true);
  await pagina.click('#ctv-tv-escuchar');
  assert.deepEqual(await pagina.evaluate(() => { const v = document.getElementById('ctv-tv-promo'); return [v.muted, v.paused]; }), [false, false]);
  assert.equal(await pagina.isVisible('#ctv-tv-escuchar'), false);
  assert.equal(await pagina.getAttribute('#ctv-tv-sonido', 'aria-pressed'), 'true');
  await pagina.click('#ctv-tv-sonido');
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').muted), true);
  assert.equal(await pagina.isVisible('#ctv-tv-escuchar'), false, 'si el cliente silencia, no se le insiste');
  await pagina.click('#ctv-tv-sonido');
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').muted), false);
  // Auto-ocultar: reproduciendo, la píldora se esconde sola; el primer toque solo la muestra (no pausa).
  await pagina.waitForFunction(() => document.getElementById('ctv-tv-prueba').classList.contains('ctv-tv--controles-ocultos'), null, { timeout: 6000 });
  assert.equal(await pagina.evaluate(() => getComputedStyle(document.getElementById('ctv-tv-audio')).pointerEvents), 'none');
  // Toque real de celular (en escritorio, mover el ratón ya los muestra y el clic pausa, como en YouTube).
  await pagina.tap('#ctv-tv-promo');
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-prueba').classList.contains('ctv-tv--controles-ocultos')), false);
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').paused), false, 'el toque que muestra los controles no pausa');
  // Al salir de la sección: ventana fija y flotante, sin solapes y dentro de la pantalla.
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.waitForFunction(() => document.getElementById('ctv-tv-prueba').classList.contains('ctv-tv--mini'));
  const flotante = await pagina.evaluate(() => {
    const ventana = document.querySelector('.ctv-tv__ventana');
    const r = ventana.getBoundingClientRect();
    return { fija: getComputedStyle(ventana).position === 'fixed', dentro: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, ancho: document.documentElement.scrollWidth, caja: [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') };
  });
  assert.deepEqual({ ...flotante, caja: undefined }, { fija: true, dentro: true, ancho: 390, caja: undefined }, `ventana en ${flotante.caja}`);
  assert.equal(await sinSolape(), true, 'CTA y ✕ debajo del video en la ventana flotante');
  // Pestaña de cine: tráilers oficiales de YouTube.
  await pagina.click('#ctv-tv-tab-cine');
  assert.equal(await pagina.getAttribute('#ctv-tv-tab-cine', 'aria-selected'), 'true');
  // El clic del cliente carga el tráiler con audio (mute=0).
  const srcTrailer = await pagina.getAttribute('#ctv-tv-reproductor iframe', 'src');
  assert.equal(new URL(srcTrailer).searchParams.get('mute'), '0', 'tráiler con sonido tras el clic');
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').paused), true, 'el video oficial se pausa');
  assert.ok(await pagina.locator('#ctv-tv-trailer option').count() >= 2);
  assert.equal(await sinSolape(), true, 'en Estrenos de Cine el CTA tampoco tapa el video');
  await pagina.click('#ctv-tv-tab-oficial');
  // CTA lleva a IPTV Premium; ✕ cierra y quita la ventana flotante.
  await pagina.click('#ctv-tv-cta');
  await pagina.waitForFunction(() => {
    const r = document.querySelector('#catalogo-grid [data-producto="iptv-premium"]')?.getBoundingClientRect();
    return !!r && r.top < innerHeight && r.bottom > 0;
  }, null, { timeout: 4000 });
  await pagina.click('#ctv-tv-cerrar');
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-promo').paused), true);
  assert.equal(await pagina.evaluate(() => document.getElementById('ctv-tv-prueba').classList.contains('ctv-tv--mini')), false);
  assert.deepEqual(errores, []);
  } finally {
    await pagina.context().close();
  }
});

test('portada en celular: estadísticas, atención, preguntas frecuentes y pagos en 2 columnas', async () => {
  const { pagina, errores } = await abrirPagina({ width: 390, height: 844 });
  const columnas = await pagina.evaluate(() => Object.fromEntries([
    ['stats', '#promos .stats-grid'], ['atencion', '#clicktv-atencion .clicktv-journey__grid'],
    ['faq', '#ayuda .faq-grid'], ['pagos', '#clicktv-pagos-faciles .clicktv-payment-guide__links']
  ].map(([k, sel]) => [k, getComputedStyle(document.querySelector(sel)).gridTemplateColumns.split(' ').length])));
  assert.deepEqual(columnas, { stats: 2, atencion: 2, faq: 2, pagos: 2 });
  assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth), 390);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('precios en acordeón: Claro Paquetes Megas muestra 4 planes y despliega el resto', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 });
  await pagina.evaluate(() => window.seleccionarCategoriaCatalogo('recargas'));
  const lista = '[data-producto="claro-paquetes-megas"] .product-plans';
  await pagina.waitForSelector(`${lista}.product-plans--plegada`);
  const visibles = () => pagina.locator(`${lista} > .product-plan`).evaluateAll((filas) => filas.filter((f) => f.offsetHeight > 0).length);
  const total = await pagina.locator(`${lista} > .product-plan`).count();
  assert.equal(await visibles(), 4);
  const boton = pagina.locator('[data-producto="claro-paquetes-megas"] .planes-toggle');
  assert.equal(await boton.getAttribute('aria-expanded'), 'false');
  assert.match(await boton.textContent(), new RegExp(`Ver ${total - 4} precios más`));
  await boton.click();
  assert.equal(await visibles(), total);
  assert.equal(await boton.getAttribute('aria-expanded'), 'true');
  // Las tarjetas IPTV ya filtran por dispositivos y meses: no se pliegan.
  await pagina.evaluate(() => window.seleccionarCategoriaCatalogo('iptv'));
  await pagina.waitForTimeout(200);
  assert.equal(await pagina.locator('[data-producto="telelatino"] .planes-toggle').count(), 0);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('partidos en Android de 360 px: 4 por bloque en formato horizontal, el resto plegado y lo abierto se conserva', async () => {
  const { pagina, errores } = await abrirPagina({ width: 360, height: 780 });
  const pintar = () => pagina.evaluate(() => {
    const base = normalizarPartidosLocales(MUNDIAL_2026)[0];
    const partidos = Array.from({ length: 7 }, (_, i) => ({ ...base, fechaUTC: new Date(Date.parse(base.fechaUTC) + i * 86400000).toISOString() }));
    pintarMundial(document.getElementById('mundial-grid'), crearBloquePartidos('Prueba', partidos));
  });
  await pintar();
  const bloque = '#mundial-grid .mundial-bloque';
  assert.equal(await pagina.locator(`${bloque} > .mundial-cards > .match-card`).count(), 4);
  assert.match(await pagina.textContent(`${bloque} .mundial-mas > summary`), /Ver 3 partidos más/);
  await pagina.click(`${bloque} .mundial-mas > summary`);
  const huecos = await pagina.evaluate(() => [...document.querySelectorAll('#mundial-grid .mundial-cards')].map((grid) => {
    const cards = [...grid.children];
    const ultima = cards[cards.length - 1];
    return {
      columnas: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      ultimaAncha: Math.abs(ultima.offsetWidth - grid.clientWidth) < 2,
      horizontales: cards.every((c) => c.offsetWidth > c.offsetHeight),
      // Cada equipo en una fila: bandera y nombre a la misma altura, nombre en una sola línea y nada se sale.
      duelosEnFila: cards.every((c) => [...c.querySelectorAll('.mundial-team')].every((t) => {
        const [emblema, nombre] = t.children;
        const centro = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
        const estilo = getComputedStyle(nombre);
        const completo = estilo.textOverflow !== 'ellipsis' && estilo.whiteSpace !== 'nowrap' && nombre.scrollWidth <= nombre.clientWidth + 1;
        return Math.abs(centro(emblema) - centro(nombre)) < 4 && completo;
      })),
      sinDesborde: cards.every((c) => c.scrollWidth <= c.clientWidth + 1)
    };
  }));
  for (const g of huecos) {
    assert.equal(g.columnas, 1, 'en celular, una tarjeta apaisada por fila');
    assert.equal(g.ultimaAncha, true);
    assert.equal(g.horizontales, true, 'cada tarjeta es más ancha que alta');
    assert.equal(g.duelosEnFila, true, 'bandera y nombre en la misma fila, con el nombre completo');
    assert.equal(g.sinDesborde, true, 'nada se sale de la tarjeta');
  }
  await pintar();
  assert.equal(await pagina.evaluate(() => document.querySelector('#mundial-grid details.mundial-mas').open), true, 'sigue abierto tras refrescar');
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

for (const ancho of [360, 412]) {
  test(`Android ${ancho} px: ningún contenido se sale de la pantalla`, async () => {
    const { pagina, errores } = await abrirPagina({ width: ancho, height: 800 });
    const fuera = await pagina.evaluate(() => {
      const recorta = (el) => {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.position === 'fixed' || a.getAttribute('aria-hidden') === 'true' || a.hidden) return true;
          if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) return true; // desplazable o recortado a propósito
        }
        return false;
      };
      return [...document.querySelectorAll('main *')].filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(el).position === 'fixed' || recorta(el)) return false;
        return r.right > innerWidth + 1 || r.left < -1;
      }).slice(0, 8).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} (${Math.round(el.getBoundingClientRect().left)}→${Math.round(el.getBoundingClientRect().right)})`);
    });
    assert.deepEqual(fuera, [], `elementos fuera de ${ancho} px`);
    assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth), ancho);
    assert.deepEqual(errores, []);
    await pagina.context().close();
  });
}

test('Android 360 px: etiquetas y botones del catálogo dentro de su tarjeta; carrito vacío sin botones de pedido', async () => {
  const { pagina, errores } = await abrirPagina({ width: 360, height: 780 });
  const fuera = await pagina.evaluate(() => [...document.querySelectorAll('#catalogo-grid .product-card')].slice(0, 12).flatMap((card) => {
    const c = card.getBoundingClientRect();
    return [...card.querySelectorAll('.product-tags span, h3, .btn, button')]
      .filter((el) => el.offsetWidth && el.getBoundingClientRect().right > c.right + 1)
      .map((el) => `${card.dataset.producto}: ${el.textContent.trim().slice(0, 30)}`);
  }));
  assert.deepEqual(fuera, []);
  const duda = await pagina.evaluate(() => { const a = document.querySelector('.catalogo-ayuda__duda'); return !a || a.scrollWidth <= a.clientWidth + 1; });
  assert.equal(duda, true, '«¿Tienes dudas?» se lee completo');
  await pagina.click('#btn-abrir-carrito');
  assert.equal(await pagina.isVisible('#btn-finalizar-compra'), false, 'sin «Finalizar compra» con el carrito vacío');
  assert.equal(await pagina.isVisible('#btn-continuar-comprando'), true);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});

test('Click TV Player en escritorio con Black Days: la ventana flotante queda abajo y dentro de la pantalla', async () => {
  const { pagina, errores } = await abrirPagina({ width: 1280, height: 800 }, { fecha: new Date('2026-11-17T15:00:00Z') });
  await pagina.locator('#ctv-tv-prueba').scrollIntoViewIfNeeded();
  await pagina.waitForFunction(() => !document.getElementById('ctv-tv-promo').paused, null, { timeout: 8000 });
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.waitForFunction(() => document.getElementById('ctv-tv-prueba').classList.contains('ctv-tv--mini'));
  const r = await pagina.evaluate(() => {
    const c = document.querySelector('.ctv-tv__ventana').getBoundingClientRect();
    return { izquierda: Math.round(c.left), arriba: Math.round(c.top), abajo: Math.round(innerHeight - c.bottom), ancho: Math.round(c.width) };
  });
  assert.ok(r.arriba >= 0, `la ventana no se sale por arriba (${JSON.stringify(r)})`);
  assert.ok(r.abajo >= 0 && r.abajo <= 40, `apoyada abajo (${JSON.stringify(r)})`);
  assert.ok(r.ancho <= 320, `ventana discreta (${r.ancho}px)`);
  assert.deepEqual(errores, []);
  await pagina.context().close();
});
