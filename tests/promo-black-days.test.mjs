// Pruebas de la promoción Black Days: fechas, precios por dispositivo y ausencia de cupón.
// Carga data.js, los precios públicos y el módulo en un contexto aislado, como en el navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';

const RAIZ = new URL('..', import.meta.url);
const contexto = createContext({ console });
contexto.window = contexto;
for (const archivo of ['data.js', 'clicktv-precios-publico-2026.js', 'clicktv-promo-black-days.js']) {
  runInContext(readFileSync(new URL(archivo, RAIZ), 'utf8'), contexto, { filename: archivo });
}
const PRODUCTOS = runInContext('PRODUCTOS', contexto);
const promo = contexto.PromoBlackDays;
const producto = (id) => PRODUCTOS.find((p) => p.id === id);
// Los objetos creados en el contexto aislado tienen otro prototipo: se copian antes de comparar.
const plano = (v) => JSON.parse(JSON.stringify(v));
const DURANTE = Date.UTC(2026, 10, 17, 15, 0, 0); // 17/11/2026 10:00 en Ecuador

test('vigencia: del 15/11 00:00 al 20/11 23:59 hora de Ecuador', () => {
  assert.equal(promo.estaActiva(Date.UTC(2026, 10, 15, 4, 59, 59)), false, '14/11 23:59 Ecuador');
  assert.equal(promo.estaActiva(Date.UTC(2026, 10, 15, 5, 0, 0)), true, '15/11 00:00 Ecuador');
  assert.equal(promo.estaActiva(Date.UTC(2026, 10, 21, 4, 59, 59)), true, '20/11 23:59 Ecuador');
  assert.equal(promo.estaActiva(Date.UTC(2026, 10, 21, 5, 0, 0)), false, '21/11 00:00 Ecuador');
});

test('las 3 promociones tienen los nombres y meses exactos', () => {
  assert.deepEqual(plano(promo.PROMOS.map((p) => [p.nombre, p.pagados, p.gratis])), [
    ['Promo Especial: Paga 2 meses y recibe 1 mes gratis', 2, 1],
    ['Más Beneficio: Paga 3 meses y recibe 3 meses gratis', 3, 3],
    ['Black Days: Paga 6 meses y recibe 6 meses gratis', 6, 6]
  ]);
});

test('IPTV Premium: cobro y ahorro con precios públicos para 1, 2 y 3 dispositivos', () => {
  const esperado = {
    1: [[16, 23, 7], [23, 43, 20], [43, 77, 34]],
    2: [[29, 41.5, 12.5], [41.5, 78.5, 37], [78.5, 139, 60.5]],
    3: [[40, 57, 17], [57, 108, 51], [108, 192, 84]]
  };
  for (const d of [1, 2, 3]) {
    promo.PROMOS.forEach((p, i) => {
      const c = promo.calcular(producto('iptv-premium'), d, p.id);
      assert.deepEqual(plano([c.precio, c.precioReferencia, c.ahorro]), esperado[d][i], `${d} disp. · ${p.id}`);
      assert.equal(c.mesesActivados, p.pagados + p.gratis);
      assert.equal(c.dispositivos, d);
    });
  }
});

test('los 10 productos IPTV con planes por dispositivo aplican, y el ahorro siempre es positivo', () => {
  const elegibles = plano(PRODUCTOS.filter((p) => promo.esElegible(p)).map((p) => p.id)).sort();
  assert.deepEqual(elegibles, ['flujo-tv', 'iptv-basico', 'iptv-premium', 'iptv-ultra', 'megax-tv', 'oleada-tv', 'stella-tv', 'telelatino', 'vanna-tv', 'xc-tv']);
  for (const id of elegibles) {
    for (const d of [1, 2, 3]) {
      for (const p of promo.PROMOS) {
        const c = promo.calcular(producto(id), d, p.id);
        assert.ok(c && c.precio > 0 && c.ahorro > 0 && c.precio < c.precioReferencia, `${id} ${d} ${p.id}`);
      }
    }
  }
});

test('no aplica a streaming, licencias anuales ni combinaciones inválidas', () => {
  assert.equal(promo.esElegible(producto('netflix-extra')), false);
  assert.equal(promo.esElegible(producto('oratv')), false);
  assert.equal(promo.esElegible(producto('ibo-player')), false);
  assert.equal(promo.calcular(producto('iptv-premium'), 4, 'bd-paga2'), null);
  assert.equal(promo.calcular(producto('iptv-premium'), 1, 'inventada'), null);
});

test('plan para el carrito: sin cupón, IVA incluido y con el desglose completo', () => {
  const plan = promo.planParaCarrito(producto('iptv-basico'), 2, 'bd-paga6', DURANTE);
  assert.equal(plan.bloquearDescuento, true);
  assert.equal(plan.ivaIncluido, true);
  assert.equal(plan.precio, 59.5);
  assert.match(plan.tipo, /Black Days · 2 dispositivos · Paga 6 meses \+ 6 gratis \(12 meses\)/);
  assert.deepEqual(
    plano(plan.promo),
    { promoId: 'bd-paga6', nombre: 'Black Days: Paga 6 meses y recibe 6 meses gratis', dispositivos: 2, mesesPagados: 6, mesesGratis: 6, mesesActivados: 12, precioReferencia: 105.5, ahorro: 46 }
  );
  const texto = promo.lineasPedido(plan.promo, 2).join('\n');
  assert.match(texto, /Meses pagados: 6 · 🎁 Meses gratis: 6 · ✅ Meses activados: 12/);
  assert.match(texto, /Ahorro: \$92\.00 USD/);
});

test('fuera de las fechas no se vende ni se muestra la promoción', () => {
  const despues = Date.UTC(2026, 10, 21, 5, 0, 0);
  assert.equal(promo.planParaCarrito(producto('iptv-premium'), 1, 'bd-paga2', despues), null);
  assert.equal(promo.htmlSelector(producto('iptv-premium'), despues), '');
  assert.match(promo.htmlSelector(producto('iptv-premium'), DURANTE), /Elige tu promoción/);
});
