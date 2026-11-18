// Pruebas del menú sándwich y de la búsqueda maestra (sin navegador).
// El buscador se carga con el catálogo real (data.js + precios públicos) en un contexto aislado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

const contexto = createContext({ console });
contexto.window = contexto;
for (const archivo of ['data.js', 'clicktv-precios-publico-2026.js', 'clicktv-navegacion-movil.js']) {
  runInContext(leer(archivo), contexto, { filename: archivo });
}
const { normalizar, crearIndice, buscar, precioDesde } = contexto.ctvBusqueda;
const PRODUCTOS = runInContext('PRODUCTOS', contexto);
const indice = crearIndice(PRODUCTOS);
const ids = (resultados) => resultados.map((r) => r.id);

test('normaliza acentos, mayúsculas, signos y el "+"', () => {
  assert.equal(normalizar('  Música  PREMIUM! '), 'musica premium');
  assert.equal(normalizar('Disney+'), 'disney plus');
  assert.equal(normalizar(null), '');
});

test('encuentra productos aunque falten acentos o mayúsculas', () => {
  const r = buscar(indice, 'NETFLIX');
  assert.ok(r.length >= 1);
  assert.equal(r[0].tipo, 'producto');
  assert.match(r[0].titulo, /Netflix/);
  assert.ok(ids(buscar(indice, 'disney')).some((id) => id.startsWith('disney')));
});

test('busca también por planes, etiquetas y varias palabras a la vez', () => {
  const r = buscar(indice, 'iptv premium');
  assert.equal(r[0].id, 'iptv-premium');
  assert.ok(buscar(indice, '12 meses').length > 0, 'los nombres de plan son buscables');
});

test('las secciones de ayuda aparecen en la búsqueda', () => {
  assert.equal(buscar(indice, 'deuna')[0].destino, '#clicktv-pagos-faciles');
  assert.equal(buscar(indice, 'renovar')[0].destino, '#clicktv-atencion');
  assert.ok(ids(buscar(indice, 'contacto')).includes('#contacto'));
});

test('las categorías se pueden abrir desde la búsqueda', () => {
  const r = buscar(indice, 'musica');
  assert.ok(r.some((e) => e.tipo === 'categoria' && e.categoria === 'musica'));
});

test('casos límite: vacío, sin coincidencias, límite de resultados y texto muy largo', () => {
  // Los arreglos vienen de otro contexto de vm: se comparan por longitud y contenido.
  assert.equal(buscar(indice, '').length, 0);
  assert.equal(buscar(indice, '   ').length, 0);
  assert.equal(buscar(indice, 'zzqxw').length, 0);
  assert.ok(buscar(indice, 'a', 8).length <= 8);
  assert.equal(buscar(indice, 'netflix '.repeat(40))[0]?.tipo, 'producto');
});

test('cada producto del catálogo tiene categoría conocida y un detalle legible', () => {
  for (const entrada of indice.filter((e) => e.tipo === 'producto')) {
    assert.ok(entrada.categoria in contexto.ctvBusqueda.CATEGORIAS, `${entrada.id}: categoría ${entrada.categoria}`);
    assert.doesNotMatch(entrada.detalle, /NaN|undefined/, entrada.id);
    assert.match(entrada.detalle, /\d+ (plan|planes)$/, entrada.id);
  }
});

test('precio "desde" ignora planes por consultar y responde null si no hay precios', () => {
  assert.equal(precioDesde({ planes: [{ precio: 10 }, { precio: 4.5 }, { consultar: true, precio: 0 }] }), 4.5);
  assert.equal(precioDesde({ planes: [{ consultar: true }] }), null);
  assert.equal(precioDesde({}), null);
});

test('menú: cada categoría del catálogo filtra al tocarla y no queda en "Todos"', () => {
  const html = leer('index.html');
  const menu = html.slice(html.indexOf('<div id="nav-menu"'), html.indexOf('</nav>', html.indexOf('<div id="nav-menu"')));
  for (const categoria of ['streaming', 'iptv', 'musica', 'apps', 'proneet', 'recargas', 'deportes']) {
    assert.match(menu, new RegExp(`class="nav-link" href="#streaming" data-ir-categoria="${categoria}"`), categoria);
  }
  for (const destino of ['#promos', '#clicktv-atencion', '#clicktv-pagos-faciles', '#contacto']) {
    assert.ok(menu.includes(`href="${destino}"`), destino);
    assert.ok(html.includes(`id="${destino.slice(1)}"`), `existe la sección ${destino}`);
  }
  assert.doesNotMatch(menu, /href="#(iptv|musica|apps)"/, 'el menú ya no apunta a los botones del filtro');
  assert.match(menu, /id="nav-busqueda-input"[^>]*type="search"|type="search"[^>]*id="nav-busqueda-input"/);
  assert.match(menu, /id="nav-busqueda-limpiar"/);
  assert.match(menu, /id="nav-busqueda-resultados"/);
  assert.match(html, /clicktv-navegacion-movil\.js/);
  assert.match(html, /clicktv-movil-2col\.css/);
});

test('el menú solo tiene un manejador de cierre y los enlaces no se filtran dos veces', () => {
  const script = leer('script.js');
  assert.doesNotMatch(script, /navMenu\?\.classList\.remove\("abierto"\)/, 'cierre duplicado eliminado');
  assert.doesNotMatch(script, /querySelectorAll\("\[data-ir-categoria\]"\)/);
  assert.doesNotMatch(leer('clicktv-final-visual.js'), /addEventListener\('click'/);
});

test('el campo de búsqueda usa 16 px para que iOS no haga zoom', () => {
  const css = leer('clicktv-movil-2col.css');
  assert.match(css, /\.nav-busqueda__input \{[^}]*font-size: 16px/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});
