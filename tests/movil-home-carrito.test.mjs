// Portada en 2 columnas, carrito compacto, asistente con Black Days y retiro de "Plataformas IPTV".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

test('"Plataformas IPTV" ya no está en el catálogo y su logo no queda huérfano', () => {
  const contexto = createContext({ console });
  contexto.window = contexto;
  for (const archivo of ['data.js', 'clicktv-precios-publico-2026.js']) runInContext(leer(archivo), contexto);
  const ids = runInContext('PRODUCTOS.map((p) => p.id)', contexto);
  assert.ok(!ids.includes('plataformas-iptv'));
  for (const id of ['iptv-basico', 'iptv-premium', 'iptv-ultra']) assert.ok(ids.includes(id), id);
  assert.doesNotMatch(leer('clicktv-logos-catalogo.js'), /plataformas-iptv/);
  assert.equal(existsSync(new URL('../assets/logos-catalogo/smartone-iptv.png', import.meta.url)), false);
});

test('los enlaces antiguos de "Plataformas IPTV" abren la categoría IPTV', () => {
  assert.match(leer('clicktv-enlaces-2026.js'), /const RETIRADOS = \{ 'plataformas-iptv': 'iptv' \};/);
});

test('carrito: fila compacta con el detalle completo desplegable y el resumen corto', () => {
  const script = leer('script.js');
  assert.match(script, /<details class="carrito-item__detalle" data-item-id="\$\{item\.itemId\}"/);
  assert.match(script, /\$\{htmlPromoCarrito\(item\)\}/, 'el desglose de Black Days sigue en el detalle');
  assert.match(script, /carrito-item__promo-chip/);
  assert.match(script, /detallesCarritoAbiertos\.has\(item\.itemId\)/, 'el detalle abierto se conserva al volver a pintar');
  assert.match(leer('index.html'), /id="carrito-resumen-corto"/);
});

test('asistente: anuncia Black Days solo con la promo vigente y ofrece rutas a IPTV', () => {
  const js = leer('clicktv-asistente-2026.js');
  assert.match(js, /if \(clave === 'blackdays'\) return promoVigente\(\) \? nodoBlackDays\(\) : nodos\.iptv;/);
  for (const ruta of ['producto:iptv-basico', 'producto:iptv-premium', 'producto:iptv-ultra', 'categoria:iptv']) assert.ok(js.includes(ruta), ruta);
  assert.match(js, /\[\/black\|promo\|oferta\|gratis\|descuento\/i, 'blackdays'\]/);
});

test('portada: categorías, acciones y atención en 2 columnas en celular', () => {
  const css = leer('clicktv-movil-2col.css');
  for (const selector of ['body .home-categorias {', '.hero .hero__actions {', 'body .ctvc-utilities .quick-links {', '#como-comprar .steps-grid {']) {
    const i = css.indexOf(selector);
    assert.ok(i > 0, selector);
    assert.match(css.slice(i, i + 200), /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/, selector);
  }
});
