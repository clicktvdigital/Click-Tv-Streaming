// Crea en tu cuenta de PayPal un producto y un plan mensual por cada plan "1 mes" del catálogo,
// y escribe clicktv-paypal-planes.js con los IDs para que el sitio los use.
// Uso (en tu computadora, con las credenciales de PayPal como variables de entorno):
//   PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... PAYPAL_ENV=sandbox node scripts/crear-planes-paypal.mjs
// Usa PAYPAL_ENV=live para la cuenta real. No guardes el secreto en archivos del proyecto.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const BASE = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
const RAIZ = fileURLToPath(new URL('..', import.meta.url));

async function obtenerToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secreto = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secreto) throw new Error('Faltan PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET');
  const r = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secreto}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`Token: ${d.error_description || r.status}`);
  return d.access_token;
}

async function llamar(token, ruta, cuerpo) {
  const r = await fetch(`${BASE}${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': crypto.randomUUID() },
    body: JSON.stringify(cuerpo),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`${ruta}: ${JSON.stringify(d.details || d.message || r.status)}`);
  return d;
}

// Lee el catálogo real de data.js para no copiar precios a mano.
const fuente = await readFile(`${RAIZ}data.js`, 'utf8');
const { PRODUCTOS } = runInNewContext(`${fuente}\n({ PRODUCTOS })`, {});

const token = await obtenerToken();
const planes = {};
for (const producto of PRODUCTOS) {
  const mensual = (producto.planes || []).find((p) => p.tipo === '1 mes' && !p.consultar && Number(p.precio) > 0);
  if (!mensual) continue;
  const prod = await llamar(token, '/v1/catalogs/products', {
    name: `Click TV · ${producto.nombre}`.slice(0, 127),
    description: String(producto.descripcion || producto.nombre).slice(0, 255),
    type: 'SERVICE',
    category: 'SOFTWARE',
  });
  const plan = await llamar(token, '/v1/billing/plans', {
    product_id: prod.id,
    name: `${producto.nombre} · 1 mes`.slice(0, 127),
    description: `Suscripción mensual a ${producto.nombre}`.slice(0, 127),
    billing_cycles: [{
      frequency: { interval_unit: 'MONTH', interval_count: 1 },
      tenure_type: 'REGULAR',
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: { fixed_price: { value: Number(mensual.precio).toFixed(2), currency_code: 'USD' } },
    }],
    payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CANCEL', payment_failure_threshold: 3 },
  });
  planes[producto.id] = plan.id;
  console.log(`ok ${producto.id} -> ${plan.id} ($${Number(mensual.precio).toFixed(2)} USD/mes)`);
}

const salida = `/* CLICK TV STREAMING · Planes mensuales de PayPal por producto.
   Generado por scripts/crear-planes-paypal.mjs. */
window.PAYPAL_PLANES = ${JSON.stringify(planes, null, 2)};

// Vuelve de PayPal con ?suscripcion=ok o ?suscripcion=cancelada.
document.addEventListener('DOMContentLoaded', () => {
  const estado = new URLSearchParams(location.search).get('suscripcion');
  if (!estado) return;
  if (typeof mostrarToast === 'function') {
    if (estado === 'ok') mostrarToast('¡Suscripción enviada a PayPal! Recibirás la confirmación en tu correo.', 'exito');
    if (estado === 'cancelada') mostrarToast('Suscripción cancelada. Puedes intentarlo de nuevo cuando quieras.', 'info');
  }
  history.replaceState(null, '', location.pathname);
});
`;
await writeFile(`${RAIZ}clicktv-paypal-planes.js`, salida, 'utf8');
console.log(`Listo: ${Object.keys(planes).length} planes escritos en clicktv-paypal-planes.js`);
