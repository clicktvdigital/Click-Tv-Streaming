// Acordeones de precios y partidos, retícula equilibrada y reglas flexibles para Android (sin navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

test('precios: listas de más de 5 planes se pliegan a 4, salvo las que ya tienen filtros', () => {
  const js = leer('clicktv-navegacion-movil.js');
  assert.match(js, /const PLANES_VISIBLES = 4;/);
  assert.match(js, /if \(conFiltros \|\| filas\.length <= PLANES_VISIBLES \+ 1\) return;/);
  assert.match(js, /setAttribute\('aria-expanded'/);
  assert.match(leer('clicktv-movil-2col.css'), /\.product-plans--plegada > \.product-plan:nth-child\(n\+5\) \{ display: none !important; \}/);
});

test('partidos: 4 por bloque, el resto plegado y el estado abierto se conserva al refrescar', () => {
  const js = leer('script.js');
  assert.match(js, /const PARTIDOS_VISIBLES = 4;/);
  assert.match(js, /<details class="mundial-mas" data-bloque=/);
  assert.match(js, /function pintarMundial\(box, html\)/);
  assert.doesNotMatch(js, /box\.innerHTML = renderizarRespaldoMundial\(\);/, 'el respaldo también conserva lo abierto');
});

test('partidos: retícula de 2 (celular) y 4 columnas (escritorio) sin huecos en la última fila', () => {
  const css = leer('clicktv-movil-2col.css');
  assert.match(css, /#mundial \.mundial-cards > \.match-card:last-child:nth-child\(odd\) \{ grid-column: 1 \/ -1; \}/);
  assert.match(css, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\) !important;/);
  assert.match(css, /:last-child:nth-child\(4n\+1\) \{ grid-column: 1 \/ -1; \}/);
});

test('Android: unidades flexibles (clamp/minmax) y medios limitados al ancho', () => {
  const css = leer('clicktv-movil-2col.css');
  const android = css.slice(css.indexOf('/* 12. Android'));
  assert.match(android, /clamp\(/);
  assert.match(android, /main :is\(img, video, iframe, svg, canvas, table, pre\) \{ max-width: 100%; \}/);
  assert.match(android, /> \* \{ min-width: 0; \}/);
});
