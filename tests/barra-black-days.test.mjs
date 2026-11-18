// Barra inferior de WhatsApp para Black Days y tarjetas IPTV compactas (comprobaciones sin navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const leer = (archivo) => readFileSync(new URL(`../${archivo}`, import.meta.url), 'utf8');

test('la barra viene oculta en el HTML y solo la muestra el JS de la promo vigente', () => {
  const html = leer('index.html');
  assert.match(html, /<div id="ctv-bd-barra" class="ctv-bd-barra" role="region" aria-label="Promoción Black Days" hidden>/);
  assert.match(html, /id="ctv-bd-barra-cerrar"[^>]*aria-label="Ocultar la barra de Black Days"/);
  const js = leer('clicktv-promo-black-days.js');
  assert.match(js, /const mostrar = !oculta && \(vigente = estaActiva\(\)\);/);
  assert.match(js, /encodeURIComponent\(MENSAJE_WHATSAPP\)/);
  assert.match(js, /Black Days\* de IPTV/);
});

test('la barra es solo para celular y no tapa menú, carrito ni asistente', () => {
  const css = leer('clicktv-promo-black-days.css');
  assert.match(css, /\.ctv-bd-barra \{ display: none; \}\n@media \(max-width: 680px\)/);
  assert.match(css, /body:is\(\.menu-movil-abierto, \.cart-open\) \.ctv-bd-barra \{ display: none !important; \}/);
  assert.match(css, /body\.ctv-bd-barra-visible #ctv-asistente-btn/);
  assert.match(css, /\.ctv-bd-barra__cerrar \{[^}]*width: 44px;[^}]*min-height: 44px;/);
});

test('las tarjetas con Black Days ya no se fuerzan a todo el ancho mientras están cerradas', () => {
  const css = leer('clicktv-movil-2col.css');
  assert.doesNotMatch(css, /:has\(\.ctv-bd\)/);
  assert.match(css, /\.product-card--ancha:not\(\.product-card--abierta\):not\(:only-child\) \.ctv-bd > :not\(\.ctv-bd__sello\) \{ display: none; \}/);
});
