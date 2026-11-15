// Pruebas del endpoint de suscripción de PayPal, sin llamar a PayPal (no hay credenciales en la prueba).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/paypal-suscripcion.js';

function respuestaFalsa() {
  return {
    statusCode: 200,
    body: null,
    status(codigo) { this.statusCode = codigo; return this; },
    json(cuerpo) { this.body = cuerpo; return this; },
  };
}

test('solo acepta POST', async () => {
  const res = respuestaFalsa();
  await handler({ method: 'GET', body: {} }, res);
  assert.equal(res.statusCode, 405);
});

test('rechaza un ID de plan con formato incorrecto', async () => {
  const res = respuestaFalsa();
  await handler({ method: 'POST', body: { planId: '<script>' } }, res);
  assert.equal(res.statusCode, 400);
});

test('sin credenciales de PayPal responde 503 y no inventa un enlace', async () => {
  const anteriorId = process.env.PAYPAL_CLIENT_ID;
  const anteriorSecreto = process.env.PAYPAL_CLIENT_SECRET;
  delete process.env.PAYPAL_CLIENT_ID;
  delete process.env.PAYPAL_CLIENT_SECRET;
  try {
    const res = respuestaFalsa();
    await handler({ method: 'POST', body: { planId: 'P-ABCDEFGHIJKLMNOP' } }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.approveUrl, undefined);
  } finally {
    if (anteriorId) process.env.PAYPAL_CLIENT_ID = anteriorId;
    if (anteriorSecreto) process.env.PAYPAL_CLIENT_SECRET = anteriorSecreto;
  }
});
